import { Scenarios } from './scenarios';
import {
  EduClassroomConfig,
  EduEventCenter,
  EduMediaEncryptionMode,
  EduRegion,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
  Platform,
  AgoraCloudProxyType,
  getPlatform,
  DevicePlatform,
} from 'agora-edu-core';
import { ApiBase } from 'agora-rte-sdk';
import { render, unmountComponentAtNode } from 'react-dom';
import { EduContext } from './contexts';
import {
  applyTheme,
  loadTheme,
  loadUIConfig,
  supportedRoomTypes,
  themes,
  uiConfigs,
} from './utils/config-loader';

import './polyfills';
import { Providers } from './providers';
import {
  ConfigParams,
  ConvertMediaOptionsConfig,
  LaunchMediaOptions,
  LaunchOption,
  RoomTemplate,
} from './type';
import {
  FcrMultiThemeMode,
  FcrTheme,
  FcrUIConfig,
  addResourceBundle,
  AgoraWidgetBase,
  Logger,
  changeLanguage,
} from 'agora-common-libs';
import { en } from './translate/en';
import { zh } from './translate/zh';
import toUpper from 'lodash/toUpper';
import { isLocked, lock, unlock } from './lock';

export * from './type';

export { applyTheme, themes } from './utils/config-loader';

export class AgoraEduSDK {
  private static _config: Record<string, string> = {};
  private static _widgets: Record<string, typeof AgoraWidgetBase> = {};
  private static _language: string;
  private static _appId = '';
  private static _uiMode: FcrMultiThemeMode = FcrMultiThemeMode.light;
  private static _uiConfig: FcrUIConfig;
  private static _theme: FcrTheme;
  private static _shareUrl: string;
  //default use GLOBAL region(including CN)
  private static _region: EduRegion = EduRegion.CN;
  private static _virtualBackgroundImages: string[] = [];
  private static _virtualBackgroundVideos: string[] = [];
  private static _convertRegion(region: string): EduRegion {
    switch (toUpper(region)) {
      case 'CN':
        return EduRegion.CN;
      case 'AP':
        return EduRegion.AP;
      case 'EU':
        return EduRegion.EU;
      case 'NA':
        return EduRegion.NA;
    }
    return toUpper(region) as EduRegion;
  }
  private static _convertMediaOptions(opts?: LaunchMediaOptions): ConvertMediaOptionsConfig {
    const config: ConvertMediaOptionsConfig = {};
    if (opts) {
      const {
        cameraEncoderConfiguration,
        screenShareEncoderConfiguration,
        encryptionConfig,
        lowStreamCameraEncoderConfiguration,
        channelProfile,
        web,
      } = opts;
      if (cameraEncoderConfiguration) {
        config.defaultCameraEncoderConfigurations = {
          ...cameraEncoderConfiguration,
        };
      }
      if (screenShareEncoderConfiguration) {
        config.defaultScreenEncoderConfigurations = {
          ...screenShareEncoderConfiguration,
        };
      }
      if (encryptionConfig) {
        config.encryption = {
          mode: encryptionConfig.mode as unknown as EduMediaEncryptionMode,
          key: encryptionConfig.key,
        };
      }
      if (lowStreamCameraEncoderConfiguration) {
        config.defaultLowStreamCameraEncoderConfigurations = {
          ...lowStreamCameraEncoderConfiguration,
        };
      }
      if (typeof channelProfile !== 'undefined') {
        config.channelProfile = channelProfile;
      }
      if (web) {
        config.web = web;
      }
    }
    return config;
  }

  static setParameters(params: string) {
    const { host, uiConfigs, themes } = JSON.parse(params) || {};

    if (host) {
      this._config.host = host;
    }

    if (uiConfigs) {
      Object.keys(uiConfigs).forEach((k) => {
        loadUIConfig(parseInt(k), uiConfigs[k]);
      });
    }

    if (themes) {
      Object.keys(themes).forEach((k) => {
        loadTheme(k, themes[k]);
      });
    }
  }

  static getLoadedScenes() {
    return supportedRoomTypes.map((roomType) => {
      const name = uiConfigs[roomType].name ?? '';

      return {
        name,
        roomType,
      };
    });
  }

  static config(config: ConfigParams) {
    this._appId = config.appId;
    if (config.region) {
      this._region = this._convertRegion(config.region);
    }
  }

  static get widgets() {
    return this._widgets || {};
  }

  static get language() {
    return this._language || 'en';
  }

  static get uiConfig() {
    return this._uiConfig;
  }

  static get theme() {
    return this._theme;
  }

  static get uiMode() {
    return this._uiMode;
  }

  static get shareUrl() {
    return this._shareUrl;
  }

  static get virtualBackgroundImages() {
    return this._virtualBackgroundImages;
  }

  static get virtualBackgroundVideos() {
    return this._virtualBackgroundVideos;
  }

  private static _validateOptions(option: LaunchOption) {
    const isInvalid = (value: string) => value === undefined || value === null || value === '';

    if (!option) {
      throw new Error('AgoraEduSDK: LaunchOption is required!');
    } else if (
      ![
        EduRoleTypeEnum.assistant,
        EduRoleTypeEnum.invisible,
        EduRoleTypeEnum.none,
        EduRoleTypeEnum.student,
        EduRoleTypeEnum.teacher,
        EduRoleTypeEnum.observer,
      ].includes(option.roleType)
    ) {
      throw new Error('AgoraEduSDK: Invalid roleType!');
    } else if (![EduRoomTypeEnum.CloudClass].includes(option.roomType)) {
      throw new Error('AgoraEduSDK: Invalid roomType!');
    } else if (isInvalid(option.userName)) {
      throw new Error('AgoraEduSDK: userName is required');
    } else if (isInvalid(option.userUuid)) {
      throw new Error('AgoraEduSDK: userUuid is required');
    } else if (isInvalid(option.roomName)) {
      throw new Error('AgoraEduSDK: roomName is required');
    } else if (isInvalid(option.roomUuid)) {
      throw new Error('AgoraEduSDK: roomUuid is required');
    } else if (
      typeof option.rtcCloudProxyType !== 'undefined' &&
      ![AgoraCloudProxyType.Automatic, AgoraCloudProxyType.TCP, AgoraCloudProxyType.UDP]
    ) {
      throw new Error(`AgoraEduSDK: ${option.rtcCloudProxyType} is not valid value for cloudProxy`);
    }
  }

  static launch(dom: HTMLElement, option: LaunchOption) {
    if (isLocked()) {
      Logger.error(
        '[AgoraEduSDK]failed to launch as you have already launched a classroom, you need to destory it by call the function returned by the launch method before you relaunch it',
      );
      return () => {
        /** noop */
      };
    }
    Logger.info('[AgoraEduSDK]launched with options:', option);
    EduContext.reset();
    this._validateOptions(option);

    const {
      userUuid,
      userName,
      roleType,
      rtmToken,
      roomUuid,
      roomName,
      roomType,
      duration,

      startTime,
      shareUrl = '',
      latencyLevel,
      userFlexProperties,
      language,
      widgets = {},
    } = option;

    const sessionInfo = {
      userUuid,
      userName,
      role: roleType,
      roomUuid,
      roomName,
      roomType,
      duration,
      flexProperties: userFlexProperties,
      token: rtmToken,
      startTime,
      roomTemplate: RoomTemplate.FINITY_CLOUD_CLASS,
    };
    this._shareUrl = shareUrl;
    this._language = language;

    this._widgets = widgets;

    changeLanguage(language);

    const config = new EduClassroomConfig(
      this._appId,
      sessionInfo,
      '',
      {
        latencyLevel,
        region: this._region,
        rtcConfigs: {
          ...this._convertMediaOptions(option.mediaOptions),
          ...{
            noDevicePermission: true,
          },
        },
        rtcSDKExtensions: [],
        rtcCloudProxyType: option.rtcCloudProxyType,
        rtmCloudProxyEnabled: option.rtmCloudProxyEnabled,
      },
      Platform.H5,
      Object.assign(
        { openCameraDeviceAfterLaunch: false, openRecordingDeviceAfterLaunch: false },
        {},
      ),
    );

    if (this._config.host) {
      config.host = this._config.host;
    }

    config.ignoreUrlRegionPrefix = ['dev', 'pre'].some((v) =>
      this._config.host ? this._config.host.includes(v) : false,
    );

    EduClassroomConfig.setConfig(config);

    EduEventCenter.shared.onClassroomEvents(option.listener);

    this._selectUITheme(this._uiMode, option.roomType);
    applyTheme(this._theme);

    addResourceBundle('en', en);
    addResourceBundle('zh', zh);

    render(
      <Providers language={option.language} uiConfig={this.uiConfig} theme={this.theme}>
        <Scenarios pretest={false} roomType={roomType} />
      </Providers>,
      dom,
    );

    lock();
    return () => {
      unmountComponentAtNode(dom);
      unlock();
    };
  }

  private static _selectUITheme(uiMode: FcrMultiThemeMode, roomType: EduRoomTypeEnum) {
    const themeMode = uiMode ?? FcrMultiThemeMode.light;
    this._uiConfig = uiConfigs[roomType];
    this._theme = themes['default'][themeMode];
  }

  static setRecordReady() {
    const {
      rteEngineConfig: { ignoreUrlRegionPrefix, region },
      sessionInfo: { roomUuid },
      appId,
    } = EduClassroomConfig.shared;
    const pathPrefix = `${
      ignoreUrlRegionPrefix ? '' : '/' + region.toLowerCase()
    }/edu/apps/${appId}`;
    new ApiBase().fetch({
      path: `/v2/rooms/${roomUuid}/records/ready`,
      method: 'PUT',
      pathPrefix,
    });
  }
}
