import { extractUserStreams } from '@classroom/infra/utils/extract';
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

export class Getters {
  constructor(private _classroomUIStore: EduClassroomUIStore) { }
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
  get teacherCameraStream(): EduStream {
    const { classroomStore } = this._classroomUIStore;
    const { teacherList } = classroomStore.userStore;
    const { streamByStreamUuid, streamByUserUuid } = classroomStore.streamStore;

    const cameraStreams = extractUserStreams(teacherList, streamByUserUuid, streamByStreamUuid, [
      AgoraRteVideoSourceType.Camera,
    ]);

    return Array.from(cameraStreams)[0];
  }

  /**
   * 学生流信息列表
   * @returns
   */
  @computed
  get studentCameraStreams(): EduStream[] {
    const { classroomStore } = this._classroomUIStore;
    const { studentList } = classroomStore.userStore;
    const { streamByStreamUuid, streamByUserUuid } = classroomStore.streamStore;

    const cameraStreams = extractUserStreams(studentList, streamByUserUuid, streamByStreamUuid, [
      AgoraRteVideoSourceType.Camera,
    ]);

    return Array.from(cameraStreams);
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
  get cameraUIStreams() {
    const isIngroupLocal = this._classroomUIStore.classroomStore.groupStore.groupUuidByUserUuid.get(
      this.localUser?.userUuid || '',
    );
    return Array.from(this.cameraStreams)
      .filter((stream) => {
        return isIngroupLocal
          ? true
          : !this._classroomUIStore.classroomStore.groupStore.groupUuidByUserUuid.get(
            stream.fromUser.userUuid,
          );
      })
      .map((stream) => new EduStreamUI(stream));
  }
  @computed
  get studentCameraUIStreams() {
    // const isIngroupLocal = this._classroomUIStore.classroomStore.groupStore.groupUuidByUserUuid.get(
    //   this.localUser?.userUuid || '',
    // );
    const { classroomStore } = this._classroomUIStore;
    const { studentList } = classroomStore.userStore;
    const { streamByStreamUuid, streamByUserUuid } = classroomStore.streamStore;

    const cameraStreams = extractUserStreams(studentList, streamByUserUuid, streamByStreamUuid, [
      AgoraRteVideoSourceType.Camera,
    ]);

    return Array.from(cameraStreams).map((stream) => new EduStreamUI(stream));
    // return Array.from(this.cameraStreams)
    //   .filter((stream) => {
    //     return isIngroupLocal
    //       ? true
    //       : !this._classroomUIStore.classroomStore.groupStore.groupUuidByUserUuid.get(
    //         stream.fromUser.userUuid,
    //       );
    //   })
    //   .map((stream) => new EduStreamUI(stream));
  }
  get isBoardWidgetActive() {
    return this._classroomUIStore.widgetUIStore.widgetInstanceList.some((widget) => {
      return widget.widgetName === 'netlessBoard';
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
}
