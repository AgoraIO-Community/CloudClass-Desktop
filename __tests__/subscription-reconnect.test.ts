import { observable, reaction, IObservableValue } from 'mobx';

/**
 * 模拟日志中录制端重连场景（agora-classroom-sdk SubscriptionUIStore）：
 * 1. scene 在第一次进房时已创建
 * 2. 第一次进房 abort 后 Extension uninstall → install 重建 UI Store
 * 3. 新的 SubscriptionUIStore.onInstall 注册 reaction 时 scene 已存在
 * 4. 验证 fireImmediately 修复后 MainRoomSubscription 能被正确创建
 */

class MockConnectionStore {
  private _scene: IObservableValue<any> = observable.box(null);

  get scene() {
    return this._scene.get();
  }

  set scene(v: any) {
    this._scene.set(v);
  }
}

class SubscriptionUIStore {
  private _disposers: (() => void)[] = [];
  private _sceneSubscriptions = new Map<string, { active: boolean; sceneId: string }>();
  connectionStore: MockConnectionStore;

  constructor(connectionStore: MockConnectionStore) {
    this.connectionStore = connectionStore;
  }

  createSceneSubscription(scene: any) {
    if (!this._sceneSubscriptions.has(scene.sceneId)) {
      this._sceneSubscriptions.set(scene.sceneId, { active: false, sceneId: scene.sceneId });
    }
    return this._sceneSubscriptions.get(scene.sceneId);
  }

  setActive(sceneId: string) {
    this._sceneSubscriptions.forEach((sub, id) => {
      sub.active = id === sceneId;
    });
  }

  get subscriptionCount() {
    return this._sceneSubscriptions.size;
  }

  getSubscription(sceneId: string) {
    return this._sceneSubscriptions.get(sceneId);
  }

  onInstallBroken() {
    this._disposers.push(
      reaction(
        () => this.connectionStore.scene,
        (scene: any) => {
          if (scene) {
            this.createSceneSubscription(scene);
            this.setActive(scene.sceneId);
          }
        },
      ),
    );
  }

  onInstallFixed() {
    this._disposers.push(
      reaction(
        () => this.connectionStore.scene,
        (scene: any) => {
          if (scene) {
            this.createSceneSubscription(scene);
            this.setActive(scene.sceneId);
          }
        },
        { fireImmediately: true },
      ),
    );
  }

  onDestroy() {
    this._sceneSubscriptions.clear();
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}

describe('SubscriptionUIStore - recording bot reconnect scenario', () => {
  test('BUG: without fireImmediately, subscription is NOT created when scene already exists', () => {
    const conn = new MockConnectionStore();

    const store1 = new SubscriptionUIStore(conn);
    store1.onInstallBroken();
    conn.scene = { sceneId: '2157841' };
    expect(store1.subscriptionCount).toBe(1);

    store1.onDestroy();

    const store2 = new SubscriptionUIStore(conn);
    store2.onInstallBroken();

    expect(store2.subscriptionCount).toBe(0);

    store2.onDestroy();
  });

  test('FIX: with fireImmediately, subscription IS created when scene already exists', () => {
    const conn = new MockConnectionStore();

    const store1 = new SubscriptionUIStore(conn);
    store1.onInstallFixed();
    conn.scene = { sceneId: '2157841' };
    expect(store1.subscriptionCount).toBe(1);

    store1.onDestroy();

    const store2 = new SubscriptionUIStore(conn);
    store2.onInstallFixed();

    expect(store2.subscriptionCount).toBe(1);
    expect(store2.getSubscription('2157841')?.active).toBe(true);

    store2.onDestroy();
  });

  test('FIX: normal first-time join still works', () => {
    const conn = new MockConnectionStore();

    const store = new SubscriptionUIStore(conn);
    store.onInstallFixed();

    expect(store.subscriptionCount).toBe(0);

    conn.scene = { sceneId: 'room-123' };
    expect(store.subscriptionCount).toBe(1);
    expect(store.getSubscription('room-123')?.active).toBe(true);

    store.onDestroy();
  });
});
