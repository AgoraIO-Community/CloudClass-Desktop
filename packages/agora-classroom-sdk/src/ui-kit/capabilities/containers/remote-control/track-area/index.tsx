import { useStore } from '@/infra/hooks/use-edu-stores';
import { observer } from 'mobx-react';
import { useEffect, useRef } from 'react';

export const RemoteControlTrackArea = observer(() => {
  const {
    classroomStore: {
      remoteControlStore: { isRemoteControlling, isHost, setRenderDom },
    },
  } = useStore();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setRenderDom(ref.current!);
    return () => setRenderDom(null);
  }, []);
  return (
    <div
      ref={ref}
      id="remote-control-track-area"
      className={`w-full h-full absolute`}
      style={{ top: 0, zIndex: isRemoteControlling && isHost ? 0 : -1 }}
    />
  );
});
