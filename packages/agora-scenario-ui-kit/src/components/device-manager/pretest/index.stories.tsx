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

<<<<<<< HEAD
const cameraList = [...'.'.repeat(3)].map((item, index) => ({ label: '摄像头' + (index + 1), deviceId: 'camera-' + (index + 1) }))
const microphoneList = [...'.'.repeat(3)].map((item, index) => ({ label: '麦克风' + (index + 1), deviceId: 'microphone-' + (index + 1) }))
const speakerList = [...'.'.repeat(3)].map((item, index) => ({ label: '扬声器' + (index + 1), deviceId: 'speaker-' + (index + 1) }))

export const Docs = ({ isNative, cameraError, microphoneError }: DocsProps) => (
=======
const cameraArray = [...'.'.repeat(3)].map((item, index) => ({ label: '摄像头' + (index + 1), deviceId: 'camera-' + (index + 1) }))
const microphoneArray = [...'.'.repeat(3)].map((item, index) => ({ label: '麦克风' + (index + 1), deviceId: 'microphone-' + (index + 1) }))
const speakerArray = [...'.'.repeat(3)].map((item, index) => ({ label: '扬声器' + (index + 1), deviceId: 'speaker-' + (index + 1) }))

export const Docs = ({isNative, cameraError, microphoneError}: DocsProps) => (
>>>>>>> 25f7a75f6f649485513d24f0b6026887136e3266
    <>
        <div className="mt-4">
            <Modal
                title={'设备检测'}
                width={720}
                footer={[<Button>完成检测</Button>]}
            >
                <Pretest
<<<<<<< HEAD
                    cameraList={cameraList}
                    microphoneList={microphoneList}
                    speakerList={speakerList}
=======
                    cameraArray={cameraArray}
                    microphoneArray={microphoneArray}
                    speakerArray={speakerArray}
>>>>>>> 25f7a75f6f649485513d24f0b6026887136e3266
                    isNative={isNative}
                    cameraError={cameraError}
                    microphoneError={microphoneError}
                />
            </Modal>
        </div>
<<<<<<< HEAD
        <div className="mt-4">
            <Button onClick={() => {
                Modal.show({
                    title: '设备检测',
                    width: 720,
                    footer: [<Button action="ok">完成检测</Button>],
                    children: (
                        <Pretest
                            cameraList={cameraList}
                            microphoneList={microphoneList}
                            speakerList={speakerList}
                            isNative={isNative}
                            cameraError={cameraError}
                            microphoneError={microphoneError}
                        />
                    )
                })
            }}>show pretest</Button>
        </div>
=======
>>>>>>> 25f7a75f6f649485513d24f0b6026887136e3266
    </>
)

Docs.args = {
    isNative: true,
    cameraError: false,
    microphoneError: false
}

export default meta;