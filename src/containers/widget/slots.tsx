import { useStore } from '@classroom/hooks/ui-store';
import { EduClassroomConfig } from 'agora-edu-core';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import React, { MutableRefObject, useEffect, useRef, useState, useLayoutEffect } from 'react';
import { SvgIconEnum, Button, SvgImg } from '@classroom/ui-kit';
import { ComponentLevelRules } from '../../configs/config';
import classNames from 'classnames';
import { useMobileStreamDrag } from '../stream/player';
import { FixedBoardTips } from './fixed-board-tips';
import './index.css';
import { TeacherStream } from '../teacher-stream';
import { useI18n } from 'agora-common-libs';

export const CountDown = observer(() => {
  const ref = useRef<HTMLDivElement>(null);
  const { pos, initData } = useMobileStreamDrag({
    isPiP: true,
    triggerRef: ref as MutableRefObject<HTMLDivElement>,
    type: "countDown"
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
      className={classNames('fcr-countdown-mobile-widget-slot', {
        'fcr-countdown-mobile-widget-landscape': isLandscape,
        'fcr-countdown-mobile-widget': !isLandscape,
      })}
      style={{
        transform: `translate3d(${pos.x}px,${pos.y}px,0)`,
      }}></div>
  );
});
export const Poll = observer(() => {
  return <div className={`fcr-poll-mobile-widget`}></div>;
});
export const Whiteboard = observer(function Board() {
  const whiteBoardRef = useRef<HTMLDivElement>(null);
  const {
    getters: { isBoardWidgetActive },
    layoutUIStore: { toggleLandscapeToolBarVisible },
    boardUIStore,
    streamUIStore: { containerH5VisibleCls, toggleTool, screenShareStream, studentStreamsVisible },
    shareUIStore: { isLandscape, updateWhiteBoardViewportSize, landscapeBoardSize },
  } = useStore();

  const { boardContainerHeight, mounted, boardContainerWidth, isGrantedBoard } = boardUIStore;
  const width = studentStreamsVisible
    ? isLandscape
      ? (boardContainerWidth - 143 - 75 - 14 - 14 -17)
      : boardContainerWidth
    : boardContainerWidth;
  useEffect(() => {
    updateWhiteBoardViewportSize(width, boardContainerHeight);
  }, [studentStreamsVisible, width]);
  const boardHeight = isBoardWidgetActive ? (isLandscape ? '100%' : 511) : 0;
  const right = studentStreamsVisible ? (isLandscape ? '161px' : '') : 0;
  const whiteboard = document.querySelector('.netless-whiteboard-wrapper') as HTMLElement;
  // document.querySelector('.netless-whiteboard-wrapper')?.setAttribute('backgroundColor', 'black');
  const maskHeight = (mounted || screenShareStream) && !isLandscape ? boardContainerHeight : 0;
  useEffect(() => {
    whiteBoardRef.current?.style.setProperty('--board-height', maskHeight + 'px');
  }, [maskHeight]);

  useEffect(() => {
    if (!whiteboard) return;
    const color = isLandscape ? 'var(--ui-02, #FEFEFE)' : '#151515';
    whiteboard.style.backgroundColor = color;
  }, [isLandscape, whiteboard])



  return (
    <div
      ref={whiteBoardRef}
      className={classnames('whiteboard-mobile-container fcr-relative', 'fcr-w-full', {
        'whiteboard-mobile-container-landscape': isLandscape,
        containerH5VisibleCls,
      })}
      style={{
        height: boardHeight,
        // width: width + 'px',
        width: '100%',
      }}
      onClick={() => {
        toggleTool();
      }}>
      {!isLandscape && isGrantedBoard && <FixedBoardTips />}
      <div
        onClick={toggleLandscapeToolBarVisible}
        style={{
          height: isLandscape ? '100%' : boardContainerHeight,
          zIndex: ComponentLevelRules.Level0,
          width: landscapeBoardSize.width,
          // backgroundColor: isLandscape ? 'rgba(35, 37, 41, 1)' : '',
        }}
        className="widget-slot-board"
      />
    </div>
  );
});
export const MadiaPlayer = observer(function Media() {
  const mediaPlayerRef = useRef<HTMLDivElement>(null);
  const {
    getters: { isMediaPlayerWidgetActive },
    layoutUIStore: { toggleLandscapeToolBarVisible },
    boardUIStore,
    widgetUIStore: { z0Widgets, currentWidget },
    streamUIStore: { containerH5VisibleCls, toggleTool, screenShareStream, studentStreamsVisible },
    shareUIStore: { isLandscape, updateWhiteBoardViewportSize, landscapeBoardSize },
  } = useStore();

  const { boardContainerHeight, mounted, boardContainerWidth } = boardUIStore;
  const width = studentStreamsVisible
    ? isLandscape
      ? (boardContainerWidth - 143 - 75 - 14 - 14 -17)
      : boardContainerWidth
    : boardContainerWidth;
  useEffect(() => {
    updateWhiteBoardViewportSize(width, boardContainerHeight);
  }, [studentStreamsVisible, width]);
  const boardHeight = isMediaPlayerWidgetActive ? (isLandscape ? '100%' : boardContainerHeight) : 0;
  const right = studentStreamsVisible ? (isLandscape ? '161px' : '') : 0;
  const maskHeight = (mounted || screenShareStream) && !isLandscape ? boardContainerHeight : 0;
  useEffect(() => {
    mediaPlayerRef.current?.style.setProperty('--board-height', maskHeight + 'px');
  }, [maskHeight]);
  const mediaPlayerWidget = z0Widgets.filter(
    (widget: { widgetName: string }) => widget.widgetName === 'mediaPlayer',
  );
  return (
    <div
      ref={mediaPlayerRef}
      className={classnames('whiteboard-mobile-container fcr-relative', 'fcr-w-full', {
        'whiteboard-mobile-container-landscape': isLandscape,
        containerH5VisibleCls,
      })}
      style={{
        height: boardHeight,
        width: width + 'px',
      }}
      onClick={() => {
        toggleTool();
      }}>
      {mediaPlayerWidget.length > 0 &&
        mediaPlayerWidget.map((item: { widgetId: React.Key | null | undefined }) => {
          return (
            <div
              key={item.widgetId}
              onClick={toggleLandscapeToolBarVisible}
              style={{
                display: item.widgetId === currentWidget?.widgetId ? 'block' : 'none',
                height: isLandscape ? landscapeBoardSize.height : boardContainerHeight,
                zIndex: ComponentLevelRules.Level1,
                width: landscapeBoardSize.width,
                // backgroundColor: isLandscape ? 'rgba(35, 37, 41, 1)' : '',
              }}
              className={`widget-slot-media-player widget-slot-media-player-${item.widgetId}`}
            />
          );
        })}
    </div>
  );
});
export const WebView = observer(function View() {
  const webViewRef = useRef<HTMLDivElement>(null);
  const transI18n = useI18n();
  const {
    getters: { isWebViewWidgetActive },
    layoutUIStore: { forceLandscapeToolBarTrue },
    boardUIStore,
    widgetUIStore: { z0Widgets, currentWidget },
    streamUIStore: { containerH5VisibleCls, toggleTool, screenShareStream, studentStreamsVisible },
    shareUIStore: { isLandscape, updateWhiteBoardViewportSize, landscapeBoardSize, addToast },
  } = useStore();

  const { boardContainerHeight, mounted, boardContainerWidth } = boardUIStore;
  const width = studentStreamsVisible
    ? isLandscape
      ? (boardContainerWidth - 143 - 75 - 14 - 14 -17)
      : boardContainerWidth
    : boardContainerWidth;
  useEffect(() => {
    updateWhiteBoardViewportSize(width, boardContainerHeight);
  }, [studentStreamsVisible, width]);
  const boardHeight = isWebViewWidgetActive ? (isLandscape ? '100%' : boardContainerHeight) : 0;
  const maskHeight = (mounted || screenShareStream) && !isLandscape ? boardContainerHeight : 0;
  const webViewWidget = z0Widgets.filter(
    (widget: { widgetName: string }) => widget.widgetName === 'webView',
  );
  useEffect(() => {
    webViewRef.current?.style.setProperty('--board-height', maskHeight + 'px');
  }, [maskHeight]);
  useEffect(() => {
    if (isLandscape && currentWidget?.widgetName === 'webView') {
      addToast(transI18n('toast.webview_tip'), 'info');
      forceLandscapeToolBarTrue();
    }
  }, [isLandscape, currentWidget?.widgetName, forceLandscapeToolBarTrue]);
  return (
    <div
      ref={webViewRef}
      className={classnames('whiteboard-mobile-container webview fcr-relative', 'fcr-w-full', {
        'whiteboard-mobile-container-landscape': isLandscape,
        containerH5VisibleCls,
      })}
      style={{
        height: boardHeight,
        width: width + 'px',
      }}
      onClick={() => {
        toggleTool();
      }}>
      {webViewWidget.length > 0 &&
        webViewWidget.map((item: { widgetId: React.Key | null | undefined }) => {
          return (
            <div
              key={item.widgetId}
              style={{
                display: item.widgetId === currentWidget?.widgetId ? 'block' : 'none',
                height: isLandscape ? landscapeBoardSize.height : boardContainerHeight,
                zIndex: ComponentLevelRules.Level0,
                width: landscapeBoardSize.width,
                // backgroundColor: isLandscape ? 'rgba(35, 37, 41, 1)' : '',
              }}
              className={`widget-slot-web-view widget-slot-web-view-${item.widgetId}`}
            />
          );
        })}
    </div>
  );
});
export const Chat = observer(function Chat() {
  const {
    widgetUIStore,
    widgetUIStore: { z0Widgets },
    streamUIStore: {
      teacherCameraStream,
      studentCameraStreams,
      studentVideoStreamSize,
      studentStreamsVisible,
      isPiP,
      screenShareStream,
      teacherVideoStreamSize,
    },
    boardUIStore: { boardContainerHeight },
    shareUIStore: { isLandscape, forceLandscape },
    layoutUIStore: { classRoomPlacholderHeight, classRoomPlacholderIngroupHeight },
    groupUIStore: { isInGroup },
  } = useStore();
  const { ready } = widgetUIStore;
  const [chatH5Height, setChatH5Height] = useState(0);

  const calcHeight = () => {
    const widgets = z0Widgets.filter((v: { widgetName: string }) => v.widgetName !== 'easemobIM');
    const h5Height = document.body.clientHeight;
    //页面高度-课堂占位符高度-白板高度-老师视频高度-学生视频高度
    const height =
      h5Height -
      (screenShareStream ? boardContainerHeight : 0) -
      (!widgets.length &&
        (!teacherCameraStream || teacherCameraStream.isCameraMuted) &&
        !screenShareStream
        ? isInGroup
          ? classRoomPlacholderIngroupHeight
          : 190
        : 0) -
      (widgets.length > 0 ? boardContainerHeight : 0) -
      (!isLandscape && teacherCameraStream && !teacherCameraStream.isCameraMuted && !isPiP
        ? (teacherVideoStreamSize.height as number) || 0
        : 0) -
      (studentCameraStreams.length > 0 && studentStreamsVisible
        ? studentVideoStreamSize.height
        : 0);
    setChatH5Height(height);
  };
  useEffect(calcHeight, [
    isLandscape,
    forceLandscape,
    teacherCameraStream,
    boardContainerHeight,
    isPiP,
    studentCameraStreams.length,
    studentVideoStreamSize.height,
    teacherCameraStream?.isCameraMuted,
    screenShareStream,
    z0Widgets,
    studentStreamsVisible,
  ]);

  useEffect(() => {
    window.addEventListener('resize', calcHeight);

    if (ready) {
      const chatWidgetId = 'easemobIM';

      if (ready) {
        widgetUIStore.createWidget(chatWidgetId);
      }

      return () => {
        widgetUIStore.destroyWidget(chatWidgetId);
        window.removeEventListener('resize', calcHeight);
      };
    }
  }, [ready]);
  useEffect(() => {
    if (isLandscape) {
      document.body.style.overflowY = 'hidden';
      return;
    }
    if (chatH5Height < 190) {
      document.body.style.overflowY = 'auto';
    } else {
      document.body.style.overflowY = 'hidden';
    }
    return () => {
      document.body.style.overflowY = 'auto';
    };
  }, [chatH5Height, isLandscape]);
  return (
    <div
      className={classNames('widget-slot-chat-mobile', isLandscape && 'active')}
      style={{
        // height: chatH5Height < 190 ? 190 : chatH5Height,
        // flex: 1,
        position: isLandscape ? 'absolute' : 'inherit',
        bottom: isLandscape ? 56 : undefined,
        width: isLandscape ? '270px' : 'auto',
        flexShrink: 0,
        background: isLandscape ? 'transparent' : '#27292f',
        overflow: 'hidden',
        zIndex: ComponentLevelRules.Level1,
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
