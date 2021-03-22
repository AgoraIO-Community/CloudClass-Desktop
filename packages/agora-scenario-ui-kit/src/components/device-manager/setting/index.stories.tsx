import React, { useState } from 'react';
import { Meta } from '@storybook/react';
import { Modal } from '~components/modal'
import { Setting } from '~components/device-manager/setting'
import { Button } from '~components/button'

const meta: Meta = {
    title: 'Components/Setting',
    component: Setting,
}

type DocsProps = {
    hasMicrophoneVolume: boolean;
    hasSpeakerVolume: boolean;
}

const cameraList = [...'.'.repeat(3)].map((item, index) => ({ label: '摄像头' + (index + 1), deviceId: 'camera-' + (index + 1) }))
const microphoneList = [...'.'.repeat(3)].map((item, index) => ({ label: '麦克风' + (index + 1), deviceId: 'microphone-' + (index + 1) }))
const speakerList = [...'.'.repeat(3)].map((item, index) => ({ label: '扬声器' + (index + 1), deviceId: 'speaker-' + (index + 1) }))

// console.log({ cameraList, microphoneList, speakerList })

const ChildrenWrap = () => {
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
        <Setting
            cameraList={cameraList}
            cameraId={cameraId}
            microphoneList={microphoneList}
            microphoneId={microphoneId}
            speakerList={speakerList}
            speakerId={speakerId}
            microphoneVolume={microphoneVolume}
            speakerVolume={speakerVolume}
            onChangeDevice={(deviceType, value) => {
                console.log(deviceType, value)
                changeDeviceFnDict[deviceType](value)
            }}
            onChangeAudioVolume={(deviceType, value) => {
                console.log(deviceType, value)
                changeAudioVolumeFnDict[deviceType](value)
            }}
        />
    )
}

const SettingContainer = () => {
    const [visible, setVisible] = useState<boolean>(true)
    const hasMicrophoneVolume = true;
    const hasSpeakerVolume = true;
    function hideModal () {
        setVisible(false)
    }
    return (
        <div className="fixed-container">
            {visible ? (
                <Modal
                    title="设备选择"
                    width={360}
                    footer={[<Button action="ok">确定</Button>]}
                    onCancel={hideModal}
                    onOk={hideModal}
                >
                    <Setting
                        cameraList={cameraList}
                        microphoneList={microphoneList}
                        speakerList={speakerList}
                        cameraId={cameraList[0].deviceId}
                        microphoneId={microphoneList[0].deviceId}
                        speakerId={speakerList[0].deviceId}
                        hasMicrophoneVolume={hasMicrophoneVolume}
                        hasSpeakerVolume={hasSpeakerVolume}
                    />
                </Modal>
            ) : ""}
        </div>
    )
}

export const Docs = ({ hasMicrophoneVolume, hasSpeakerVolume }: DocsProps) => {
    return (
        <>
            <div className="mt-4">
                <SettingContainer/>
            </div>
            <div className="mt-4">
                <Button onClick={() => {
                    Modal.show({
                        title: "设备检测",
                        width: 360,
                        footer: [<Button action="ok">确定</Button>],
                        onOk: () => {
                        },
                        children: <ChildrenWrap />
                    })
                }}>show setting</Button>
            </div>
        </>
    )
}

Docs.args = {
    hasMicrophoneVolume: true,
    hasSpeakerVolume: true
}

export default meta;