import { Button, Modal, Setting, t } from '~ui-kit'
import { observer } from 'mobx-react'
import { useUIStore } from '@/infra/hooks'
import { useGlobalContext, useMediaContext, usePretestContext } from 'agora-edu-core'
import { useCallback } from 'react'

export const SettingContainer = observer(({ id }: any) => {

    const {
        cameraList,
        microphoneList,
        speakerList,
        cameraId,
        speakerId,
        microphoneId,
        changeCamera,
        changeMicrophone,
        changeSpeakerVolume,
        changeMicrophoneVolume
    } = useMediaContext()

    const changeDevice = async (deviceType: string, value: any) => {
        switch (deviceType) {
            case 'camera': {
                await changeCamera(value)
                break;
            }
            case 'microphone': {
                await changeMicrophone(value)
                break;
            }
        }
    }

    const changeAudioVolume = async (deviceType: string, value: any) => {
        switch (deviceType) {
            case 'speaker': {
                await changeSpeakerVolume(value)
                break;
            }
            case 'microphone': {
                await changeMicrophoneVolume(value)
                break;
            }
        }
    }

    const {
        removeDialog
    } = useUIStore()

    return (
        <Modal
            title={t('pretest.settingTitle')}
            width={360}
            footer={[<Button action="ok">{t('toast.confirm')}</Button>]}
            onCancel={() => {
                // uiStore.removeDialog(id)
                removeDialog(id)
            }}
            onOk={() => {
                // uiStore.removeDialog(id)
                removeDialog(id)
            }}
        >
            <Setting
                cameraList={cameraList}
                microphoneList={microphoneList}
                speakerList={speakerList}
                cameraId={cameraId}
                microphoneId={microphoneId}
                speakerId={speakerId}
                onChangeDevice={changeDevice}
                onChangeAudioVolume={changeAudioVolume}
                hasMicrophoneVolume={false}
                hasSpeakerVolume={false}
            />
        </Modal>
    )
})