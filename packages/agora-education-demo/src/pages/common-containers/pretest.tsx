import { useAppStore, usePretestStore } from '@/hooks'
import { Button, Modal, Pretest, useI18nContext } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import React, { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { RendererPlayer } from '../common-comps/renderer-player'

export const usePretestContext = () => {

    const {t} = useI18nContext()

    const pretestStore = usePretestStore()

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
        pretestStore.openTestMicrophone()
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
                className="camera-placeholder"
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
        history.push(roomPath)
    }, [history, appStore.params.roomPath])

    return {
        title: t('pretest.title'),
        cameraList,
        microphoneList,
        speakerList,
        isNative: false,
        finish: t('pretest.finishTest'),
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

export const PretestContainer = observer(() => {

    const {
        cameraList,
        microphoneList,
        isNative,
        speakerList,
        title,
        finish,
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
    } = usePretestContext()

    return (
        <div className="fixed-container">
            <Modal
                title={title}
                width={720}
                footer={[<Button action="ok">{finish}</Button>]}
                onOk={handleOk}
                onCancel={() => {}}
            >
                <Pretest
                    speakerTestUrl={"https://webdemo.agora.io/test_audio.mp3"}
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