import { ReactChild, ReactElement } from 'react';
import { SceneDefinition } from 'white-web-sdk';
import { GenericErrorWrapper } from 'agora-rte-sdk';
import { AgoraEduSDKConfigParams, LaunchOption } from '../declare';
import { CoreContextProvider } from '../../context/core';
import { globalConfigs } from '../../utilities/config';
import { eduSDKApi } from '../../services/edu-sdk-api';
import { controller } from './controller';
import { checkConfigParams, checkLaunchOption } from './validator';
// import { setRoutesMap, defaultRoutePath } from "./resolver"
// @ts-ignore
import { AgoraChatWidget, AgoraHXChatWidget } from 'agora-widget-gallery';

export type AgoraEduBoardScene = SceneDefinition;

export type AgoraEduCourseWare = {
  resourceUuid: string;
  resourceName: string;
  scenePath: string;
  scenes: AgoraEduBoardScene[];
  url: string;
  type: string;
};

export const ChatWidgetFactory = (region: string) => {
  if (region.toUpperCase() === 'CN') {
    return new AgoraHXChatWidget();
  }
  return new AgoraChatWidget();
};

type SDKConfig = {
  configParams: AgoraEduSDKConfigParams;
};

const sdkConfig: SDKConfig = {
  configParams: {
    appId: '',
  },
};

const getLiveRoomPath = (roomType: number) => {
  return (
    globalConfigs.routesMap.routesPath[roomType]?.path ?? globalConfigs.routesMap.defaultRoutePath
  );
};

export class AgoraEduCoreSDK {
  static get version(): string {
    return '1.1.0';
  }

  static _debug: boolean = false;

  static _list: AgoraEduCourseWare[];

  // @internal
  static configCourseWares(list: AgoraEduCourseWare[]) {
    this._list = list;
  }

  static config(params: AgoraEduSDKConfigParams) {
    checkConfigParams(params);

    Object.assign(sdkConfig.configParams, params);

    globalConfigs.setRegion(params.region ?? 'GLOBAL');

    console.log('# set config ', sdkConfig.configParams, ' params ', params);
    // globalConfigs should only be copied here
    eduSDKApi.updateConfig({
      sdkDomain: globalConfigs.sdkDomain,
      appId: sdkConfig.configParams.appId,
    });
  }

  // @internal
  static setParameters(params: string) {
    try {
      let json = JSON.parse(params);
      if (json['edu.routesMap']) {
        globalConfigs.setRoutesMap(json['edu.routesMap']);
      }
      if (json['edu.apiUrl']) {
        globalConfigs.setSDKDomain(json['edu.apiUrl']);
      }
      if (json['reportUrl'] && json['reportQos'] && json['reportV1Url']) {
        globalConfigs.setReportConfig({
          sdkDomain: json['reportUrl'],
          qos: +json['reportQos'],
          v1SdkDomain: json['reportV1Url'],
        });
      } else {
        globalConfigs.setReportConfig();
      }
      console.info(`setParameters ${params}`);
    } catch (e) {
      console.error(`parse private params failed ${params}`);
    }
  }

  static _launchTime = 0;

  static _replayTime = 0;

  private static appNode: ReactElement | null = null;

  static setAppNode(appNode: ReactElement) {
    this.appNode = appNode;
  }

  /**
   * 开启在线教育场景
   * @param dom DOM元素
   * @param option LaunchOption
   */
  static async launch(dom: HTMLElement, option: LaunchOption, children: ReactChild) {
    console.log('launch ', dom, ' option ', option);

    if (controller.appController.hasCalled) {
      throw GenericErrorWrapper('already launched');
    }

    const unlock = controller.appController.acquireLock();
    try {
      checkLaunchOption(dom, option);
      eduSDKApi.updateRtmInfo({
        rtmUid: option.userUuid,
        rtmToken: option.rtmToken,
      });
      const data = await eduSDKApi.getConfig();

      let mainPath = getLiveRoomPath(option.roomType);
      console.log('mainPath ', mainPath);
      let roomPath = mainPath;

      console.log('main Path', mainPath, ' room Path', roomPath);

      if (option.pretest) {
        mainPath = globalConfigs.routesMap.pretestPath;
      }

      const params = {
        config: {
          rtcArea: globalConfigs.sdkArea.rtcArea,
          rtmArea: globalConfigs.sdkArea.rtmArea,
          agoraAppId: sdkConfig.configParams.appId,
          agoraNetlessAppId: data.netless.appId,
          enableLog: true,
          sdkDomain: `${globalConfigs.sdkDomain}`,
          region: option.region,
          courseWareList: option.courseWareList,
          personalCourseWareList: option.personalCourseWareList,
          vid: data.vid,
          oss: {
            region: data.netless.oss.region,
            bucketName: data.netless.oss.bucket,
            folder: data.netless.oss.folder,
            accessKey: data.netless.oss.accessKey,
            secretKey: data.netless.oss.secretKey,
            endpoint: data.netless.oss.endpoint,
          },
          rtmUid: option.userUuid,
          rtmToken: option.rtmToken,
          recordUrl: option.recordUrl!,
          extApps: option.extApps,
          widgets: Object.assign(
            {
              chat: ChatWidgetFactory(option.region!),
            },
            option.widgets,
          ),
          userFlexProperties: option.userFlexProperties,
          mediaOptions: option.mediaOptions,
        },
        language: option.language,
        startTime: option.startTime,
        duration: option.duration,
        roomInfoParams: {
          roomUuid: option.roomUuid,
          userUuid: option.userUuid,
          roomName: option.roomName,
          userName: option.userName,
          userRole: option.roleType,
          roomType: +option.roomType,
        },
        resetRoomInfo: false,
        mainPath: mainPath,
        roomPath: roomPath,
        pretest: option.pretest,
      };
      controller.appController.create(
        <CoreContextProvider params={params} dom={dom} controller={controller.appController}>
          {children}
        </CoreContextProvider>,
        dom,
        option.listener,
      );
      unlock();
    } catch (err) {
      unlock();
      throw GenericErrorWrapper(err);
    }

    return controller.appController.getClassRoom();
  }
}
