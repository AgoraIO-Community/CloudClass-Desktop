import { useGlobalContext, usePretestContext, useVolumeContext } from 'agora-edu-core'
import { observer } from 'mobx-react'
import { useCallback, useEffect } from 'react'
import { useHistory } from 'react-router'
import { Button, Modal, Pretest, t } from '~ui-kit'
import { RendererPlayer } from '~utilities/renderer-player'
import { Volume } from '~components/volume';


const VideoPreviewPlayer = observer(() => {
    const {
        cameraId,
        pretestCameraRenderer,
        isMirror,
    } = usePretestContext()

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
})

const VolumeIndicationView = observer(() => {
    const {
        microphoneLevel
    } = useVolumeContext()
    // const {
        // microphoneLevel
    // } = usePretestContext()

    return (
        <Volume
            currentVolume={microphoneLevel}
            maxLength={48}
            style={{marginLeft: 6}}
        />
    )
})


export const PretestContainer = observer(() => {
    // const {
    //     cameraList,
    //     microphoneList,
    //     speakerList,
    //     cameraId,
    //     microphoneId,
    //     isMirror,
    //     setMirror,
    //     changeTestSpeakerVolume,
    //     changeTestMicrophoneVolume,
    //     installPretest,
    //     changeTestCamera,
    //     changeTestMicrophone,
    //     stopPretestCamera,
    //     stopPretestMicrophone,
    //     pretestNoticeChannel,
    // } = usePretestContext()
    const {
        cameraList,
        microphoneList,
        speakerList,
        cameraId,
        microphoneId,
        isMirror,
        setMirror,
        changeTestSpeakerVolume,
        changeTestMicrophoneVolume,
        installPretest,
        changeTestCamera,
        changeTestMicrophone,
        stopPretestCamera,
        stopPretestMicrophone,
        pretestNoticeChannel,
    } = usePretestContext()

    useEffect(() => installPretest(), [])

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
                    pretestChannel={pretestNoticeChannel}
                    speakerTestUrl={"https://webdemo.agora.io/pretest_audio.mp3"}
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
                    videoComponent={<VideoPreviewPlayer />}
                    volumeComponent={<VolumeIndicationView />}
                />
            </Modal>
        </div>
    )
})