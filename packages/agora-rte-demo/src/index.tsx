import 'promise-polyfill/src/polyfill';
import './index.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from '@/monolithic/app';
import * as serviceWorker from '@/serviceWorker';
import TagManager from 'react-gtm-module';
import { isElectron } from '@/utils/platform';
import { EduManager } from 'agora-rte-sdk';
import { AgoraEduSDK } from './edu-sdk';
import { eduSDKApi } from './services/edu-sdk-api';
import { GlobalStorage } from '@/utils/custom-storage';
//@ts-ignore
import { stopReportingRuntimeErrors } from "react-error-overlay";

// NOTE: 改方法仅在开发环境生效，所以在开发环境禁止。
if (process.env.NODE_ENV === "development") {
  stopReportingRuntimeErrors(); // disables error overlays
}

// replace fetch to resolve whiteboard convert issue
const mockFetch = fetch;
window.fetch = async function(input: RequestInfo, init?: RequestInit): Promise<Response> {
    if (typeof input === "string") {
        return mockFetch(input.replace("api.netless.link/services/conversion/tasks?roomToken", "shunt-api.netless.link/services/conversion/tasks?roomToken"), init);
    } else {
        return mockFetch({...input, url: input.url.replace("api.netless.link/services/conversion/tasks?roomToken", "shunt-api.netless.link/services/conversion/tasks?roomToken")}, init);
    }
};

GlobalStorage.useSessionStorage()
//@ts-ignore
window.AgoraEduSDK = AgoraEduSDK

if (isElectron) {
  EduManager.useElectron()
}

// eduSDKApi.updateConfig({
//   sdkDomain: `${REACT_APP_AGORA_APP_SDK_DOMAIN}`,
//   appId: `${REACT_APP_AGORA_APP_ID}`,
// })

// AgoraEduSDK.config({
//   appId: `${REACT_APP_AGORA_APP_ID}`,
//   restToken: `${REACT_APP_AGORA_APP_TOKEN}`,
//   token: "eyJhbGciOiJIUzI1NiJ9.eyJhcHBJZCI6ImY0ODg0OTNkMTg4NjQzNWY5NjNkZmIzZDk1OTg0ZmQ0IiwidXNlclV1aWQiOiJqYXNvbnRlYWNoZXIiLCJyb29tVXVpZCI6Imphc29uMSIsImlhdCI6MTYxMDIxMzA1Mn0.9CgTA_y4DNVyXAUPqDsomAz69MQ5DxPRRXlnGSsSv8g"
// })

// // use gtm
// if (REACT_APP_AGORA_GTM_ID) {
//   !isElectron && TagManager.initialize({
//     gtmId: REACT_APP_AGORA_GTM_ID
//   })
// }

// appConfig: AppStoreConfigParams
// roomConfig: RoomParameters

// useEffect(() => {
// }, [])

ReactDOM.render(
  <App
    appConfig={{
      agoraAppId: '',
      agoraNetlessAppId: '',
      sdkDomain: '',
      reportDomain: '',
      enableLog: true,
      rtmToken: '',
      rtmUid: '',
      courseWareList: [],
    }}
  />,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();

// console.log("mountAgoraEduApp")
//@ts-ignore
// window.mountAgoraEduApp = (id: string, basename: string) => {
//   const dom = document.querySelector(`#${id}`)
//   ReactDOM.render(
//     <App basename={basename} />,
//     dom
//   )
// }

// export const AgoraApp = App;