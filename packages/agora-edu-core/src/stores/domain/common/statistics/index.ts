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
  networkQuality?: AGNetworkQuality = AGNetworkQuality.unknown;

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
    networkQuality,
    cpu,
    cpuTotal,
    delay,
  }: {
    packetLoss: number;
    networkQuality: AGNetworkQuality;
    cpu: number;
    cpuTotal: number;
    delay: number;
  }) {
    this.packetLoss = packetLoss;
    this.networkQuality = networkQuality;
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
        networkQuality = AGNetworkQuality.unknown,
        cpu = -1,
        cpuTotal = -1,
        delay = 0,
      }: NetworkStats) => {
        this.updateNetworkStats({
          packetLoss,
          networkQuality,
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
