import { AgoraRteScene, Log } from 'agora-rte-sdk';
import { reaction } from 'mobx';
import { EduStoreBase } from '../base';
import { SceneSubscription, SubscriptionFactory } from './room';

@Log.attach({ proxyMethods: false })
export class SubscriptionStore extends EduStoreBase {
  private _sceneSubscriptions: Map<string, SceneSubscription> = new Map<
    string,
    SceneSubscription
  >();

  setActive(sceneId: string) {
    this._sceneSubscriptions.forEach((sub, subSceneId) => {
      if (subSceneId === sceneId) {
        sub.setActive(true);
      } else {
        sub.setActive(false);
      }
    });
  }

  createSceneSubscription(scene: AgoraRteScene) {
    if (!this._sceneSubscriptions.has(scene.sceneId)) {
      const sub = SubscriptionFactory.createSubscription(scene);

      sub && this._sceneSubscriptions.set(scene.sceneId, sub);
    }

    return this._sceneSubscriptions.get(scene.sceneId);
  }

  onInstall(): void {
    reaction(
      () => this.classroomStore.connectionStore.scene,
      (scene) => {
        if (scene) {
          this.createSceneSubscription(scene);
          this.setActive(scene.sceneId);
        }
      },
    );
  }

  onDestroy(): void {}
}
