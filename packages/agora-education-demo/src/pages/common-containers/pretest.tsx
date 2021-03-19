import React, { useState } from 'react'
import { Pretest, Modal, Button } from 'agora-scenario-ui-kit'

export const PretestContainer = () => {
    const cameraList = [...'.'.repeat(3)].map((item, index) => ({ label: '摄像头' + (index + 1), deviceId: 'camera-' + (index + 1) }))
    const microphoneList = [...'.'.repeat(3)].map((item, index) => ({ label: '麦克风' + (index + 1), deviceId: 'microphone-' + (index + 1) }))
    const speakerList = [...'.'.repeat(3)].map((item, index) => ({ label: '扬声器' + (index + 1), deviceId: 'speaker-' + (index + 1) }))
    const [visible, setVisible] = useState<boolean>(true)
    const isNative = true;
    const cameraError = false;
    const microphoneError = false;
    function hideModal() {
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