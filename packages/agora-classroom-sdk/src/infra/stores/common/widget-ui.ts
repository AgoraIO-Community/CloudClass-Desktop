import {
  AGEduErrorCode,
  EduClassroomConfig,
  EduErrorCenter,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
} from 'agora-edu-core';
import {
  AgoraRteEventType,
  AgoraRteMediaSourceState,
  AgoraRteVideoSourceType,
} from 'agora-rte-sdk';
import { get } from 'lodash';
import { action, computed, IReactionDisposer, reaction, when } from 'mobx';
import { EduUIStoreBase } from './base';
import { EduStreamUI } from './stream/struct';

export class WidgetUIStore extends EduUIStoreBase {
  private _disposers: IReactionDisposer[] = [];

  protected get uiOverrides() {
    return {
      ...super.uiOverrides,
      heightRatio: 1,
      aspectRatio: 9 / 16,
    };
  }
  /**
   * 大窗容器高度
   * @returns
   */
  @computed
  get bigWidgetWindowHeight() {
    const { roomType } = EduClassroomConfig.shared.sessionInfo;

    const viewportHeight = this.shareUIStore.classroomViewportSize.height;
    const height = this.uiOverrides.heightRatio * viewportHeight;
    if (roomType === EduRoomTypeEnum.Room1v1Class || roomType === EduRoomTypeEnum.RoomBigClass) {
      return height - this.shareUIStore.navBarHeight;
    }

    return height;
  }
  /**
   * 老师流信息列表
   * @returns
   */
  @computed get teacherStreams(): Set<EduStreamUI> {
    const streamSet = new Set<EduStreamUI>();
    const teacherList = this.classroomStore.userStore.teacherList;
    for (const teacher of teacherList.values()) {
      const streamUuids =
        this.classroomStore.streamStore.streamByUserUuid.get(teacher.userUuid) || new Set();
      for (const streamUuid of streamUuids) {
        const stream = this.classroomStore.streamStore.streamByStreamUuid.get(streamUuid);
        if (stream) {
          const uiStream = new EduStreamUI(stream);
          streamSet.add(uiStream);
        }
      }
    }
    return streamSet;
  }

  /**
   * 老师流信息（教室内只有一个老师时使用，如果有一个以上老师请使用 teacherStreams）
   * @returns
   */
  @computed get teacherCameraStream(): EduStreamUI | undefined {
    const streamSet = new Set<EduStreamUI>();
    const streams = this.teacherStreams;
    for (const stream of streams) {
      if (stream.stream.videoSourceType === AgoraRteVideoSourceType.Camera) {
        streamSet.add(stream);
      }
    }

    if (streamSet.size > 1) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_UNEXPECTED_TEACHER_STREAM_LENGTH,
        new Error(`unexpected stream size ${streams.size}`),
      );
    }
    return Array.from(streamSet)[0];
  }
  @computed
  get isBigWidgetWindowTeacherStreamActive() {
    return !!this.classroomStore.widgetStore.widgetStateMap[
      `streamWindow-${this.teacherCameraStream?.stream.streamUuid}`
    ];
  }
  @action.bound
  private _handleRoomPropertiesChange(
    changedRoomProperties: string[],
    roomProperties: any,
    operator: any,
  ) {
    const { userUuid } = EduClassroomConfig.shared.sessionInfo;
    // if (!operator.userUuid) {
    //   changedRoomProperties.forEach(async (key) => {
    //     if (key === 'widgets') {
    //       const whiteboardProperties = get(
    //         roomProperties,
    //         `widgets.${BUILTIN_WIDGETS.boardWidget}`,
    //         {},
    //       );
    //       if (whiteboardProperties) {
    //         const whiteboardState = get(whiteboardProperties, 'state');
    //         if (whiteboardState === 0) {
    //           await when(() => !!this.teacherCameraStream?.stream.streamUuid);
    //           if (
    //             this.classroomStore.mediaStore.localScreenShareTrackState !==
    //               AgoraRteMediaSourceState.started &&
    //             !this.classroomStore.boardStore.configReady
    //           ) {
    //             this.classroomStore.widgetStore.setActive(
    //               `streamWindow-${this.teacherCameraStream?.stream.streamUuid}`,
    //               {
    //                 extra: {
    //                   userUuid: userUuid,
    //                 },
    //               },
    //               userUuid,
    //             );
    //           }
    //         }
    //       }
    //     }
    //   });
    // }
  }
  onInstall() {
    if (EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher) {
      this._disposers.push(
        reaction(
          () => this.classroomStore.connectionStore.scene,
          (scene) => {
            if (scene) {
              scene.on(AgoraRteEventType.RoomPropertyUpdated, this._handleRoomPropertiesChange);
            }
          },
        ),
      );
    }
  }

  onDestroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}

export const BUILTIN_WIDGETS = {
  boardWidget: 'netlessBoard',
};
