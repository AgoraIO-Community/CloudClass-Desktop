import { FC, memo } from 'react';
import { observer } from 'mobx-react';
import { RootBox } from '~ui-kit';
import { useClassroomStyle, useInitialize } from './hooks';

type FixedAspectRatioProps = {
  minimumWidth?: number;
  minimumHeight?: number;
  delayBeforeScale?: number;
  trackMargin?: Partial<{ top: number }>;
  trackResize?: Partial<{
    minHeight: number;
    minWidth: number;
    maxHeight: number;
    maxWidth: number;
  }>;
};

const FixedAspectRatioContainer: React.FC<FixedAspectRatioProps> = observer(
  ({ children, minimumWidth = 0, minimumHeight = 0, delayBeforeScale = 500 }) => {
    const style = useClassroomStyle({ minimumHeight, minimumWidth, delayBeforeScale });

    return (
      <div className="flex bg-black justify-center items-center h-screen w-screen">
        <div style={style} className="w-full h-full relative">
          {children}
        </div>
      </div>
    );
  },
);

const TrackArea = memo(({ top }: Partial<{ top: number }>) => (
  <div
    className="track-bounds w-full absolute"
    style={{ height: `calc( 100% - ${top}px )`, top, zIndex: -1 }}
  />
));

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
      <TrackArea top={trackMargin?.top || 0} />
      <RootBox>{children}</RootBox>
    </FixedAspectRatioContainer>
  );
};
