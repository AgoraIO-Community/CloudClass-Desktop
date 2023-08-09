import { useStore } from '@classroom/infra/hooks/ui-store';
import { AgoraRteMediaSourceState, MediaPlayerEvents, StreamMediaPlayer } from 'agora-rte-sdk';
import { observer } from 'mobx-react';
import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import placeholderIcon from './assets/cdn-placeholder.svg';
type CDNPlayerStream = {
  rtmp: string;
  flv: string;
  hls: string;
  videoSourceState: AgoraRteMediaSourceState;
  audioSourceState: AgoraRteMediaSourceState;
};

enum RecordStatus {
  starting = -1,
  started = 1,
  stopped = 0,
}
type CDNPlayerProps = {
  stream: CDNPlayerStream;
  style?: CSSProperties;
  className?: string;
  state: RecordStatus;
  placeholderIcon?: React.ReactElement;
  placeholderText?: string;
};

const PlaceholderIcon = () => (
  <img style={{ width: '200px', maxWidth: '20vw' }} src={placeholderIcon} />
);

export const CDNPlayer: React.FC<CDNPlayerProps> = observer(
  ({
    style,
    stream,
    className,
    state,
    placeholderText = '',
    placeholderIcon = <PlaceholderIcon />,
  }) => {
    const [interactiveNeeded, setInteractiveNeeded] = useState(false);
    const [readyPlay, setReadyPlay] = useState(false);
    const { classroomStore } = useStore();
    const { mediaStore } = classroomStore;
    const domRef = useRef<HTMLDivElement | null>(null);
    const playerRef = useRef<StreamMediaPlayer | null>(null);

    const loading = useMemo(() => {
      return !(state === RecordStatus.started || readyPlay);
    }, [state, readyPlay]);

    useEffect(() => {
      if (loading) {
        playerRef.current && playerRef.current.dispose();
      }
    }, [loading]);
    useEffect(() => {
      const { hls } = stream;
      if (!hls || !domRef.current) {
        return;
      }
      playerRef.current && playerRef.current.dispose();
      mediaStore.setupMediaStream(
        hls,
        domRef.current,
        true,
        stream.audioSourceState === AgoraRteMediaSourceState.started,
        stream.videoSourceState === AgoraRteMediaSourceState.started,
      );

      playerRef.current = mediaStore.getMediaTrackPlayer(hls) || null;
      if (!playerRef.current) {
        return;
      }
      const handleReadyPlay = () => setReadyPlay(true);
      const handleInteractiveNeeded = (interactiveNeeded: boolean) =>
        setInteractiveNeeded(interactiveNeeded);
      playerRef.current.on(MediaPlayerEvents.ReadyToPlay, handleReadyPlay);
      playerRef.current.on(MediaPlayerEvents.InteractiveNeeded, handleInteractiveNeeded);
      return () => {
        playerRef.current?.off(MediaPlayerEvents.ReadyToPlay, handleReadyPlay);
        playerRef.current?.off(MediaPlayerEvents.InteractiveNeeded, handleInteractiveNeeded);
        playerRef.current?.dispose();
      };
    }, [stream, mediaStore]);

    const handlePlay = useCallback(async () => {
      const { hls } = stream;
      if (!hls) {
        return;
      }
      const player = mediaStore.getMediaTrackPlayer(hls);
      if (!player) {
        return;
      }
      player.play(
        stream.videoSourceState === AgoraRteMediaSourceState.started,
        stream.audioSourceState === AgoraRteMediaSourceState.started,
      );
    }, [mediaStore, stream]);

    const text = useMemo(() => {
      if (!!placeholderText) {
        <p className="text-base" style={{ color: '#7B88A0' }}>
          {placeholderText}
        </p>;
      }
      return '';
    }, [placeholderText]);

    const placeholderElement = useMemo(() => {
      return (
        <div
          className="fcr-absolute fcr-w-full fcr-h-full fcr-top-0 fcr-left-0 fcr-flex fcr-items-center fcr-justify-center fcr-flex-col"
          style={{ backgroundColor: 'rgb(249 249 252)' }}>
          {placeholderIcon}
          {text}
        </div>
      );
    }, [placeholderIcon, placeholderText]);

    return (
      <div className="fcr-relative fcr-w-full fcr-h-full fcr-flex fcr-items-center fcr-justify-center">
        <div
          style={style}
          className={`fcr-flex-1 fcr-max-w-full fcr-max-h-full ${className || ''}`}
          ref={domRef}></div>
        {loading ? placeholderElement : null}
        {interactiveNeeded ? (
          <div
            className="fcr-absolute fcr-w-full fcr-h-full fcr-cursor-pointer fcr-top-0 fcr-left-0 cdn-player-play-btn"
            onClick={handlePlay}
          />
        ) : null}
      </div>
    );
  },
);
