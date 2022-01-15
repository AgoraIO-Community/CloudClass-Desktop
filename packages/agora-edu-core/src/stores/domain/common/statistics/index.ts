import { AgoraRteEventType, AgoraRteScene, NetworkStats, AGNetworkQuality } from 'agora-rte-sdk';
import { action, observable, reaction } from 'mobx';
import { EduClassroomStore } from '..';
import { EduStoreBase } from '../base';

//for users
export class StatisticsStore extends EduStoreBase {
  //observes
  @observable
  packetLoss?: number = 0;

  @observable
  downlinkNetworkQuality?: AGNetworkQuality = AGNetworkQuality.good; // 默认网络状态为正常

  @observable
  uplinkNetworkQuality?: AGNetworkQuality = AGNetworkQuality.good; // 默认网络状态为正常

  @observable
  cpu?: number = 0;
  @observable
  cpuTotal?: number = 0;

  @observable
  delay?: number = 0;

  //computes

  //actions

  @action.bound
  private updateNetworkStats({
    packetLoss,
    uplinkNetworkQuality,
    downlinkNetworkQuality,
    cpu,
    cpuTotal,
    delay,
  }: {
    packetLoss: number;
    uplinkNetworkQuality: AGNetworkQuality;
    downlinkNetworkQuality: AGNetworkQuality;
    cpu: number;
    cpuTotal: number;
    delay: number;
  }) {
    this.packetLoss = packetLoss;
    this.uplinkNetworkQuality = uplinkNetworkQuality;
    this.downlinkNetworkQuality = downlinkNetworkQuality;
    this.cpu = cpu;
    this.cpuTotal = cpuTotal;
    this.delay = delay;
  }

  //others
  private _addEventHandlers(scene: AgoraRteScene) {
    scene.on(
      AgoraRteEventType.NetworkStats,
      ({
        packetLoss = 0,
        downlinkNetworkQuality = AGNetworkQuality.good,
        uplinkNetworkQuality = AGNetworkQuality.good,
        cpu = -1,
        cpuTotal = -1,
        delay = 0,
      }: NetworkStats) => {
        this.updateNetworkStats({
          packetLoss,
          downlinkNetworkQuality,
          uplinkNetworkQuality,
          cpu,
          cpuTotal,
          delay,
        });
      },
    );
  }

  onInstall() {
    reaction(
      () => this.classroomStore.connectionStore.scene,
      (scene) => {
        if (scene) {
          //bind events
          this._addEventHandlers(scene);
        } else {
          //clean up
        }
      },
    );
  }
  onDestroy() {}
}
