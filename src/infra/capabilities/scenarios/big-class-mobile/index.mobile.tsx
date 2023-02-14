import { useLectureH5UIStores, useStore } from '@classroom/infra/hooks/ui-store';
import { EduLectureH5UIStore } from '@classroom/infra/stores/lecture-h5';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import React, { FC, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Layout, LayoutProps } from '@classroom/ui-kit/components/layout';
import {
  H5RoomPlaceholder,
  RoomBigStudentStreamsH5Container,
  RoomBigTeacherStreamH5Container,
} from '@classroom/infra/capabilities/containers/stream/room-big-class-player.mobile';
import { WidgetContainerMobile } from '../../containers/widget/index.mobile';
import {
  ChatMobile,
  CountDownMobile,
  PollMobile,
  Watermark,
  WhiteboardMobile,
} from '../../containers/widget/slots';
import Room from '../room';
import './index.mobile.css';
import { ToastContainerMobile } from '../../containers/toast/index.mobile';
import { ClassState, EduClassroomConfig } from 'agora-edu-core';
import { ComponentLevelRulesMobile } from '../../config';
import { ScreenShareContainerMobile } from '../../containers/screen-share/index.mobile';
export const BigClassScenarioMobile = observer(() => {
  const {
    classroomStore: {
      roomStore: {
        classroomSchedule: { state },
      },
    },
    shareUIStore: { isLandscape, forceLandscape },
  } = useStore();
  return (
    <Room>
      <H5LayoutContainer>
        <Helmet>
          <title>{EduClassroomConfig.shared.sessionInfo.roomName}</title>
          <meta
            name="viewport"
            content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
          />
          <meta content="yes" name="apple-mobile-web-app-capable" />
          <meta content="black" name="apple-mobile-web-app-status-bar-style" />
          <meta content="telephone=no" name="format-detection" />
        </Helmet>
        <LayoutOrientation
          style={
            isLandscape
              ? forceLandscape
                ? { width: window.innerHeight }
                : { height: window.innerHeight }
              : {}
          }
          className={
            isLandscape
              ? forceLandscape
                ? 'fcr-h5-landscape-container-rotate'
                : 'fcr-h5-landscape-container'
              : ''
          }
          direction="col">
          {state === ClassState.close ? (
            <AfterClassMobileDialog></AfterClassMobileDialog>
          ) : (
            <>
              <WhiteboardMobile />
              <ToastContainerMobile></ToastContainerMobile>
              {!isLandscape && <H5RoomPlaceholder></H5RoomPlaceholder>}
              {!isLandscape && <ScreenShareContainerMobile></ScreenShareContainerMobile>}
              <H5TeacherStreamChatContainer />
              {!isLandscape && (
                <RoomBigStudentStreamsH5Container></RoomBigStudentStreamsH5Container>
              )}
              <CountDownMobile></CountDownMobile>
              <ChatMobile />
              <PollMobile></PollMobile>
            </>
          )}
        </LayoutOrientation>
        <WidgetContainerMobile></WidgetContainerMobile>
        <Watermark />
      </H5LayoutContainer>
    </Room>
  );
});

const LayoutOrientation: FC<LayoutProps> = observer(({ className, children, ...restProps }) => {
  const { shareUIStore } = useLectureH5UIStores();
  useEffect(() => {
    shareUIStore.addOrientationchange();

    shareUIStore.addWindowResizeEventListener();
    return () => {
      shareUIStore.removeOrientationchange();
      shareUIStore.removeWindowResizeEventListener();
    };
  }, []);
  return (
    <Layout className={classnames(className)} {...restProps}>
      {children}
    </Layout>
  );
});

const H5TeacherStreamChatContainer = observer(() => {
  const {
    streamUIStore: { teacherCameraStream },
    boardUIStore: { containerH5VisibleCls },
  } = useLectureH5UIStores() as EduLectureH5UIStore;
  return (
    <Layout direction="col" className={classnames(containerH5VisibleCls)}>
      {teacherCameraStream && !teacherCameraStream.isCameraMuted ? (
        <RoomBigTeacherStreamH5Container />
      ) : null}
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
const AfterClassMobileDialog = observer(() => {
  const {
    notificationUIStore: { setLeaveRoom },
  } = useStore();
  return (
    <div
      className="fcr-after-class-mobile-dialog-mask fixed w-full h-full l-0 t-0"
      style={{ zIndex: ComponentLevelRulesMobile.Level3 }}>
      <div className="fcr-after-class-mobile-dialog">
        <div className="fcr-after-class-mobile-dialog-img"></div>
        <h1>本节课程已结束！</h1>
        <h2>你可以去预约其它的课程啦</h2>
        <div className="fcr-after-class-mobile-dialog-btn" onClick={() => setLeaveRoom(true)}>
          我知道了
        </div>
      </div>
    </div>
  );
});
