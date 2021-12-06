import { observer } from 'mobx-react';
import React, { useRef, useLayoutEffect, useMemo } from 'react';
import { DraggableData, ResizableDelta, Rnd, Position } from 'react-rnd';
import { useStore } from '~hooks/use-edu-stores';

type TrackSyncingProps = {
  trackId: string;
  draggable: boolean;
  resizable: boolean;
  controlled: boolean;
  style?: React.CSSProperties;
  handle?: string;
  cancel?: string;
  syncOn?: 'drag' | 'drop';
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
};

const forceUpdateRndBounds = (rnd: Rnd, boundary: HTMLDivElement) => {
  const parent = rnd.getParent();
  const boundaryRect = boundary.getBoundingClientRect();
  const boundaryLeft = boundaryRect.left;
  const boundaryTop = boundaryRect.top;
  const parentRect = parent.getBoundingClientRect();
  const parentLeft = parentRect.left;
  const parentTop = parentRect.top;
  const scale = rnd.props.scale as number;
  const left = (boundaryLeft - parentLeft) / scale;
  const top = boundaryTop - parentTop;

  rnd.updateOffsetFromParent();
  const offset = rnd.offsetFromParent;
  rnd.setState({
    bounds: {
      top: top - offset.top,
      right: left + (boundary.offsetWidth - rnd.resizable.size.width) - offset.left / scale,
      bottom: top + (boundary.offsetHeight - rnd.resizable.size.height) - offset.top,
      left: left - offset.left / scale,
    },
  });
};

export const Track: React.FC<TrackSyncingProps> = observer(
  ({
    children,
    trackId,
    draggable,
    resizable,
    style,
    handle,
    syncOn = 'drop',
    controlled,
    minHeight,
    minWidth,
    maxWidth,
    maxHeight,
    cancel,
  }) => {
    const { trackUIStore } = useStore();
    const { trackByWidgetId, setTrackById, bounds } = trackUIStore;

    const track = trackByWidgetId.get(trackId);

    const rootRef = useRef<Rnd | null>(null);

    const boundsClz = '.track-bounds';

    const handleEvents = useMemo(
      () =>
        ({
          drag: {
            onDrag: (_: any, pos: DraggableData) => {
              setTrackById(trackId, true, pos);
            },
            onResize: (_: any, __: any, ref: HTMLElement, delta: ResizableDelta, pos: Position) => {
              setTrackById(trackId, true, pos, {
                width: ref.clientWidth,
                height: ref.clientHeight,
              });
            },
          },
          drop: {
            onDrag: (_: any, pos: DraggableData) => {
              setTrackById(trackId, false, pos);
            },
            onDragStop: (_: any, pos: DraggableData) => {
              setTrackById(trackId, true, pos);
            },
            onResize: (_: any, __: any, ref: HTMLElement, delta: ResizableDelta, pos: Position) => {
              setTrackById(trackId, false, pos, {
                width: ref.clientWidth,
                height: ref.clientHeight,
              });
            },
            onResizeStop: (
              _: any,
              __: any,
              ref: HTMLElement,
              delta: ResizableDelta,
              pos: Position,
            ) => {
              setTrackById(trackId, true, pos, {
                width: ref.clientWidth,
                height: ref.clientHeight,
              });
            },
          },
        }[syncOn]),
      [syncOn],
    );

    useLayoutEffect(() => {
      const rnd = rootRef.current;
      const boundary = document.querySelector(boundsClz!) as HTMLDivElement;
      if (rnd) {
        // fix rnd bug
        forceUpdateRndBounds(rnd, boundary);
      }
    }, [bounds, boundsClz]);

    const postStyle = useMemo(
      () => Object.assign({}, style, track?.needTransition ? { transition: 'all .3s' } : null),
      [style, track?.needTransition],
    );

    return track ? (
      <Rnd
        {...handleEvents}
        style={postStyle}
        bounds={boundsClz}
        cancel={cancel}
        dragHandleClassName={handle}
        disableDragging={!controlled || !draggable}
        enableResizing={controlled && resizable}
        ref={rootRef}
        minHeight={minHeight}
        minWidth={minWidth}
        maxHeight={maxHeight}
        maxWidth={maxWidth}
        size={track.realVal.dimensions}
        position={track.realVal.position}>
        {children}
      </Rnd>
    ) : null;
  },
);
