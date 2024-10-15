import { useStore } from '@classroom/hooks/ui-store';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { CSSProperties, useEffect, useRef } from 'react';
import { EduStream } from 'agora-edu-core';
import { AGRenderMode } from 'agora-rte-sdk';
import { useForceRenderWhenVisibilityChanged } from '@classroom/utils/force-render';

import './index.css';

export const ScreenShareContainer = observer(() => {
  const {
    shareUIStore: { isLandscape },
    boardUIStore: { boardContainerHeight },
    streamUIStore: { screenShareStream, toggleTool },
    layoutUIStore: { toggleLandscapeToolBarVisible },
  } = useStore();
  const { renderKey } = useForceRenderWhenVisibilityChanged();
  const remotecls = classnames('remote-screen-share-container', 'fcr-t-0', {
    'remote-screen-share-container-landscape': isLandscape,
  });

  return screenShareStream ? (
    <div
      className={remotecls}
      // style={{ height: boardContainerHeight }}
      onClick={toggleLandscapeToolBarVisible}>
      <ScreenShareRemoteTrackPlayer key={renderKey} stream={screenShareStream} />
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
    const {
      streamUIStore,
      classroomStore: {
        streamStore: { muteRemoteVideoStream },
      },
    } = useStore();
    const { setupRemoteVideo } = streamUIStore;
    const ref = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      const subscribeAndRender = () => {
        if (ref.current) {
          muteRemoteVideoStream(stream, false);
          setupRemoteVideo(stream, ref.current, false, AGRenderMode.fit);
        }
      };
      subscribeAndRender();
      return () => {
        muteRemoteVideoStream(stream, true);
      };
    }, [ref.current, stream]);

    return (
      <div
        style={{ width: '100%', height: '100%', ...style }}
        className={className}
        ref={ref}></div>
    );
  },
);
