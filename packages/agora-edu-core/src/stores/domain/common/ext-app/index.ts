import { action, observable, runInAction, toJS, reaction } from 'mobx';
import { EduStoreBase } from '../base';
import { AGEduErrorCode, EduErrorCenter } from '../../../../utils/error';
import { IAgoraExtApp } from './type';
import { EduClassroomConfig, EduRoleTypeEnum } from '../../../..';
import { bound, Log } from 'agora-rte-sdk';
import { forEach } from 'lodash';
import { escapeExtAppIdentifier } from '../room/command-handler';
import { TrackData, TrackState } from '../room/type';

/**
 * 负责功能：
 *  1.初始化ExtApps
 *  2.打开ExtApp
 *  3.关闭ExtApp
 *  4.当前focus的ExtApp
 *  5.ExApps实例
 */
@Log.attach({ proxyMethods: false })
export class ExtAppStore extends EduStoreBase {
  private _extAppInstances: Record<string, IAgoraExtApp> = {};

  @observable
  activeAppIds: string[] = [];

  @observable
  focusedAppId?: string;

  @observable
  extappsTrackState: TrackState = {};

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

    const onClose = this._extAppInstances[appId].eventHandler?.onClose;

    if (onClose) {
      onClose.call(this._extAppInstances[appId].eventHandler);
    }

    this.activeAppIds = this.activeAppIds.filter((k) => k !== appId);
    this.classroomStore.extAppsTrackStore.deleteTrackById(escapeExtAppIdentifier(appId));
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
      this.classroomStore.extAppsTrackStore.setTrackById(
        escapeExtAppIdentifier(appId),
        true,
        { x: 0.5, y: 0.5, real: false },
        { width, height, real: true },
      );

      this.activeAppIds.push(appId);

      const { updateExtAppProperties } = this.classroomStore.extAppStore;

      updateExtAppProperties(appId, {}, { state: 1 }, {});
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

  @bound
  async deleteExtappTrackState(extappId: string) {
    const { roomUuid } = this.classroomStore.roomStore;
    await this.api.deleteExtAppProperties(roomUuid, extappId, ['position', 'extra', 'size']);
  }

  @bound
  async updateExtappTrackState(extappId: string, data: TrackData) {
    const { roomUuid } = this.classroomStore.roomStore;
    await this.api.updateExtAppProperties(roomUuid, extappId, data, null, {
      cmd: 0,
    });
  }

  @action.bound
  updateTrackState(trackState: TrackState) {
    this.extappsTrackState = trackState;
  }

  onInstall() {
    forEach(EduClassroomConfig.shared.extApps, this.registerExtApp);

    const isTeacherOrAssistant = [
      EduRoleTypeEnum.teacher,
      EduRoleTypeEnum.assistant,
      EduRoleTypeEnum.observer,
    ].includes(this.classroomStore.roomStore.userRole);

    if (isTeacherOrAssistant) {
      reaction(
        () => this.classroomStore.roomStore.extAppsCommon,
        (extAppsCommon) => {
          runInAction(() => {
            Object.keys(extAppsCommon).forEach((key) => {
              const appId = escapeExtAppIdentifier(key, true);
              const commonState = extAppsCommon[key];

              if (commonState.state && !this.activeAppIds.includes(appId)) {
                this.activeAppIds.push(appId);

                this.logger.info(`Ext app [${appId}] is set to active by remote`);
              }
              if (!commonState.state && this.activeAppIds.includes(appId)) {
                this.activeAppIds = this.activeAppIds.filter((key) => key !== appId);

                this.logger.info(`Ext app [${appId}] is set to inactive by remote`);
              }
            });
          });
        },
      );
    }
  }
  onDestroy() {}
}
