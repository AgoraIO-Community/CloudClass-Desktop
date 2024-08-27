import { extractUserStreams } from '@classroom/utils/extract';
import {
  EduClassroomConfig,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
  EduStream,
  EduUserStruct,
  GroupState,
} from 'agora-edu-core';
import { ExpandedScopeState } from 'agora-edu-core';
import { AgoraRteMediaSourceState, AgoraRteVideoSourceType } from 'agora-rte-sdk';
import isNumber from 'lodash/isNumber';
import { computed } from 'mobx';
import { EduClassroomUIStore } from '.';
import { LayoutMaskCode } from './type';
import { EduStreamUI } from './stream/struct';
import { computedFn } from 'mobx-utils';
import dayjs from 'dayjs';

export class Getters {
  constructor(private _classroomUIStore: EduClassroomUIStore) { }
  private formatCountDown(ms: number): string {
    const duration = dayjs.duration(ms);

    if (duration.days() > 0) {
      const mmss = duration.format('mm:ss');
      const h = Math.floor(duration.asHours());
      return `${h}:${mmss}`;
    }

    const seconds = Math.floor(ms / 1000);
    if (seconds < 60 * 60) {
      return duration.format('mm:ss');
    }

    return duration.format('HH:mm:ss');
  }
  get classroomUIStore() {
    return this._classroomUIStore;
  }

  /**
   * 分组讨论是否已开启
   */
  @computed
  get breakoutRoomStarted() {
    return this._classroomUIStore.classroomStore.groupStore.state === GroupState.OPEN;
  }

  /**
   * 台上用户ID
   */
  @computed
  get stageUserUuids() {
    const { roomStore } = this._classroomUIStore.classroomStore;
    return roomStore.acceptedList.map(({ userUuid }) => userUuid);
  }

  /**
   * 老师流信息
   * @returns
   */
  @computed
  get teacherCameraStream() {
    return this.teacherUIStream?.stream;
  }

  /**
   * 学生流信息列表
   * @returns
   */
  @computed
  get studentCameraStreams(): EduStream[] {
    return this.studentCameraUIStreams.map((stream) => stream.stream);
  }

  /**
   * 台上人员流列表
   */
  @computed
  get stageCameraStreams(): EduStream[] {
    const { streamStore, userStore } = this._classroomUIStore.classroomStore;
    const { streamByStreamUuid, streamByUserUuid } = streamStore;

    const users = this.stageUserUuids.reduce((prev, userUuid) => {
      const user = userStore.users.get(userUuid);
      if (user) {
        prev.set(userUuid, user);
      }
      return prev;
    }, new Map<string, EduUserStruct>());

    const cameraStreams = extractUserStreams(users, streamByUserUuid, streamByStreamUuid, [
      AgoraRteVideoSourceType.Camera,
    ]);

    return Array.from(cameraStreams);
  }

  /**
   * 是否在分组房间
   */
  @computed
  get isInSubRoom() {
    return !!this._classroomUIStore.classroomStore.groupStore.currentSubRoom;
  }

  /**
   * 本地摄像头视频流
   */
  @computed
  get localCameraStream() {
    const { localCameraStreamUuid, streamByStreamUuid } =
      this._classroomUIStore.classroomStore.streamStore;
    if (!localCameraStreamUuid) {
      return;
    }
    return streamByStreamUuid.get(localCameraStreamUuid);
  }

  /**
   * 本地屏幕视频流
   */
  @computed
  get localScreenStream() {
    const { localShareStreamUuid, streamByStreamUuid } =
      this._classroomUIStore.classroomStore.streamStore;
    if (!localShareStreamUuid) {
      return;
    }
    return streamByStreamUuid.get(localShareStreamUuid);
  }
  @computed
  get screenShareUIStream() {
    const streamUuid = this._classroomUIStore.classroomStore.roomStore
      .screenShareStreamUuid as string;
    const stream =
      this._classroomUIStore.classroomStore.streamStore.streamByStreamUuid.get(streamUuid);
    return stream ? new EduStreamUI(stream) : null;
  }
  @computed
  get isScreenSharing() {
    return !!this.screenShareUIStream;
  }
  @computed
  get isLocalScreenSharing() {
    return (
      this.classroomUIStore.classroomStore.mediaStore.localScreenShareTrackState ===
      AgoraRteMediaSourceState.started
    );
  }
  @computed
  get pinnedUIStream() {
    const stream = this._classroomUIStore.classroomStore.streamStore.streamByStreamUuid.get(
      this.classroomUIStore.streamUIStore.pinnedStreamUuid,
    );
    return stream ? new EduStreamUI(stream) : null;
  }
  userCameraStreamByUserUuid = computedFn((userUuid: string) => {
    const cameraStreams: EduStream[] = [];
    this.cameraStreams.forEach((stream) => {
      if (stream.fromUser.userUuid === userUuid) cameraStreams.push(stream);
    });
    return cameraStreams[0];
  });
  @computed
  get localUser() {
    return this._classroomUIStore.classroomStore.userStore.localUser;
  }
  @computed
  get cameraStreams() {
    const { streamByUserUuid, streamByStreamUuid } =
      this._classroomUIStore.classroomStore.streamStore;
    const cameraStreams = extractUserStreams(
      this._classroomUIStore.classroomStore.userStore.users,
      streamByUserUuid,
      streamByStreamUuid,
      [AgoraRteVideoSourceType.Camera],
    );
    return cameraStreams;
  }
  @computed
  get isInGroup() {
    return this._classroomUIStore.classroomStore.groupStore.groupUuidByUserUuid.get(
      this.localUser?.userUuid || '',
    );
  }
  @computed
  get cameraUIStreams() {
    const {
      classroomStore: { groupStore: { groupUuidByUserUuid } }
    } = this._classroomUIStore;
    const isInMainroom = groupUuidByUserUuid?.size === 0 || !this.isInGroup;
    return Array.from(this.cameraStreams)
      .filter((stream) => {
        return isInMainroom
          ? !groupUuidByUserUuid.get(stream.fromUser.userUuid)
          : !!groupUuidByUserUuid.get(stream.fromUser.userUuid) && this.isInGroup === groupUuidByUserUuid.get(stream.fromUser.userUuid)
      })
      .map((stream) => new EduStreamUI(stream));
  }
  @computed
  get studentCameraUIStreams() {
    const { classroomStore } = this._classroomUIStore;
    const { studentList } = classroomStore.userStore;

    return this.cameraUIStreams.filter((stream) => {
      return studentList.has(stream.fromUser.userUuid);
    });
  }
  get isBoardWidgetActive() {
    return this._classroomUIStore.widgetUIStore.widgetInstanceList.some((widget) => {
      return widget.widgetName === 'netlessBoard';
    });
  }
  get isWebViewWidgetActive() {
    return this._classroomUIStore.widgetUIStore.widgetInstanceList.some((widget) => {
      return widget.widgetName === 'webView';
    });
  }
  get isMediaPlayerWidgetActive() {
    return this._classroomUIStore.widgetUIStore.widgetInstanceList.some((widget) => {
      return widget.widgetName === 'mediaPlayer';
    });
  }
  @computed
  get teacherUIStream() {
    return this.cameraUIStreams.find((stream) => {
      return stream.role === EduRoleTypeEnum.teacher;
    });
  }

  get activeWidgetIds() {
    return this._classroomUIStore.widgetUIStore.widgetInstanceList.map((w) => w.widgetId);
  }
  @computed
  get userCount() {
    const { userCount, teacherList } = this._classroomUIStore.classroomStore.userStore;
    const isTeacherInClass = teacherList.size > 0;
    return Math.max(userCount - (isTeacherInClass ? 1 : 0), 0);
  }
  @computed
  get isTeacherInClass() {
    return this._classroomUIStore.classroomStore.userStore.teacherList.size > 0;
  }
  @computed
  get calibratedTime() {
    const { clockTime, clientServerTimeShift } = this._classroomUIStore.classroomStore.roomStore;
    return clockTime + clientServerTimeShift;
  }
  @computed
  get classTimeDuration(): number {
    const { classroomSchedule } = this._classroomUIStore.classroomStore.roomStore;
    let duration = -1;
    if (classroomSchedule) {
      switch (classroomSchedule.state) {
        case 0:
          if (classroomSchedule.startTime !== undefined) {
            duration = Math.max(classroomSchedule.startTime - this.calibratedTime, 0);
          }
          break;
        case 1:
          if (classroomSchedule.startTime !== undefined) {
            duration = Math.max(this.calibratedTime - classroomSchedule.startTime, 0);
          }
          break;
        case 2:
          if (
            classroomSchedule.startTime !== undefined &&
            classroomSchedule.duration !== undefined
          ) {
            duration = Math.max(this.calibratedTime - classroomSchedule.startTime, 0);
          }
          break;
      }
    }
    return duration;
  }
  @computed
  get classStatusText() {
    const duration = this.classTimeDuration || 0;

    if (duration < 0) {
      return ``;
    }
    const {
      classroomSchedule: { state },
    } = this._classroomUIStore.classroomStore.roomStore;

    switch (state) {
      case 1:
        return `${this.formatCountDown(duration)}`;
      case 2:
        return `${this.formatCountDown(duration)}`;
      default:
        return ``;
    }
  }
}
