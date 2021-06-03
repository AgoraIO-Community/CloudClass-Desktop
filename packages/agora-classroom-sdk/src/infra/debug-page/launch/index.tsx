import { AgoraEduSDK, AgoraEduEvent} from '../../api'
import { globalConfigs } from 'agora-edu-core'
import {ClassRoom, ClassRoomAbstractStore, controller } from '../../api/controller'
import { useHomeStore } from '@/infra/hooks'
import { isEmpty } from 'lodash'
import { observer } from 'mobx-react'
import { useCallback, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom'
import {generatePath} from 'react-router'
//@ts-ignore
import { AgoraExtAppCountDown, AgoraExtAppWhiteboard } from 'agora-plugin-gallery'
import { RtmTokenBuilder, RtmRole } from 'agora-access-token'
import MD5 from 'js-md5'

//@ts-ignore
window.controller = controller

export const LaunchPage = observer(() => {

  const homeStore = useHomeStore()

  const history = useHistory()

  const launchOption = homeStore.launchOption

  const roomRef = useRef<ClassRoom<ClassRoomAbstractStore> | null>(null)

  useEffect(() => {
    if (!launchOption || isEmpty(launchOption)) {
      history.push('/')
      return 
    }
  }, [])

  const mountLaunch = useCallback(async (dom: any) => {
    if (dom) {
      AgoraEduSDK.setParameters(JSON.stringify({
        'edu.apiUrl': `${REACT_APP_AGORA_APP_SDK_DOMAIN}`,
        'reportUrl': `${REACT_APP_REPORT_URL}`,
        'reportQos': `${REACT_APP_REPORT_QOS}`,
      }))
      AgoraEduSDK.config({
        appId: `${REACT_APP_AGORA_APP_ID}`,
        // region: launchOption.region ?? "CN",
      })
      // this is for DEBUG PURPOSE only. please do not store certificate in client, it's not safe.
      // 此处仅为开发调试使用, token应该通过服务端生成, 请确保不要把证书保存在客户端
      const appCertificate = `${REACT_APP_AGORA_APP_CERTIFICATE}`
      if(appCertificate) {
        launchOption.rtmToken = RtmTokenBuilder.buildToken(
          `${REACT_APP_AGORA_APP_ID}`,
          appCertificate,
          launchOption.userUuid,
          RtmRole.Rtm_User,
          0
        )
      }

      launchOption.extApps = [new AgoraExtAppCountDown(launchOption.language as any)]
      const genH5Scenes = (size: number) => {
        return new Array(size).fill(1).map((_, index) => ({ name: `${index + 1}` }));
      }

      const size = 10

      roomRef.current = await AgoraEduSDK.launch(dom, {
        ...launchOption,
        // TODO:  这里需要传递开发者自己发布的录制页面地址
        recordUrl: AGORA_APAAS_BRANCH_PATH ? `https://webdemo.agora.io/flexible-classroom/${AGORA_APAAS_BRANCH_PATH}/record_page` : `https://webdemo.agora.io/flexible-classroom/record_page`,
        courseWareList: [
          {
          resourceName: 'H5课件',
          resourceUuid: `h5${MD5('https://demo-h5.netless.group/dist2020/')}`,
          ext: 'h5',
          url: 'https://demo-h5.netless.group/dist2020/',
          conversion: {
              type: 'static',
          },
          size: 0,
          updateTime: 0,
          scenes: genH5Scenes(size),
          convert: false,
          taskUuid: '',
          taskToken: '',
          taskProgress: {
              totalPageSize: size,
              convertedPageSize: 0,
              convertedPercentage: 100,
              convertedFileList: []
          },
        },
        {
          resourceName: 'H5课件2',
          resourceUuid: `h5${MD5('https://demo-h5.netless.group/dist2020/')}1`,
          ext: 'h5',
          url: 'https://demo-h5.netless.group/dist2020/',
          conversion: {
              type: 'static',
          },
          size: 0,
          updateTime: 0,
          scenes: genH5Scenes(size),
          convert: false,
          taskUuid: '',
          taskToken: '',
          taskProgress: {
              totalPageSize: size,
              convertedPageSize: 0,
              convertedPercentage: 100,
              convertedFileList: []
          },
        }
      ],
        // recordUrl: `${REACT_APP_AGORA_APP_RECORD_URL}`,
        listener: (evt: AgoraEduEvent) => {
          console.log("launch#listener ", evt)
          if (evt === AgoraEduEvent.destroyed) {
            history.push('/')
          }
        }
      })
    }
    return () => {
      if (roomRef.current) {
        roomRef.current.destroy()
      }
    }
  }, [AgoraEduSDK])

  return (
    <div ref={mountLaunch} id="app" style={{width: '100%', height: '100%', background: '#F9F9FC'}}></div>
  )
})