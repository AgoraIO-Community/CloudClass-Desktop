import { AgoraRteScene, Log } from 'agora-rte-sdk';
import { reaction } from 'mobx';
import { EduStoreBase } from '../base';

import { SceneSubscription, SubscriptionFactory, SubscriptionType } from './room';

@Log.attach({ proxyMethods: false })
export class SubscriptionStore extends EduStoreBase {
  private _sceneSubscriptions: Map<string, SceneSubscription> = new Map<
    string,
    SceneSubscription
  >();

  setSceneActive(sceneId: string, active: boolean) {
    const sub = this._sceneSubscriptions.get(sceneId);
    if (sub) {
      sub.setActive(active);
    }
  }

  createSceneSubscription(scene: AgoraRteScene, type: SubscriptionType) {
    const sub = SubscriptionFactory.createSubscription(type, scene);
    if (sub) {
      this._sceneSubscriptions.set(scene.sceneId, sub);
    }
  }

  onInstall(): void {
    reaction(
      () => this.classroomStore.connectionStore.scene,
      (scene) => {
        if (scene) {
          this.createSceneSubscription(scene, SubscriptionType.MainRoom);
        }
      },
    );
  }

  onDestroy(): void {}
}
