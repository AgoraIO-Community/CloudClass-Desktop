import { useGlobalContext, usePretestContext } from 'agora-edu-core'
import { observer } from 'mobx-react'
import { useCallback, useEffect } from 'react'
import { useHistory } from 'react-router'
import { Button, Modal, Pretest, t } from '~ui-kit'
import { RendererPlayer } from '~utilities/renderer-player'


export const PretestContainer = observer(() => {
    const {
        cameraList,
        microphoneList,
        speakerList,
        cameraError,
        microphoneError,
        cameraId,
        microphoneId,
        pretestCameraRenderer,
        isMirror,
        setMirror,
        microphoneLevel,
        changeTestSpeakerVolume,
        changeTestMicrophoneVolume,
        installPretest,
        changeTestCamera,
        changeTestMicrophone,
        stopPretestCamera,
        stopPretestMicrophone,
    } = usePretestContext()

    useEffect(() => installPretest(), [])

    const VideoPreviewPlayer = useCallback(() => {
        return (
            <RendererPlayer
                className="camera-placeholder camera-muted-placeholder"
                style={{width: 320, height: 180}}
                mirror={isMirror}
                key={cameraId}
                id="stream-player"
                track={pretestCameraRenderer}
                preview={true}
            />
        )
    }, [pretestCameraRenderer, cameraId, isMirror])

    const onChangeDevice = async (type: string, value: any) => {
        switch (type) {
            case 'camera': {
                await changeTestCamera(value)
                break;
            }
            case 'microphone': {
                await changeTestMicrophone(value)
                break;
            }
        }
    }

    const onChangeAudioVolume = async (type: string, value: any) => {
        switch(type) {
            case 'speaker': {
                await changeTestSpeakerVolume(value)
                break;
            }
            case 'microphone': {
                await changeTestMicrophoneVolume(value)
                break;
            }
        }
    }

    const global = useGlobalContext()

    const history = useHistory()

    const handleOk = () => {
        stopPretestCamera()
        stopPretestMicrophone()
        history.push(global?.params?.roomPath ?? '/classroom/1v1')
    }

    
    return (
        <div className="fixed-container">
            <Modal
                title={t('pretest.settingTitle')}
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
                    onSelectMirror={() => {
                        setMirror(!isMirror)
                    }}
                    cameraList={cameraList}
                    cameraId={cameraId}
                    microphoneList={microphoneList}
                    microphoneId={microphoneId}
                    speakerList={speakerList}
                    speakerId={speakerList[0].deviceId}
                    isNative={false}
                    cameraError={!!cameraError}
                    microphoneError={!!microphoneError}
                    videoComponent={<VideoPreviewPlayer />}
                />
            </Modal>
        </div>
    )
})