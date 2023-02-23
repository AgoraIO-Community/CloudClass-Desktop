import { useStore } from '@classroom/infra/hooks/ui-store';
import { Logger } from 'agora-rte-sdk';
import { MouseEvent, RefObject } from 'react';
import { useMemo, useRef } from 'react';
import { DraggableData, Rnd, RndDragEvent } from 'react-rnd';

/**
 * pagniation control, update published user list when user scroll into page
 */
export const useVideoPage = () => {
  const { videoGalleryUIStore } = useStore();

  const { totalPageNum, curStreamList, setPageSize } = videoGalleryUIStore;

  return { streamList: curStreamList, setPageSize, totalPageNum };
};

export enum ForceDirection {
  RightToLeft = 'left',
  LeftToRight = 'right',
  TopToBottom = 'bottom',
  BottomToTop = 'top',
}

type DragOutCallback = (forceDirection: ForceDirection) => void;

/**
 * analyze whether the target moved out of bounds and how it is being moved out
 */
export const useDragAnalyzer = ({
  bounds,
  rnd,
  onDragOutDetect,
  detectMovement,
}: {
  bounds: string;
  rnd: RefObject<Rnd>;
  onDragOutDetect: DragOutCallback;
  detectMovement: number;
}) => {
  const ref = useRef({
    forceDirection: ForceDirection.LeftToRight,
    forceAccumulation: 0,
  });

  const { shareUIStore } = useStore();

  const eventHandlers = useMemo(() => {
    let containerEl: Element | null = document.querySelector(bounds);

    const getBoundaries = () => {
      const rect = containerEl?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      return {
        left: 0,
        top: shareUIStore.navHeight,
        right: Math.floor(rect.width),
        bottom: Math.floor(shareUIStore.navHeight + rect.height),
      };
    };

    const detectZoneEdgeCollision = (x: number, y: number, width: number, height: number) => {
      const rect = getBoundaries();
      if (!rect) {
        return;
      }

      if (x <= rect.left) {
        return ForceDirection.RightToLeft;
      }
      if (x + width >= rect.right) {
        return ForceDirection.LeftToRight;
      }
      if (y <= rect.top) {
        return ForceDirection.BottomToTop;
      }
      if (y + height >= rect.bottom) {
        return ForceDirection.TopToBottom;
      }
    };

    return {
      onDragStart: (e: RndDragEvent, data: DraggableData) => {
        const { node, ...other } = data;
        Logger.info('onDragStart', other);
        ref.current.forceAccumulation = 0;
      },
      onDragStop: (e: RndDragEvent, data: DraggableData) => {
        const { node, ...other } = data;
        Logger.info('onDragStop', other);
      },
      onDrag: (e: RndDragEvent, data: DraggableData) => {
        const { node, ...other } = data;
        // e.client;
        const mouseEvent = e as MouseEvent;

        const rndWidth = rnd.current?.getSelfElement()?.clientWidth || 0;
        const rndHeight = rnd.current?.getSelfElement()?.clientHeight || 0;

        const direction = detectZoneEdgeCollision(other.x, other.y, rndWidth, rndHeight);

        if (direction) {
          if (
            direction === ForceDirection.RightToLeft ||
            direction === ForceDirection.LeftToRight
          ) {
            ref.current.forceAccumulation += mouseEvent.movementX;
          } else {
            ref.current.forceAccumulation += mouseEvent.movementY;
          }

          ref.current.forceDirection = direction;
        } else {
          ref.current.forceAccumulation = 0;
        }

        if (Math.abs(ref.current.forceAccumulation) > detectMovement) {
          onDragOutDetect(ref.current.forceDirection);
        }
      },
    };
  }, []);

  return {
    eventHandlers,
  };
};
