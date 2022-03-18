import { EventEmitter } from 'events';
import { Log } from '../../decorator/log';
import { Injectable } from '../../decorator/type';
import { AgoraRteEngine } from '../../engine';
import { AGRtmManager } from '../../rtm';
import { AgoraRteSyncDataStore } from './data';
import { AgoraRteChannelMessageHandle } from './handler';
import { AgoraRteMessageHandleTask, AgoraRteSyncSnapshotData } from './struct';

@Log.attach({ proxyMethods: false })
export class AgoraRteSynchronizer {
  protected logger!: Injectable.Logger;
  sceneId: string;
  userUuid: string;
  streamUuid: string;
  private _channelObserver: EventEmitter;
  private _snapshot?: AgoraRteSyncSnapshotData;
  private _queueTasks: AgoraRteMessageHandleTask[] = [];
  private _currentTask?: AgoraRteMessageHandleTask;
  private _lastSeq: number = -1;
  private _requestingGap: boolean = false;
  private _handleChannelMessage: ({
    message,
    memberId,
  }: {
    message: {
      text: string;
    };
    memberId: string;
  }) => void;
  private _handlePeerMessage: ({ message, peerId }: { message: string; peerId: string }) => void;

  handle: AgoraRteChannelMessageHandle;
  constructor(
    dataStore: AgoraRteSyncDataStore,
    {
      sceneId,
      userUuid,
      streamUuid,
      channelObserver,
      rtm,
    }: {
      sceneId: string;
      userUuid: string;
      streamUuid: string;
      channelObserver: EventEmitter;
      rtm: AGRtmManager;
    },
  ) {
    this.sceneId = sceneId;
    this.streamUuid = streamUuid;
    this.userUuid = userUuid;
    this._handleChannelMessage = this.handleChannelMessage.bind(this);
    this._handlePeerMessage = this.handlePeerMessage.bind(this);
    this._channelObserver = channelObserver;
    this._channelObserver.on('ChannelMessage', this._handleChannelMessage);
    rtm.on('MessageFromPeer', this._handlePeerMessage);
    this.handle = new AgoraRteChannelMessageHandle(dataStore, {
      sceneId,
      userUuid,
      streamUuid,
    });
  }

  handlePeerMessage({ message, peerId }: { message: string; peerId: string }) {
    // only process channel message from server
    if (peerId === 'server') {
      this.logger.debug('peer message', message);
      try {
        const task = JSON.parse(message);
        this.handle.handlePeerMessage(task);
      } catch (e) {
        this.logger.error(`${(e as Error).message} original: ${message}`);
      }
    }
  }

  handleChannelMessage({
    message,
    memberId,
  }: {
    message: {
      text: string;
    };
    memberId: string;
  }) {
    // only process channel message from server
    if (memberId === 'server') {
      this.logger.debug(`channel message sceneId:${this.sceneId}`, message.text);
      try {
        const sequence = JSON.parse(message.text);
        this.addTask({
          sequence,
        });
      } catch (e) {
        this.logger.error(`${(e as Error).message} original: ${message.text}`);
      }
    }
  }

  syncSnapshot(snapshot: AgoraRteSyncSnapshotData) {
    this._snapshot = snapshot;
    this.handle.handleSnapshot(snapshot);
    this._lastSeq = snapshot.sequence;
    this.notifyTaskQueueUpdate();
  }

  findSequenceGap(): { seq: number; count: number; queueHeadSeq: number } | null {
    // precheck if sequence gap exists for current queued tasks
    if (this._queueTasks.length === 0) {
      // continue process although queue is empty
      return null;
    }

    let firstTaskSequence = this._queueTasks[0].sequence.sequence;
    if (firstTaskSequence - this._lastSeq > 1) {
      return {
        seq: this._lastSeq + 1,
        count: firstTaskSequence - this._lastSeq - 1,
        queueHeadSeq: firstTaskSequence,
      };
    }

    return null;
  }

  sortTasks() {
    this._queueTasks = this._queueTasks.sort(
      (t1, t2) => t1.sequence.sequence - t2.sequence.sequence,
    );
  }

  addTask(task: AgoraRteMessageHandleTask) {
    this._queueTasks.push(task);
    this.sortTasks();
    this.notifyTaskQueueUpdate();
  }

  prependTasks(tasks: AgoraRteMessageHandleTask[]) {
    this._queueTasks = tasks.concat(this._queueTasks);
    this.sortTasks();
  }

  notifyTaskQueueUpdate() {
    if (!this._snapshot) {
      this.logger.warn(`Snapshot not ready yet..wait`);
      return;
    }

    const sequenceGap = this.findSequenceGap();
    if (sequenceGap) {
      const { seq, count, queueHeadSeq } = sequenceGap;
      this.logger.warn(
        `gap ${this._lastSeq} - ${queueHeadSeq} exists, need fill ${seq} ${count}. stop task processing before gap is resolved`,
      );
      this.syncSequenceUntilSuccess(seq, count);
      return;
    }

    this.runNextTask();
  }

  runNextTask = () => {
    if (this._currentTask) {
      this.logger.debug(`Task Running`);
      return;
    }

    let task = this.dequeueTask();
    if (!task) {
      this.logger.debug(`message handle queue clear`);
      return;
    } else {
      this._currentTask = task;
      this.processTask(this._currentTask)
        .then(() => {
          this._currentTask = undefined;
          this.notifyTaskQueueUpdate();
        })
        .catch((e: Error) => {
          this.logger.error(`message handle failed: ${e}`);
          this._currentTask = undefined;
          this.notifyTaskQueueUpdate();
        });
    }
  };

  dequeueTask() {
    if (this._queueTasks.length === 0) {
      return null;
    } else {
      return this._queueTasks.shift();
    }
  }

  async processTask(task: AgoraRteMessageHandleTask) {
    if (!this._snapshot) {
      // do not process if snapshot is not ready
      return;
    }
    if (task.sequence.sequence <= this._lastSeq) {
      // task earlier than current snapshot, drop it
      this.logger.debug(
        `skip sequence ${task.sequence.sequence}, snapshot ${this._snapshot.sequence}`,
      );
      return;
    }

    this.logger.debug(
      `process sequence ${task.sequence.sequence}, snapshot ${this._snapshot.sequence}, last ${this._lastSeq}`,
    );

    this.handle.handleMessage(task);

    this._lastSeq = task.sequence.sequence;

    // prevent main thread jam/stack overflow
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  async syncSequenceUntilSuccess(lastSeq: number, count: number) {
    if (this._requestingGap) {
      // prevent duplicate requests
      return;
    }

    // lock
    this._requestingGap = true;
    let success = false;

    this.logger.info(`begin resolve gap ${lastSeq} - ${count}`);
    do {
      try {
        const { list } = await AgoraRteEngine.engine
          .getApiService()
          .syncSequence(this.sceneId, lastSeq, count);
        const messageLength = Math.min(count, list.length);
        const tasks = list.slice(0, messageLength).map((m: any) => {
          return { sequence: m } as AgoraRteMessageHandleTask;
        });
        this.prependTasks(tasks);
        success = true;
        this.logger.info(`gap resolved, new ${tasks.length} tasks prepended `);
        this.notifyTaskQueueUpdate();
      } catch (e) {
        this.logger.error(`syncSequence failed: ${e}`);
        // wait for 3 second before next retry
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    } while (!success);

    // release lock
    this._requestingGap = false;
  }

  reset() {
    this._channelObserver.off('ChannelMessage', this._handleChannelMessage);
  }
}
