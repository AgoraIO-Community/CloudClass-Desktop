import { useGlobalContext, useMediaContext, usePretestContext, useVolumeContext } from 'agora-edu-core'
import { observer } from 'mobx-react'
import { useCallback, useEffect } from 'react'
import { useHistory } from 'react-router'
import { Button, MediaDeviceState, Modal, Pretest, t, transI18n } from '~ui-kit'
import { RendererPlayer } from '~utilities/renderer-player'
import { Volume } from '~components/volume'
import {v4 as uuidv4} from 'uuid'


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
    const {
        cameraError,
        microphoneError,
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
        pretestCameraRenderer,
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

    const {isNative} = useMediaContext()

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

    const handleError = (evt: any) => {
        pretestNoticeChannel.next({type: 'error', info: transI18n(evt.info), kind: 'toast', id: uuidv4()})
    }

    useEffect(() => installPretest(handleError), [])

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

    const global = useGlobalContext()

    const history = useHistory()

    const handleOk = () => {
        stopPretestCamera()
        stopPretestMicrophone()
        history.push(global?.params?.roomPath ?? '/classroom/1v1')
    }

    const handleMirror = () => {
        setMirror(!isMirror)
    }

    const handleBeauty = () => {
        setBeauty(!isBeauty)
    }

    return (
        <div className="fixed-container">
            <Modal
                title={t('pretest.settingTitle')}
                width={720}
                footer={[<Button action="ok">{t('pretest.finishTest')}</Button>]}
                onOk={handleOk}
                onCancel={() => {}}
                btnId="device_assert"
            >
                <Pretest
                    //@ts-ignore
                    pretestChannel={pretestNoticeChannel}
                    speakerTestUrl={"https://webdemo.agora.io/pretest_audio.mp3"}
                    isMirror={isMirror}
                    onChangeDevice={onChangeDevice}
                    onChangeAudioVolume={onChangeAudioVolume}
                    onSelectMirror={handleMirror}
                    cameraList={cameraList}
                    cameraId={cameraId}
                    microphoneList={microphoneList}
                    microphoneId={microphoneId}
                    speakerList={speakerList}
                    speakerId={speakerList[0].deviceId}
                    isNative={isNative}
                    videoComponent={<VideoPreviewPlayer />}
                    volumeComponent={<VolumeIndicationView />}
                    isBeauty={isBeauty}
                    onSelectBeauty={handleBeauty}
                    whitening={whitening}
                    buffing={buffing}
                    ruddy={ruddy}
                    onChangeBeauty={onChangeBeauty}
                />
            </Modal>
        </div>
    )
})