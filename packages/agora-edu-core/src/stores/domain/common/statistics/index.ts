import { AgoraRteEventType, AgoraRteScene, NetworkStats, AGNetworkQuality } from 'agora-rte-sdk';
import { action, computed, observable, reaction } from 'mobx';
import { EduStoreBase } from '../base';

//for users
export class StatisticsStore extends EduStoreBase {
  @observable
  private _dataStore: DataStore = {
    packetLoss: 0,
    downlinkNetworkQuality: AGNetworkQuality.good, // 默认网络状态为正常
    uplinkNetworkQuality: AGNetworkQuality.good, // 默认网络状态为正常
    cpu: 0,
    cpuTotal: 0,
    delay: 0,
  };

  //observes
  @computed
  get packetLoss() {
    return this._dataStore.packetLoss;
  }
  @computed
  get uplinkNetworkQuality() {
    return this._dataStore.uplinkNetworkQuality;
  }
  @computed
  get downlinkNetworkQuality() {
    return this._dataStore.downlinkNetworkQuality;
  }
  @computed
  get cpu() {
    return this._dataStore.cpu;
  }
  @computed
  get cpuTotal() {
    return this._dataStore.cpuTotal;
  }
  @computed
  get delay() {
    return this._dataStore.delay;
  }

  @action
  private _setEventHandler(scene: AgoraRteScene) {
    if (this.classroomStore.connectionStore.mainRoomScene === scene) {
      let handler = SceneEventHandler.getEventHandler(scene);
      if (!handler) {
        handler = SceneEventHandler.createEventHandler(scene);
      }
      this._dataStore = handler.dataStore;
    } else {
      const handler = SceneEventHandler.createEventHandler(scene);
      this._dataStore = handler.dataStore;
    }
  }

  onInstall() {
    reaction(
      () => this.classroomStore.connectionStore.scene,
      (scene) => {
        if (scene) {
          this._setEventHandler(scene);
        }
      },
    );
  }
  onDestroy() {
    SceneEventHandler.cleanup();
  }
}

type DataStore = {
  packetLoss: number;
  downlinkNetworkQuality: AGNetworkQuality; // 默认网络状态为正常
  uplinkNetworkQuality: AGNetworkQuality; // 默认网络状态为正常
  cpu: number;
  cpuTotal: number;
  delay: number;
};

class SceneEventHandler {
  private static _handlers: Record<string, SceneEventHandler> = {};

  static createEventHandler(scene: AgoraRteScene) {
    if (SceneEventHandler._handlers[scene.sceneId]) {
      SceneEventHandler._handlers[scene.sceneId].removeEventHandlers();
    }
    const handler = new SceneEventHandler(scene);

    handler.addEventHandlers();

    SceneEventHandler._handlers[scene.sceneId] = handler;

    return SceneEventHandler._handlers[scene.sceneId];
  }

  static getEventHandler(scene: AgoraRteScene) {
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
    packetLoss: 0,
    downlinkNetworkQuality: AGNetworkQuality.good, // 默认网络状态为正常
    uplinkNetworkQuality: AGNetworkQuality.good, // 默认网络状态为正常
    cpu: 0,
    cpuTotal: 0,
    delay: 0,
  };

  addEventHandlers() {
    this._scene.on(AgoraRteEventType.NetworkStats, this._updateNetworkStats);
  }

  removeEventHandlers() {
    this._scene.off(AgoraRteEventType.NetworkStats, this._updateNetworkStats);
  }

  @action.bound
  private _updateNetworkStats({
    packetLoss = 0,
    downlinkNetworkQuality = AGNetworkQuality.good,
    uplinkNetworkQuality = AGNetworkQuality.good,
    cpu = -1,
    cpuTotal = -1,
    delay = 0,
  }: NetworkStats) {
    this.dataStore.packetLoss = packetLoss;
    this.dataStore.uplinkNetworkQuality = uplinkNetworkQuality;
    this.dataStore.downlinkNetworkQuality = downlinkNetworkQuality;
    this.dataStore.cpu = cpu;
    this.dataStore.cpuTotal = cpuTotal;
    this.dataStore.delay = delay;
  }
}
