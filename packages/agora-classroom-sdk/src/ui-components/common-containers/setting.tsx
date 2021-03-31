import { Button, Modal, Setting } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import React from 'react'
import { useSettingContext } from '../hooks'

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
                footer={[<Button action="ok">{t('toast.confirm')}</Button>]}
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