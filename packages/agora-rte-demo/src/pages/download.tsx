import { AgoraEduSDK } from '@/edu-sdk'
import { AgoraEduEvent } from '@/edu-sdk/declare'
import React, { useEffect, useRef } from 'react'
import { useHistory } from 'react-router-dom'

export const DownloadPage = () => {
  const history = useHistory();
  const ref = useRef<HTMLDivElement | null>(null)

  const searchParams = new URLSearchParams(window.location.search)

  const bootstrap = async () => {
    AgoraEduSDK.config({
      appId: `${REACT_APP_AGORA_APP_ID}`,
    })

    await AgoraEduSDK.openDisk(ref.current!, {
      language: searchParams.get("lang")?.match(/zh/i) ? "zh" : "en",
      courseWareList: [
        {
          ext: "ppt",
          url: "",
          resourceName: "default_ppt",
          resourceUuid: "93b61ab070ec11eb8122cf10b9ec91f7",
          updateTime: +Date.now(),
          scenes: [],
          conversion: {type: "dynamic"},
          size: 100,
        },
        {
          ext: "ppt",
          url: "",
          resourceName: "default_ppt1",
          resourceUuid: "6ffabb20765611eb9579d36d3e11d923",
          updateTime: +Date.now(),
          scenes: [],
          conversion: {type: "dynamic"},
          size: 100,
        },
      ],
      listener: (evt: any) => {
        if (evt === AgoraEduEvent.destroyed) {
          history.push('/')
        }
      }
    })
  }

  useEffect(() => {
    bootstrap()
  }, [])

  return (<div ref={ref} style={{ width: '100%', height: '100%' }} />)
}