import { useStore } from '@classroom/hooks/ui-store';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import React, { FC, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Layout } from '@classroom/ui-kit/components/layout';
import { RoomPlaceholder, TeacherStreamContainer } from '@classroom/containers/stream/player';
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
import { StudentStreamsContainer } from '@classroom/containers/student-streams';
import { AfterClassDialog, DialogContainer } from '@classroom/containers/dialogs';
import { AutoPlayFailedTip } from '@classroom/containers/auto-play-failed';
import { Room, LayoutContainer, LayoutOrientation, RoomInfo } from '@classroom/containers/layout';
import { LoadingContainer, GroupLoading } from '@classroom/containers/loading';
import { TeacherStream } from '@classroom/containers/teacher-stream';
import { StreamsSwiper } from '@classroom/containers/streams-swiper';
import { LandscapeToolPanel } from '@classroom/containers/landscape-tool-panel';
export const Scenario = observer(() => {
  const {
    classroomStore: {
      roomStore: {
        classroomSchedule: { state },
      },
    },
    getters: { isBoardWidgetActive },
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
          className={classnames({
            'fcr-mobile-landscape-container-rotate': forceLandscape,
            'fcr-mobile-landscape-container': isLandscape && !forceLandscape,
          })}
          direction={isLandscape ? 'row' : 'col'}>
          {state === ClassState.close ? (
            <AfterClassDialog></AfterClassDialog>
          ) : (
            <>
              {!isLandscape ? <GroupInfoPanel /> : null}
              {isLandscape ? (
                <div className="landscape-mobile-container">
                  {<Whiteboard />}
                  <LandscapeToolPanel />
                  {!isBoardWidgetActive && <TeacherStream />}
                  <StreamsSwiper />
                </div>
              ) : (
                <>
                  <Whiteboard />
                  {!isLandscape && <RoomPlaceholder></RoomPlaceholder>}
                  {!isLandscape && <ScreenShareContainer></ScreenShareContainer>}
                  <TeacherStream />
                  {<StudentStreamsContainer></StudentStreamsContainer>}
                  {!isLandscape && !groupInfo && <RoomInfo></RoomInfo>}
                  <HandsUpActionSheet></HandsUpActionSheet>
                  <Poll></Poll>
                </>
              )}

              {groupUIStore.joiningSubRoom ? <GroupLoading /> : <Chat />}

              <CountDown></CountDown>
              <AutoPlayFailedTip></AutoPlayFailedTip>
              {!isLandscape && <ShareActionSheet></ShareActionSheet>}
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
