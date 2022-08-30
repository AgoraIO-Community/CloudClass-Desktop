import { CSSProperties, FC, useEffect, useState } from 'react';
import { EduStreamUI, StreamBounds } from '@/infra/stores/common/stream/struct';
import { observer } from 'mobx-react';
import { Rnd } from 'react-rnd';
import { animated, useTransition } from 'react-spring';
import { useStore } from '@/infra/hooks/ui-store';
import './index.css';
import { StreamPlayer } from '../stream';
import { StreamWindow } from '@/infra/stores/common/stream-window/type';
import useMeasure from 'react-use-measure';
import { StreamPlayerToolbar } from '../stream/stream-tool';

const WindowContainer: FC = observer(({ children }) => {
  const { streamWindowUIStore, boardUIStore } = useStore();
  const [measureRef, bounds] = useMeasure();

  useEffect(() => {
    streamWindowUIStore.setMiddleContainerBounds(bounds);
  }, [bounds]);

  return (
    <div
      id="stream-window-container"
      className="w-full absolute flex-shrink-0 bottom-0"
      style={{ height: boardUIStore.boardAreaHeight, pointerEvents: 'none' }}
      ref={measureRef}>
      {children}
    </div>
  );
});

export const StreamWindowsContainer = observer(() => {
  const { streamWindowUIStore, streamUIStore } = useStore();
  const { streamsBounds } = streamUIStore;
  const { streamWindows, needDraggable: needDragable } = streamWindowUIStore;

  return (
    <WindowContainer>
      {needDragable
        ? streamWindows.map(([streamUuid, streamWindow]) => (
          <DragableStreamWindow key={streamUuid} info={streamWindow} streamUuid={streamUuid} />
        ))
        : null}
      <TransitionStreamWindow streamWindows={streamWindows} streamsBounds={streamsBounds} />
    </WindowContainer>
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
        minRect,
        setTransitionStreams,
        removeTransitionStreams,
        stageVisible,
        draggingStreamUuid,
      },
      streamUIStore: { allUIStreams }
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
      from: () => ({ opacity: 0 }),
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

    return transitions((props, item) => {
      const itemKey = item[0];
      const stream = allUIStreams.get(itemKey);
      return (
        <animated.div
          style={{
            ...props,
            position: 'absolute',
            top: '0',
            left: '0',
            minWidth: minRect.minWidth,
            minHeight: minRect.minHeight,
          }}
          key={itemKey}>
          {stream ? (
            <StreamPlayer
              key={`stream-window-${itemKey}`}
              renderAt="Window"
              stream={stream}
              style={{ width: '100%', height: '100%' }}
              toolbarDisabled
            />
          ) : null}
        </animated.div>
      );
    }
    );
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
    const { streamWindowUIStore, streamUIStore } = useStore();
    const { allUIStreams, fullScreenToolbarOffset, fullScreenToolbarPlacement } = streamUIStore;

    const {
      handleStreamWindowInfo,
      handleDrag,
      handleStreamWindowClick,
      sendWidgetDataToServer: sendWigetDataToServer,
      updateDraggingStreamUuid,
      resetDraggingStreamUuid,
      streamWindowLocked,
      minRect,
    } = streamWindowUIStore;
    const [toolbarVisible, setToolbarVisible] = useState(false);

    const uiStream = allUIStreams.get(streamUuid) as EduStreamUI;
    const stream = uiStream?.stream;
    return stream ? (
      <Rnd
        key={streamUuid}
        className="stream-window"
        style={style}
        minWidth={minRect.minWidth}
        minHeight={minRect.minHeight}
        size={{
          width: info.width,
          height: info.height,
        }}
        bounds="#stream-window-container"
        position={{
          x: info.x,
          y: info.y,
        }}
        onDrag={(e, d) => {
          setToolbarVisible(false);
          handleDrag(e, d, streamUuid, info.x);
        }}
        // onDragStart={()=> { setVisible(false)}}
        onDragStop={() => {
          // sent to server
          resetDraggingStreamUuid();
          sendWigetDataToServer(streamUuid);
        }}
        onResize={(e, direction, ref, delta, position) => {
          setToolbarVisible(false);
          updateDraggingStreamUuid(streamUuid);
          handleStreamWindowInfo(
            stream,
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
          setToolbarVisible(true);
        }}
        onMouseLeave={() => {
          setToolbarVisible(false);
        }}
        onClick={handleStreamWindowClick(stream)}
        disableDragging={
          stream
            ? streamWindowLocked(stream)
            : false
        }
        enableResizing={
          stream
            ? !streamWindowLocked(stream)
            : true
        }>
        <div
          style={{
            width: info.width,
            height: info.height,
            minWidth: minRect.minWidth,
            minHeight: minRect.minHeight,
            background: 'transparent',
          }} />
        <StreamPlayerToolbar visible={toolbarVisible} stream={uiStream} placement={fullScreenToolbarPlacement} offset={fullScreenToolbarOffset} />
      </Rnd>
    ) : null;
  },
);
