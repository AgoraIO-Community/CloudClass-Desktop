import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import { useStore } from '@classroom/hooks/ui-store';
import { Avatar } from '@classroom/ui-kit/components/avatar';
import { EduClassroomConfig } from 'agora-edu-core';


export const LocalVideoPlayer = observer(() => {
    const {
        deviceSettingUIStore: {
            isCameraDeviceEnabled,
            setupLocalVideoPreview,
        },
    } = useStore();
    const videoRef = useRef<HTMLDivElement>(null);
    const { userName } = EduClassroomConfig.shared.sessionInfo;

    useEffect(() => {
        if (videoRef.current && isCameraDeviceEnabled) {
            setupLocalVideoPreview(videoRef.current, false);
        }
    }, [isCameraDeviceEnabled]);

    return (
        <div className="fcr-video-player-wrapper">
            <div ref={videoRef} className="fcr-video-player" />
            <div className="fcr-video-player__placeholder">
                <Avatar textSize={24} borderRadius='0' nickName={userName} style={{ background: '#FF757A' }} />
            </div>
        </div>
    );
});

