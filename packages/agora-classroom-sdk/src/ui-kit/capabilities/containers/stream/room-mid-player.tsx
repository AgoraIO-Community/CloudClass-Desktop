import { observer } from 'mobx-react';
import { useInteractiveUIStores, useStore } from '~hooks/use-edu-stores';
import { useCallback, useEffect, useMemo, useState, useRef, ReactNode, CSSProperties } from 'react';
import { EduInteractiveUIClassStore } from '@/infra/stores/interactive';
import {
  CarouselGroup,
  LocalStreamPlayerTools,
  NavGroup,
  RemoteStreamPlayerTools,
  StreamPlayer,
  VisibilityDOM,
} from '.';
import useMeasure from 'react-use-measure';
import { useDrag } from '@use-gesture/react';
import { EduStreamUI } from '@/infra/stores/common/stream/struct';
import { Popover } from '~ui-kit';

export const RoomMidStreamsContainer = observer(() => {
  const {
    streamUIStore,
    streamWindowUIStore: { visibleStream, streamDragable, handleDBClickStreamWindow },
  } = useInteractiveUIStores() as EduInteractiveUIClassStore;
  const {
    videoStreamSize,
    carouselNext,
    carouselPrev,
    scrollable,
    gap,
    carouselStreams,
    stageVisible,
  } = streamUIStore;

  const [navigationVisible, setNavigationVisible] = useState(false);

  const mouseHandler = useCallback(
    (visible: boolean) => () => {
      setNavigationVisible(visible);
    },
    [],
  );

  const handleStreamDoubleClick = (stream: EduStreamUI) => {
    streamDragable && stream && handleDBClickStreamWindow(stream);
  };

  return (
    <div
      id="stage-container"
      className={`w-full flex-grow flex-shrink-0 ${stageVisible ? '' : 'hidden'}`}>
      <div className="h-full flex justify-center items-center relative">
        <TeacherStream />
        <div onMouseEnter={mouseHandler(true)} onMouseLeave={mouseHandler(false)}>
          {scrollable && (
            <NavGroup visible={navigationVisible} onPrev={carouselPrev} onNext={carouselNext} />
          )}
          <CarouselGroup
            gap={gap}
            videoWidth={videoStreamSize.width}
            videoHeight={videoStreamSize.height}
            carouselStreams={carouselStreams}
            invisible={visibleStream}
            handleDBClick={handleStreamDoubleClick}
          />
        </div>
      </div>
    </div>
  );
});

export const TeacherStream = observer((props: { isFullScreen?: boolean }) => {
  const [ref, bounds] = useMeasure();
  const { isFullScreen = false } = props;
  const { streamUIStore, widgetUIStore, streamWindowUIStore } =
    useInteractiveUIStores() as EduInteractiveUIClassStore;
  const { teacherCameraStream, videoStreamSize, gap, setStreamBoundsByStreamUuid } = streamUIStore;
  const { streamDragable, visibleStream, handleDBClickStreamWindow } = streamWindowUIStore;
  const videoStreamStyle = useMemo(() => {
    return isFullScreen
      ? { width: '100%', height: '100%' }
      : {
          width: videoStreamSize.width,
          height: videoStreamSize.height,
        };
  }, [videoStreamSize.width, videoStreamSize.height, isFullScreen]);
  const { isBigWidgetWindowTeacherStreamActive } = widgetUIStore;
  const canSetupVideo = useMemo(
    () =>
      isFullScreen ? isBigWidgetWindowTeacherStreamActive : !isBigWidgetWindowTeacherStreamActive,
    [isBigWidgetWindowTeacherStreamActive, isFullScreen],
  );

  const handleStreamDoubleClick = () => {
    streamDragable && teacherCameraStream && handleDBClickStreamWindow(teacherCameraStream);
  };

  useEffect(() => {
    teacherCameraStream &&
      setStreamBoundsByStreamUuid(teacherCameraStream.stream.streamUuid, bounds);
  }, [bounds]);
  return teacherCameraStream ? (
    <div
      ref={ref}
      style={{ marginRight: gap - 2, position: 'relative' }}
      className={isFullScreen ? 'video-player-fullscreen' : ''}>
      {visibleStream(teacherCameraStream.stream.streamUuid) ? (
        <VisibilityDOM style={videoStreamStyle} />
      ) : (
        <StreamPlayer
          stream={teacherCameraStream}
          style={videoStreamStyle}
          isFullScreen={isFullScreen}
          canSetupVideo={canSetupVideo}></StreamPlayer>
      )}
      <DragableContainer
        stream={teacherCameraStream}
        visibleTools={!visibleStream(teacherCameraStream.stream.streamUuid)}
        onDoubleClick={handleStreamDoubleClick}
      />
    </div>
  ) : null;
});

export const DragableContainer = observer(
  ({
    stream,
    onDoubleClick,
    visibleTools,
    toolbarPlacement,
  }: {
    stream: EduStreamUI;
    visibleTools: boolean;
    onDoubleClick?: (...args: any) => void;
    toolbarPlacement?: 'left' | 'bottom';
  }) => {
    const [ref, bounds] = useMeasure();
    const [translate, setTranslate] = useState([0, 0]);
    const { streamWindowUIStore } = useStore();
    const { setStreamDragInformation, streamDragable, visibleStream } = streamWindowUIStore;

    const handleDragStream = ({
      stream,
      active,
      xy,
    }: {
      stream: EduStreamUI;
      active: boolean;
      xy: [number, number];
    }) => {
      streamDragable && setStreamDragInformation({ stream, active, pos: xy });
    };

    const bind = useDrag(({ args: [stream], active, xy, movement: [mx, my] }) => {
      const delta = [xy[0] - bounds.x, xy[1] - bounds.y];

      setTranslate(delta);
      !active && setTranslate([0, 0]);
      if (Math.abs(mx) >= 3 || Math.abs(my) >= 3) {
        handleDragStream({ stream, active, xy });
        // active && setVisible(false);
      }
    });

    return (
      <DragableOverlay
        visibleTools={visibleTools}
        stream={stream}
        style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}
        toolbarPlacement={toolbarPlacement}>
        <div
          ref={ref}
          {...bind(stream)}
          onDoubleClick={visibleStream(stream.stream.streamUuid) ? () => {} : onDoubleClick}
          style={{
            touchAction: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            background: 'transparnt',
            width: '100%',
            height: '100%',
            zIndex: 3,
            transform: `translate(${translate[0]}px, ${translate[1]}px)`,
          }}></div>
      </DragableOverlay>
    );
  },
);

export const DragableOverlay = ({
  stream,
  style,
  children,
  isFullScreen,
  toolbarPlacement,
  visibleTools = true,
}: {
  stream: EduStreamUI;
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
  isFullScreen?: boolean;
  toolbarPlacement?: 'left' | 'bottom';
  visibleTools?: boolean;
}) => {
  const {
    streamUIStore: { toolbarPlacement: streamToolbarPlacement, fullScreenToolbarPlacement },
  } = useStore();
  return (
    <Popover
      align={{
        offset: isFullScreen ? [0, -58] : [0, -8],
      }}
      style={style}
      overlayClassName="video-player-tools-popover"
      content={
        visibleTools ? (
          stream.stream.isLocal ? (
            <LocalStreamPlayerTools isFullScreen={isFullScreen} />
          ) : (
            <RemoteStreamPlayerTools
              stream={stream}
              isFullScreen={isFullScreen}></RemoteStreamPlayerTools>
          )
        ) : null
      }
      placement={
        isFullScreen
          ? fullScreenToolbarPlacement
          : toolbarPlacement
          ? toolbarPlacement
          : streamToolbarPlacement
      }>
      {children}
    </Popover>
  );
};
