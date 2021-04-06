import 'promise-polyfill/src/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from '@/monolithic/app';
import TagManager from 'react-gtm-module';
import { isElectron } from '@/utils/utils';
import { EduManager } from 'agora-rte-sdk';
import { AgoraEduSDK } from '@/edu-sdk';
import { eduSDKApi } from '@/services/edu-sdk-api';
import { GlobalStorage } from '@/utils/utils';

// 国际化
import '@/i18n/index'

//@ts-ignore
import { stopReportingRuntimeErrors } from "react-error-overlay";

// NOTE: 改方法仅在开发环境生效，所以在开发环境禁止。
if (process.env.NODE_ENV === "development") {
  stopReportingRuntimeErrors(); // disables error overlays
}



GlobalStorage.useSessionStorage()
//@ts-ignore
window.AgoraEduSDK = AgoraEduSDK

if (isElectron) {
  EduManager.useElectron()
}

eduSDKApi.updateConfig({
  sdkDomain: `${REACT_APP_AGORA_APP_SDK_DOMAIN}`,
  appId: `${REACT_APP_AGORA_APP_ID}`,
})

ReactDOM.render(
  <App
    appConfig={{
      agoraAppId: `${REACT_APP_AGORA_APP_ID}`,
      agoraNetlessAppId: `${REACT_APP_NETLESS_APP_ID}`,
      sdkDomain: `${REACT_APP_AGORA_APP_SDK_DOMAIN}`,
      enableLog: true,
      rtmToken: '',
      rtmUid: '',
      courseWareList: [],
      recordUrl: ''
    }}
  />,
  document.getElementById('root')
);