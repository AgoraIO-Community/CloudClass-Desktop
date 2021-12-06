import { observer } from 'mobx-react';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '~hooks/use-edu-stores';
import { EduStream } from 'agora-edu-core';
import classnames from 'classnames';
import './index.css';
import { Button, SvgImg } from '~ui-kit';
import { AGRenderMode } from 'agora-rte-sdk';

const ScreenShareLocalTrackPlayer = observer(() => {
  const {
    streamUIStore: { stopScreenShareCapture, localScreenShareOff },
  } = useStore();

  const [icon, setIcon] = useState<string>('share-default');

  return localScreenShareOff ? null : (
    <div style={{ width: 108, height: 30 }}>
      <button
        className="stop-button"
        onClick={stopScreenShareCapture}
        onMouseEnter={() => setIcon('share-hover')}
        onMouseLeave={() => setIcon('share-default')}>
        <SvgImg type={icon} style={{ display: 'flex', marginRight: 2 }} />
        <span>停止分享</span>
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
        setupRemoteVideo(stream, ref.current, AGRenderMode.fit);
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

export const ScreenShareContainer = observer(() => {
  const {
    streamUIStore: { localScreenShareOff, teacherScreenShareStream },
  } = useStore();
  const remotecls = classnames({
    [`remote-screen-share-container`]: 1,
  });
  const localcls = classnames({
    [`local-screen-share-container`]: 1,
  });
  return teacherScreenShareStream ? (
    <>
      {teacherScreenShareStream.stream.isLocal ? (
        <div className={localcls}>
          <ScreenShareLocalTrackPlayer />
        </div>
      ) : (
        <div className={remotecls}>
          <ScreenShareRemoteTrackPlayer stream={teacherScreenShareStream.stream} />
        </div>
      )}
    </>
  ) : null;
});
