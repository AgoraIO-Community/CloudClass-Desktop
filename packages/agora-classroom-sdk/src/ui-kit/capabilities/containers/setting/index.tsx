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
        changeMicrophoneVolume,
        isNative
    } = useMediaContext()

    const {
        isMirror,
        setMirror,
        isBeauty,
        setBeauty,
        whitening,
        buffing,
        ruddy,
        setWhitening,
        setBuffing,
        setRuddy,
        setBeautyEffectOptions,
    } = usePretestContext()

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

    const handleBeauty = () => {
        setBeautyEffectOptions({
            isBeauty: !isBeauty,
            lighteningLevel: whitening,
            rednessLevel: ruddy,
            smoothnessLevel: buffing
        })
        setBeauty(!isBeauty)
    }

    const handleMirror = () => {
        setMirror(!isMirror)
    }

    const onChangeBeauty = (type: string, value: any) => {
        switch(type) {
            case 'whitening':
                setWhitening(value)
                break;
            case 'buffing':
                setBuffing(value)
                break;
            case 'ruddy':
                setRuddy(value)
                break;        
        }
        setBeautyEffectOptions({
            lighteningLevel: whitening,
            rednessLevel: ruddy,
            smoothnessLevel: buffing
        })
    }

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
                isBeauty={isBeauty}
                onSelectBeauty={handleBeauty}
                whitening={whitening}
                buffing={buffing}
                ruddy={ruddy}
                onChangeBeauty={onChangeBeauty}
                isMirror={isMirror}
                onSelectMirror={handleMirror}
            />
        </Modal>
    )
})