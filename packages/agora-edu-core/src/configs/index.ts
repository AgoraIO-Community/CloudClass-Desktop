import { AgoraRteEngine, AgoraRteEngineConfig, Logger } from 'agora-rte-sdk';
import { merge } from 'lodash';
import { EduSessionInfo, EduRoleTypeEnum, EduRoomTypeEnum, CourseWareList } from '../type';
import { CloudDriveResource } from '../stores/domain/common/cloud-drive/struct';
import { CloudDriveResourceConvertProgress } from '../stores/domain/common/cloud-drive/type';
import { AGEduErrorCode, EduErrorCenter } from '../utils/error';
import { AgoraRteOptions } from 'agora-rte-sdk/src/configs';
import { IAgoraExtApp, IAgoraWidget } from '..';

declare const EDU_SDK_VERSION: string;

export interface WhiteboardConfigs {
  boardAppId: string;
  boardId: string;
  boardRegion: string;
  boardToken: string;
}

export interface WhiteboardDefaults {
  scale: number;
}

export class EduClassroomConfig {
  private static _classroomConfig?: EduClassroomConfig;
  static get shared(): EduClassroomConfig {
    if (!this._classroomConfig) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_CLASSROOM_CONFIG_NOT_READY,
        new Error(`classroom config not ready`),
      );
    }
    return this._classroomConfig;
  }
  static setConfig(config: EduClassroomConfig) {
    this._classroomConfig = config;
  }

  readonly appId: string;
  readonly recordUrl: string;
  private readonly _rteEngineConfig: AgoraRteEngineConfig;
  private _sessionInfo?: EduSessionInfo;
  private _boardConfig?: WhiteboardConfigs;
  private _courseWareList?: CloudDriveResource[];
  private _widgets: { [key: string]: IAgoraWidget } = {};
  private _extApps: ReadonlyArray<IAgoraExtApp> = [];
  private _currentAPIVersion = 'v3';
  private _compatibleVersions: string[] = [];
  boardDefaults: WhiteboardDefaults = { scale: 1.2 };
  //by default use https://api.sd-rtn.com
  host: string = 'https://api.sd-rtn.com';
  ignoreUrlRegionPrefix: boolean = false;
  get headers(): Record<string, string | number> {
    return {
      'Content-Type': 'application/json',
      'x-agora-token': this.sessionInfo?.token || '',
      'x-agora-uid': this.sessionInfo?.userUuid || '',
    };
  }
  constructor(
    appId: string,
    sessionInfo: EduSessionInfo,
    recordUrl: string,
    rteOpts?: AgoraRteOptions,
    widgets: { [key: string]: IAgoraWidget } = {},
    extApps: IAgoraExtApp[] = [],
  ) {
    this.appId = appId;
    this._sessionInfo = sessionInfo;
    this.recordUrl = recordUrl;
    const rtcConfigs = merge(
      {
        defaultCameraEncoderConfigurations: EduClassroomConfig.defaultMediaOptions(
          sessionInfo.roomType,
          sessionInfo.role,
        ),
      },
      rteOpts?.rtcConfigs,
    );
    this._rteEngineConfig = new AgoraRteEngineConfig(appId, {
      ...rteOpts,
      rtcConfigs,
    });
    this._widgets = widgets;
    this._extApps = extApps;

    AgoraRteEngineConfig.setConfig(this._rteEngineConfig);

    Logger.info(
      `[Core] core configurations initialized, rte: v${AgoraRteEngine.getVersion()}, core: ${EduClassroomConfig.getVersion()}`,
    );
  }

  get sessionInfo(): EduSessionInfo {
    if (!this._sessionInfo) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_SESSION_INFO_NOT_READY,
        new Error(`session info is undefined, not logged in?`),
      );
    }

    // handleThrowableError will throw an error so it's not possible to return undefined here
    return this._sessionInfo;
  }

  setWhiteboardConfig(config?: WhiteboardConfigs) {
    this._boardConfig = config;
  }

  setCompatibleVersions(compatibleVersions: string[]) {
    this._compatibleVersions = compatibleVersions;
  }

  get isLowAPIVersionCompatibleRequired() {
    return this._compatibleVersions.some((v) => {
      return v < this._currentAPIVersion;
    });
  }

  get whiteboardConfig(): WhiteboardConfigs {
    if (!this._boardConfig) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_BOARD_INFO_NOT_READY,
        new Error(`board info is undefined`),
      );
    }

    // handleThrowableError will throw an error so it's not possible to return undefined here
    return this._boardConfig;
  }

  setCourseWareList(list?: CourseWareList) {
    const resourceList = list?.map(
      (data: {
        ext: string;
        resourceName: string;
        resourceUuid: string;
        size: number;
        updateTime: number;
        taskProgress?: CloudDriveResourceConvertProgress;
        taskUuid?: string;
        url?: string;
      }) => CloudDriveResource.fromData(data),
    );
    this._courseWareList = resourceList;
  }

  get courseWareList(): CloudDriveResource[] {
    return this._courseWareList || [];
  }

  get rteEngineConfig(): AgoraRteEngineConfig {
    this._rteEngineConfig.service.host = this.host;
    this._rteEngineConfig.ignoreUrlRegionPrefix = this.ignoreUrlRegionPrefix;
    if (this.sessionInfo) {
      this._rteEngineConfig.token = this.sessionInfo.token;
    }
    return this._rteEngineConfig;
  }

  get widgets() {
    return this._widgets;
  }

  get extApps() {
    return this._extApps;
  }

  static getVersion(): string {
    return EDU_SDK_VERSION;
  }

  static getRtcVersion(): string {
    return AgoraRteEngine.getRtcVersion();
  }

  static defaultMediaOptions(roomType: EduRoomTypeEnum, userRole: EduRoleTypeEnum) {
    let cameraEncoderConfiguration = {
      width: 160,
      height: 120,
      bitrate: 65,
      frameRate: 15,
    };

    if (userRole === EduRoleTypeEnum.teacher) {
      switch (roomType) {
        case EduRoomTypeEnum.Room1v1Class:
          // stay 240p
          cameraEncoderConfiguration = {
            width: 320,
            height: 240,
            frameRate: 15,
            bitrate: 200,
          };
          break;
        case EduRoomTypeEnum.RoomSmallClass:
          cameraEncoderConfiguration = {
            width: 160,
            height: 120,
            bitrate: 65,
            frameRate: 15,
          };
          break;
        case EduRoomTypeEnum.RoomBigClass:
          cameraEncoderConfiguration = {
            width: 640,
            height: 480,
            frameRate: 15,
            bitrate: 400,
          };
          break;
      }
    } else if (userRole === EduRoleTypeEnum.student) {
      switch (roomType) {
        case EduRoomTypeEnum.Room1v1Class:
          // stay 240p
          cameraEncoderConfiguration = {
            width: 320,
            height: 240,
            frameRate: 15,
            bitrate: 200,
          };
          break;
        case EduRoomTypeEnum.RoomSmallClass:
          cameraEncoderConfiguration = {
            width: 160,
            height: 120,
            bitrate: 65,
            frameRate: 15,
          };
          break;
        case EduRoomTypeEnum.RoomBigClass:
          cameraEncoderConfiguration = {
            width: 160,
            height: 120,
            bitrate: 65,
            frameRate: 15,
          };
          break;
      }
    }
    return cameraEncoderConfiguration;
  }
}
