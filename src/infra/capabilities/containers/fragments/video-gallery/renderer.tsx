import { EduStreamUI } from '@classroom/infra/stores/common/stream/struct';
import { getCameraPlaceholder } from '@classroom/infra/stores/common/stream/tool';
import { CameraPlaceHolder } from '@classroom/ui-kit';
import classNames from 'classnames';
import { CSSProperties, FC, useContext, useEffect, useRef } from 'react';
import { RtcEngineContext } from './context';

/**
 * 本地视频渲染
 * @returns
 */
export const LocalRenderer: FC<{ isMirrorMode: boolean; className?: string }> = ({
  isMirrorMode,
  className,
}) => {
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

  return <div className={className} style={style} ref={domRef} />;
};

/**
 * 远端视频渲染
 * @param param0
 * @returns
 */
export const RemoteRenderer: FC<{ uid: number; className?: string }> = ({ uid, className }) => {
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

  return (
    <div
      className={className}
      style={{ width: '100%', height: '100%', overflow: 'hidden' }}
      ref={domRef}
    />
  );
};

export const VideoRenderer: FC<{ stream: EduStreamUI }> = ({ stream }) => {
  const placeholder = getCameraPlaceholder(stream.stream);

  const uid = parseInt(stream.stream.streamUuid);
  const isLocal = stream.stream.isLocal;
  const isMirrorMode = stream.isMirrorMode;

  const cls = classNames('fcr-relative', {
    'fcr-invisible': stream.isCameraMuted,
  });

  return (
    <div className="fcr-w-full fcr-h-full fcr-relative">
      <CameraPlaceHolder style={{ position: 'absolute', top: 0 }} state={placeholder} />

      {isLocal ? (
        <LocalRenderer key={uid} isMirrorMode={isMirrorMode} className={cls} />
      ) : (
        <RemoteRenderer key={uid} uid={uid} className={cls} />
      )}
    </div>
  );
};
