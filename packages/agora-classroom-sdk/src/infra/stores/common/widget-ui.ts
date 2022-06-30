import {
  AGEduErrorCode,
  EduClassroomConfig,
  EduErrorCenter,
  EduRoomTypeEnum,
  AgoraWidgetEventType,
  AgoraWidgetBase,
} from 'agora-edu-core';
import { WidgetsConfigMap, AgoraWidgetPrefix } from 'agora-plugin-gallery';
import { AgoraRteVideoSourceType, bound } from 'agora-rte-sdk';
import { computed, IReactionDisposer, reaction, when } from 'mobx';
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
  @bound
  setWidgetToFullScreen(widgetId: string) {
    const widget = this.classroomStore.widgetStore.widgetController?.widgetsMap.get(widgetId);
    if (widget) {
      this.classroomStore.widgetStore.widgetController?.sendMessageToWidget(
        widgetId,
        AgoraWidgetEventType.WidegtTrackSet,
        true,
        { x: 0, y: 0, real: false },
        {
          width: widget.track.trackContext.outerSize.width,
          height: widget.track.trackContext.outerSize.height,
          real: true,
        },
      );
    } else {
      this.logger.warn('Widget Controller [setWidgetToFullScreen] => failed. Widget not exist.');
    }
  }
  @bound
  setWidgetZIndexToTop(widgetId: string) {
    if (this.classroomStore.widgetStore.widgetController) {
      const length = this.classroomStore.widgetStore.widgetController?.widgetsMap.size;
      if (length <= 1) return;
      const widget = this.classroomStore.widgetStore.widgetController?.widgetsMap.get(widgetId);
      const widgetZIndexSorter = (a: AgoraWidgetBase, b: AgoraWidgetBase) => {
        const zIndexA = (a.widgetRoomProperties.extra as any)?.zIndex ?? 0;
        const zIndexB = (b.widgetRoomProperties.extra as any)?.zIndex ?? 0;
        return zIndexA - zIndexB;
      };
      if (widget) {
        const updatedWidgetProperties = {
          ...widget.widgetRoomProperties,
          extra: {
            ...widget.widgetRoomProperties?.extra,
            zIndex:
              ((
                [...this.classroomStore.widgetStore.widgetController!.widgetsMap.entries()].sort(
                  (a, b) => widgetZIndexSorter(a[1], b[1]),
                )[length - 1][1].widgetRoomProperties.extra as any
              )?.zIndex ?? 0) + 1,
          },
        };
        this.classroomStore.widgetStore.widgetController?.sendMessageToWidget(
          widgetId,
          AgoraWidgetEventType.WidgetRoomPropertiesUpdate,
          updatedWidgetProperties,
        );
        this.classroomStore.widgetStore.widgetController?.updateWidgetProperties(
          widgetId,
          updatedWidgetProperties,
        );
      } else {
        this.logger.warn('Widget Controller [setWidgetZIndexToTop] => failed. Widget not exist.');
      }
    }
  }
  onInstall() {
    this._disposers.push(
      reaction(
        () => this.classroomStore.connectionStore.scene,
        async () => {
          await when(() => !!this.classroomStore.widgetStore.widgetController);
          this.classroomStore.widgetStore.setWidgetsConfigMap(WidgetsConfigMap);
        },
      ),
    );
  }

  onDestroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}

export const BUILTIN_WIDGETS = {
  boardWidget: 'netlessBoard',
};
