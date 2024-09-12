import { useStore } from '@classroom/hooks/ui-store';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { RoomPlaceholder } from '@classroom/containers/stream/player';
import { WidgetContainer } from '../../containers/widget';
import {
  Chat,
  CountDown,
  MadiaPlayer,
  Poll,
  Watermark,
  WebView,
  Whiteboard,
} from '../../containers/widget/slots';

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
import { StudentStreamsContainer } from '@classroom/containers/student-streams';
import { AfterClassDialog, DialogContainer } from '@classroom/containers/dialogs';
import { AutoPlayFailedTip } from '@classroom/containers/auto-play-failed';
import { Room, LayoutContainer, LayoutOrientation, RoomInfo } from '@classroom/containers/layout';
import { LoadingContainer, GroupLoading } from '@classroom/containers/loading';
import { TeacherStream } from '@classroom/containers/teacher-stream';
import { StreamsSwiper } from '@classroom/containers/streams-swiper';
import { LandscapeToolPanel } from '@classroom/containers/landscape-tool-panel';
import { TopPanel } from '@classroom/containers/top-panel';
import { AllStream } from '@classroom/containers/all-streams';
export const Scenario = observer(() => {
  const {
    classroomStore: {
      roomStore: {
        classroomSchedule: { state },
      },
    },
    boardUIStore: { isFullScreen, setIsFullScreen, isFoldStream, setFoldStream },
    layoutUIStore: { toggleLandscapeToolBarVisible },
    getters: {
      isBoardWidgetActive,
      isMediaPlayerWidgetActive,
      isWebViewWidgetActive,
      isScreenSharing,
      isTeacherInClass,
    },
    shareUIStore: { isLandscape, forceLandscape, landscapeInnerHeight },
    widgetUIStore: { currentWidget },
    shareUIStore,
    groupUIStore,
  } = useStore();
  const { getUserGroupInfo } = groupUIStore;
  const userUuid = EduClassroomConfig.shared.sessionInfo.userUuid;
  const groupInfo = getUserGroupInfo(userUuid);
  useEffect(() => {
    shareUIStore.setLayoutReady(!groupUIStore.joiningSubRoom);
  }, [groupUIStore.joiningSubRoom]);
  // useEffect(() => {
  //   const widgets = z0Widgets.filter((v) => v.widgetName !== 'easemobIM')
  //   const index = widgets.findIndex((v) => v.widgetName === currentWidget?.widgetName)
  //   if (index === -1) {
  //     setCurrentWidget(widgets[widgets.length - 1])
  //   }

  // }, [z0Widgets])
  const transI18n = useI18n();


  const handleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  }

  const handleFold = () => {
    setFoldStream(!isFoldStream);
  }

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
          className={classnames({
            'fcr-mobile-landscape-container-rotate': forceLandscape,
            'fcr-mobile-landscape-container': isLandscape && !forceLandscape,
          })}
          direction={isLandscape ? 'row' : 'col'}>
          <TopPanel />
          {state === ClassState.close ? (
            <AfterClassDialog></AfterClassDialog>
          ) : (
            <>
              <div
                className={isLandscape ? "fct-mobile-main-container fct-mobile-main-container-landscape" : "fct-mobile-main-container"}
              // style={{ height: isLandscape ? landscapeInnerHeight : window.innerHeight }}
              >
                <div className={'fct-mobile-main-top'}>
                  {(isBoardWidgetActive ||
                    isMediaPlayerWidgetActive ||
                    isWebViewWidgetActive ||
                    isScreenSharing)
                    && <div className="fct-mobile-board-fullscreen-btn" onClick={handleFullScreen}>
                      {!isFullScreen
                        ? <SvgImg
                          type={SvgIconEnum.WHITEBOARDFULLSCREEN_LANDSCAPE}
                          colors={{ iconPrimary: '#FFFFFF' }}
                          size={38}
                        />
                        : <SvgImg
                          type={SvgIconEnum.WHITEBOARDFULLSCREEN_LANDSCAPE_CLOSE}
                          colors={{ iconPrimary: '#FFFFFF' }}
                          size={38}
                        />
                      }
                    </div>}
                  <div
                    style={{
                      opacity: currentWidget?.widgetName === 'screenShare' ? 1 : 0,
                      transition: 'opacity 0.2s linear',
                      height:
                        currentWidget?.widgetName === 'screenShare'
                          ? '100%'
                          : 0,
                    }}>
                    <ScreenShareContainer key={'sceenShare'}></ScreenShareContainer>
                  </div>
                  <div
                    style={{
                      opacity: currentWidget?.widgetName === 'netlessBoard' ? 1 : 0,
                      transition: 'opacity 0.2s linear',
                      height:
                        currentWidget?.widgetName === 'netlessBoard'
                          ? '100%'
                          : 0,
                    }}>
                    <Whiteboard key={'board'} />
                  </div>
                  <div
                    style={{
                      opacity: currentWidget?.widgetName === 'mediaPlayer' ? 1 : 0,
                      transition: 'opacity 0.2s linear',
                      height:
                        currentWidget?.widgetName === 'mediaPlayer'
                          ? '100%'
                          : 0,
                    }}>
                    <MadiaPlayer key={'media'} />
                  </div>
                  <div
                    style={{
                      opacity: currentWidget?.widgetName === 'webView' ? 1 : 0,
                      transition: 'opacity 0.2s linear',
                      height:
                        currentWidget?.widgetName === 'webView'
                          ? '100%'
                          : 0,
                    }}>
                    {' '}
                    {/* <WebView key={'webview'} /> */}
                  </div>
                </div>
                {isLandscape ? (
                  <>
                    {/* <LandscapeToolPanel /> */}
                    {!isTeacherInClass &&
                      !isBoardWidgetActive &&
                      !isMediaPlayerWidgetActive &&
                      !isWebViewWidgetActive &&
                      !isScreenSharing && (
                        <div
                          className="landscape-teacher-stream active"
                          onClick={toggleLandscapeToolBarVisible}>
                          {transI18n('fcr_student_no_teacher_show')}
                        </div>
                      )}

                  </>
                ) : (
                  <>
                    {/* <GroupInfoPanel /> */}
                    {/* {!isLandscape && <RoomPlaceholder></RoomPlaceholder>} */}
                    {/* <ScreenShareContainer></ScreenShareContainer> */}
                    <AllStream isTeacherInClass={false} isBoardWidgetActive={false}
                      isMediaPlayerWidgetActive={false} isWebViewWidgetActive={false}
                      isScreenSharing={false}></AllStream>
                    {!isLandscape && !groupInfo && <RoomInfo></RoomInfo>}
                    <HandsUpActionSheet></HandsUpActionSheet>

                    <ShareActionSheet></ShareActionSheet>
                  </>
                )}
                {groupUIStore.joiningSubRoom ? <GroupLoading /> : <Chat />}
                {/* {groupUIStore.joiningSubRoom && <GroupLoading /> } */}
                <Poll></Poll>
                <CountDown></CountDown>
                <AutoPlayFailedTip></AutoPlayFailedTip>
                <DialogContainer></DialogContainer>
                <ToastContainer></ToastContainer>
                <ClassRoomDialogContainer></ClassRoomDialogContainer>
                {isLandscape && <div
                  className='all-stream-fold-icon-wrapped'
                  onClick={handleFold}
                >
                  {isFoldStream ?
                    <SvgImg
                      type={SvgIconEnum.ALL_STREAM_FOLD_NOT}
                      colors={{ iconPrimary: '#FEFEFE' }}
                    />
                    : <SvgImg
                      type={SvgIconEnum.ALL_STREAM_FOLD}
                      colors={{ iconPrimary: '#FEFEFE' }}
                    />}
                </div>}
                <div className={isLandscape
                  ? `landscape-bottom-tools landscape-bottom-tools-horizontal ${isFullScreen ? 'landscape-bottom-tools-fullScreen' : 'landscape-bottom-tools-notfullScreen'}`
                  : `landscape-bottom-tools landscape-bottom-tools-vertical ${isFullScreen ? 'landscape-bottom-tools-fullScreen' : 'landscape-bottom-tools-notfullScreen'}`}  ></div>
                {isLandscape && !isFoldStream && <AllStream
                  isTeacherInClass={isTeacherInClass}
                  isBoardWidgetActive={isBoardWidgetActive}
                  isMediaPlayerWidgetActive={isMediaPlayerWidgetActive}
                  isWebViewWidgetActive={isWebViewWidgetActive}
                  isScreenSharing={isScreenSharing}
                ></AllStream>}
              </div>
              {/* {isLandscape && <StreamsSwiper />} */}

            </>
          )}
        </LayoutOrientation>

        <WidgetContainer></WidgetContainer>
        <Watermark />
      </LayoutContainer>
    </Room>
  );
});
