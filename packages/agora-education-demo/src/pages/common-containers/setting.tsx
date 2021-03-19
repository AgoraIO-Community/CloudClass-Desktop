import React, { useState } from 'react'
import { Setting, Modal, Button } from 'agora-scenario-ui-kit'

export const SettingContainer = () => {
    const cameraList = [...'.'.repeat(3)].map((item, index) => ({ label: '摄像头' + (index + 1), deviceId: 'camera-' + (index + 1) }))
    const microphoneList = [...'.'.repeat(3)].map((item, index) => ({ label: '麦克风' + (index + 1), deviceId: 'microphone-' + (index + 1) }))
    const speakerList = [...'.'.repeat(3)].map((item, index) => ({ label: '扬声器' + (index + 1), deviceId: 'speaker-' + (index + 1) }))
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
                        micorophoneId={microphoneList[0].deviceId}
                        speakerId={speakerList[0].deviceId}
                        hasMicrophoneVolume={hasMicrophoneVolume}
                        hasSpeakerVolume={hasSpeakerVolume}
                    />
                </Modal>
            ) : ""}
        </div>
    )
}