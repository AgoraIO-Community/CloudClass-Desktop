import React from 'react';
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

Docs.args = {
    hasMicrophoneVolume: true,
    hasSpeakerVolume: true
}

export default meta;