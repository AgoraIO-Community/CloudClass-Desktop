import React, { useState } from 'react';
import { Meta } from '@storybook/react';
import { Modal } from '~components/modal'
import { Pretest } from '~components/device-manager/pretest'
import { Button } from '~components/button'
import { changeLanguage$, I18nProvider } from '~components';
import { useI18nContext, withI18n } from '~components/i18n';
import { CameraPlaceHolder } from '~components/placeholder';

const meta: Meta = {
    title: 'Components/Pretest',
    component: Pretest,
}

type DocsProps = {
    isNative: boolean; // web平台没有扬声器下拉
    cameraError: boolean; // 展示摄像头错误信息
    microphoneError: boolean; // 展示麦克风错误信息
    lang: 'zh' | 'en';
}

const cameraList = [...'.'.repeat(3)].map((item, index) => ({ label: '摄像头' + (index + 1), deviceId: 'camera-' + (index + 1) }))
const microphoneList = [...'.'.repeat(3)].map((item, index) => ({ label: '麦克风' + (index + 1), deviceId: 'microphone-' + (index + 1) }))
const speakerList = [...'.'.repeat(3)].map((item, index) => ({ label: '扬声器' + (index + 1), deviceId: 'speaker-' + (index + 1) }))

const VideoPreviewPlayer = () => {
    return (
        <CameraPlaceHolder
            state="muted"
            style={{
                width: 320,
                height: 180,
                borderRadius: 4,
                overflow: 'hidden'
            }}
        />
    )
}

const ChildrenWrap = () => {
    let [isMirror, setIsMirror] = useState<boolean>(true)
    let [cameraId, setCameraId] = useState<string>(cameraList[0].deviceId)
    let [microphoneId, setMicrophoneId] = useState<string>(microphoneList[0].deviceId)
    let [speakerId, setSpeakerId] = useState<string>(speakerList[0].deviceId)
    let [microphoneVolume, setMicrophoneVolume] = useState<number>(50)
    let [speakerVolume, setSpeakerVolume] = useState<number>(50)
    const changeDeviceFnDict: Record<string, CallableFunction> = {
        'camera': setCameraId,
        'microphone': setMicrophoneId,
        'speaker': setSpeakerId
    }
    const changeAudioVolumeFnDict: Record<string, CallableFunction> = {
        'microphone': setMicrophoneVolume,
        'speaker': setSpeakerVolume,
    }
    return (
        <>
            <Pretest
                isMirror={isMirror}
                cameraList={cameraList}
                cameraId={cameraId}
                microphoneList={microphoneList}
                microphoneId={microphoneId}
                speakerList={speakerList}
                speakerId={speakerId}
                microphoneVolume={microphoneVolume}
                speakerVolume={speakerVolume}
                onSelectMirror={isMirror => {
                    setIsMirror(isMirror)
                }}
                onChangeDevice={(deviceType, value) => {
                    console.log(deviceType, value)
                    changeDeviceFnDict[deviceType](value)
                }}
                onChangeAudioVolume={(deviceType, value) => {
                    console.log(deviceType, value)
                    changeAudioVolumeFnDict[deviceType](value)
                }}
                videoComponent={<VideoPreviewPlayer />}
            />
        </>
    )
}

const PretestContainer = () => {
    const [visible, setVisible] = useState<boolean>(true)
    const isNative = true;
    const cameraError = false;
    const microphoneError = false;
    function hideModal () {
        setVisible(false)
    }
    return (
        <div className="fixed-container">
            {visible ? (
                <Modal
                    title={'设备检测'}
                    width={720}
                    footer={[<Button action="ok">完成检测</Button>]}
                    onOk={hideModal}
                    onCancel={hideModal}
                >
                    <Pretest
                        videoComponent={<VideoPreviewPlayer />}
                        cameraList={cameraList}
                        cameraId={cameraList[0].deviceId}
                        microphoneList={microphoneList}
                        microphoneId={microphoneList[0].deviceId}
                        speakerList={speakerList}
                        speakerId={speakerList[0].deviceId}
                        isNative={isNative}
                        cameraError={cameraError}
                        microphoneError={microphoneError}
                    />
                </Modal>
            ) : ""}
        </div>
    )
}

export const Docs = ({ lang, isNative, cameraError, microphoneError }: DocsProps) => (
    <I18nProvider value={lang}>
        <div className="mt-4">
            <PretestContainer />
        </div>
        <div className="mt-4">
            <Button onClick={() => {
                Modal.show({
                    title: '设备检测',
                    width: 720,
                    footer: [<Button action="ok">完成检测</Button>],
                    children: (
                        <I18nProvider>
                            <ChildrenWrap />
                        </I18nProvider>
                    )
                })
            }}>show pretest</Button>
        </div>
    </I18nProvider>
)

Docs.args = {
    isNative: true,
    cameraError: false,
    microphoneError: false,
    lang: 'en'
}

export default meta;