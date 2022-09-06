import { vocationalNeedPreset } from '@/app/pages/home/vocational';
import { ControlBar } from '@/ui-kit/capabilities/containers/fragments';
import { Scenarios } from '@/ui-kit/capabilities/scenarios';
import {
    AgoraEduClassroomEvent,
    CloudDriveResource,
    EduClassroomConfig,
    EduEventCenter,
    EduMediaEncryptionMode,
    EduRegion,
    EduRoleTypeEnum,
    EduRoomServiceTypeEnum,
    EduRoomSubtypeEnum,
    EduRoomTypeEnum,
    Platform
} from 'agora-edu-core';
import {
    AgoraChatWidget,
    AgoraCountdown,
    AgoraHXChatWidget,
    AgoraPolling,
    AgoraSelector,
    FcrBoardWidget,
    FcrStreamMediaPlayerWidget,
    FcrWebviewWidget
} from 'agora-plugin-gallery';
import { ApiBase } from 'agora-rte-sdk';
import { render, unmountComponentAtNode } from 'react-dom';
import { FcrTheme } from '~ui-kit';
import { EduContext } from '../contexts';

import { createCloudResource } from '../stores/common/cloud-drive/helper';
import { FcrMultiThemeMode, FcrUIConfig } from '../types/config';
import {
    applyTheme,
    loadGeneratedFiles,
    loadTheme,
    loadUIConfig,
    supportedRoomTypes,
    themes,
    uiConfigs
} from '../utils/config-loader';

import './polyfills';
import { Providers } from './providers';
import {
    AgoraWidgetBase,
    BoardWindowAnimationOptions,
    ConfigParams,
    ConvertMediaOptionsConfig,
    CourseWareItem,
    CourseWareList,
    LaunchMediaOptions,
    LaunchOption,
    LaunchWindowOption,
    WindowID
} from './type';

export * from './type';

export class AgoraEduSDK {
  private static _config: any = {};
  private static _widgets: Record<string, typeof AgoraWidgetBase> = {};
  private static _coursewareList: CourseWareList = [];
  private static _boardWindowAnimationOptions: BoardWindowAnimationOptions = {};
  private static _language: string;
  private static _appId = '';
  private static _uiConfig: FcrUIConfig;
  private static _theme: FcrTheme;
  private static _shareUrl: string;
  //default use GLOBAL region(including CN)
  private static region: EduRegion = EduRegion.CN;

  private static _convertRegion(region: string): EduRegion {
    switch (region) {
      case 'CN':
        return EduRegion.CN;
      case 'AS':
        return EduRegion.AP;
      case 'EU':
        return EduRegion.EU;
      case 'NA':
        return EduRegion.NA;
    }
    return region as EduRegion;
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
        roomType
      }
    });
  }

  static config(config: ConfigParams) {
    this._appId = config.appId;
    if (config.region) {
      this.region = this._convertRegion(config.region);
    }
  }

  static get widgets() {
    return this._widgets || {};
  }

  static get courseWareList(): CloudDriveResource[] {
    return this._coursewareList || [];
  }

  static get boardWindowAnimationOptions(): BoardWindowAnimationOptions {
    return this._boardWindowAnimationOptions || {};
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

  static get shareUrl() {
    return this._shareUrl;
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
    } else if (
      ![
        EduRoomTypeEnum.Room1v1Class,
        EduRoomTypeEnum.RoomBigClass,
        EduRoomTypeEnum.RoomSmallClass,
      ].includes(option.roomType)
    ) {
      throw new Error('AgoraEduSDK: Invalid roomType!');
    } else if (isInvalid(option.userName)) {
      throw new Error('AgoraEduSDK: userName is required');
    } else if (isInvalid(option.userUuid)) {
      throw new Error('AgoraEduSDK: userUuid is required');
    } else if (isInvalid(option.roomName)) {
      throw new Error('AgoraEduSDK: roomName is required');
    } else if (isInvalid(option.roomUuid)) {
      throw new Error('AgoraEduSDK: roomUuid is required');
    }
  }

  private static _getWidgetName(widgetClass: unknown) {
    const Clz = widgetClass as typeof AgoraWidgetBase;
    return Object.create(Clz.prototype).widgetName;
  }

  static launch(dom: HTMLElement, option: LaunchOption) {
    EduContext.reset();
    this._validateOptions(option);
    const {
      pretest,
      userUuid,
      userName,
      roleType,
      roomSubtype = EduRoomSubtypeEnum.Standard,
      roomServiceType = EduRoomServiceTypeEnum.LiveStandard,
      rtmToken,
      roomUuid,
      roomName,
      roomType,
      courseWareList,
      duration,
      platform = Platform.PC,
      startTime,
      recordOptions,
      recordRetryTimeout,
      uiMode,
      shareUrl,
    } = option;
    const sessionInfo = {
      userUuid,
      userName,
      role: roleType,
      roomUuid,
      roomName,
      roomType,
      roomSubtype,
      roomServiceType,
      duration,
      flexProperties: {},
      token: rtmToken,
      startTime,
    };

    this._shareUrl = shareUrl || '';

    this._language = option.language;

    this._widgets = {
      ...option.widgets,
      [this._getWidgetName(AgoraChatWidget)]: AgoraChatWidget,
      [this._getWidgetName(AgoraHXChatWidget)]: AgoraHXChatWidget,
      [this._getWidgetName(AgoraCountdown)]: AgoraCountdown,
      [this._getWidgetName(AgoraSelector)]: AgoraSelector,
      [this._getWidgetName(AgoraPolling)]: AgoraPolling,
      [this._getWidgetName(FcrBoardWidget)]: FcrBoardWidget,
      [this._getWidgetName(FcrWebviewWidget)]: FcrWebviewWidget,
      [this._getWidgetName(FcrStreamMediaPlayerWidget)]: FcrStreamMediaPlayerWidget,
    };

    //TODO:待优化。 问题：合流转推(学生) 和 伪直播 场景不需要白板插件，因为它们使用的都是大班课的班型，所以不能通过后端禁用白板。
    if (
      option.roomServiceType === EduRoomServiceTypeEnum.HostingScene ||
      (EduRoomServiceTypeEnum.MixStreamCDN === option.roomServiceType &&
        option.roleType !== EduRoleTypeEnum.teacher)
    ) {
      const widgetName = this._getWidgetName(FcrBoardWidget);
      delete this._widgets[widgetName];
    }

    const config = new EduClassroomConfig(
      this._appId,
      sessionInfo,
      option.recordUrl || '',
      {
        region: this.region,
        rtcConfigs: {
          ...this._convertMediaOptions(option.mediaOptions),
          ...{
            noDevicePermission:
              roleType === EduRoleTypeEnum.invisible ||
              !vocationalNeedPreset(roleType, roomServiceType, roomSubtype),
          },
        },
      },
      platform,
      Object.assign(
        { openCameraDeviceAfterLaunch: pretest, openRecordingDeviceAfterLaunch: pretest },
        recordRetryTimeout ? { recordRetryTimeout } : {},
      ),
    );

    if (this._config.host) {
      config.host = this._config.host;
    }

    config.ignoreUrlRegionPrefix = ['dev', 'pre'].some((v) => config.host.includes(v));

    if (courseWareList) {
      this._coursewareList = courseWareList.map((data: CourseWareItem) =>
        createCloudResource(data),
      );
    }

    if (recordOptions) {
      this._boardWindowAnimationOptions = recordOptions;
    }

    EduClassroomConfig.setConfig(config);

    EduEventCenter.shared.onClassroomEvents((event: AgoraEduClassroomEvent) => {
      if (event === AgoraEduClassroomEvent.Destroyed) {
        unmountComponentAtNode(dom);
      }
    });

    EduEventCenter.shared.onClassroomEvents(option.listener);

    const themeMode = uiMode ?? FcrMultiThemeMode.light;
    this._selectUITheme(themeMode, option.roomType);
    applyTheme(this._theme);
    render(
      <Providers language={option.language} uiConfig={this.uiConfig} theme={this.theme}>
        <Scenarios
          pretest={pretest}
          roomType={sessionInfo.roomType}
          roomSubtype={sessionInfo.roomSubtype}
        />
      </Providers>,
      dom,
    );
  }

  /**
   * 运行窗口UI
   * @param dom
   * @param option
   * @returns
   */
  static launchWindow(dom: HTMLElement, option: LaunchWindowOption) {
    const mapping = {
      [WindowID.RemoteControlBar]: ControlBar,
    };

    const Component = mapping[option.windowID];

    const themeMode = option.uiMode ?? FcrMultiThemeMode.light;
    this._selectUITheme(themeMode, option.roomType);
    applyTheme(this._theme);

    render(
      <Providers language={option.language} uiConfig={this.uiConfig} theme={this.theme}>
        {Component && <Component {...option.args} />}
      </Providers>,
      dom,
    );

    return () => {
      unmountComponentAtNode(dom);
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
    const pathPrefix = `${ignoreUrlRegionPrefix ? '' : '/' + region.toLowerCase()
      }/edu/apps/${appId}`;
    new ApiBase().fetch({
      path: `/v2/rooms/${roomUuid}/records/ready`,
      method: 'PUT',
      pathPrefix,
    });
  }
}

loadGeneratedFiles();
