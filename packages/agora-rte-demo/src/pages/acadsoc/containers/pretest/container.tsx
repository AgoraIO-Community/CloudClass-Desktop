import styles from './style.module.scss'
import React, { useEffect, useState, useCallback, useRef } from 'react'
import {observer} from 'mobx-react'
import { PretestHeader, VideoDetect, AudioDetect, SpeakerDetect, TestReport, PretestButton } from './component'
import { useAppStore, usePretestStore } from '@/hooks'
import { t } from '@/i18n'
import { useHistory, useLocation } from 'react-router-dom'

export interface PretestComponentProps {
  onClickMenu?: (type: string) => any,
  onNext?: (type: string, result: string) => any,
  headerTitle: string,
  children?: React.ElementType
}

export const PretestContainer: React.FC<PretestComponentProps> = observer((props) => {

  const history = useHistory()

  const appStore = useAppStore()

  const location = useLocation()

  const pretestStore = usePretestStore()

  const [tab, setTabValue] = useState<string>('video')

  const lock = useRef<boolean>(false)

  const acquireLock = () => {
    lock.current = true
    return () => {
      lock.current = false
    }
  }

  const onNext = async (nextValue: String) => {
    if (nextValue === 'video') {
      const unlock = acquireLock()
      try {
        await pretestStore.init({video: true})
        await pretestStore.openTestCamera()
      } catch (err) {
      }

      unlock()
      setTabValue('video')
    }

    if (nextValue === 'audio') {
      const unlock = acquireLock()
      try {
        await pretestStore.closeTestCamera()
        await pretestStore.init({audio: true})
        await pretestStore.openTestMicrophone()
      } catch(err) {
      }
      unlock()
      setTabValue('audio')
    }

    if (nextValue === 'speaker') {
      const lock = acquireLock()
      try {
        await pretestStore.closeTestMicrophone()
      } catch(err) {
      }
      lock()
      setTabValue('speaker')
    }

    if (nextValue === 'report') {
      const lock = acquireLock()
      try {
        await pretestStore.closeTestMicrophone()
      } catch(err) {

      }
      lock()
      setTabValue('report')
    }
  }

  useEffect(() => {
    onNext('video')
  }, [])

  const camOk = useCallback(async () => {
    if (!lock.current) {
      pretestStore.setCameraTestResult(pretestStore.cameraLabel)
      await onNext('audio')
    }
  }, [lock.current])

  const camNo = useCallback(async () => {
    if (!lock.current) {
      pretestStore.setCameraTestResult('error')
      await onNext('audio')
    }
  }, [lock.current])

  const micOk = useCallback(async () => {
    if (!lock.current) {
      pretestStore.setMicrophoneTestResult(pretestStore.microphoneLabel)
      await onNext('speaker')
    }
  }, [lock.current])

  const micNo = useCallback(async () => {
    if (!lock.current) {
      pretestStore.setMicrophoneTestResult('error')
      await onNext('speaker')
    }
  }, [lock.current])

  const speakerOk = useCallback(async () => {
    if (!lock.current) {
      pretestStore.setSpeakerTestResult(pretestStore.speakerLabel)
      await onNext('report')
    }
  }, [lock.current])

  const speakerNo = useCallback(async () => {
    if (!lock.current) {
      pretestStore.setSpeakerTestResult('error')
      await onNext('report')
    }
  }, [lock.current])

  const reportOK = useCallback(async () => {
    if (!lock.current) {
      await onNext('video')
      pretestStore.setSpeakerTestResult('error')
      pretestStore.setMicrophoneTestResult('error')
      pretestStore.setCameraTestResult('error')
    }
  }, [lock.current])

  const reportNo = useCallback(async () => {
    if (!lock.current) {
      if (appStore.params?.roomPath) {
        history.push(appStore.params?.roomPath)
        return
      }
      if (location.pathname === '/pretest') {
        history.push('/')
      }
    }
  }, [lock.current])

  return (
    <div className={styles.pretestContainer}>
      <div className={styles.leftMenu}>
        <PretestButton
          text={t("aclass.device.videoDetectTitle")}
          type="video"
          active={tab === "video"}
          onClick={(type: string) => {
            props.onClickMenu && props.onClickMenu(type)
          }}
        />
        <PretestButton
          text={t("aclass.device.audioDetectTitle")}
          type="audio"
          active={tab === "audio"}
          onClick={(type: string) => {
            props.onClickMenu && props.onClickMenu(type)
          }}
        />
        <PretestButton
          text={t("aclass.device.speakerDetectTitle")}
          type="speaker"
          active={tab === "speaker"}
          onClick={(type: string) => {
            props.onClickMenu && props.onClickMenu(type)
          }}
        />
      </div>
      <div className={styles.rightFrame}>
        <PretestHeader title={props.headerTitle} />
        {
          tab === 'video' ? 
          <VideoDetect
            cameraId={pretestStore.cameraId}
            value={pretestStore.cameraId}
            renderer={pretestStore.cameraRenderer}
            label={t("aclass.device.camera")}
            detectText={t("aclass.device.videoDetectText")}
            yesText={t("aclass.device.yes")}
            noText={t("aclass.device.no")}
            // disableBtnGroup={lock}
            onYes={camOk}
            onNo={camNo}
            list={pretestStore.cameraList}
            onChange={async (evt: any) => {
              lock.current = true
              try {
                await pretestStore.changeTestCamera(evt.target.value)
                lock.current = false
              } catch (err) {
                lock.current = false
                throw err
              }
            }}
          /> : null
        }
        {
          tab === 'audio' ? 
          <AudioDetect
            value={pretestStore.microphoneId}
            label={t("aclass.device.mic")}
            detectText={t("aclass.device.audioDetectText")}
            yesText={t("aclass.device.yes")}
            noText={t("aclass.device.no")}
            volume={pretestStore.totalVolume}
            onYes={micOk}
            onNo={micNo}
            list={pretestStore.microphoneList}
            onChange={async (evt: any) => {
              lock.current = true
              try {
                await pretestStore.changeTestMicrophone(evt.target.value)
                lock.current = false
              } catch (err) {
                lock.current = false
                throw err
              }
            }}
          /> : null
        }
        {
          tab === 'speaker' ?
          <SpeakerDetect
            value={pretestStore.speakerId}
            url="https://webdemo.agora.io/test_audio.mp3"
            // detectText="请点击播放按钮，是否能听到声音呢？"
            detectText={t("aclass.device.speakerDetectText")}
            label={t("aclass.device.speaker")}
            yesText={t("aclass.device.yes")}
            noText={t("aclass.device.no")}
            onYes={speakerOk}
            onNo={speakerNo}
            list={pretestStore.speakerList}
            onChange={async (evt: any) => {
              lock.current = true
              try {
                await pretestStore.changeTestSpeaker(evt.target.value)
                lock.current = false
              } catch (err) {
                lock.current = false
                throw err
              }
            }}
          /> : null
        }
        {
          tab === 'report' ?
          <TestReport
            onYes={reportOK}
            onNo={reportNo}
            yesText={t("aclass.device.repeat")}
            noText={t("aclass.device.enter")}
            result={pretestStore.deviceTestSuccess}
            resultText={pretestStore.deviceTestSuccess ? t("aclass.device.report_result_success") : t("aclass.device.report_result_failed")}
            videoText={pretestStore.cameraTestResult === 'error' ? t("aclass.device.cameraTestFailed") : pretestStore.cameraTestResult}
            video={pretestStore.cameraTestResult !== 'error'}
            audioText={pretestStore.microphoneTestResult === 'error' ? t("aclass.device.microphoneTestFailed") : pretestStore.microphoneTestResult}
            audio={pretestStore.microphoneTestResult !== 'error'}
            speakerText={pretestStore.speakerTestResult === 'error' ? t("aclass.device.speakerTestFailed") : pretestStore.speakerTestResult}
            speaker={pretestStore.speakerTestResult !== 'error'}
          /> : null
        }
      </div>
    </div>
  )
})