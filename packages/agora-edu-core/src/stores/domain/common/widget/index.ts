import { EduStoreBase } from '../base';
import { AGEduErrorCode, EduErrorCenter } from '../../../../utils/error';
import { IAgoraWidget } from './type';
import { TrackState } from '../room/type';
import { action, computed, observable } from 'mobx';
import { AgoraRteEventType, AgoraRteScene, bound } from 'agora-rte-sdk';
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
  private _dataStore: DataStore = {
    widgetStateMap: {},
  };

  @computed
  get widgetStateMap() {
    return this._dataStore.widgetStateMap;
  }

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
    this.api.updateWidgetProperties(this.classroomStore.connectionStore.sceneId, widgetId, {
      state: 1,
      ownerUserUuid,
      ...widgetProps,
    });
  }

  @bound
  setInactive(widgetId: string) {
    this.api.updateWidgetProperties(this.classroomStore.connectionStore.sceneId, widgetId, {
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

  @action
  private _setEventHandler(scene: AgoraRteScene) {
    const handler = SceneEventHandler.createEventHandler(scene);
    this._dataStore = handler.dataStore;
  }

  onInstall() {
    computed(() => this.classroomStore.connectionStore.scene).observe(({ newValue, oldValue }) => {
      if (newValue) {
        this._setEventHandler(newValue);
      }
    });
  }

  onDestroy() {
    SceneEventHandler.cleanup();
  }
}

type DataStore = {
  widgetStateMap: Record<string, boolean>;
};

class SceneEventHandler {
  private static _handlers: Record<string, SceneEventHandler> = {};

  static createEventHandler(scene: AgoraRteScene) {
    if (!SceneEventHandler._handlers[scene.sceneId]) {
      const handler = new SceneEventHandler(scene);

      handler.addEventHandlers();

      SceneEventHandler._handlers[scene.sceneId] = handler;
    }
    return SceneEventHandler._handlers[scene.sceneId];
  }

  static cleanup() {
    Object.keys(SceneEventHandler._handlers).forEach((k) => {
      SceneEventHandler._handlers[k].removeEventHandlers();
    });

    SceneEventHandler._handlers = {};
  }

  constructor(private _scene: AgoraRteScene) {}

  @observable
  dataStore: DataStore = {
    widgetStateMap: {},
  };

  addEventHandlers() {
    this._scene.on(AgoraRteEventType.RoomPropertyUpdated, this._handleRoomPropertiesChange);
  }

  removeEventHandlers() {
    this._scene.off(AgoraRteEventType.RoomPropertyUpdated, this._handleRoomPropertiesChange);
  }

  @action.bound
  private _handleRoomPropertiesChange(changedRoomProperties: string[], roomProperties: any) {
    changedRoomProperties.forEach((key) => {
      if (key === 'widgets') {
        const widgets = get(roomProperties, 'widgets', []);

        this.dataStore.widgetStateMap = Object.keys(widgets).reduce((prev, cur) => {
          prev[cur] = widgets[cur].state === 1;
          return prev;
        }, {} as Record<string, boolean>);
      }
    });
  }
}
