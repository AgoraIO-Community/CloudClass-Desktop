import { observer } from 'mobx-react';
import React, { useRef, useLayoutEffect, useMemo } from 'react';
import { DraggableData, ResizableDelta, Rnd, Position } from 'react-rnd';
import { Dimensions, Point, Track, TrackOptions } from 'agora-edu-core';

type TrackSyncingProps = {
  draggable: boolean;
  resizable: boolean;
  controlled: boolean;
  handle?: string;
  cancel?: string;
  syncOn?: 'drag' | 'drop';
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  boundaryName?: string;
  children?: React.ReactNode;
  zIndex?: number;
  track: Track;
  onChange: (end: boolean, pos: Point, dimensions?: Dimensions, options?: TrackOptions) => void;
  onZIndexChange: () => void;
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

export const TrackCore: React.FC<TrackSyncingProps> = observer(
  ({
    children,
    draggable,
    resizable,
    handle,
    syncOn = 'drop',
    controlled,
    minHeight,
    minWidth,
    maxWidth,
    maxHeight,
    cancel,
    boundaryName,
    track,
    onChange,
    zIndex,
    onZIndexChange
  }) => {
    const rootRef = useRef<Rnd | null>(null);

    const boundsSel = `.${boundaryName}`;
    const cancelSel = `.${cancel}`

    const handleEvents = useMemo(
      () =>
      ({
        drag: {
          onMouseDown: onZIndexChange,
          onDrag: (_: unknown, pos: DraggableData) => {
            onChange(true, { x: pos.x, y: pos.y, real: true });
          },
          onResize: (
            _: unknown,
            __: unknown,
            ref: HTMLElement,
            delta: ResizableDelta,
            pos: Position,
          ) => {
            onChange(
              true,
              { x: pos.x, y: pos.y, real: true },
              {
                width: ref.clientWidth,
                height: ref.clientHeight,
                real: true,
              },
            );
          },
        },
        drop: {
          onMouseDown: onZIndexChange,
          onDrag: (_: unknown, pos: DraggableData) => {
            onChange(false, { x: pos.x, y: pos.y, real: true });
          },
          onDragStart: () => { },
          onDragStop: (_: unknown, pos: DraggableData) => {
            onChange(true, { x: pos.x, y: pos.y, real: true });
          },
          onResize: (
            _: unknown,
            __: unknown,
            ref: HTMLElement,
            delta: ResizableDelta,
            pos: Position,
          ) => {
            onChange(
              false,
              {
                x: pos.x,
                y: pos.y,
                real: true,
              },
              {
                width: ref.clientWidth,
                height: ref.clientHeight,
                real: true,
              },
            );
          },
          onResizeStop: (
            _: unknown,
            __: unknown,
            ref: HTMLElement,
            delta: ResizableDelta,
            pos: Position,
          ) => {
            onChange(
              true,
              {
                x: pos.x,
                y: pos.y,
                real: true,
              },
              {
                width: ref.clientWidth,
                height: ref.clientHeight,
                real: true,
              },
            );
          },
        },
      }[syncOn]),
      [syncOn, onChange, onZIndexChange],
    );


    useLayoutEffect(() => {
      const rnd = rootRef.current;
      const boundary = boundsSel && (document.querySelector(boundsSel) as HTMLDivElement);
      if (rnd && boundary) {
        // fix rnd bug
        forceUpdateRndBounds(rnd, boundary);
      }
    }, [boundsSel]);

    const postStyle = useMemo(
      () => Object.assign({ zIndex }, track.needTransition ? { transition: 'all .3s' } : null),
      [track.needTransition, zIndex],
    );

    return track.visible ? <Rnd
      {...handleEvents}
      style={postStyle}
      bounds={boundsSel}
      cancel={cancelSel}
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
    </Rnd> : null
  },
);
