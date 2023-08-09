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
  getLiveTime: () => number;
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
  Ready, // Received orders to play, but can't automatically play, waiting for a manual trigger
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
    getLiveTime,
  },
  ref,
) => {
  const [interactiveNeeded, setInteractiveNeeded] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [state, setState] = useState(VideoPlayerState.Initializing);
  const [canplay, setCanplay] = useState(false);
  const setTimeHandle = useCallback(
    (currentTime: number) => {
      if (!url || !canplay) {
        return;
      }
      if (videoRef.current && currentTime >= 0 && videoRef.current.currentTime < currentTime) {
        const time = Math.min(videoRef.current.duration, currentTime);
        videoRef.current.currentTime = time;
      }
    },
    [url, canplay],
  );

  const playHandle = useCallback(
    (currentTime: number) => {
      if (videoRef.current) {
        setTimeHandle(currentTime);
        videoRef.current
          ?.play()
          .then(() => {
            setTimeHandle(currentTime);
            setState(VideoPlayerState.Playing);
          })
          .catch(() => {
            setState(VideoPlayerState.Ready);
            setTimeout(() => {
              setTimeHandle(currentTime);
            }, 1000);
          });
        return;
      }
    },
    [setTimeHandle],
  );

  const pauseHandle = useCallback(async () => {
    if (videoRef.current) {
      videoRef.current.pause();
      return;
    }
  }, []);

  const showPlaceholder = useMemo(() => {
    return !(state !== VideoPlayerState.Initializing && !!url);
  }, [state, url]);

  useImperativeHandle(ref, () => ({
    play: playHandle,
    pause: pauseHandle,
  }));

  useEffect(() => {
    if (videoRef.current) {
      const handle = () => {
        setInteractiveNeeded(false);
      };
      videoRef.current.addEventListener('play', handle);
      return () => {
        videoRef.current?.removeEventListener('play', handle);
      };
    }
  }, [url]);

  useEffect(() => {
    if (videoRef.current) {
      const handle = () => {
        setInteractiveNeeded(true);
      };
      videoRef.current.addEventListener('pause', handle);
      return () => {
        videoRef.current?.removeEventListener('pause', handle);
      };
    }
  }, [url]);

  useEffect(() => {
    if (videoRef.current) {
      setCanplay(false);
      const handle = () => {
        setCanplay(true);
      };
      videoRef.current.addEventListener('canplay', handle);
      return () => {
        videoRef.current?.removeEventListener('canplay', handle);
      };
    }
  }, [url]);

  useEffect(() => {
    if (videoRef.current) {
      const handle = () => {
        //结束
        ended && ended();
      };
      videoRef.current.addEventListener('ended', handle);
      return () => {
        videoRef.current?.removeEventListener('ended', handle);
      };
    }
  }, [ended]);

  const placeholderElement = useMemo(() => {
    return (
      <div
        className="fcr-absolute fcr-w-full fcr-h-full fcr-top-0 fcr-left-0 fcr-flex fcr-items-center fcr-justify-center fcr-flex-col fcr-z-10"
        style={{ backgroundColor: 'rgb(249 249 252)' }}>
        {placeholderIcon}
        {placeholderText !== '' ? (
          <p className="fcr-text-base" style={{ color: '#7B88A0' }}>
            {placeholderText}
          </p>
        ) : (
          ''
        )}
      </div>
    );
  }, [placeholderIcon, placeholderText]);

  return (
    <div className="fcr-relative fcr-w-full fcr-h-full fcr-flex fcr-items-center fcr-justify-center">
      <video
        src={url}
        style={style}
        className={`fcr-pointer-events-none fcr-w-full fcr-h-full ${className}`}
        ref={videoRef}
      />
      {interactiveNeeded ? (
        <div
          className="fcr-absolute fcr-w-full fcr-h-full fcr-cursor-pointer fcr-top-0 fcr-left-0 video-live-player-play-btn"
          onClick={() => {
            playHandle(getLiveTime());
          }}></div>
      ) : null}
      {showPlaceholder ? placeholderElement : null}
    </div>
  );
};

export const VideoLivePlayer = observer(forwardRef(VideoLivePlayerBaseCom));
