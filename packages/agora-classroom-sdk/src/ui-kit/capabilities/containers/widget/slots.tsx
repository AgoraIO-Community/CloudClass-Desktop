import { useLectureH5UIStores, useStore } from '@/infra/hooks/ui-store';
import { EduLectureH5UIStore } from '@/infra/stores/lecture-h5';
import { EduStudyRoomUIStore } from '@/infra/stores/study-room';
import { EduClassroomConfig, EduRegion } from 'agora-edu-core';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import React, { useEffect, useMemo } from 'react';
import { Rnd } from 'react-rnd';
import { Layout, SvgImg, transI18n } from '~components';
import { ComponentLevelRules } from '../../config';

export const Chat = observer(function () {
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

export const StudyChatWindow = observer(function () {
  const { layoutUIStore } = useStore() as EduStudyRoomUIStore;
  const y = (window.innerHeight - 80 - 530) / 2;
  const x = (window.innerWidth - 300) / 2 / 2;

  const style = useMemo(() => {
    return layoutUIStore.chatVisibility ? {
      cursor: 'auto',

    } : { cursor: 'auto', display: 'none' };
  }, [layoutUIStore.chatVisibility]);

  return (
    <Rnd default={{ x, y, width: 'auto', height: 'auto' }} enableResizing={false} style={style} className="z-50">
      <Chat />
    </Rnd>
  )
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
  const { widgetUIStore } = useStore();
  const { ready } = widgetUIStore;

  useEffect(() => {
    if (ready) {
      widgetUIStore.createWidget('watermark');
      return () => {
        widgetUIStore.destroyWidget('watermark');
      };
    }
  }, [ready]);

  return (
    <div className="widget-slot-watermark h-full w-full absolute top-0 left-0 pointer-events-none z-10" />
  );
});
