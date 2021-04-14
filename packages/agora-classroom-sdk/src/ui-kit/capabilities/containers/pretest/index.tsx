import { Button, Modal, Pretest, t } from '~ui-kit'
import { observer } from 'mobx-react'
import React from 'react'
import {usePretestContext} from '../hooks'

export const PretestContainer = observer(() => {

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
    } = usePretestContext()

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