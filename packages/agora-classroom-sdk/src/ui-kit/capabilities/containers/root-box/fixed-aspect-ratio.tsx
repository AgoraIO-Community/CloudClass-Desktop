import { FC, useRef } from 'react';
import { observer } from 'mobx-react';
import { RootBox } from '~ui-kit';
import { useClassroomStyle } from './hooks';
import { useStore } from '@/infra/hooks/ui-store';

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
  children?: React.ReactNode;
};

const FixedAspectRatioContainer: React.FC<FixedAspectRatioProps> = observer(
  ({ children, minimumWidth = 0, minimumHeight = 0 }) => {
    const style = useClassroomStyle({ minimumHeight, minimumWidth });

    const { shareUIStore } = useStore();

    return (
      <div className="flex bg-black justify-center items-center h-screen w-screen">
        <div
          style={style}
          className={`w-full h-full relative ${shareUIStore.classroomViewportClassName}`}>
          {children}
        </div>
      </div>
    );
  },
);

export const TrackArea = ({ top = 0, boundaryName }: { top?: number; boundaryName: string }) => {
  const dom = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={dom}
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
