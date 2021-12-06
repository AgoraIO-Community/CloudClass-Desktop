import { useEffect, useMemo } from 'react';
import { useStore } from '~hooks/use-edu-stores';

export const useInitialize = (trackMargin: { top: number }) => {
  const { trackUIStore } = useStore();
  const { initialize, destroy } = trackUIStore;

  useEffect(() => {
    initialize({ margin: trackMargin });
    return destroy;
  }, []);
};

export const useClassroomStyle = ({
  minimumHeight,
  minimumWidth,
  delayBeforeScale,
}: {
  minimumHeight: number;
  minimumWidth: number;
  delayBeforeScale: number;
}) => {
  const minimumSize = useMemo(
    () => ({ height: minimumHeight, width: minimumWidth }),
    [minimumHeight, minimumWidth],
  );
  const { shareUIStore } = useStore();

  const { classroomViewportSize } = shareUIStore;

  const postStyle = useMemo(
    () =>
      classroomViewportSize.width !== 0 && classroomViewportSize.height !== 0
        ? Object.assign(
            {
              width: classroomViewportSize.width,
              height: classroomViewportSize.height,
              minWidth: minimumSize.width,
              minHeight: minimumSize.height,
            },
            { transition: 'all .3s' },
          )
        : {},
    [
      classroomViewportSize.width,
      classroomViewportSize.height,
      minimumSize.width,
      minimumSize.height,
    ],
  );

  return postStyle;
};
