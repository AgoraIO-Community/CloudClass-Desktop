import { useStore } from "@/infra/hooks/ui-store";
import { EduStreamUI } from "@/infra/stores/common/stream/struct";
import { AgoraRteMediaSourceState, MediaPlayerEvents } from "agora-rte-sdk";
import { observer } from "mobx-react";
import { CSSProperties, FC, useCallback, useEffect, useRef, useState } from "react";
import classnames from "classnames";
import { EduStream } from "agora-edu-core";

export const TrackPlayer: FC<{ stream: EduStreamUI, className?: string, style?: CSSProperties }> = observer(({ stream, className, style }) => {
    const cls = classnames({
        [`video-player`]: 1,
        ['invisible']: stream.isCameraMuted,
        [`${className}`]: !!className,
    });

    return stream.stream.isLocal ? (
        <LocalTrackPlayer
            className={cls}
            style={style}
        />
    ) : (
        <RemoteTrackPlayer
            className={cls}
            style={style}
            stream={stream.stream}
            mirrorMode={stream.isMirrorMode}
        />
    )
});


type RemoteTrackPlayerProps = {
    stream: EduStream
    style?: CSSProperties;
    className?: string;
    mirrorMode?: boolean;
};

type LocalTrackPlayerProps = Omit<RemoteTrackPlayerProps, 'stream'>;

export const LocalTrackPlayer: FC<LocalTrackPlayerProps> = observer(
    ({ style, className }) => {
        const {
            streamUIStore: { setupLocalVideo, isMirror },
        } = useStore();
        const ref = useRef<HTMLDivElement | null>(null);

        useEffect(() => {
            if (ref.current) {
                setupLocalVideo(ref.current, isMirror);
            }
        }, [isMirror, setupLocalVideo]);

        return <div style={style} className={className} ref={ref}></div>;
    },
);

export const RemoteTrackPlayer: FC<RemoteTrackPlayerProps> = observer(
    ({ style, stream, className, mirrorMode = true, }) => {
        const [readyPlay, setReadyPlay] = useState(false);
        const [interactiveNeeded, setInteractiveNeeded] = useState(false);
        const { classroomStore } = useStore();
        const { streamStore, mediaStore, roomStore } = classroomStore;
        const { setupRemoteVideo, muteRemoteAudioStream, muteRemoteVideoStream } = streamStore;
        const { isCDNMode } = roomStore;

        const rtcRef = useRef<HTMLDivElement | null>(null);
        const cdnRef = useRef<HTMLDivElement | null>(null);

        const handleReadyPlay = () => setReadyPlay(true);
        const handleInteractiveNeeded = (interactiveNeeded: boolean) =>
            setInteractiveNeeded(interactiveNeeded);

        const handlePlay = useCallback(async () => {
            const { streamHlsUrl } = stream;
            if (!streamHlsUrl || !isCDNMode) {
                return;
            }
            const player = mediaStore.getMediaTrackPlayer(streamHlsUrl);
            if (!player) {
                return;
            }
            player.play(
                stream.videoSourceState === AgoraRteMediaSourceState.started,
                stream.audioSourceState === AgoraRteMediaSourceState.started,
            );
        }, [mediaStore, stream]);

        useEffect(() => {
            if (cdnRef.current && stream.streamHlsUrl && isCDNMode) {
                muteRemoteVideoStream(stream, true);
                muteRemoteAudioStream(stream, true);
                mediaStore.setupMediaStream(
                    stream.streamHlsUrl,
                    cdnRef.current,
                    true,
                    stream.audioSourceState === AgoraRteMediaSourceState.started,
                    stream.videoSourceState === AgoraRteMediaSourceState.started,
                );
            }
            if (rtcRef.current && stream.streamHlsUrl && !isCDNMode) {
                const mediaTrackPlayer = mediaStore.getMediaTrackPlayer(stream.streamHlsUrl);
                if (mediaTrackPlayer) {
                    mediaTrackPlayer.dispose();
                }
                muteRemoteVideoStream(stream, false);
                muteRemoteAudioStream(stream, false);
            }
            if (rtcRef.current && !isCDNMode) {
                setupRemoteVideo(stream, rtcRef.current, mirrorMode);
            }
        }, [
            stream,
            setupRemoteVideo,
            muteRemoteAudioStream,
            muteRemoteVideoStream,
            isCDNMode,
            mediaStore,
        ]);

        useEffect(() => {
            const { streamHlsUrl } = stream;
            if (!streamHlsUrl || !isCDNMode) {
                return;
            }
            const player = mediaStore.getMediaTrackPlayer(streamHlsUrl);
            if (!player) {
                return;
            }
            player.on(MediaPlayerEvents.ReadyToPlay, handleReadyPlay);
            player.on(MediaPlayerEvents.InteractiveNeeded, handleInteractiveNeeded);
            return () => {
                player.off(MediaPlayerEvents.ReadyToPlay, handleReadyPlay);
                player.off(MediaPlayerEvents.InteractiveNeeded, handleInteractiveNeeded);
            };
        }, [stream, mediaStore, handleReadyPlay, handleInteractiveNeeded]);
        return (
            <>
                <div
                    style={style}
                    className={`${className} ${isCDNMode ? '' : 'hidden'}`}
                    ref={cdnRef}></div>
                <div
                    style={style}
                    className={`${className} ${isCDNMode ? 'hidden ' : ''}`}
                    ref={rtcRef}></div>
                {isCDNMode && !interactiveNeeded && !readyPlay ? (
                    <div className="video-player-video-loading"></div>
                ) : null}
                {isCDNMode && interactiveNeeded ? (
                    <div className="video-player-play-btn" onClick={handlePlay}></div>
                ) : null}
            </>
        );
    },
);
