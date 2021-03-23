import React, { useCallback, useEffect, useState } from 'react'
import { Setting, Modal, Button, useI18nContext } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import { useAppStore, usePretestStore, useUIStore } from '@/hooks'
import { RendererPlayer } from '../common-comps/renderer-player'
import { useHistory } from 'react-router-dom'

export const useSettingContext = () => {

    const {t} = useI18nContext()

    const pretestStore = usePretestStore()
    const uiStore = useUIStore()
    const {visibleSetting} = uiStore

    const [cameraError, setCameraError] = useState<boolean>(false)
    const [microphoneError, setMicrophoneError] = useState<boolean>(false)
    const [isMirror, setMirror] = useState<boolean>(false)

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

    const onChangeAudioVolume = useCallback(async (deviceType: string, value: any) => {
        switch (deviceType) {
            case 'speaker': {
                await pretestStore.changeSpeakerVolume(value)
                break;
            }
            case 'microphone': {
                await pretestStore.changeMicrophoneVolume(value)
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
        // const roomPath = appStore.params.roomPath!
        // history.push(roomPath)
    }, [history])

    const hideSetting = useCallback(() => {
        uiStore.setVisibleSetting(false)
    }, [visibleSetting, uiStore])

    return {
        visibleSetting,
        isNative: false,
        title: t('pretest.title'),
        cameraList,
        microphoneList,
        speakerList,
        finish: t('pretest.finishTest'),
        cameraId,
        microphoneId,
        speakerId,
        onChangeAudioVolume,
        onSelectMirror,
        cameraError,
        microphoneError,
        VideoPreviewPlayer,
        microphoneLevel,
        isMirror,
        hideSetting,
        handleOk,
        onChangeDevice,
        t,
    }
}

export const SettingContainer = observer(() => {

    const {
        title,
        cameraList,
        microphoneList,
        speakerList,
        visibleSetting,
        hideSetting,
        cameraId,
        speakerId,
        microphoneId,
        isNative,
        onChangeDevice,
        onChangeAudioVolume,
        t
    } = useSettingContext()

    return (
        visibleSetting ?
        <div className="fixed-container">
            <Modal
                title={title}
                width={360}
                footer={[<Button action="ok">{t('room.confirm')}</Button>]}
                onCancel={hideSetting}
                onOk={hideSetting}
            >
            <Setting
                cameraList={cameraList}
                microphoneList={microphoneList}
                speakerList={speakerList}
                cameraId={cameraId}
                microphoneId={microphoneId}
                onChangeDevice={onChangeDevice}
                onChangeAudioVolume={onChangeAudioVolume}
                speakerId={speakerId}
                hasMicrophoneVolume={isNative}
                hasSpeakerVolume={isNative}
            />
            </Modal>
        </div>
        : null
    )
})