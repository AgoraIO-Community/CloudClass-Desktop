import { AgoraRteMediaSourceState, AgoraRteThread, Log } from 'agora-rte-sdk';

@Log.attach({ proxyMethods: false })
export class ShareStreamStateKeeper extends AgoraRteThread {
  private _timer?: any;
  private _cancelTimer?: () => void;
  private _timeout = 500;
  private _currentState: AgoraRteMediaSourceState = AgoraRteMediaSourceState.stopped;
  private _targetState: AgoraRteMediaSourceState = AgoraRteMediaSourceState.stopped;

  syncTo: (targetState: AgoraRteMediaSourceState) => Promise<void>;

  constructor(syncTo: (targetState: AgoraRteMediaSourceState) => Promise<void>) {
    super();
    this.syncTo = syncTo;
  }

  async onExecution() {
    do {
      this.logger.debug(`thread notify start...`);

      if (this._currentState === this._targetState) {
        this.logger.info(`state synced.`);
        break;
      }

      if (!this.syncTo) {
        this.logger.warn(`no syncTo handler found, screen share state sync will not be possible`);
        break;
      }

      try {
        await this.syncTo(this._targetState);
        this._currentState = this._targetState;
        this.logger.info(`sync state to ${this._targetState} done`);
        break;
      } catch (e) {
        this.logger.error(`sync state failed: ${(e as Error).message}`);
        this._increaseTimeout();
      }

      await this._wait(this._timeout);
    } while (this.running);
    this.logger.debug(`thread sleep...`);
  }

  setShareScreenState(state: AgoraRteMediaSourceState) {
    if (state === AgoraRteMediaSourceState.starting) {
      //ignore starting state
      return;
    }
    this._targetState = state;
    //run immediately
    this._runImmediately();
  }

  run() {
    //reset timeout when run is called
    this._timeout = 500;
    super.run();
  }

  stop() {
    super.stop();
    this._cancelWait();
  }

  private _increaseTimeout() {
    if (this._timeout >= 10 * 1000) {
      //if current timeout is more than 10 seconds, don't increase
      return;
    }
    // otherwise increase timeout exponentially
    this._timeout = this._timeout * 2;
  }

  private _runImmediately() {
    this._cancelWait();
    this.run();
  }

  private async _wait(timeout: number) {
    this.logger.info(`wait for ${timeout}ms to retry`);
    await new Promise<void>((resolve) => {
      clearTimeout(this._timer);
      this._timer = setTimeout(resolve, timeout);
      this._cancelTimer = () => {
        this.logger.info(`cancel wait`);
        resolve();
      };
    });
  }

  private _cancelWait() {
    clearTimeout(this._timer);
    this._timer = undefined;
    this._cancelTimer && this._cancelTimer();
  }
}
