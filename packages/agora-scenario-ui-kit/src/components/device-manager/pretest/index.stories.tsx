import React from 'react';
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

const cameraArray = [...'.'.repeat(3)].map((item, index) => ({ label: '摄像头' + (index + 1), deviceId: 'camera-' + (index + 1) }))
const microphoneArray = [...'.'.repeat(3)].map((item, index) => ({ label: '麦克风' + (index + 1), deviceId: 'microphone-' + (index + 1) }))
const speakerArray = [...'.'.repeat(3)].map((item, index) => ({ label: '扬声器' + (index + 1), deviceId: 'speaker-' + (index + 1) }))

export const Docs = ({isNative, cameraError, microphoneError}: DocsProps) => (
    <>
        <div className="mt-4">
            <Modal
                title={'设备检测'}
                width={720}
                footer={[<Button>完成检测</Button>]}
            >
                <Pretest
                    cameraArray={cameraArray}
                    microphoneArray={microphoneArray}
                    speakerArray={speakerArray}
                    isNative={isNative}
                    cameraError={cameraError}
                    microphoneError={microphoneError}
                />
            </Modal>
        </div>
    </>
)

Docs.args = {
    isNative: true,
    cameraError: false,
    microphoneError: false
}

export default meta;