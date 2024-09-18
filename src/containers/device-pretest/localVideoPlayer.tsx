import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { useStore } from '@classroom/hooks/ui-store';
import { Avatar } from '@classroom/ui-kit/components/avatar';
import { EduClassroomConfig } from 'agora-edu-core';
import { LocalTrackPlayer } from '../stream';
import { MobileCallState } from '@classroom/uistores/type';
import { AgoraRteMediaPublishState } from 'agora-rte-sdk';


export const LocalVideoPlayer = observer(() => {
    const {
        classroomStore: {
            streamStore: { updateRemotePublishState },
        },
        deviceSettingUIStore: {
            isCameraDeviceEnabled,
            isAudioRecordingDeviceEnabled,
        },
        layoutUIStore: { broadcastCallState },
        streamUIStore: { localStream, setLocalVideoRenderAt }
    } = useStore();
    const { userName } = EduClassroomConfig.shared.sessionInfo;
    const [callState, setCallState] = useState(MobileCallState.Processing);

    useEffect(() => {
        if (isAudioRecordingDeviceEnabled && isCameraDeviceEnabled) {
            setCallState(MobileCallState.VideoAndVoiceCall);
        } else if (isAudioRecordingDeviceEnabled) {
            setCallState(MobileCallState.VoiceCall);
        } else if (isCameraDeviceEnabled) {
            setCallState(MobileCallState.VideoCall);
        } else {
            setCallState(MobileCallState.Initialize);
        }
    }, [isCameraDeviceEnabled, isAudioRecordingDeviceEnabled]);

    useEffect(() => {
        if (isAudioRecordingDeviceEnabled && localStream && localStream.isMicMuted) {
            updateRemotePublishState(
                EduClassroomConfig.shared.sessionInfo.userUuid,
                localStream.stream.streamUuid,
                {
                    audioState: AgoraRteMediaPublishState.Published,
                },
            );
        }
        if (isCameraDeviceEnabled && localStream && localStream.isCameraMuted) {
            updateRemotePublishState(
                EduClassroomConfig.shared.sessionInfo.userUuid,
                localStream.stream.streamUuid,
                {
                    videoState: AgoraRteMediaPublishState.Published,
                },
            );
        }
    }, [callState, isCameraDeviceEnabled, isAudioRecordingDeviceEnabled]);


    useEffect(() => {
        broadcastCallState(callState);
    }, [callState]);

    useEffect(() => {
        setLocalVideoRenderAt(isCameraDeviceEnabled ? 'Preview' : 'Window');
    }, [isCameraDeviceEnabled]);

    return (
        <div className="fcr-video-player-wrapper">
            {isCameraDeviceEnabled && (
                <LocalTrackPlayer renderAt="Preview" style={{ height: '100%', zIndex: 10, position: 'relative' }}></LocalTrackPlayer>
            )}
            <div className="fcr-video-player__placeholder">
                <Avatar textSize={24} borderRadius='0' nickName={userName} style={{ background: '#FF757A' }} />
            </div>
        </div>
    );
});

