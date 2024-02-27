import { useStore } from '@classroom/hooks/ui-store';
import { EduClassroomConfig } from 'agora-edu-core';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import React, { MutableRefObject, useEffect, useRef, useState } from 'react';
import { ComponentLevelRules } from '../../configs/config';
import classNames from 'classnames';
import { useMobileStreamDrag } from '../stream/player';
import './index.css';

export const CountDown = observer(() => {
  const ref = useRef<HTMLDivElement>(null);
  const { pos, initData } = useMobileStreamDrag({
    isPiP: true,
    triggerRef: ref as MutableRefObject<HTMLDivElement>,
  });
  const {
    shareUIStore: { isLandscape },
  } = useStore();
  useEffect(() => {
    initData();
  }, [isLandscape]);
  return (
    <div
      ref={ref}
      className={classNames({
        'fcr-countdown-mobile-widget-landscape': isLandscape,
        'fcr-countdown-mobile-widget': !isLandscape,
      })}
      style={{
        transform: `translate3d(${pos.x}px,${pos.y}px,0)`,
      }}></div>
  );
});
export const Poll = observer(() => {
  const {
    shareUIStore: { isLandscape },
  } = useStore();
  return <div className={`fcr-poll-mobile-widget ${isLandscape ? '' : 'fcr-relative'}`}></div>;
});
export const Whiteboard = observer(function Board() {
  const whiteBoardRef = useRef<HTMLDivElement>(null);
  const {
    boardUIStore,
    streamUIStore: { containerH5VisibleCls, toggleTool, screenShareStream },
    shareUIStore: { isLandscape },
  } = useStore();

  const { boardContainerHeight, mounted } = boardUIStore;
  const height = mounted && !isLandscape ? boardContainerHeight : 0;
  const maskHeight = (mounted || screenShareStream) && !isLandscape ? boardContainerHeight : 0;
  useEffect(() => {
    whiteBoardRef.current?.style.setProperty('--board-height', maskHeight + 'px');
  }, [maskHeight]);
  return (
    <div
      ref={whiteBoardRef}
      className={classnames(
        'whiteboard-mobile-container fcr-w-full fcr-relative',
        containerH5VisibleCls,
      )}
      style={{
        height: height,
        visibility: isLandscape ? 'hidden' : 'visible',
      }}
      onClick={() => {
        toggleTool();
      }}>
      <div
        style={{
          height: isLandscape ? 0 : boardContainerHeight,
          zIndex: ComponentLevelRules.Level0,
        }}
        className="widget-slot-board"
      />
    </div>
  );
});

export const Chat = observer(function Chat() {
  const {
    widgetUIStore,
    streamUIStore: {
      teacherCameraStream,
      studentCameraStreams,
      studentVideoStreamSize,
      studentStreamsVisible,
      isPiP,
      screenShareStream,
      teacherVideoStreamSize,
    },
    boardUIStore: { boardContainerHeight, mounted },
    shareUIStore: { isLandscape, forceLandscape },
    layoutUIStore: { classRoomPlacholderHeight, classRoomPlacholderIngroupHeight },
    groupUIStore: { isInGroup },
  } = useStore();
  const { ready } = widgetUIStore;
  const [chatH5Height, setChatH5Height] = useState(0);
  const calcHeight = () => {
    const h5Height = document.body.clientHeight;
    //页面高度-课堂占位符高度-白板高度-老师视频高度-学生视频高度
    const height =
      h5Height -
      (screenShareStream ? boardContainerHeight : 0) -
      (!mounted && (!teacherCameraStream || teacherCameraStream.isCameraMuted) && !screenShareStream
        ? isInGroup
          ? classRoomPlacholderIngroupHeight
          : classRoomPlacholderHeight
        : 0) -
      (mounted ? boardContainerHeight : 0) -
      (teacherCameraStream && !teacherCameraStream.isCameraMuted && !isPiP
        ? teacherVideoStreamSize.height || 0
        : 0) -
      (studentCameraStreams.length > 0 && studentStreamsVisible
        ? studentVideoStreamSize.height
        : 0);
    setChatH5Height(height);
    console.log(height, boardContainerHeight, 'heightheight');
  };
  useEffect(() => {
    calcHeight();
    window.addEventListener('resize', calcHeight);
    () => window.removeEventListener('resize', calcHeight);
  }, [isLandscape, forceLandscape, mounted, teacherCameraStream, boardContainerHeight, isPiP, studentCameraStreams.length, studentVideoStreamSize.height, teacherCameraStream?.isCameraMuted, studentStreamsVisible, screenShareStream]);

  useEffect(() => {
    if (ready) {
      const chatWidgetId = 'easemobIM';

      if (ready) {
        widgetUIStore.createWidget(chatWidgetId);
      }

      return () => {
        widgetUIStore.destroyWidget(chatWidgetId);
      };
    }
  }, [ready]);

  return (
    <div
      className="widget-slot-chat-mobile"
      style={{
        height: chatH5Height < 190 ? 190 : chatH5Height,
        flexShrink: 0,
        background: '#27292f',
      }}
    />
  );
});

export const Watermark = observer(function Chat() {
  const { widgetUIStore, classroomStore } = useStore();
  const { ready } = widgetUIStore;

  const watermark =
    classroomStore.connectionStore.mainRoomScene &&
    classroomStore.roomStore?.mainRoomDataStore.flexProps?.watermark;

  useEffect(() => {
    if (ready && watermark) {
      widgetUIStore.createWidget('watermark', {
        userProperties: {},
        properties: {
          content: EduClassroomConfig.shared.sessionInfo.userName,
          visible: true,
        },
        trackProperties: {},
      });
      return () => {
        widgetUIStore.destroyWidget('watermark');
      };
    }
  }, [ready, watermark]);

  return (
    <div className="widget-slot-watermark fcr-h-full fcr-w-full fcr-absolute fcr-t-0 fcr-left-0 fcr-pointer-events-none" />
  );
});
