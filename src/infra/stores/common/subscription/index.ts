import { AgoraRteScene, Log } from 'agora-rte-sdk';
import { computed, IReactionDisposer, Lambda, reaction } from 'mobx';
import { SceneSubscription } from './abstract';
import { EduUIStoreBase } from '../base';
import { EduClassroomConfig } from 'agora-edu-core';
import { CDNRoomSubscription } from './cdn-room';
import { MainRoomSubscription } from './main-room';
import { EduRoomServiceTypeEnum, EduRoomTypeEnum, EduSessionInfo } from 'agora-edu-core';

@Log.attach({ proxyMethods: false })
export class SubscriptionUIStore extends EduUIStoreBase {
  private _disposers: (IReactionDisposer | Lambda)[] = [];

  private static _sceneSubscriptions: Map<string, SceneSubscription> = new Map<
    string,
    SceneSubscription
  >();

  setActive(sceneId: string) {
    SubscriptionUIStore._sceneSubscriptions.forEach((sub, subSceneId) => {
      if (subSceneId === sceneId) {
        sub.setActive(true);
      } else {
        sub.setActive(false);
      }
    });
  }

  setCDNMode(cdnMode: boolean) {
    SubscriptionUIStore._sceneSubscriptions.forEach((sub) => {
      if (sub.active) {
        sub.setCDNMode(cdnMode);
      }
    });
  }

  createSceneSubscription(scene: AgoraRteScene) {
    if (!SubscriptionUIStore._sceneSubscriptions.has(scene.sceneId)) {
      const sub = SubscriptionFactory.createSubscription(scene);

      sub && SubscriptionUIStore._sceneSubscriptions.set(scene.sceneId, sub);
    }
    return SubscriptionUIStore._sceneSubscriptions.get(scene.sceneId);
  }

  onInstall(): void {
    this._disposers.push(
      reaction(
        () => this.classroomStore.connectionStore.scene,
        (scene) => {
          if (scene) {
            this.createSceneSubscription(scene);
            this.setActive(scene.sceneId);
          }
        },
      ),
    );
    this._disposers.push(
      computed(() => this.classroomStore.connectionStore.subRoomScene).observe(({ oldValue }) => {
        if (oldValue) {
          SubscriptionUIStore._sceneSubscriptions.delete(oldValue.sceneId);
        }
      }),
    );
    this._disposers.push(
      reaction(
        () => this.classroomStore.roomStore.isCDNMode,
        (isCDNMode) => {
          this.setCDNMode(isCDNMode);
        },
      ),
    );
  }

  onDestroy(): void {
    SubscriptionUIStore._sceneSubscriptions.clear();
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}

class SubscriptionFactory {
  static createSubscription(scene: AgoraRteScene) {
    if (isCDNSubscriptionRoom(EduClassroomConfig.shared.sessionInfo)) {
      return new CDNRoomSubscription(scene);
    }
    return new MainRoomSubscription(scene);
  }
}

function isCDNSubscriptionRoom(sessionInfo: EduSessionInfo) {
  const { roomServiceType, roomType } = sessionInfo;
  if (
    roomType === EduRoomTypeEnum.RoomBigClass &&
    roomServiceType === EduRoomServiceTypeEnum.MixStreamCDN
  ) {
    return true;
  }
  if (
    roomType === EduRoomTypeEnum.RoomBigClass &&
    roomServiceType === EduRoomServiceTypeEnum.HostingScene
  ) {
    return true;
  }
  return false;
}
