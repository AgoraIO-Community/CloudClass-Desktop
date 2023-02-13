import { WindowID } from '@classroom/infra/api';
import { listenChannelMessage, sendToRendererProcess } from '@classroom/infra/utils/ipc';
import { ChannelType } from '@classroom/infra/utils/ipc-channels';
import { CSSProperties, FC, useContext, useEffect, useRef, useState } from 'react';
import { RtcEngineContext } from './context';

/**
 * 本地视频渲染
 * @returns
 */
export const LocalRenderer = () => {
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

  return <div style={{ width: '100%', height: '100%' }} ref={domRef} />;
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

export const VideoRenderers = () => {
  const [streams, setStreams] = useState<{ uid: number; channelId: string }[]>([]);

  useEffect(() => {
    sendToRendererProcess(WindowID.Main, ChannelType.Message, {
      type: 'rtc-stream-refersh',
    });
    const rtcRegisterEventDisposer = listenChannelMessage(ChannelType.Message, (e, message) => {
      if (message.type === 'rtc-stream-updated') {
        setStreams(message.payload as typeof streams);
      }
    });

    return rtcRegisterEventDisposer;
  }, []);

  return (
    <div>
      {streams.map(({ uid }) =>
        uid === 0 ? <LocalRenderer key={uid} /> : <RemoteRenderer key={uid} uid={uid} />,
      )}
    </div>
  );
};
