import { CSSProperties, FC, useContext, useEffect, useRef } from 'react';
import { RtcEngineContext } from './context';

/**
 * 本地视频渲染
 * @returns
 */
export const LocalRenderer: FC<{ isMirrorMode: boolean }> = ({ isMirrorMode }) => {
  const domRef = useRef<HTMLDivElement>(null);
  const context = useContext(RtcEngineContext);

  useEffect(() => {
    const { rtcEngine } = context;

    if (domRef.current && rtcEngine) {
      rtcEngine.initRender('local', domRef.current, '');
    }

    return () => {
      if (rtcEngine) rtcEngine.destroyRender('local', '');
    };
  }, [context.rtcEngine]);

  const style: CSSProperties = { width: '100%', height: '100%', overflow: 'hidden' };
  if (!isMirrorMode) {
    style.transform = 'rotateY(180deg)';
  }

  return <div style={style} ref={domRef} />;
};

/**
 * 远端视频渲染
 * @param param0
 * @returns
 */
export const RemoteRenderer: FC<{ uid: number }> = ({ uid }) => {
  const domRef = useRef<HTMLDivElement>(null);
  const context = useContext(RtcEngineContext);

  useEffect(() => {
    const { rtcEngine } = context;

    if (domRef.current && rtcEngine) {
      rtcEngine.initRender(uid, domRef.current, '');
    }

    return () => {
      if (rtcEngine) {
        rtcEngine.destroyRender(uid, '');
      }
    };
  }, [context.rtcEngine]);

  return <div style={{ width: '100%', height: '100%', overflow: 'hidden' }} ref={domRef} />;
};

export const VideoRenderer: FC<{ uid: number; isLocal: boolean; isMirrorMode: boolean }> = ({
  uid,
  isLocal,
  isMirrorMode,
}) => {
  return isLocal ? (
    <LocalRenderer key={uid} isMirrorMode={isMirrorMode} />
  ) : (
    <RemoteRenderer key={uid} uid={uid} />
  );
};
