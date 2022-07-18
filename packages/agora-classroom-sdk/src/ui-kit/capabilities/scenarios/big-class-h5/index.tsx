import { useLectureH5UIStores } from '@/infra/hooks/ui-store';
import { EduLectureH5UIStore } from '@/infra/stores/lecture-h5';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import React, { FC, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Layout, LayoutProps } from '~components/layout';
import { ScreenShareContainer } from '~containers/screen-share';
import {
  RoomBigStudentStreamsH5Container,
  RoomBigTeacherStreamH5Container,
} from '~containers/stream/room-big-h5-player';
import { WidgetContainer } from '../../containers/widget';
import { ChatH5, WhiteboardH5 } from '../../containers/widget/slots';
import Room from '../room';

export const BigClassScenarioH5 = observer(() => {
  return (
    <Room>
      <H5LayoutContainer>
        <Helmet>
          <title>大班课</title>
          <meta
            name="viewport"
            content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
          />
          <meta content="yes" name="apple-mobile-web-app-capable" />
          <meta content="black" name="apple-mobile-web-app-status-bar-style" />
          <meta content="telephone=no" name="format-detection" />
        </Helmet>
        <LayoutOrientation className="big-class-h5">
          <H5LayoutStudentStreamBoardContainer />
          <H5TeacherStreamChatContainer />
        </LayoutOrientation>
        <WidgetContainer />
      </H5LayoutContainer>
    </Room>
  );
});

const LayoutOrientation: FC<LayoutProps> = observer(({ className, children, ...restProps }) => {
  const { layoutUIStore, shareUIStore } = useLectureH5UIStores();
  useEffect(() => {
    shareUIStore.addOrientationchange();

    shareUIStore.addWindowResizeEventListener();
    return () => {
      shareUIStore.removeOrientationchange();
      shareUIStore.removeWindowResizeEventListener();
    };
  }, []);
  return (
    <Layout
      className={classnames(className)}
      direction={layoutUIStore.flexOrientationCls}
      style={layoutUIStore.h5LayoutUIDimensions}
      {...restProps}>
      {children}
    </Layout>
  );
});

const H5LayoutStudentStreamBoardContainer = () => {
  return (
    <Layout className="flex-1" direction="col">
      <WhiteboardH5 />
      <RoomBigStudentStreamsH5Container />
      <ScreenShareContainer />
    </Layout>
  );
};

const H5TeacherStreamChatContainer = observer(() => {
  const {
    boardUIStore: { containerH5VisibleCls },
  } = useLectureH5UIStores() as EduLectureH5UIStore;
  return (
    <Layout direction="col" className={classnames(containerH5VisibleCls)}>
      <RoomBigTeacherStreamH5Container />
      <ChatH5 />
    </Layout>
  );
});

type Props = {
  children?: React.ReactNode;
};

const H5LayoutContainer: FC<Props> = observer(({ children }) => {
  const {
    layoutUIStore: { h5ContainerCls },
    shareUIStore: { classroomViewportClassName },
  } = useLectureH5UIStores() as EduLectureH5UIStore;
  return (
    <section
      className={`h5-layout-container flex h-full ${h5ContainerCls}  ${classroomViewportClassName}`}
      style={{ backgroundColor: '#f9f9fc' }}>
      {children}
    </section>
  );
});
