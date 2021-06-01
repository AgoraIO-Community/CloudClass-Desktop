import 'promise-polyfill/src/polyfill';
import ReactDOM from 'react-dom';
// import { App } from '@/infra/monolithic/app';
import { isElectron } from '@/infra/utils';
import { EduManager } from 'agora-rte-sdk';
import { AppStoreInitParams, CoreContextProvider, eduSDKApi } from 'agora-edu-core';
import { GlobalStorage } from '@/infra/utils';

//@ts-ignore
import { stopReportingRuntimeErrors } from "react-error-overlay";
import React, { useEffect, useRef } from 'react';
import { Premium } from './infra/monolithic/premium';
import { BizPagePath } from '../../agora-edu-core/src/types';
import { EduSDKController } from './infra/api/controller';

// NOTE: 改方法仅在开发环境生效，所以在开发环境禁止。
if (process.env.NODE_ENV === "development") {
  stopReportingRuntimeErrors(); // disables error overlays
}

GlobalStorage.useSessionStorage()

if (isElectron) {
  EduManager.useElectron()
}

eduSDKApi.updateConfig({
  sdkDomain: `${REACT_APP_AGORA_APP_SDK_DOMAIN}`,
  appId: `${REACT_APP_AGORA_APP_ID}`,
})

let controller = new EduSDKController()

const params:AppStoreInitParams = {
  config: {
    rtcArea: "GLOBAL",
    rtmArea: "GLOBAL",
    agoraAppId: "f488493d1886435f963dfb3d95984fd4",
    agoraNetlessAppId: "",
    enableLog: true,
    sdkDomain: `https://api-solutions-dev.bj2.agoralab.co`,
    region: "CN",
    courseWareList: [],
    personalCourseWareList: [],
    vid: 0,
    oss: {
      region: "",
      bucketName: "",
      folder: "",
      accessKey: "123",
      secretKey: "123",
      endpoint: ""
    },
    rtmUid: "user01",
    rtmToken: "006f488493d1886435f963dfb3d95984fd4IAB8eJsKCUuCV98dNRYolF6KEBt1IgDkMZ4YjhoW63rU+ggqSoEAAAAAEABRcvWnxmm3YAEA6APGabdg",
    recordUrl: "",
    extApps: [],
    widgets: {...{/*'chat':new AgoraChatWidget()*/}, ...{}},
    userFlexProperties: {}
  },
  language: 'zh',
  startTime: undefined,
  duration: undefined,
  roomInfoParams: {
    roomUuid: "testroom",
    userUuid: "user01",
    roomName: "room",
    userName: "qianze",
    userRole: 1,
    roomType: 4,
  },
  resetRoomInfo: false,
  mainPath: BizPagePath.OneToOnePath,
  roomPath: BizPagePath.OneToOnePath,
  pretest: true,
}
const App = () => {
  
  return (
    <Premium></Premium>
  )
}

const dom = document.getElementById('root')

controller.create(
  <CoreContextProvider params={params} dom={dom!} controller={controller}>
      <App />
  </CoreContextProvider>,
  dom!,
  () => {

  }
)