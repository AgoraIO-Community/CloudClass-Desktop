import { action, observable, toJS } from 'mobx';
import { EduStoreBase } from '../base';
import { AGEduErrorCode, EduErrorCenter } from '../../../../utils/error';
import { IAgoraExtApp } from './type';
import { EduClassroomConfig } from '../../../..';
import { bound } from 'agora-rte-sdk';
import { escapeExtAppIdentifier } from '../room/command-handler';
import { forEach } from 'lodash';

/**
 * 负责功能：
 *  1.初始化ExtApps
 *  2.打开ExtApp
 *  3.关闭ExtApp
 *  4.当前focus的ExtApp
 *  5.ExApps实例
 */
export class ExtAppStore extends EduStoreBase {
  private _extAppInstances: Record<string, IAgoraExtApp> = {};

  @observable
  activeAppIds: string[] = [];

  @observable
  focusedAppId?: string;

  @bound
  fireExtAppsDidUpdate(apps: Record<string, any>, extAppCause: any) {
    Object.keys(apps).forEach((appId) => {
      const dotAppId = escapeExtAppIdentifier(appId, true);
      this._extAppInstances[dotAppId].extAppRoomPropertiesDidUpdate(
        toJS(apps[appId]),
        toJS(extAppCause),
      );
    });
  }

  @bound
  registerExtApp(app: IAgoraExtApp) {
    this._extAppInstances[app.appIdentifier] = app;
  }

  /** Actions */
  @action.bound
  shutdownApp(appId: string) {
    const registerd = this._extAppInstances[appId];
    if (!registerd) {
      return;
    }

    if (appId === this.focusedAppId) {
      this.focusedAppId = undefined;
    }

    this.activeAppIds = this.activeAppIds.filter((k) => k !== appId);
    this.classroomStore.trackStore.deleteTrackById(escapeExtAppIdentifier(appId));
  }

  @action.bound
  launchApp(appId: string) {
    const registerd = this._extAppInstances[appId];
    if (!registerd) {
      return;
    }

    const active = this.activeAppIds.find((k) => appId === k);

    if (!active) {
      const app = this.classroomStore.extAppStore.extApps[appId];

      const { width, height } = app;
      this.classroomStore.trackStore.setTrackById(
        escapeExtAppIdentifier(appId),
        true,
        { x: 0.5, y: 0.5, real: false },
        { width, height, real: true },
      );
      this.activeAppIds.push(appId);
    }

    this.focusedAppId = appId;
  }

  /** Getters */
  get extApps() {
    return this._extAppInstances;
  }

  /** Methods */
  @bound
  async updateExtAppProperties(appId: string, properties: any, common: any, cause: any) {
    const { roomUuid } = this.classroomStore.roomStore;
    try {
      return await this.api.updateExtAppProperties(roomUuid, appId, properties, common, cause);
    } catch (err) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_EXTAPP_UPDATE_PROPERTIES_FAIL,
        err as Error,
      );
    }
  }

  @bound
  async deleteExtAppProperties(appId: string, properties: string[], cause: any) {
    const { roomUuid } = this.classroomStore.roomStore;
    try {
      return await this.api.deleteExtAppProperties(roomUuid, appId, properties, cause);
    } catch (err) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_EXTAPP_DELETE_PROPERTIES_FAIL,
        err as Error,
      );
    }
  }

  onInstall() {
    forEach(EduClassroomConfig.shared.extApps, this.registerExtApp);
  }
  onDestroy() {}
}
