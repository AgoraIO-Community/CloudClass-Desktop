import { AgoraRteScene, Log } from 'agora-rte-sdk';
import { computed, IReactionDisposer, Lambda, reaction } from 'mobx';
import { SceneSubscription } from './abstract';
import { EduUIStoreBase } from '../base';
import { MainRoomSubscription } from './main-room';
import { Getters } from '../getters';

@Log.attach({ proxyMethods: false })
export class SubscriptionUIStore extends EduUIStoreBase {
  private _disposers: (IReactionDisposer | Lambda)[] = [];

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
      const sub = SubscriptionFactory.createSubscription(scene, this.getters);

      sub && this._sceneSubscriptions.set(scene.sceneId, sub);
    }
    return this._sceneSubscriptions.get(scene.sceneId);
  }

  removeSceneSubscription(scene: AgoraRteScene) {
    const sub = this._sceneSubscriptions.get(scene.sceneId);
    if (sub) {
      sub.destroy();
      this._sceneSubscriptions.delete(scene.sceneId);
    }
  }

  clearSubscription() {
    this._sceneSubscriptions.forEach((sub) => {
      sub.destroy();
    });
    this._sceneSubscriptions.clear();
  }

  printStat() {
    const { scene } = this.classroomStore.connectionStore;
    if (scene) {
      const sub = this._sceneSubscriptions.get(scene.sceneId);
      sub?.printStat();
    }
  }

  onInstall() {
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
          this.removeSceneSubscription(oldValue);
        }
      }),
    );
  }

  onDestroy() {
    this.clearSubscription();
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}

class SubscriptionFactory {
  static createSubscription(scene: AgoraRteScene, getters: Getters) {
    return new MainRoomSubscription(scene, getters);
  }
}
