import { useStore } from '@/infra/hooks/ui-store';
import { ScreenShareContainer } from '@/ui-kit/capabilities/containers/screen-share';
import { StreamWindowsContainer } from '@/ui-kit/capabilities/containers/stream-windows-container';
import { WhiteboardToolbar } from '@/ui-kit/capabilities/containers/toolbar';
import { WidgetContainer } from '@/ui-kit/capabilities/containers/widget';
import { Chat, Whiteboard } from '@/ui-kit/capabilities/containers/widget/slots';
import { EduClassroomConfig, EduRoleTypeEnum, EduRoomServiceTypeEnum } from 'agora-edu-core';
import { MediaPlayerEvents } from 'agora-rte-sdk';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import React, { FC, useEffect, useMemo } from 'react';
import { Aside, Layout } from '~components/layout';
import { DialogContainer } from '~containers/dialog';
import { HandsUpContainer } from '~containers/hand-up';
import { LoadingContainer } from '~containers/loading';
import { NavigationBar } from '~containers/nav';
import { FixedAspectRatioRootBox } from '~containers/root-box/fixed-aspect-ratio';
import { RoomBigTeacherStreamContainer } from '~containers/stream/room-big-player';
import { ToastContainer } from '~containers/toast';
import { ScenesController } from '../../../containers/scenes-controller';
import Room from '../../room';

type Props = {
  children?: React.ReactNode;
};

const Content: FC<Props> = ({ children }) => {
  return <div className="flex-col flex-grow relative">{children}</div>;
};
const layoutCls = classnames('edu-room', 'big-class-room', 'bg-white');

export const StandardClassScenario = observer(() => {
  // layout
  const {
    classroomStore,
    streamUIStore,
    boardUIStore,
    streamWindowUIStore: { containedStreamWindowCoverOpacity },
  } = useStore();
  const { teacherCameraStream } = streamUIStore;
  const { streamStore, mediaStore, roomStore } = classroomStore;
  const teacherCameraStreamAudioState = useMemo(
    () => teacherCameraStream?.stream.audioState,
    [teacherCameraStream],
  );
  const teacherCameraStreamVideoState = useMemo(
    () => teacherCameraStream?.stream.videoState,
    [teacherCameraStream],
  );
  const { isOnPodium } = roomStore;

  const showHandsUpContainer =
    EduClassroomConfig.shared.sessionInfo.roomServiceType !== EduRoomServiceTypeEnum.BlendCDN &&
    EduClassroomConfig.shared.sessionInfo.roomServiceType !== EduRoomServiceTypeEnum.MixStreamCDN;

  useEffect(() => {
    if (
      (teacherCameraStreamAudioState || teacherCameraStreamVideoState) &&
      EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher
    ) {
      streamStore.publishStreamToCdn();
    }
  }, [teacherCameraStreamAudioState, teacherCameraStreamVideoState, streamStore]);

  useEffect(() => {
    if (isOnPodium) {
      streamStore.publishStreamToCdn();
    }
  }, [isOnPodium, streamStore]);

  useEffect(() => {
    if (
      EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher ||
      !teacherCameraStream
    ) {
      return;
    }
    const { streamHlsUrl } = teacherCameraStream.stream;
    if (!streamHlsUrl) {
      return;
    }
    const player = mediaStore.getMediaTrackPlayer(streamHlsUrl);
    if (!player) {
      return;
    }
    const handleCDNDelayUpdate = boardUIStore.setDelay;
    player.on(MediaPlayerEvents.CdnDelayUpdated, handleCDNDelayUpdate);
    return () => {
      player.off(MediaPlayerEvents.CdnDelayUpdated, handleCDNDelayUpdate);
    };
  }, [mediaStore, teacherCameraStream, boardUIStore.setDelay]);

  return (
    <Room>
      <FixedAspectRatioRootBox trackMargin={{ top: 27 }}>
        <Layout className={layoutCls} direction="col">
          <NavigationBar />
          <Layout className="horizontal">
            <Content>
              <Whiteboard />
              <ScreenShareContainer />
              <WhiteboardToolbar />
              <ScenesController />
              <StreamWindowsContainer />
              <Aside className="aisde-fixed">
                {showHandsUpContainer ? <HandsUpContainer /> : null}
              </Aside>
            </Content>
            <Aside style={{ opacity: containedStreamWindowCoverOpacity }}>
              <RoomBigTeacherStreamContainer />
              <Chat />
            </Aside>
          </Layout>
          <DialogContainer />
          <LoadingContainer />
        </Layout>
        <WidgetContainer />
        <ToastContainer />
      </FixedAspectRatioRootBox>
    </Room>
  );
});
