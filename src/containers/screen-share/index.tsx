import { useStore } from '@classroom/hooks/ui-store';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import './index.css';
import { CSSProperties, useEffect, useRef } from 'react';
import { EduStream } from 'agora-edu-core';
import { AGRenderMode } from 'agora-rte-sdk';

export const ScreenShareContainerMobile = observer(() => {
  const {
    boardUIStore: { boardContainerHeight },
    streamUIStore: { screenShareStream },
  } = useStore();

  const remotecls = classnames('remote-screen-share-container', 'fcr-absolute', 'fcr-t-0');

  return screenShareStream ? (
    <div className={remotecls} style={{ height: boardContainerHeight }}>
      <ScreenShareRemoteTrackPlayer stream={screenShareStream} />
    </div>
  ) : null;
});
export const ScreenShareRemoteTrackPlayer = observer(
  ({
    style,
    stream,
    className,
  }: {
    style?: CSSProperties;
    stream: EduStream;
    className?: string;
  }) => {
    const { streamUIStore } = useStore();
    const { setupRemoteVideo } = streamUIStore;

    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (ref.current) {
        setupRemoteVideo(stream, ref.current, false, AGRenderMode.fit);
      }
    }, [ref.current, stream]);

    return (
      <div
        style={{ width: '100%', height: '100%', ...style }}
        className={className}
        ref={ref}></div>
    );
  },
);
