import { Button, Modal, Setting, t } from '~ui-kit'
import { observer } from 'mobx-react'
import { useUIStore } from '@/infra/hooks'
import { useGlobalContext, useMediaContext, usePretestContext } from 'agora-edu-core'
import { useCallback, useState } from 'react'

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
        changeSpeaker,
        changeSpeakerVolume,
        changeMicrophoneVolume,
        isNative,
        getAudioRecordingVolume,
        getAudioPlaybackVolume,
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
            case 'speaker': {
                await changeSpeaker(value)
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
    const [ speakerVolume ] = useState<number>(getAudioPlaybackVolume());
    const [ microphoneVolume ] = useState<number>(getAudioRecordingVolume());
    return (
        <Modal
            title={t('pretest.settingTitle')}
            width={360}
            footer={[<Button action="ok">{t('toast.confirm')}</Button>]}
            onCancel={() => {
                removeDialog(id)
            }}
            onOk={() => {
                removeDialog(id)
            }}
            closable={true}
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
                isNative={isNative}
                speakerVolume={speakerVolume}
                microphoneVolume={microphoneVolume}
            />
        </Modal>
    )
})