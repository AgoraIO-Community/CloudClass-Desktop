import { useLectureH5UIStores, useStore } from '@/infra/hooks/ui-store';
import { EduLectureH5UIStore } from '@/infra/stores/lecture-h5';
import { EduClassroomConfig, EduRegion } from 'agora-edu-core';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { Layout, SvgImg, transI18n } from '~ui-kit';
import { ComponentLevelRules } from '../../config';

export const Chat = observer(function Chat() {
  const { widgetUIStore } = useStore();
  const { ready } = widgetUIStore;

  useEffect(() => {
    if (ready) {
      const chatWidgetId =
        EduClassroomConfig.shared.rteEngineConfig.region === EduRegion.CN
          ? 'easemobIM'
          : 'io.agora.widget.chat';

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
  return (
    <div className="spinner-container">
      <div className="spinner-contianer-innner">
        <div className="spinner"></div> {transI18n('whiteboard.loading')}
      </div>
    </div>
  );
};

export const WhiteboardH5 = observer(function Board() {
  const {
    boardUIStore,
    streamUIStore: { containerH5VisibleCls },
  } = useLectureH5UIStores() as EduLectureH5UIStore;

  const {
    iconBorderZoomType,
    iconZoomVisibleCls,
    handleBoradZoomStatus,
    boardContainerHeight,
    boardContainerWidth,
  } = boardUIStore;

  return (
    <div
      className={classnames('whiteboard-h5-container w-full relative', containerH5VisibleCls)}
      style={{ height: boardContainerHeight, width: boardContainerWidth }}>
      <div
        style={{
          height: boardUIStore.boardContainerHeight,
          width: boardUIStore.boardContainerWidth,
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

export const ChatH5 = observer(function Chat() {
  const { widgetUIStore } = useStore();
  const { layoutUIStore, streamUIStore } = useLectureH5UIStores();
  const { ready } = widgetUIStore;

  useEffect(() => {
    if (ready) {
      const chatWidgetId =
        EduClassroomConfig.shared.rteEngineConfig.region === EduRegion.CN
          ? 'easemobIM'
          : 'io.agora.widget.chat';

      if (ready) {
        widgetUIStore.createWidget(chatWidgetId);
      }

      return () => {
        widgetUIStore.destroyWidget(chatWidgetId);
      };
    }
  }, [ready]);

  return (
    <Layout
      className={classnames(
        layoutUIStore.chatWidgetH5Cls,
        streamUIStore.containerH5VisibleCls,
        'h5-chat-pannel',
      )}>
      <div className="widget-slot-chat w-full h-full" />
    </Layout>
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
          content: EduClassroomConfig.shared.sessionInfo.userUuid,
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
