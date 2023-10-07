import { useStore } from '@classroom/infra/hooks/ui-store';
import { EduStreamUI } from '@classroom/infra/stores/common/stream/struct';
import { observer } from 'mobx-react';
import { CSSProperties, FC, useEffect, useRef } from 'react';
import classnames from 'classnames';
import { EduStream } from 'agora-edu-core';
import { AGRenderMode } from 'agora-rte-sdk';

export const TrackPlayer: FC<{
  stream: EduStreamUI;
  className?: string;
  style?: CSSProperties;
  renderMode?: AGRenderMode;
}> = observer(({ stream, className, style, renderMode }) => {
  const cls = classnames({
    [`video-player`]: 1,
    ['fcr-invisible']: stream.isCameraMuted,
    [`${className}`]: !!className,
  });

  return stream.stream.isLocal ? (
    <LocalTrackPlayer className={cls} style={style} renderMode={renderMode} />
  ) : (
    <RemoteTrackPlayer
      className={cls}
      style={style}
      stream={stream.stream}
      mirrorMode={stream.isMirrorMode}
      renderMode={renderMode}
    />
  );
});

type RemoteTrackPlayerProps = {
  stream: EduStream;
  style?: CSSProperties;
  className?: string;
  mirrorMode?: boolean;
  renderMode?: AGRenderMode;
};

type LocalTrackPlayerProps = Omit<RemoteTrackPlayerProps, 'stream'>;

export const LocalTrackPlayer: FC<LocalTrackPlayerProps> = observer(
  ({ style, className, renderMode }) => {
    const {
      streamUIStore: { setupLocalVideo, isMirror },
    } = useStore();
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (ref.current) {
        setupLocalVideo(ref.current, isMirror, renderMode);
      }
    }, [isMirror, setupLocalVideo]);

    return <div style={style} className={className} ref={ref}></div>;
  },
);

export const RemoteTrackPlayer: FC<RemoteTrackPlayerProps> = observer(
  ({ style, stream, className, mirrorMode = true, renderMode }) => {
    const { classroomStore } = useStore();
    const { streamStore } = classroomStore;
    const { setupRemoteVideo } = streamStore;

    const rtcRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (rtcRef.current) {
        setupRemoteVideo(stream, rtcRef.current, mirrorMode, renderMode);
      }
    }, [stream, setupRemoteVideo]);

    return <div style={style} className={`${className}`} ref={rtcRef} />;
  },
);
