import { Button, Modal, Setting, t } from '~ui-kit'
import { observer } from 'mobx-react'
import { useMediaContext } from 'agora-edu-core'
import { useUIStore } from '@/infra/hooks'

export const SettingContainer = observer(({id}: any) => {

    const {
        cameraList,
        microphoneList,
        speakerList,
        cameraId,
        speakerId,
        microphoneId,
        changeDevice,
        changeAudioVolume
    } = useMediaContext()

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