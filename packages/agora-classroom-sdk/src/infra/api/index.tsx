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
  Platform,
} from 'agora-edu-core';
import {
  AgoraChatWidget,
  AgoraCountdown,
  AgoraHXChatWidget,
  AgoraPolling,
  AgoraSelector,
  FcrBoardWidget,
  FcrStreamMediaPlayerWidget,
  FcrWebviewWidget,
} from 'agora-plugin-gallery';
import { ApiBase } from 'agora-rte-sdk';
import { render, unmountComponentAtNode } from 'react-dom';
import { I18nProvider } from '~ui-kit';
import { EduContext } from '../contexts';
import { createCloudResource } from '../stores/common/cloud-drive/helper';
import './polyfills';
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
  WindowID,
} from './type';

export * from './type';

export class AgoraEduSDK {
  private static _config: any = {};
  private static _widgets: Record<string, typeof AgoraWidgetBase> = {};
  private static _coursewareList: CourseWareList = [];
  private static _boardWindowAnimationOptions: BoardWindowAnimationOptions = {};
  private static _language: string;
  private static appId = '';
  //default use GLOBAL region(including CN)
  private static region: EduRegion = EduRegion.CN;

  private static convertRegion(region: string): EduRegion {
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
  private static convertMediaOptions(opts?: LaunchMediaOptions): ConvertMediaOptionsConfig {
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
    const { host } = JSON.parse(params) || {};
    AgoraEduSDK._config.host = host;
  }

  static config(config: ConfigParams) {
    AgoraEduSDK.appId = config.appId;
    if (config.region) {
      AgoraEduSDK.region = AgoraEduSDK.convertRegion(config.region);
    }
  }

  static get widgets() {
    return AgoraEduSDK._widgets || {};
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

  static validateOptions(option: LaunchOption) {
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
    }
  }

  static getWidgetName(widgetClass: unknown) {
    const Clz = widgetClass as typeof AgoraWidgetBase;
    return Object.create(Clz.prototype).widgetName;
  }

  static launch(dom: HTMLElement, option: LaunchOption) {
    EduContext.reset();
    AgoraEduSDK.validateOptions(option);
    const {
      pretest,
      userUuid,
      userName,
      roleType,
      roomSubtype = EduRoomSubtypeEnum.Standard,
      roomServiceType = EduRoomServiceTypeEnum.Live,
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

    AgoraEduSDK._language = option.language;

    AgoraEduSDK._widgets = {
      ...option.widgets,
      [this.getWidgetName(AgoraChatWidget)]: AgoraChatWidget,
      [this.getWidgetName(AgoraHXChatWidget)]: AgoraHXChatWidget,
      [this.getWidgetName(AgoraCountdown)]: AgoraCountdown,
      [this.getWidgetName(AgoraSelector)]: AgoraSelector,
      [this.getWidgetName(AgoraPolling)]: AgoraPolling,
      [this.getWidgetName(FcrBoardWidget)]: FcrBoardWidget,
      [this.getWidgetName(FcrWebviewWidget)]: FcrWebviewWidget,
      [this.getWidgetName(FcrStreamMediaPlayerWidget)]: FcrStreamMediaPlayerWidget,
    };

    //TODO:待优化。 问题：合流转推(学生) 和 伪直播 场景不需要白板插件，因为它们使用的都是大班课的班型，所以不能通过后端禁用白板。
    if (
      option.roomServiceType === EduRoomServiceTypeEnum.HostingScene ||
      (EduRoomServiceTypeEnum.MixStreamCDN === option.roomServiceType &&
        option.roleType !== EduRoleTypeEnum.teacher)
    ) {
      const widgetName = AgoraEduSDK.getWidgetName(FcrBoardWidget);
      delete AgoraEduSDK._widgets[widgetName];
    }

    const config = new EduClassroomConfig(
      AgoraEduSDK.appId,
      sessionInfo,
      option.recordUrl || '',
      {
        region: AgoraEduSDK.region,
        rtcConfigs: {
          ...AgoraEduSDK.convertMediaOptions(option.mediaOptions),
          ...{
            noDevicePermission: roleType === EduRoleTypeEnum.invisible,
          },
        },
      },
      platform,
      recordRetryTimeout ? { recordRetryTimeout } : undefined,
    );

    if (AgoraEduSDK._config.host) {
      config.host = AgoraEduSDK._config.host;
    }
    config.ignoreUrlRegionPrefix = config.host.includes('dev') || config.host.includes('pre');

    if (courseWareList) {
      this._coursewareList = courseWareList.map((data: CourseWareItem) =>
        createCloudResource(data),
      );
    }

    if (recordOptions) {
      AgoraEduSDK._boardWindowAnimationOptions = recordOptions;
    }

    EduClassroomConfig.setConfig(config);

    EduEventCenter.shared.onClassroomEvents((event: AgoraEduClassroomEvent, ...args) => {
      if (event === AgoraEduClassroomEvent.Ready) {
        AgoraEduSDK.setRecordReady();
      }
      if (event === AgoraEduClassroomEvent.Destroyed) {
        unmountComponentAtNode(dom);
      }

      option.listener(event, ...args);
    });

    render(
      <I18nProvider language={option.language}>
        <Scenarios
          pretest={pretest}
          roomType={sessionInfo.roomType}
          roomSubtype={sessionInfo.roomSubtype}
        />
      </I18nProvider>,
      dom,
    );
  }

  static getWindowByID(id: WindowID, props: any) {
    switch (id) {
      case WindowID.RemoteControlBar:
        return <ControlBar {...props} />;
    }
    return <div />;
  }

  static launchWindow(dom: HTMLElement, option: LaunchWindowOption) {
    render(
      <I18nProvider language={option.language}>
        {this.getWindowByID(option.windowID, option.args)}
      </I18nProvider>,
      dom,
    );

    return () => {
      unmountComponentAtNode(dom);
    };
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
