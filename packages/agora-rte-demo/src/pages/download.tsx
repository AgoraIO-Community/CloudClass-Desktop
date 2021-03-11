import { AgoraEduSDK } from '@/edu-sdk'
import { AgoraEduEvent } from '@/edu-sdk/declare'
import { storage } from '@/utils/custom-storage'
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
      courseWareList: storage.getCourseWareSaveList(),
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