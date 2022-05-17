import { useRef, useState } from 'react';
import { StreamWindow } from '@/infra/stores/common/stream-window/type';
import { observer } from 'mobx-react';
import { Rnd } from 'react-rnd';
import { animated, useTransition } from 'react-spring';
import { useStore } from '~hooks/use-edu-stores';
import './index.css';
import { StreamPlayer } from '../stream';
import { CSSProperties } from 'styled-components';
import { EduStreamUI, StreamBounds } from '@/infra/stores/common/stream/struct';
import { DragableOverlay } from '../stream/room-mid-player';

const StreamWindowsContainer = observer(() => {
  const { streamWindowUIStore, streamUIStore } = useStore();
  const { streamsBounds } = streamUIStore;
  const { streamWindows, needDragable } = streamWindowUIStore;

  return (
    <div className="stream-window-container" id="stream-window-container">
      <TransitionStreamWindow streamWindows={streamWindows.slice()} streamsBounds={streamsBounds} />
      {needDragable
        ? streamWindows.map(([streamUuid, streamWindow]) => (
            <DragableStreamWindow key={streamUuid} info={streamWindow} streamUuid={streamUuid} />
          ))
        : null}
    </div>
  );
});

export const TransitionStreamWindow = observer(
  ({
    streamWindows,
    streamsBounds,
  }: {
    streamWindows: [string, StreamWindow][];
    streamsBounds: Map<string, StreamBounds>;
  }) => {
    const {
      streamWindowUIStore: {
        getStream,
        minRect,
        setTransitionStreams,
        removeTransitionStreams,
        stageVisible,
        draggingStreamUuid,
      },
    } = useStore();

    const calcInitPosition = (streamUuid: string) => {
      const targetStreamBounds = streamsBounds.get(streamUuid);
      const parent = document.querySelector('#stream-window-container');
      const parentBounds = parent?.getBoundingClientRect();
      if (stageVisible && targetStreamBounds && parentBounds) {
        const { left: targetLeft, top: targetTop, width, height } = targetStreamBounds;
        const { left: parentLeft, top: parentTop } = parentBounds;

        const left = targetLeft - parentLeft,
          top = targetTop - parentTop;
        return { x: left, y: top, width, height };
      }
      return { opacity: 0 };
    };

    const transitions = useTransition(streamWindows, {
      key: (item: [string, StreamWindow]) => item[0],
      from: (item: [string, StreamWindow]) => {
        return { opacity: 0 };
      },
      enter: ([streamUuid, streamWindow]) => {
        setTransitionStreams(streamUuid);
        return {
          x: streamWindow.x,
          y: streamWindow.y,
          width: streamWindow.width,
          height: streamWindow.height,
          opacity: 1,
          id: streamUuid,
        };
      }, // 进入位置
      leave: ([streamUuid, _]) => {
        return calcInitPosition(streamUuid);
      }, // 离开的时候
      update: ([streamUuid, streamWindow]) => {
        return {
          x: streamWindow.x,
          y: streamWindow.y,
          width: streamWindow.width,
          height: streamWindow.height,
          id: streamUuid,
        };
      }, // 更新数据
      immediate: () => !!draggingStreamUuid,
      onDestroyed: (item: [string, StreamWindow]) => {
        removeTransitionStreams(item[0]);
      },
    });

    return transitions((props, item) => (
      <animated.div
        style={{
          ...props,
          position: 'absolute',
          top: '0',
          left: '0',
          minWidth: minRect.minWidth,
          minHeight: minRect.minHeight,
        }}
        key={item[0]}>
        {getStream(item[0]) ? (
          <StreamPlayer
            key={`stream-window-${item[0]}`}
            isFullScreen={true}
            stream={getStream(item[0]) as EduStreamUI}
            style={{ width: '100%', height: '100%' }}></StreamPlayer>
        ) : null}
      </animated.div>
    ));
  },
);

const DragableStreamWindow = observer(
  ({
    info,
    streamUuid,
    style,
  }: {
    info: StreamWindow;
    streamUuid: string;
    style?: CSSProperties;
  }) => {
    const { streamWindowUIStore } = useStore();
    const rndRef = useRef(null);
    const {
      handleStreamWindowInfo,
      handleDrag,
      streamWindowStreams,
      handleStreamWindowClick,
      sendWigetDataToServer,
      updateDraggingStreamUuid,
      resetDraggingStreamUuid,
      streamWindowLocked,
      minRect,
    } = streamWindowUIStore;
    const [visible, setVisible] = useState<boolean>(false);
    return (
      <Rnd
        ref={rndRef}
        key={streamUuid}
        className="stream-window"
        style={style}
        minWidth={minRect.minWidth}
        minHeight={minRect.minHeight}
        size={{
          width: info.width,
          height: info.height,
        }}
        bounds=".stream-window-container"
        position={{
          x: info.x,
          y: info.y,
        }}
        onDrag={(e, d) => {
          visible && setVisible(false);
          handleDrag(e, d, streamUuid, info.x);
        }}
        // onDragStart={()=> { setVisible(false)}}
        onDragStop={() => {
          // sent to server
          resetDraggingStreamUuid();
          sendWigetDataToServer(streamUuid);
        }}
        onResize={(e, direction, ref, delta, position) => {
          visible && setVisible(false);
          updateDraggingStreamUuid(streamUuid);
          handleStreamWindowInfo(
            streamWindowStreams.get(streamUuid),
            {
              width: ref.offsetWidth,
              height: ref.offsetHeight,
              ...position,
            },
            false,
          );
        }}
        onResizeStop={() => {
          resetDraggingStreamUuid();
          sendWigetDataToServer(streamUuid);
        }}
        onMouseEnter={() => {
          setVisible(true);
        }}
        onMouseLeave={() => {
          setVisible(false);
        }}
        onClick={handleStreamWindowClick(streamWindowStreams.get(streamUuid))}
        disableDragging={
          streamWindowStreams.get(streamUuid)
            ? streamWindowLocked(streamWindowStreams.get(streamUuid))
            : false
        }
        enableResizing={
          streamWindowStreams.get(streamUuid)
            ? !streamWindowLocked(streamWindowStreams.get(streamUuid))
            : true
        }>
        {streamWindowStreams.get(streamUuid) ? (
          <DragableOverlay
            stream={streamWindowStreams.get(streamUuid)}
            style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}
            isFullScreen={true}
            visibleTools={visible}>
            <div
              style={{
                width: info.width,
                height: info.height,
                minWidth: minRect.minWidth,
                minHeight: minRect.minHeight,
                background: 'transparent',
              }}></div>
          </DragableOverlay>
        ) : null}
      </Rnd>
    );
  },
);

export default StreamWindowsContainer;
