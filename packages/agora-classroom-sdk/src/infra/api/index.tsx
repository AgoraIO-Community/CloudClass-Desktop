import { Scenarios } from '@/ui-kit/capabilities/scenarios';
import {
  EduRoomTypeEnum,
  EduClassroomConfig,
  EduRoleTypeEnum,
  CourseWareList,
  EduRegion,
  EduLanguage,
  EduRtcConfig,
  EduMediaEncryptionMode,
  IAgoraExtApp,
  EduEventCenter,
  AgoraEduClassroomEvent,
  IAgoraWidget,
} from 'agora-edu-core';
import { render, unmountComponentAtNode } from 'react-dom';
import { ListenerCallback } from './declare';
import { EduContext } from '../contexts';
import { MediaOptions } from 'agora-rte-sdk';
import { AgoraHXChatWidget, AgoraChatWidget } from 'agora-widget-gallery';
import { I18nProvider } from '~ui-kit';

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
  startTime: number; // 房间开始时间
  duration: number; // 课程时长
  courseWareList: CourseWareList; // 课件列表
  recordUrl?: string; // 回放页地址
  extApps?: IAgoraExtApp[]; // app插件
  region?: EduRegion;
  widgets?: { [key: string]: IAgoraWidget };
  userFlexProperties?: { [key: string]: any }; //用户自订属性
  mediaOptions?: MediaOptions;
  latencyLevel?: 1 | 2;
};

export { AgoraEduClassroomEvent } from 'agora-edu-core';

const ChatFactory = (region: EduRegion = EduRegion.CN) =>
  region === EduRegion.CN ? new AgoraHXChatWidget() : new AgoraChatWidget();

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
  private static convertMediaOptions(opts?: MediaOptions): EduRtcConfig {
    const config: EduRtcConfig = {};
    if (opts) {
      const { cameraEncoderConfiguration, screenShareEncoderConfiguration, encryptionConfig } =
        opts;
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
    }
    return config;
  }

  static setParameters(params: string) {
    const { host } = JSON.parse(params) || {};
    AgoraEduSDK._config.host = host;
  }

  static config(config: ConfigParams) {
    this.appId = config.appId;
    if (config.region) {
      this.region = this.convertRegion(config.region);
    }
  }

  static async launch(dom: HTMLElement, option: LaunchOption): Promise<any> {
    EduContext.reset();
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
    };

    const config = new EduClassroomConfig(
      this.appId,
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
        chat: ChatFactory(this.region),
        ...option.widgets,
      },
      option.extApps,
    );

    if (AgoraEduSDK._config.host) {
      config.host = AgoraEduSDK._config.host;
    }
    config.ignoreUrlRegionPrefix = config.host.includes('dev') || config.host.includes('pre');

    if (courseWareList) {
      config.setCourseWareList(courseWareList);
    }

    // config.rteEngineConfig.debugI18n = true;
    // setDebugI18n(config.rteEngineConfig.debugI18n);

    EduClassroomConfig.setConfig(config);

    EduEventCenter.shared.onClassroomEvents((event: AgoraEduClassroomEvent, ...args) => {
      if (event === AgoraEduClassroomEvent.destroyed) {
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
}

export * from './declare';
