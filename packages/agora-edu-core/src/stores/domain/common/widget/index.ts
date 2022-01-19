import { EduStoreBase } from '../base';
import { AGEduErrorCode, EduErrorCenter } from '../../../../utils/error';
import { IAgoraWidget } from './type';
import { EduClassroomConfig } from '../../../..';
import { TrackState } from '../room/type';
import { action, observable, reaction } from 'mobx';
import { AgoraRteEventType, bound } from 'agora-rte-sdk';
import { get } from 'lodash';

/**
 * 负责功能：
 *  1.初始化Widgets
 *  2.注入依赖
 *  3.销毁Widgets
 *  4.Widgets实例
 */
export class WidgetStore extends EduStoreBase {
  widgets: { [key: string]: IAgoraWidget } = {};

  @observable
  widgetStateMap: Record<string, boolean> = {};

  @observable
  widgetsTrackState: TrackState = {};

  @bound
  leave() {
    let keys = Object.keys(this.widgets);
    for (let i = 0; i < keys.length; i++) {
      try {
        this.widgets[keys[i]].widgetWillUnload();
      } catch (err: any) {
        EduErrorCenter.shared.handleThrowableError(AGEduErrorCode.EDU_ERR_WIDGET_LEAVE_FAIL, err);
      }
    }
  }

  @bound
  setActive(widgetId: string, widgetProps: any, ownerUserUuid?: string) {
    const { roomUuid } = EduClassroomConfig.shared.sessionInfo;
    this.api.updateWidgetProperties(roomUuid, widgetId, {
      state: 1,
      ownerUserUuid,
      ...widgetProps,
    });
  }

  @bound
  setInactive(widgetId: string) {
    const { roomUuid } = EduClassroomConfig.shared.sessionInfo;
    this.api.updateWidgetProperties(roomUuid, widgetId, {
      state: 0,
    });
  }

  @action
  async deleteWidgetTrackState(widgetId: string) {
    this.setInactive(widgetId);
  }

  @action.bound
  updateTrackState(trackState: TrackState) {
    // filter out tracks of inactive widgets
    this.widgetsTrackState = Object.keys(trackState).reduce((prev: TrackState, cur) => {
      if (trackState[cur].state) {
        prev[cur] = trackState[cur];
      }
      return prev;
    }, {});
  }

  @action.bound
  private _handleRoomPropertiesChange(
    changedRoomProperties: string[],
    roomProperties: any,
    operator: any,
    cause: any,
  ) {
    changedRoomProperties.forEach((key) => {
      if (key === 'widgets') {
        const widgets = get(roomProperties, 'widgets', []);

        this.widgetStateMap = Object.keys(widgets).reduce((prev, cur) => {
          prev[cur] = widgets[cur].state === 1;
          return prev;
        }, {} as Record<string, boolean>);
      }
    });
  }

  onInstall() {
    reaction(
      () => this.classroomStore.connectionStore.scene,
      (scene) => {
        if (scene) {
          scene.on(AgoraRteEventType.RoomPropertyUpdated, this._handleRoomPropertiesChange);
        }
      },
    );
  }

  onDestroy() {}
}
