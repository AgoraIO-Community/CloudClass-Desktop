import React, { useCallback, useEffect, useState } from 'react'
import { Setting, Modal, Button, useI18nContext } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import { useAppStore, usePretestStore, useUIStore } from '@/hooks'
import { RendererPlayer } from '../common-comps/renderer-player'
import { useHistory } from 'react-router-dom'
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