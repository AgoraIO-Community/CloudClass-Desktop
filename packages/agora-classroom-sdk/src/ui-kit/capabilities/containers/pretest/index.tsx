import { Button, Modal, Pretest, t } from '~ui-kit'
import { observer } from 'mobx-react'
import { PretestUIStore } from './store'
import { useAppStore } from '@/hooks'
import React, { useState, useEffect, useCallback } from 'react'
import { useHistory } from 'react-router'
import { RendererPlayer } from '~utilities/renderer-player'

export const usePretestContext = (pretestStore: PretestUIStore) => {

  
    const [cameraError, setCameraError] = useState<boolean>(false)
    const [microphoneError, setMicrophoneError] = useState<boolean>(false)
    const [isMirror, setMirror] = useState<boolean>(false)
  
    useEffect(() => {
        const uninstall = pretestStore.onDeviceTestError(({type, error}) => {
            if (type === 'video') {
                setCameraError(error)
            }
            if (type === 'audio') {
                setMicrophoneError(error)
            }
        })
        // TODO: need pipe
        pretestStore.init({video: true, audio: true})
        pretestStore.openTestCamera()
        pretestStore.openTestMicrophone({enableRecording: true})
        return () => {
            pretestStore.closeTestCamera()
            pretestStore.closeTestMicrophone()
            uninstall()
        }
    }, [setCameraError, setMicrophoneError])
  
    const {
        cameraList,
        microphoneList,
        speakerList,
        cameraId,
        microphoneId,
        speakerId,
        cameraRenderer,
        microphoneLevel,
    } = pretestStore
  
    const onChangeDevice = useCallback(async (deviceType: string, value: any) => {
        switch (deviceType) {
            case 'camera': {
                await pretestStore.changeTestCamera(value)
                break;
            }
            case 'microphone': {
                await pretestStore.changeTestMicrophone(value)
                break;
            }
            case 'speaker': {
                await pretestStore.changeTestSpeaker(value)
                break;
            }
        }
    }, [pretestStore])
    const onChangeAudioVolume = useCallback(async (deviceType: string, value: any) => {
        switch (deviceType) {
            case 'speaker': {
                await pretestStore.changeTestSpeakerVolume(value)
                break;
            }
            case 'microphone': {
                await pretestStore.changeTestMicrophoneVolume(value)
                break;
            }
        }
    }, [pretestStore])
    const onSelectMirror = useCallback((evt: any) => {
        setMirror(!isMirror)
    }, [pretestStore, isMirror])
  
  
    const VideoPreviewPlayer = useCallback(() => {
        return (
            <RendererPlayer
                className="camera-placeholder camera-muted-placeholder"
                style={{width: 320, height: 216}}
                mirror={isMirror}
                key={cameraId}
                id="stream-player"
                track={cameraRenderer}
                preview={true}
            />
        )
    }, [cameraRenderer, cameraId, isMirror])
  
    const history = useHistory()
  
    const appStore = useAppStore()
  
    const handleOk = useCallback(() => {
        const roomPath = appStore.params.roomPath!
        console.log('history path ', roomPath)
        pretestStore.closeTestCamera()
        pretestStore.closeTestMicrophone()
        history.push(roomPath)
    }, [history, appStore.params.roomPath, pretestStore])
  
    return {
        cameraList,
        microphoneList,
        speakerList,
        isNative: false,
        cameraId,
        microphoneId,
        speakerId,
        onChangeDevice,
        onChangeAudioVolume,
        onSelectMirror,
        cameraError,
        microphoneError,
        VideoPreviewPlayer,
        microphoneLevel,
        isMirror,
        handleOk,
    }
  }

export const PretestContainer = observer(({store}: {store: PretestUIStore}) => {

    const {
        cameraList,
        microphoneList,
        isNative,
        speakerList,
        // title,
        // finish,
        cameraId,
        microphoneId,
        speakerId,
        onChangeDevice,
        onChangeAudioVolume,
        onSelectMirror,
        cameraError,
        microphoneError,
        VideoPreviewPlayer,
        isMirror,
        microphoneLevel,
        handleOk,
    } = usePretestContext(store)

    return (
        <div className="fixed-container">
            <Modal
                title={t('pretest.title')}
                width={720}
                footer={[<Button action="ok">{t('pretest.finishTest')}</Button>]}
                onOk={handleOk}
                onCancel={() => {}}
            >
                <Pretest
                    speakerTestUrl={"https://webdemo.agora.io/pretest_audio.mp3"}
                    microphoneLevel={microphoneLevel}
                    isMirror={isMirror}
                    onChangeDevice={onChangeDevice}
                    onChangeAudioVolume={onChangeAudioVolume}
                    onSelectMirror={onSelectMirror}
                    cameraList={cameraList}
                    cameraId={cameraId}
                    microphoneList={microphoneList}
                    microphoneId={microphoneId}
                    speakerList={speakerList}
                    speakerId={speakerList[0].deviceId}
                    isNative={isNative}
                    cameraError={!!cameraError}
                    microphoneError={!!microphoneError}
                    videoComponent={<VideoPreviewPlayer />}
                />
            </Modal>
        </div>
    )
})