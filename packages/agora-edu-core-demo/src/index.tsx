import 'promise-polyfill/src/polyfill';
import ReactDOM from 'react-dom';
// import { App } from '@/infra/monolithic/app';
import { isElectron } from '@/infra/utils';
import { EduManager } from 'agora-rte-sdk';
import { AppStoreInitParams, CoreContextProvider, eduSDKApi } from 'agora-edu-core';
import { GlobalStorage } from '@/infra/utils';

//@ts-ignore
import { stopReportingRuntimeErrors } from "react-error-overlay";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Premium } from './infra/monolithic/premium';
import { BizPagePath } from '../../agora-edu-core/src/types';
import { EduSDKController } from './infra/api/controller';
import { RtmTokenBuilder, RtmRole } from 'agora-access-token'

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

let params:AppStoreInitParams = {
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
    userName: "test-demo",
    userRole: 1,
    roomType: 4,
  },
  resetRoomInfo: false,
  mainPath: BizPagePath.OneToOnePath,
  roomPath: BizPagePath.OneToOnePath,
  pretest: true,
}
const App = () => {

  const [roomUuid, setRoomUuid] = useState<string>("")
  const [userUuid, setUserUuid] = useState<string>("")
  const [userRole, setUserRole] = useState<string>("1")

  
  const onInitialize = useCallback(() => {
    const dom = document.getElementById('classroom')
    // params.config.rtmToken = token
    // params.config.agoraAppId = appid
    params.roomInfoParams!.roomUuid = roomUuid
    params.roomInfoParams!.userUuid = userUuid
    params.roomInfoParams!.userRole = +userRole


    // this is for DEBUG PURPOSE only. please do not store certificate in client, it's not safe.
    // 此处仅为开发调试使用, token应该通过服务端生成, 请确保不要把证书保存在客户端
    const appCertificate = `${REACT_APP_AGORA_APP_CERTIFICATE}`
    if(appCertificate) {
      params.config.rtmToken = RtmTokenBuilder.buildToken(
        `${REACT_APP_AGORA_APP_ID}`,
        appCertificate,
        userUuid,
        RtmRole.Rtm_User,
        0
      )
    }


    controller.create(
      <CoreContextProvider params={params} dom={dom!} controller={controller}>
        <Premium></Premium>
      </CoreContextProvider>,
      dom!,
      () => {

      }
    )
  }, [roomUuid, userUuid, userRole])

  return (
    <div className="container mx-auto md:flex h-full">
        <div style={{
            maxWidth: 'calc(.25rem * 64)'
        }}>
            <div className="md:flex md:flex-col w-full text-xs md:mt-4">
              <div className="mb-3 md:space-y-2 w-full text-xs">
                <label className="font-semibold text-gray-600 py-2">Room Uuid</label>
                <input value={roomUuid} onChange={e => setRoomUuid(e.currentTarget.value)} placeholder="Enter room uuid" className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4" type="text"/>
                <p className="text-red text-xs hidden">Please fill out this field.</p>
              </div>
              <div className="mb-3 md:space-y-2 w-full text-xs">
                <label className="font-semibold text-gray-600 py-2">User Uuid</label>
                <input value={userUuid} onChange={e => setUserUuid(e.currentTarget.value)} placeholder="Enter user uuid" className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4" type="text"/>
                <p className="text-red text-xs hidden">Please fill out this field.</p>
              </div>
              <div className="mb-3 md:space-y-2 w-full text-xs">
                <label className="font-semibold text-gray-600 py-2">User Role</label>
                <input value={userRole} onChange={e => setUserRole(`${e.currentTarget.value}`)} placeholder="Enter user role" className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4" type="text"/>
                <p className="text-red text-xs hidden">Please fill out this field.</p>
              </div>
            </div>
            <button className="bg-blue-500 text-white py-2 px-8" onClick={onInitialize}>init</button>
        </div>
        <div id="classroom" style={{
            minWidth: 'calc(100% - (.25rem * 64))'
        }}>
        </div>
    </div>
  )
}

const dom = document.getElementById('root')

ReactDOM.render(<App/>, dom)