<<<<<<< HEAD
import React, { useState } from 'react';
=======
import React from 'react';
>>>>>>> 25f7a75f6f649485513d24f0b6026887136e3266
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

<<<<<<< HEAD
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
    return  (
        <Setting
            cameraList={cameraList}
            cameraId={cameraId}
            microphoneList={microphoneList}
            micorophoneId={microphoneId}
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

export const Docs = ({ hasMicrophoneVolume, hasSpeakerVolume }: DocsProps) => {
    return (
        <>
            <div className="mt-4">
                <Modal
                    title="设备选择"
                    width={360}
                    footer={[<Button>确定</Button>]}
                >
                    <Setting
                        cameraList={cameraList}
                        microphoneList={microphoneList}
                        speakerList={speakerList}
                        cameraId={cameraList[0].deviceId}
                        micorophoneId={microphoneList[0].deviceId}
                        speakerId={speakerList[0].deviceId}
                        hasMicrophoneVolume={hasMicrophoneVolume}
                        hasSpeakerVolume={hasSpeakerVolume}
                    />
                </Modal>
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
=======
const cameraArray = [...'.'.repeat(3)].map((item, index) => ({ label: '摄像头' + (index + 1), deviceId: 'camera-' + (index + 1) }))
const microphoneArray = [...'.'.repeat(3)].map((item, index) => ({ label: '麦克风' + (index + 1), deviceId: 'microphone-' + (index + 1) }))
const speakerArray = [...'.'.repeat(3)].map((item, index) => ({ label: '扬声器' + (index + 1), deviceId: 'speaker-' + (index + 1) }))

// console.log({ cameraArray, microphoneArray, speakerArray })

export const Docs = ({ hasMicrophoneVolume, hasSpeakerVolume }: DocsProps) => (
    <>
        <div className="mt-4">
            <Modal
                title="设备选择"
                width={360}
                footer={[<Button>确定</Button>]}
            >
                <Setting
                    cameraArray={cameraArray}
                    microphoneArray={microphoneArray}
                    speakerArray={speakerArray}
                    hasMicrophoneVolume={hasMicrophoneVolume}
                    hasSpeakerVolume={hasSpeakerVolume}
                />
            </Modal>
        </div>
        <div className="mt-4">
            <Button onClick={() => {
                Modal.show({
                    title: "设备检测",
                    width: 360,
                    footer: [<Button action="ok">确定</Button>],
                    children: (
                        <Setting
                            cameraArray={cameraArray}
                            microphoneArray={microphoneArray}
                            speakerArray={speakerArray}
                            hasMicrophoneVolume={hasMicrophoneVolume}
                            hasSpeakerVolume={hasSpeakerVolume}
                        />
                    )
                })
            }}>show setting</Button>
        </div>
    </>
)
>>>>>>> 25f7a75f6f649485513d24f0b6026887136e3266

Docs.args = {
    hasMicrophoneVolume: true,
    hasSpeakerVolume: true
}

export default meta;