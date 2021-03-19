import React, { useState } from 'react';
import { Meta } from '@storybook/react';
import { Modal } from '~components/modal'
import { Pretest } from '~components/device-manager/pretest'
import { Button } from '~components/button'

const meta: Meta = {
    title: 'Components/Pretest',
    component: Pretest,
}

type DocsProps = {
    isNative: boolean; // web平台没有扬声器下拉
    cameraError: boolean; // 展示摄像头错误信息
    microphoneError: boolean; // 展示麦克风错误信息
}

const cameraList = [...'.'.repeat(3)].map((item, index) => ({ label: '摄像头' + (index + 1), deviceId: 'camera-' + (index + 1) }))
const microphoneList = [...'.'.repeat(3)].map((item, index) => ({ label: '麦克风' + (index + 1), deviceId: 'microphone-' + (index + 1) }))
const speakerList = [...'.'.repeat(3)].map((item, index) => ({ label: '扬声器' + (index + 1), deviceId: 'speaker-' + (index + 1) }))

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
        <Pretest
            isMirror={isMirror}
            cameraList={cameraList}
            cameraId={cameraId}
            microphoneList={microphoneList}
            micorophoneId={microphoneId}
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
        />
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
                        cameraList={cameraList}
                        cameraId={cameraList[0].deviceId}
                        microphoneList={microphoneList}
                        micorophoneId={microphoneList[0].deviceId}
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

export const Docs = ({ isNative, cameraError, microphoneError }: DocsProps) => (
    <>
        <div className="mt-4">
            <PretestContainer />
        </div>
        <div className="mt-4">
            <Button onClick={() => {
                Modal.show({
                    title: '设备检测',
                    width: 720,
                    footer: [<Button action="ok">完成检测</Button>],
                    children: <ChildrenWrap />
                })
            }}>show pretest</Button>
        </div>
    </>
)

Docs.args = {
    isNative: true,
    cameraError: false,
    microphoneError: false
}

export default meta;