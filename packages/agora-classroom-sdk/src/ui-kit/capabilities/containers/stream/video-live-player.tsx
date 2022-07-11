import { observer } from 'mobx-react';
import {
  CSSProperties,
  forwardRef,
  ForwardRefRenderFunction,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import placeholderIcon from './assets/cdn-placeholder.svg';

type VideoLivePlayerProps = {
  url: string;
  style?: CSSProperties;
  className?: string;
  ended?: () => void;
  placeholderIcon?: React.ReactElement;
  placeholderText?: string;
  currentTime?: number;
};

export type VideoLivePlayerRef = {
  play: (currentTime: number) => void;
  pause: (currentTime: number) => void;
};

const PlaceholderIcon = () => (
  <img style={{ width: '200px', maxWidth: '20vw' }} src={placeholderIcon} />
);

enum VideoPlayerState {
  Initializing,
  Ready,
  Playing,
  Ended,
}

const VideoLivePlayerBaseCom: ForwardRefRenderFunction<VideoLivePlayerRef, VideoLivePlayerProps> = (
  {
    style,
    url,
    className,
    ended,
    placeholderIcon = <PlaceholderIcon />,
    placeholderText,
    currentTime = 0,
  },
  ref,
) => {
  const [interactiveNeeded, setInteractiveNeeded] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [state, setState] = useState(VideoPlayerState.Initializing);
  const setTimeHandle = useCallback((currentTime: number) => {
    if (videoRef.current && currentTime >= 0) {
      const time =
        currentTime >= videoRef.current.duration ? videoRef.current.duration : currentTime;
      videoRef.current.currentTime = time;
    }
  }, []);

  const playHandle = useCallback((currentTime: number) => {
    if (videoRef.current) {
      setTimeHandle(currentTime);
      setState(VideoPlayerState.Playing);
      videoRef.current?.play();
      return;
    }
  }, []);

  const pauseHandle = useCallback(async () => {
    if (videoRef.current) {
      videoRef.current.pause();
      return;
    }
  }, []);

  const showPlaceholder = useMemo(() => {
    return !(state === VideoPlayerState.Playing && !!url);
  }, [state, url]);

  useImperativeHandle(ref, () => ({
    play: playHandle,
    pause: pauseHandle,
  }));

  const placeholderElement = useMemo(() => {
    return (
      <div
        className="absolute w-full h-full top-0 left-0 flex items-center justify-center flex-col z-10"
        style={{ backgroundColor: 'rgb(249 249 252)' }}>
        {placeholderIcon}
        {placeholderText !== '' ? (
          <p className="text-base" style={{ color: '#7B88A0' }}>
            {placeholderText}
          </p>
        ) : (
          ''
        )}
      </div>
    );
  }, [placeholderIcon, placeholderText]);

  useEffect(() => {
    if (videoRef.current) {
      const endedHandle = () => {
        //结束
        ended && ended();
      };
      videoRef.current.addEventListener('ended', endedHandle);
      return () => {
        videoRef.current?.removeEventListener('ended', endedHandle);
      };
    }
  }, [ended]);

  useEffect(() => {
    if (videoRef.current) {
      const playHandle = () => {
        setInteractiveNeeded(false);
      };
      videoRef.current.addEventListener('play', playHandle);
      return () => {
        videoRef.current?.removeEventListener('play', playHandle);
      };
    }
  }, [url]);

  useEffect(() => {
    if (videoRef.current) {
      const pauseHandle = () => {
        setInteractiveNeeded(true);
      };
      videoRef.current.addEventListener('pause', pauseHandle);
      return () => {
        videoRef.current?.removeEventListener('pause', pauseHandle);
      };
    }
  }, [url]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <video src={url} style={style} className={className} ref={videoRef}></video>
      {interactiveNeeded ? (
        <div
          className="absolute w-full h-full cursor-pointer top-0 left-0 video-live-player-play-btn"
          onClick={() => {
            playHandle(currentTime);
          }}></div>
      ) : null}
      {showPlaceholder ? placeholderElement : null}
    </div>
  );
};

export const VideoLivePlayer = observer(forwardRef(VideoLivePlayerBaseCom));
