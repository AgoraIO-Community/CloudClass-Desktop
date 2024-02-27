import { useStore } from '@classroom/hooks/ui-store';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import React, { FC, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Layout, LayoutProps } from '@classroom/ui-kit/components/layout';
import {
  RoomPlaceholder,
  StudentStreamsContainer,
  TeacherStreamContainer,
} from '@classroom/containers/stream/player';
import { WidgetContainer } from '../../containers/widget';
import { Chat, CountDown, Poll, Watermark, Whiteboard } from '../../containers/widget/slots';
import { transI18n } from 'agora-common-libs';

import './index.css';
import { ToastContainer } from '../../containers/toast';
import { ClassroomState, ClassState, EduClassroomConfig } from 'agora-edu-core';
import { ComponentLevelRules } from '../../configs/config';
import { ScreenShareContainer } from '../../containers/screen-share';
import { useI18n } from 'agora-common-libs';
import { TeacherCameraPlaceHolder } from '../../containers/stream';
import { Card, Loading, SvgIconEnum, SvgImg, SvgImgMobile } from '@classroom/ui-kit';
import { ShareActionSheet } from '../../containers/action-sheet/share';
import { HandsUpActionSheet } from '../../containers/action-sheet/hands-up';
import { DialogCategory } from '@classroom/uistores/share';
import { ConfirmDialogAction } from '@classroom/uistores/type';
import { ClassRoomDialogContainer } from '../../containers/confirm-dialog';
import { useEffectOnce } from '@classroom/hooks/utilites';
import { GroupInfoPanel } from '@classroom/containers/group-info-panel';
export const Scenario = observer(() => {
  const {
    classroomStore: {
      roomStore: {
        classroomSchedule: { state },
      },
    },
    shareUIStore: { isLandscape, forceLandscape },
    shareUIStore,
    groupUIStore,
  } = useStore();
  const { getUserGroupInfo } = groupUIStore;
  const userUuid = EduClassroomConfig.shared.sessionInfo.userUuid;
  const groupInfo = getUserGroupInfo(userUuid);

  useEffect(() => {
    shareUIStore.setLayoutReady(!groupUIStore.joiningSubRoom);
  }, [groupUIStore.joiningSubRoom]);
  return (
    <Room>
      <LoadingContainer></LoadingContainer>

      <LayoutContainer>
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
                : { height: window.innerHeight, position: 'absolute', top: 0, left: 0 }
              : {}
          }
          className={classnames({
            'fcr-mobile-landscape-container-rotate': forceLandscape,
            'fcr-mobile-landscape-container': isLandscape && !forceLandscape,
          })}
          direction="col">
          {state === ClassState.close ? (
            <AfterClassDialog></AfterClassDialog>
          ) : (
            <>
              <GroupInfoPanel />
              <Whiteboard />

              {!isLandscape && <RoomPlaceholder></RoomPlaceholder>}
              {!isLandscape && <ScreenShareContainer></ScreenShareContainer>}
              <TeacherStream />
              {!isLandscape && (
                <>
                  <StudentStreamCollapse></StudentStreamCollapse>
                  <StudentStreamsContainer></StudentStreamsContainer>
                </>
              )}
              {!isLandscape && !groupInfo && <RoomInfo></RoomInfo>}
              {groupUIStore.joiningSubRoom ? (
                <div className="fcr-w-full fcr-h-full fcr-bg-white">
                  <PageLoading />
                </div>
              ) : (
                ''
              )}
              <AutoPlayFailedTip></AutoPlayFailedTip>
              {groupUIStore.joiningSubRoom ? (
                ''
              ) : (
                <>
                  <Chat />
                  <Poll></Poll>
                </>
              )}
              <CountDown></CountDown>

              <ShareActionSheet></ShareActionSheet>
              <HandsUpActionSheet></HandsUpActionSheet>
              <DialogContainer></DialogContainer>
              <ToastContainer></ToastContainer>
              <ClassRoomDialogContainer></ClassRoomDialogContainer>
            </>
          )}
        </LayoutOrientation>
        <WidgetContainer></WidgetContainer>
        <Watermark />
      </LayoutContainer>
    </Room>
  );
});
const PageLoading = () => {
  const { layoutUIStore } = useStore();

  return (
    <div className="scene-switch-loading">
      <Card
        className="fcr-absolute fcr-inline-flex fcr-flex-col fcr-inset-auto fcr-p-4"
        style={{
          width: 'unset!important',
          height: 'unset!important',
          borderRadius: 12,
        }}>
        <Loading />
        <p className="fcr-m-0 fcr-text-level1">
          {layoutUIStore.currentSubRoomName
            ? transI18n('fcr_group_joining', {
                reason: layoutUIStore.currentSubRoomName,
              })
            : transI18n('fcr_group_back_main_room')}
        </p>
      </Card>
    </div>
  );
};
const Room: FC<Props> = observer(({ children }) => {
  const { join } = useStore();

  useEffectOnce(() => {
    join();
  });

  return <React.Fragment>{children}</React.Fragment>;
});

const LayoutOrientation: FC<LayoutProps> = observer(({ className, children, ...restProps }) => {
  const { shareUIStore } = useStore();
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
const TeacherStream = observer(() => {
  const {
    shareUIStore: { isLandscape },
    streamUIStore: { teacherCameraStream, containerH5VisibleCls, showTool },
  } = useStore();
  useEffect(() => {
    showTool();
  }, []);
  return (
    <Layout direction="col" style={{ flexShrink: 0 }} className={classnames(containerH5VisibleCls)}>
      {(!teacherCameraStream || teacherCameraStream.isCameraMuted) && isLandscape && (
        <TeacherCameraPlaceHolder></TeacherCameraPlaceHolder>
      )}
      {teacherCameraStream && !teacherCameraStream.isCameraMuted && (
        <TeacherStreamContainer stream={teacherCameraStream} />
      )}
    </Layout>
  );
});

type Props = {
  children?: React.ReactNode;
};

const LayoutContainer: FC<Props> = observer(({ children }) => {
  const {
    layoutUIStore: { h5ContainerCls },
    shareUIStore: { classroomViewportClassName },
  } = useStore();
  return (
    <section
      className={`h5-layout-container fcr-flex fcr-h-full ${h5ContainerCls} ${classroomViewportClassName}`}
      style={{ backgroundColor: '#f9f9fc' }}>
      {children}
    </section>
  );
});
const AfterClassDialog = observer(() => {
  const {
    notificationUIStore: { setLeaveRoom },
  } = useStore();
  const transI18n = useI18n();

  return (
    <div
      className="fcr-after-class-mobile-dialog-mask fcr-fixed fcr-w-full fcr-h-full fcr-l-0 fcr-t-0"
      style={{ zIndex: ComponentLevelRules.Level3 }}>
      <div className="fcr-after-class-mobile-dialog">
        <div className="fcr-after-class-mobile-dialog-img"></div>
        <h1>{transI18n('fcr_H5_status_upcoming')}</h1>
        <h2>{transI18n('fcr_H5_tips_chat_book')}</h2>
        <div className="fcr-after-class-mobile-dialog-btn" onClick={() => setLeaveRoom(true)}>
          {transI18n('fcr_h5_label_gotit')}
        </div>
      </div>
    </div>
  );
});
const LoadingContainer = observer(() => {
  const {
    classroomStore: {
      connectionStore: { classroomState },
    },
  } = useStore();
  return classroomState !== ClassroomState.Connected ? (
    <div
      style={{ zIndex: ComponentLevelRules.Level3 }}
      className="fcr-w-screen fcr-h-screen fcr-fixed fcr-left-0 fcr-t-0 fcr-flex fcr-items-center fcr-justify-center">
      <Card width={90} height={90}>
        <Loading></Loading>
      </Card>
    </div>
  ) : null;
});
const AutoPlayFailedTip = observer(() => {
  const {
    shareUIStore: { isLandscape, forceLandscape },
    streamUIStore: { showAutoPlayFailedTip, closeAutoPlayFailedTip, teacherCameraStream },
    boardUIStore: { mounted },
  } = useStore();
  const transI18n = useI18n();
  useEffect(() => {
    if (showAutoPlayFailedTip) {
      window.addEventListener('touchstart', closeAutoPlayFailedTip, { once: true });
    }
    return () => window.removeEventListener('touchstart', closeAutoPlayFailedTip);
  }, [showAutoPlayFailedTip]);
  return showAutoPlayFailedTip ? (
    <div
      className={classnames(
        'fcr-mobile-auto-play-failed fcr-absolute fcr-t-0 fcr-l-0 fcr-w-full fcr-h-full fcr-flex fcr-justify-center',
        { 'fcr-mobile-auto-play-failed-landscape': isLandscape },
        {
          'fcr-mobile-auto-play-failed-no-board':
            (!mounted || !teacherCameraStream) && !isLandscape,
        },
      )}>
      <div>
        <SvgImgMobile
          landscape={isLandscape}
          forceLandscape={forceLandscape}
          type={SvgIconEnum.AUTO_PLAY_FAILED}
          size={130}></SvgImgMobile>
        <div className="fcr-mobile-auto-play-failed-btn">{transI18n('fcr_H5_click_to_play')}</div>
      </div>
    </div>
  ) : null;
});
export const DialogContainer: React.FC<unknown> = observer(() => {
  const { shareUIStore } = useStore();
  const { dialogQueue } = shareUIStore;
  const transI18n = useI18n();

  return (
    <React.Fragment>
      {dialogQueue
        .filter(
          (dialog) =>
            dialog.category === DialogCategory.ErrorGeneric ||
            dialog.category === DialogCategory.Confirm,
        )
        .map(({ id, props, category }) => {
          let dialogProps: GenericErrorDialogProps;
          if (category === DialogCategory.Confirm) {
            const confirmProps = props as ConfirmDialogProps;
            dialogProps = {
              title: confirmProps.title,
              content: confirmProps.content,
              okBtnText: confirmProps.opts.btnText?.ok ?? transI18n('toast.confirm'),
              onOK: confirmProps.opts.onOk,
            };
          } else {
            const genericErrorProps = props as GenericErrorDialogProps;
            dialogProps = {
              title: genericErrorProps.title,
              content: genericErrorProps.content,
              okBtnText: genericErrorProps.okBtnText,
              onOK: genericErrorProps.onOK,
            };
          }

          return <GenericErrorDialog key={id} {...dialogProps}></GenericErrorDialog>;
        })}
    </React.Fragment>
  );
});
interface ConfirmDialogProps {
  title: string;
  content: string;
  opts: {
    actions: ConfirmDialogAction[] | undefined;
    btnText: Record<ConfirmDialogAction, string> | undefined;
    onOk: () => void;
    onCancel: () => void;
  };
}
interface GenericErrorDialogProps {
  onOK: () => void;
  okBtnText: string;
  title: string;
  content: string;
}
export const GenericErrorDialog = ({
  onOK,
  title,
  content,
  okBtnText,
}: GenericErrorDialogProps) => {
  return (
    <div
      className="fcr-mobile-dialog-mask fcr-fixed fcr-w-full fcr-h-full fcr-l-0 fcr-t-0"
      style={{ zIndex: ComponentLevelRules.Level3 }}>
      <div className="fcr-mobile-dialog">
        <div className="fcr-mobile-dialog-img"></div>
        <h1>{title}</h1>
        <h2>{content}</h2>
        <div
          className="fcr-mobile-dialog-btn"
          onClick={() => {
            onOK();
          }}>
          {okBtnText}
        </div>
      </div>
    </div>
  );
};
const StudentStreamCollapse = observer(() => {
  const {
    streamUIStore: { studentCameraStreams, toggleStudentStreamsVisible, studentStreamsVisible },
    shareUIStore: { isLandscape },
  } = useStore();
  return (
    <>
      {studentCameraStreams.length > 0 && (
        <div className="fcr-stream-collapse-mobile-wrapper">
          <div className="fcr-stream-collapse-mobile">
            <SvgImgMobile
              onClick={toggleStudentStreamsVisible}
              style={{ transform: `rotateX(${studentStreamsVisible ? '0deg' : '180deg'})` }}
              type={SvgIconEnum.COLLAPSE_STREAM_MOBILE}
              size={40}
              landscape={isLandscape}
              forceLandscape={false}></SvgImgMobile>
          </div>
        </div>
      )}
    </>
  );
});
const RoomInfo = observer(() => {
  const {
    getters: { userCount, classStatusText },
    streamUIStore: { toolVisible },
  } = useStore();
  return toolVisible ? (
    <div className="fcr-mobile-room-info-container">
      <div className="fcr-mobile-room-info-user-count-container">
        <SvgImg type={SvgIconEnum.USER_COUNT} size={18} />
        <span>{userCount} </span>
      </div>
      {classStatusText && (
        <div className="fcr-mobile-room-info-time-container">{classStatusText}</div>
      )}
    </div>
  ) : null;
});
