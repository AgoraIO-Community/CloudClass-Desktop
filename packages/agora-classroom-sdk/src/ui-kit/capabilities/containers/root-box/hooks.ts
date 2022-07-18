import { useEffect, useMemo } from 'react';
import { useStore } from '@/infra/hooks/ui-store';

export const useClassroomStyle = ({
  minimumHeight,
  minimumWidth,
}: {
  minimumHeight: number;
  minimumWidth: number;
}) => {
  const minimumSize = useMemo(
    () => ({ height: minimumHeight, width: minimumWidth }),
    [minimumHeight, minimumWidth],
  );
  const { shareUIStore } = useStore();

  const { classroomViewportSize, classroomViewportTransitionDuration } = shareUIStore;

  useEffect(() => {
    shareUIStore.addWindowResizeEventListener();
    return () => {
      shareUIStore.removeWindowResizeEventListener();
    };
  }, []);

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
            { transition: `all ${classroomViewportTransitionDuration}ms` },
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
