import { AgoraRteScene, Log } from 'agora-rte-sdk';
import { computed, reaction } from 'mobx';
import { EduStoreBase } from '../base';
import { SceneSubscription, SubscriptionFactory } from './room';

@Log.attach({ proxyMethods: false })
export class SubscriptionStore extends EduStoreBase {
  private static _sceneSubscriptions: Map<string, SceneSubscription> = new Map<
    string,
    SceneSubscription
  >();

  setActive(sceneId: string) {
    SubscriptionStore._sceneSubscriptions.forEach((sub, subSceneId) => {
      if (subSceneId === sceneId) {
        sub.setActive(true);
      } else {
        sub.setActive(false);
      }
    });
  }

  createSceneSubscription(scene: AgoraRteScene) {
    if (!SubscriptionStore._sceneSubscriptions.has(scene.sceneId)) {
      const sub = SubscriptionFactory.createSubscription(scene);

      sub && SubscriptionStore._sceneSubscriptions.set(scene.sceneId, sub);
    }
    return SubscriptionStore._sceneSubscriptions.get(scene.sceneId);
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
    computed(() => this.classroomStore.connectionStore.subRoomScene).observe(({ oldValue }) => {
      if (oldValue) {
        SubscriptionStore._sceneSubscriptions.delete(oldValue.sceneId);
      }
    });
  }

  onDestroy(): void {
    SubscriptionStore._sceneSubscriptions.clear();
  }
}
