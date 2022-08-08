import { useStore } from '@/infra/hooks/ui-store';
import { EduStream } from 'agora-edu-core';
import { AGRenderMode } from 'agora-rte-sdk';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import React, { FC, useEffect, useRef, useState } from 'react';
import { SvgIconEnum, SvgImg, transI18n } from '~ui-kit';
import './index.css';

const ScreenShareLocalTrackPlayer = observer(() => {
  const {
    streamUIStore: { stopScreenShareCapture, localScreenShareOff },
  } = useStore();

  const [icon, setIcon] = useState(SvgIconEnum.SHARE_DEFAULT);

  return localScreenShareOff ? null : (
    <div style={{ width: 108, height: 30 }}>
      <button
        className="stop-button"
        onClick={stopScreenShareCapture}
        onMouseEnter={() => setIcon(SvgIconEnum.SHARE_HOVER)}
        onMouseLeave={() => setIcon(SvgIconEnum.SHARE_DEFAULT)}>
        <SvgImg type={icon} style={{ display: 'flex', marginRight: 2 }} />
        <span>{transI18n('scaffold.stop_screen_share')}</span>
      </button>
    </div>
  );
});

const ScreenShareRemoteTrackPlayer = observer(
  ({ style, stream, className }: { style?: any; stream: EduStream; className?: string }) => {
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

export type ScreenShareContainerProps = {
  className?: string;
}

export const ScreenShareContainer = observer<FC<ScreenShareContainerProps>>(({className = ""}) => {
  const {
    boardUIStore: {
      boardAreaHeight
    },
    streamUIStore: { screenShareStream },
    classroomStore: {
      remoteControlStore: { isControlled, isHost },
    },
  } = useStore();

  const remotecls = classnames('remote-screen-share-container', 'absolute', 'bottom-0',className);

  const localcls = classnames('local-screen-share-container',className);

  return screenShareStream || isControlled ? (
    <React.Fragment>
      {screenShareStream?.isLocal || isControlled ? (
        <div className={localcls} style={{ top: `calc(100% - ${boardAreaHeight}px)` }}>
          <ScreenShareLocalTrackPlayer />
        </div>
      ) : screenShareStream && !screenShareStream.isLocal && !isHost ? (
        <div className={remotecls} style={{ height: boardAreaHeight }}>
          <ScreenShareRemoteTrackPlayer stream={screenShareStream} />
        </div>
      ) : null}
    </React.Fragment>
  ) : null;
});
