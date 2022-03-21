import { EduClassroomConfig, EduRoleTypeEnum, escapeExtAppIdentifier } from 'agora-edu-core';
import { bound, Lodash, Log } from 'agora-rte-sdk';
import { computed } from 'mobx';
import { EduUIStoreBase } from '../base';

@Log.attach({ proxyMethods: false })
export class ExtensionAppUIStore extends EduUIStoreBase {
  /** Getters  */
  /**
   * 当前用户是否拥有 ExtApp 的关闭权限
   * @returns
   */
  get canClose() {
    const { role: userRole, userUuid } = EduClassroomConfig.shared.sessionInfo;
    const { grantUsers } = this.classroomStore.boardStore;

    return (
      userRole === EduRoleTypeEnum.teacher ||
      userRole === EduRoleTypeEnum.assistant ||
      grantUsers.has(userUuid)
    );
  }

  /**
   * 当前用户是否拥有 ExtApp 的移动权限
   * @returns
   */
  get canDrag() {
    const { role: userRole, userUuid } = EduClassroomConfig.shared.sessionInfo;
    const { grantUsers } = this.classroomStore.boardStore;

    return (
      userRole === EduRoleTypeEnum.teacher ||
      userRole === EduRoleTypeEnum.assistant ||
      grantUsers.has(userUuid)
    );
  }

  /**
   * 当前打开的 ExtApp
   * @returns
   */
  @computed
  get activeApps() {
    const { extensionAppInstances } = this.classroomStore.extensionAppStore;
    const activedAppIds = this.classroomStore.extensionAppStore.activeAppIds.slice();
    return activedAppIds.reduce(
      (pre: Array<any>, next: string) => [...pre, extensionAppInstances[next]],
      [],
    );
  }

  /**
   * 更新 extension 的轨迹信息
   * @param appId
   * @param width
   * @param height
   */
  @Lodash.debounced(200, { trailing: true })
  updateTrackState(appId: string, width: number, height: number) {
    this.classroomStore.extAppsTrackStore.setTrackLocalDimensionsById(
      escapeExtAppIdentifier(appId),
      {
        width,
        height,
        real: true,
      },
    );
  }
  @bound
  shutdownApp(appId: string) {
    this.classroomStore.extensionAppStore.shutdownApp(appId);
  }

  onInstall() {}

  onDestroy() {}
}
