import { useStore } from '@classroom/hooks/ui-store';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import React, { FC, MutableRefObject, useContext, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Layout, LayoutProps } from '@classroom/ui-kit/components/layout';
import {
  H5RoomPlaceholder,
  RoomBigStudentStreamsContainerMobile,
  RoomBigTeacherStreamContainerMobile,
  useMobileStreamTool,
} from '@classroom/containers/stream/player';
import { WidgetContainerMobile } from '../../containers/widget/index.mobile';
import {
  ChatMobile,
  CountDownMobile,
  PollMobile,
  Watermark,
  WhiteboardMobile,
} from '../../containers/widget/slots';
import './index.css';
import { ToastContainerMobile } from '../../containers/toast';
import { ClassroomState, ClassState, EduClassroomConfig } from 'agora-edu-core';
import { ComponentLevelRulesMobile } from '../../configs/config';
import { ScreenShareContainerMobile } from '../../containers/screen-share';
import { useI18n } from 'agora-common-libs';
import { TeacherCameraPlaceHolderMobile } from '../../containers/stream';
import { Card, Loading, SvgIconEnum, SvgImgMobile } from '@classroom/ui-kit';
import { ShareActionSheetMobile } from '../../containers/action-sheet/share';
import { HandsUpActionSheetMobile } from '../../containers/action-sheet/hands-up';
import { DialogCategory } from '@classroom/uistores/share';
import { ConfirmDialogAction } from '@classroom/uistores/type';
import { ClassRoomDialogContainer } from '../../containers/confirm-dialog';

import { useEffectOnce } from '@classroom/hooks/utilites';
export const Scenario = observer(() => {
  const {
    classroomStore: {
      roomStore: {
        classroomSchedule: { state },
      },
    },
    shareUIStore: { isLandscape, forceLandscape },
    streamUIStore: { teacherCameraStream, showTool }
  } = useStore();
  // useEffect(() => {
  //   showTool()
  // }, [])
  return (
    <Room>
      <MobileLoadingContainer></MobileLoadingContainer>

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
                : { height: window.innerHeight, position: 'absolute', top: 0, left: 0 }
              : {}
          }
          className={classnames({
            'fcr-mobile-landscape-container-rotate': forceLandscape,
            'fcr-mobile-landscape-container': isLandscape && !forceLandscape,
          })}
          direction="col">
          {state === ClassState.close ? (
            <AfterClassMobileDialog></AfterClassMobileDialog>
          ) : (
            <>
              <WhiteboardMobile />
              {!isLandscape && <H5RoomPlaceholder></H5RoomPlaceholder>}
              {!isLandscape && <ScreenShareContainerMobile></ScreenShareContainerMobile>}
              {/* <StreamMobile></StreamMobile> */}
              <TeacherStreamChatContainerMobile />
              <CountDownMobile
                haveStream={
                  !!(teacherCameraStream && !teacherCameraStream.isCameraMuted)
                }></CountDownMobile>
              {!isLandscape && (
                <RoomBigStudentStreamsContainerMobile></RoomBigStudentStreamsContainerMobile>
              )}
              <AutoPlayFailedTip></AutoPlayFailedTip>
              <ChatMobile />
              <PollMobile></PollMobile>
              <ShareActionSheetMobile></ShareActionSheetMobile>
              <HandsUpActionSheetMobile></HandsUpActionSheetMobile>
              <DialogContainerMobile></DialogContainerMobile>
              <ToastContainerMobile></ToastContainerMobile>
              <ClassRoomDialogContainer></ClassRoomDialogContainer>
            </>
          )}
        </LayoutOrientation>
        <WidgetContainerMobile></WidgetContainerMobile>
        <Watermark />
      </H5LayoutContainer>
    </Room>
  );
});
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
const TeacherStreamChatContainerMobile = observer(() => {
  const {
    shareUIStore: { isLandscape },
    streamUIStore: { teacherCameraStream, containerH5VisibleCls },
  } = useStore();
  return (
    <Layout direction="col" className={classnames(containerH5VisibleCls)}>
      {(!teacherCameraStream || teacherCameraStream.isCameraMuted) && isLandscape && (
        <TeacherCameraPlaceHolderMobile></TeacherCameraPlaceHolderMobile>
      )}
      {teacherCameraStream && !teacherCameraStream.isCameraMuted && (
        <RoomBigTeacherStreamContainerMobile stream={teacherCameraStream} />
      )}
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
  } = useStore();
  return (
    <section
      className={`h5-layout-container fcr-flex fcr-h-full ${h5ContainerCls} ${classroomViewportClassName}`}
      style={{ backgroundColor: '#f9f9fc' }}>
      {children}
    </section>
  );
});
const AfterClassMobileDialog = observer(() => {
  const {
    notificationUIStore: { setLeaveRoom },
  } = useStore();
  const transI18n = useI18n();

  return (
    <div
      className="fcr-after-class-mobile-dialog-mask fcr-fixed fcr-w-full fcr-h-full fcr-l-0 fcr-t-0"
      style={{ zIndex: ComponentLevelRulesMobile.Level3 }}>
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
const MobileLoadingContainer = observer(() => {
  const {
    classroomStore: {
      connectionStore: { classroomState },
    },
  } = useStore();
  return classroomState !== ClassroomState.Connected ? (
    <div
      style={{ zIndex: ComponentLevelRulesMobile.Level3 }}
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
export const DialogContainerMobile: React.FC<unknown> = observer(() => {
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
          let dialogProps: GenericErrorDialogMobileProps;
          if (category === DialogCategory.Confirm) {
            const confirmProps = props as ConfirmDialogMobileProps;
            dialogProps = {
              title: confirmProps.title,
              content: confirmProps.content,
              okBtnText: confirmProps.opts.btnText?.ok ?? transI18n('toast.confirm'),
              onOK: confirmProps.opts.onOk,
            };
          } else {
            const genericErrorProps = props as GenericErrorDialogMobileProps;
            dialogProps = {
              title: genericErrorProps.title,
              content: genericErrorProps.content,
              okBtnText: genericErrorProps.okBtnText,
              onOK: genericErrorProps.onOK,
            };
          }

          return <GenericErrorDialogMobile key={id} {...dialogProps}></GenericErrorDialogMobile>;
        })}
    </React.Fragment>
  );
});
interface ConfirmDialogMobileProps {
  title: string;
  content: string;
  opts: {
    actions: ConfirmDialogAction[] | undefined;
    btnText: Record<ConfirmDialogAction, string> | undefined;
    onOk: () => void;
    onCancel: () => void;
  };
}
interface GenericErrorDialogMobileProps {
  onOK: () => void;
  okBtnText: string;
  title: string;
  content: string;
}
export const GenericErrorDialogMobile = ({
  onOK,
  title,
  content,
  okBtnText,
}: GenericErrorDialogMobileProps) => {
  return (
    <div
      className="fcr-mobile-dialog-mask fcr-fixed fcr-w-full fcr-h-full fcr-l-0 fcr-t-0"
      style={{ zIndex: ComponentLevelRulesMobile.Level3 }}>
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
