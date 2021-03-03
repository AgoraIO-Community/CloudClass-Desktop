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

GlobalStorage.useSessionStorage()
//@ts-ignore
window.AgoraEduSDK = AgoraEduSDK

if (isElectron) {
  EduManager.useElectron()
}
const search = new URLSearchParams(location.href.split('?').pop())
eduSDKApi.updateConfig({
  sdkDomain: `${REACT_APP_AGORA_APP_SDK_DOMAIN}`,
  appId: search.get('appId') || `${REACT_APP_AGORA_APP_ID}`,
})

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
      agoraAppId: `${REACT_APP_AGORA_APP_ID}`,
      agoraNetlessAppId: `${REACT_APP_NETLESS_APP_ID}`,
      // agoraRestFullToken: window.btoa(`${REACT_APP_AGORA_CUSTOMER_ID}:${REACT_APP_AGORA_CUSTOMER_CERTIFICATE}`),
      sdkDomain: `${REACT_APP_AGORA_APP_SDK_DOMAIN}`,
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