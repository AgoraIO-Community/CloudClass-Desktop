import { useLectureH5UIStores, useStore } from '@classroom/infra/hooks/ui-store';
import { EduLectureH5UIStore } from '@classroom/infra/stores/lecture-mobile';
import { EduClassroomConfig, EduRegion } from 'agora-edu-core';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { SvgImg } from '@classroom/ui-kit';
import { useI18n } from 'agora-common-libs';
import { ComponentLevelRules } from '../../config';

export const Chat = observer(function Chat() {
  const { widgetUIStore } = useStore();
  const { ready } = widgetUIStore;

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

  return <div className="widget-slot-chat h-full" />;
});

export const Whiteboard = observer(function Board() {
  const { boardUIStore } = useStore();

  const { isCopying } = boardUIStore;

  return (
    <React.Fragment>
      <div
        style={{ height: boardUIStore.boardAreaHeight, zIndex: ComponentLevelRules.WhiteBoard }}
        className="widget-slot-board"
      />
      {isCopying && <Spinner />}
    </React.Fragment>
  );
});

const Spinner = () => {
  const transI18n = useI18n();

  return (
    <div className="spinner-container">
      <div className="spinner-contianer-innner">
        <div className="spinner"></div> {transI18n('whiteboard.loading')}
      </div>
    </div>
  );
};

export const CountDownMobile = observer(() => {
  return <div className="fcr-countdown-h5-widget"></div>;
});
export const PollMobile = observer(() => {
  const {
    shareUIStore: { isLandscape },
  } = useStore();
  return <div className={`fcr-poll-h5-widget ${isLandscape ? '' : 'relative'}`}></div>;
});
export const WhiteboardMobile = observer(function Board() {
  const {
    boardUIStore,
    streamUIStore: { containerH5VisibleCls },
    shareUIStore: { isLandscape },
  } = useLectureH5UIStores() as EduLectureH5UIStore;

  const {
    iconBorderZoomType,
    iconZoomVisibleCls,
    handleBoradZoomStatus,
    boardContainerHeight,
    boardContainerWidth,
    mounted,
  } = boardUIStore;
  const height = mounted ? boardContainerHeight : 0;
  return (
    <div
      className={classnames('whiteboard-h5-container w-full relative', containerH5VisibleCls)}
      style={{
        height: height,
        width: boardContainerWidth,
        visibility: isLandscape ? 'hidden' : 'visible',
        overflow: 'hidden',
      }}>
      <div
        style={{
          height: height,
          width: boardContainerWidth,
          zIndex: ComponentLevelRules.WhiteBoard,
        }}
        className="widget-slot-board"
      />
      <SvgImg
        type={iconBorderZoomType}
        className={classnames('whiteboard-zoom-status', iconZoomVisibleCls)}
        onClick={handleBoradZoomStatus}
      />
    </div>
  );
});

export const ChatMobile = observer(function Chat() {
  const {
    widgetUIStore,
    streamUIStore: { teacherCameraStream, studentCameraStreams, studentVideoStreamSize, isPiP },
    boardUIStore: { boardContainerHeight, mounted },
    shareUIStore: { isLandscape, forceLandscape },
  } = useLectureH5UIStores();
  const { ready } = widgetUIStore;
  const [chatH5Height, setChatH5Height] = useState(0);
  const calcHeight = () => {
    const h5Height = document.body.clientHeight;

    const height =
      h5Height -
      (!mounted && !teacherCameraStream ? boardContainerHeight : 0) -
      (mounted ? boardContainerHeight : 0) -
      (teacherCameraStream && !teacherCameraStream.isCameraMuted && !isPiP
        ? boardContainerHeight
        : 0) -
      (studentCameraStreams.length > 0 ? studentVideoStreamSize.height : 0);
    setChatH5Height(height);
  };
  useEffect(calcHeight, [
    isLandscape,
    forceLandscape,
    mounted,
    teacherCameraStream,
    boardContainerHeight,
    isPiP,
    studentCameraStreams.length,
    studentVideoStreamSize.height,
    teacherCameraStream?.isCameraMuted,
  ]);
  useEffect(() => {
    window.addEventListener('resize', calcHeight);
    () => window.removeEventListener('resize', calcHeight);
  }, []);

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
      className="widget-slot-chat-h5"
      style={{ height: chatH5Height, background: isLandscape ? '#27292f' : 'transparent' }}
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
    <div className="widget-slot-watermark h-full w-full absolute top-0 left-0 pointer-events-none" />
  );
});
