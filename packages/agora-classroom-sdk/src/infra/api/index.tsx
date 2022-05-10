import { Scenarios } from '@/ui-kit/capabilities/scenarios';
import { ControlBar } from '@/ui-kit/capabilities/containers/fragments';
import {
  EduRoomTypeEnum,
  EduClassroomConfig,
  EduRoleTypeEnum,
  CourseWareList,
  RecordOptions,
  EduRegion,
  EduLanguage,
  EduRtcConfig,
  EduMediaEncryptionMode,
  EduEventCenter,
  AgoraEduClassroomEvent,
  IAgoraWidget,
  Platform,
  IAgoraExtensionApp,
} from 'agora-edu-core';
import { AgoraCountdown, AgoraPolling, AgoraSelector } from 'agora-plugin-gallery';
import { render, unmountComponentAtNode } from 'react-dom';
import { ListenerCallback, WindowID } from './declare';
import { EduContext } from '../contexts';
import { EduVideoEncoderConfiguration, MediaOptions } from 'agora-rte-sdk';
import { AgoraHXChatWidget, AgoraChatWidget } from 'agora-widget-gallery';
import { I18nProvider, i18nResources } from '~ui-kit';

export type LanguageEnum = 'en' | 'zh';
export type TranslateEnum =
  | ''
  | 'auto'
  | 'zh-CHS'
  | 'en'
  | 'ja'
  | 'ko'
  | 'fr'
  | 'es'
  | 'pt'
  | 'it'
  | 'ru'
  | 'vi'
  | 'de'
  | 'ar';

export type ConfigParams = {
  appId: string;
  region?: string;
};

export type LaunchMediaOptions = MediaOptions & {
  lowStreamCameraEncoderConfiguration?: EduVideoEncoderConfiguration;
};

export type ConvertMediaOptionsConfig = EduRtcConfig & {
  defaultLowStreamCameraEncoderConfigurations?: EduVideoEncoderConfiguration;
};

/**
 * LaunchOption 接口
 */
export type LaunchOption = {
  userUuid: string; // 用户uuid
  userName: string; // 用户昵称
  roomUuid: string; // 房间uuid
  roleType: EduRoleTypeEnum; // 角色
  roomType: EduRoomTypeEnum; // 房间类型
  roomName: string; // 房间名称
  listener: ListenerCallback; // launch状态
  pretest: boolean; // 开启设备检测
  // rtmUid: string
  rtmToken: string; // rtmToken
  language: LanguageEnum; // 国际化
  startTime?: number; // 房间开始时间
  duration: number; // 课程时长
  courseWareList: CourseWareList; // 课件列表
  recordUrl?: string; // 回放页地址
  widgets?: { [key: string]: IAgoraWidget };
  userFlexProperties?: { [key: string]: any }; //用户自订属性
  mediaOptions?: LaunchMediaOptions;
  latencyLevel?: 1 | 2;
  platform?: Platform;
  extensions?: IAgoraExtensionApp[]; // 新app插件
  recordOptions?: RecordOptions; // 白板录制参数
  recordRetryTimeout?: number; // 录制重试间隔
};

/**
 *  运行窗口选项
 */
export type LaunchWindowOption = {
  windowID: WindowID; //窗口ID
  language: LanguageEnum; // 语言
  args: any; // 传入属性
};

export { AgoraEduClassroomEvent } from 'agora-edu-core';

const ChatFactory = (region: EduRegion = EduRegion.CN) =>
  region === EduRegion.CN
    ? new AgoraHXChatWidget(EduClassroomConfig.shared)
    : new AgoraChatWidget(EduClassroomConfig.shared);

export class AgoraEduSDK {
  private static _config: any = {};
  private static appId = '';
  //default use GLOBAL region(including CN)
  private static region: EduRegion = EduRegion.CN;
  private static convertLanguage(lang: LanguageEnum): EduLanguage {
    switch (lang) {
      case 'zh':
        return EduLanguage.zh;
      case 'en':
        return EduLanguage.en;
    }
  }
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

  static launch(dom: HTMLElement, option: LaunchOption) {
    EduContext.reset();
    AgoraEduSDK.validateOptions(option);
    const {
      pretest,
      userUuid,
      userName,
      roleType,
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
      duration,
      flexProperties: {},
      token: rtmToken,
      startTime,
    };

    const extensions = [
      new AgoraCountdown(),
      new AgoraSelector(),
      new AgoraPolling(),
    ] as IAgoraExtensionApp[];

    const config = new EduClassroomConfig(
      AgoraEduSDK.appId,
      sessionInfo,
      option.recordUrl || '',
      {
        language: AgoraEduSDK.convertLanguage(option.language),
        region: AgoraEduSDK.region,
        rtcConfigs: {
          ...AgoraEduSDK.convertMediaOptions(option.mediaOptions),
          ...{
            noDevicePermission: roleType === EduRoleTypeEnum.invisible,
          },
        },
      },
      {
        ...option.widgets,
      },
      platform,
      i18nResources,
      option.extensions ? extensions.concat(option.extensions) : extensions,
      recordRetryTimeout ? { recordRetryTimeout } : undefined,
    );

    if (AgoraEduSDK._config.host) {
      config.host = AgoraEduSDK._config.host;
    }
    config.ignoreUrlRegionPrefix = config.host.includes('dev') || config.host.includes('pre');

    if (courseWareList) {
      config.setCourseWareList(courseWareList);
    }

    if (recordOptions) {
      config.setRecordOptions(recordOptions);
    }

    EduClassroomConfig.setConfig(config);

    config.widgets.chat = ChatFactory(AgoraEduSDK.region) as IAgoraWidget;

    EduEventCenter.shared.onClassroomEvents((event: AgoraEduClassroomEvent, ...args) => {
      if (event === AgoraEduClassroomEvent.Destroyed) {
        unmountComponentAtNode(dom);
      }
      option.listener(event, ...args);
    });

    render(
      <I18nProvider language={AgoraEduSDK.convertLanguage(option.language)}>
        <Scenarios pretest={pretest} roomType={sessionInfo.roomType} />
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
      <I18nProvider language={AgoraEduSDK.convertLanguage(option.language)}>
        {this.getWindowByID(option.windowID, option.args)}
      </I18nProvider>,
      dom,
    );

    return () => {
      unmountComponentAtNode(dom);
    };
  }
}

export * from './declare';
export { EduClassroomUIStore } from '../stores/common';
