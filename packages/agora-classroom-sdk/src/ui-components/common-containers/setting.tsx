import { Button, Modal, Setting, t } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import React from 'react'
import { useSettingContext } from '../hooks'

export const SettingContainer = observer(({id}: any) => {

    const {
        cameraList,
        microphoneList,
        speakerList,
        handleCancel,
        handleOk,
        cameraId,
        speakerId,
        microphoneId,
        isNative,
        onChangeDevice,
        onChangeAudioVolume,
    } = useSettingContext(id)

    return (
        <Modal
            title={t('pretest.title')}
            width={360}
            footer={[<Button action="ok">{t('toast.confirm')}</Button>]}
            onCancel={handleCancel}
            onOk={handleOk}
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
    )
})