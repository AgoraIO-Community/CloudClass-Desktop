import { observer } from 'mobx-react';
import React, { useRef, useLayoutEffect, useMemo } from 'react';
import { DraggableData, ResizableDelta, Rnd, Position } from 'react-rnd';
import { useStore } from '~hooks/use-edu-stores';
import { Track, Point, Dimensions, AgoraWidgetBase } from 'agora-edu-core';

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
  boundaryName?: string;
  children?: React.ReactNode;
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

export const TrackCore: React.FC<
  TrackSyncingProps & {
    setTrackById: (trackId: string, end: boolean, pos: Point, dimensions?: Dimensions) => void;
    trackById: Map<string, Track>;
  }
> = observer(
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
    boundaryName,
    setTrackById,
    trackById,
  }) => {
    const track = trackById.get(trackId);

    const rootRef = useRef<Rnd | null>(null);

    const boundsClz = `.${boundaryName}`;

    const handleEvents = useMemo(
      () =>
        ({
          drag: {
            onDrag: (_: unknown, pos: DraggableData) => {
              setTrackById(trackId, true, pos);
            },
            onResize: (
              _: unknown,
              __: unknown,
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
          drop: {
            onDrag: (_: unknown, pos: DraggableData) => {
              setTrackById(trackId, false, pos);
            },
            onDragStop: (_: unknown, pos: DraggableData) => {
              setTrackById(trackId, true, pos);
            },
            onResize: (
              _: unknown,
              __: unknown,
              ref: HTMLElement,
              delta: ResizableDelta,
              pos: Position,
            ) => {
              setTrackById(trackId, false, pos, {
                width: ref.clientWidth,
                height: ref.clientHeight,
              });
            },
            onResizeStop: (
              _: unknown,
              __: unknown,
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
      [syncOn, trackId, setTrackById],
    );

    useLayoutEffect(() => {
      const rnd = rootRef.current;
      const boundary = boundsClz && (document.querySelector(boundsClz) as HTMLDivElement);
      if (rnd && boundary) {
        // fix rnd bug
        forceUpdateRndBounds(rnd, boundary);
      }
    }, [boundsClz]);

    const postStyle = useMemo(
      () => Object.assign({}, style, track?.needTransition ? { transition: 'all .3s' } : null),
      [style, track?.needTransition],
    );

    return track && track.isContextInitialized ? (
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
export const WidgetTrackCore: React.FC<TrackSyncingProps> = observer(
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
    boundaryName,
  }) => {
    const {
      classroomStore: {
        widgetStore: { widgetController },
      },
      widgetUIStore: { setWidgetZIndexToTop },
    } = useStore();
    const widget = widgetController?.widgetsMap.get(trackId) as AgoraWidgetBase;
    const track = widget.track;

    const rootRef = useRef<Rnd | null>(null);

    const boundsClz = `.${boundaryName}`;

    const handleEvents = useMemo(
      () =>
        ({
          drag: {
            onDrag: (_: unknown, pos: DraggableData) => {
              widgetController?.setTrack(widget.id, true, { ...pos, real: true });
            },
            onResize: (
              _: unknown,
              __: unknown,
              ref: HTMLElement,
              delta: ResizableDelta,
              pos: Position,
            ) => {
              widgetController?.setTrack(
                widget.id,
                true,
                { ...pos, real: true },
                {
                  width: ref.clientWidth,
                  height: ref.clientHeight,
                  real: true,
                },
              );
            },
          },
          drop: {
            onDrag: (_: unknown, pos: DraggableData) => {
              widgetController?.setTrack(widget.id, false, { ...pos, real: true });
            },
            onDragStart: () => {
              setWidgetZIndexToTop(trackId);
            },
            onDragStop: (_: unknown, pos: DraggableData) => {
              widgetController?.setTrack(widget.id, true, { ...pos, real: true });
            },
            onResize: (
              _: unknown,
              __: unknown,
              ref: HTMLElement,
              delta: ResizableDelta,
              pos: Position,
            ) => {
              widgetController?.setTrack(
                widget.id,
                false,
                { ...pos, real: true },
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
              widgetController?.setTrack(
                widget.id,
                true,
                { ...pos, real: true },
                {
                  width: ref.clientWidth,
                  height: ref.clientHeight,
                  real: true,
                },
              );
            },
          },
        }[syncOn]),
      [syncOn, trackId, widget],
    );

    useLayoutEffect(() => {
      const rnd = rootRef.current;
      const boundary = boundsClz && (document.querySelector(boundsClz) as HTMLDivElement);
      if (rnd && boundary) {
        // fix rnd bug
        forceUpdateRndBounds(rnd, boundary);
      }
    }, [boundsClz]);

    const postStyle = useMemo(
      () => Object.assign({}, style, track?.needTransition ? { transition: 'all .3s' } : null),
      [style, track?.needTransition],
    );
    return track && track.isContextInitialized ? (
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
export const WidgetTrack: React.FC<TrackSyncingProps> = observer((props) => {
  return <WidgetTrackCore {...props} />;
});

export const ExtAppTrack: React.FC<TrackSyncingProps> = observer((props) => {
  const { trackUIStore } = useStore();

  const { extAppTrackById, setExtAppTrackById } = trackUIStore;

  return <TrackCore {...props} setTrackById={setExtAppTrackById} trackById={extAppTrackById} />;
});
