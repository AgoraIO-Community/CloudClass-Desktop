import { useStore } from '@classroom/infra/hooks/ui-store';
import { observer } from 'mobx-react';
import { useEffect, useRef } from 'react';
import { ComponentLevelRules } from '../../config';

export const RemoteControlContainer = observer(() => {
  const {
    classroomStore: {
      remoteControlStore: { isRemoteControlling, isHost, setRenderDom },
    },
    boardUIStore: { boardAreaHeight },
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
      className={`fcr-w-full fcr-absolute`}
      style={{
        bottom: 0,
        pointerEvents: isRemoteControlling && isHost ? 'auto' : 'none',
        zIndex: ComponentLevelRules.StreamWindow,
        height: boardAreaHeight,
      }}></div>
  );
});
