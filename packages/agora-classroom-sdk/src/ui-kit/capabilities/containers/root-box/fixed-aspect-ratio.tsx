import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import { RootBox } from '~ui-kit';
import { useClassroomStyle, useInitialize } from './hooks';
import { useStore } from '@/infra/hooks/use-edu-stores';

type FixedAspectRatioProps = {
  minimumWidth?: number;
  minimumHeight?: number;
  trackMargin?: Partial<{ top: number }>;
  trackResize?: Partial<{
    minHeight: number;
    minWidth: number;
    maxHeight: number;
    maxWidth: number;
  }>;
};

const FixedAspectRatioContainer: React.FC<FixedAspectRatioProps> = observer(
  ({ children, minimumWidth = 0, minimumHeight = 0 }) => {
    const style = useClassroomStyle({ minimumHeight, minimumWidth });

    return (
      <div
        className="flex justify-center items-center h-screen w-screen"
        style={{ background: '#263487' }}>
        <div style={style} className="w-full h-full relative">
          {children}
        </div>
      </div>
    );
  },
);

export const TrackArea = ({ top = 0, boundaryName }: { top?: number; boundaryName: string }) => {
  const { trackUIStore } = useStore();

  useEffect(() => {
    trackUIStore.updateTrackContext(boundaryName);
  }, []);
  return (
    <div
      className={`${boundaryName} w-full absolute`}
      style={{ height: `calc( 100% - ${top}px )`, top, zIndex: -1 }}
    />
  );
};

export const FixedAspectRatioRootBox: FC<FixedAspectRatioProps> = ({
  children,
  minimumWidth,
  minimumHeight,
  trackMargin,
  ...props
}) => {
  useInitialize({ top: trackMargin?.top || 0 });

  return (
    <FixedAspectRatioContainer
      minimumWidth={minimumWidth || 1024}
      minimumHeight={minimumHeight || 576}
      {...props}>
      <ClassroomTrackBounds trackMargin={trackMargin} />
      <RootBox>{children}</RootBox>
    </FixedAspectRatioContainer>
  );
};

export const ClassroomTrackBounds = observer(
  ({ trackMargin }: { trackMargin: FixedAspectRatioProps['trackMargin'] }) => {
    const { shareUIStore } = useStore();

    const readyToMount = shareUIStore.classroomViewportSize.width > 0;

    return readyToMount ? (
      <TrackArea top={trackMargin?.top || 0} boundaryName="classroom-track-bounds" />
    ) : null;
  },
);
