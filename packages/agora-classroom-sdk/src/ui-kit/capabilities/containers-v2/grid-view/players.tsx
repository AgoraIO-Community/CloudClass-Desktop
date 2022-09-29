import { useStore } from "@/infra/hooks/ui-store";
import { EduStream } from "agora-edu-core";
import { AgoraRteRemoteStreamType, AgoraRteVideoSourceType } from "agora-rte-sdk";
import { observer } from "mobx-react";
import { useRef, useEffect } from "react";
import { SvgIconEnum, SvgImg } from "~components";
import { LocalTrackPlayer as LocalCameraTrackPlayer, RemoteTrackPlayer } from "../../containers/stream/track-player";

export const LocalScreenTrackPlayer = observer(
    ({ className }: { className?: string }) => {
        const {
            streamUIStore: { setupLocalScreenShare },
        } = useStore();
        const ref = useRef<HTMLDivElement | null>(null);

        useEffect(() => {
            if (ref.current) {
                setupLocalScreenShare(ref.current);
            }
        }, [setupLocalScreenShare]);

        return <div ref={ref} className={className}></div>;
    },
);

export const LocalTrackPlayer = ({ stream }: { stream: EduStream }) => {
    if (stream.videoSourceType === AgoraRteVideoSourceType.ScreenShare) {
        return (
            <div className="w-full h-full relative">
                <LocalScreenTrackPlayer className="w-full h-full" />
                <div className="absolute flex" style={{ bottom: 3, left: 5, color: '#fff' }}>
                    <SvgImg type={SvgIconEnum.MIC_OFF} colors={{ iconPrimary: '#fff' }} />
                    {stream.fromUser.userName}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative">
            <LocalCameraTrackPlayer className="w-full h-full" />
            <div className="absolute flex" style={{ bottom: 3, left: 5, color: '#fff' }}>
                <SvgImg type={SvgIconEnum.MIC_OFF} colors={{ iconPrimary: '#fff' }} />
                {stream.fromUser.userName}
            </div>
        </div>
    );
}

export const AutoSubscriptionRemoteTrackPlayer = ({ stream, streamType = AgoraRteRemoteStreamType.LOW_STREAM }: { stream: EduStream, streamType?: AgoraRteRemoteStreamType }) => {
    // const { classroomStore } = useStore();

    const needMirror = stream.videoSourceType !== AgoraRteVideoSourceType.ScreenShare;

    // useEffect(() => {
    //     const handle = setTimeout(() => {
    //         classroomStore.streamStore.muteRemoteVideoStream(stream, false);
    //         classroomStore.streamStore.setRemoteVideoStreamType(stream.streamUuid, streamType);
    //     }, 1500);

    //     return () => {
    //         clearTimeout(handle);
    //         classroomStore.streamStore.muteRemoteVideoStream(stream, true);
    //     }
    // }, [stream.streamUuid]);

    return (
        <div className="w-full h-full relative">
            <RemoteTrackPlayer stream={stream} className='w-full h-full' mirrorMode={needMirror} />;
            <div className="absolute flex" style={{ bottom: 3, left: 5, color: '#fff' }}>
                <SvgImg type={SvgIconEnum.MIC_OFF} colors={{ iconPrimary: '#fff' }} />
                {stream.fromUser.userName}
            </div>
        </div>
    );

}

