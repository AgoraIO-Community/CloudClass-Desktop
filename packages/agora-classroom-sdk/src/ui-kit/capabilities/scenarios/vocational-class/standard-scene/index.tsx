import { useStore } from '@/infra/hooks/use-edu-stores';
import { EduClassroomConfig, EduRoleTypeEnum, EduRoomServiceTypeEnum } from 'agora-edu-core';
import { MediaPlayerEvents } from 'agora-rte-sdk';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import React, { FC, useEffect, useMemo } from 'react';
import { Aside, Layout } from '~components/layout';
import { CollectorContainer, WhiteboardContainer } from '~containers/board';
import { DialogContainer } from '~containers/dialog';
import { ExtensionAppContainer } from '~containers/extension-app-container';
import { HandsUpContainer } from '~containers/hand-up';
import { LoadingContainer } from '~containers/loading';
import { NavigationBarContainer } from '~containers/nav';
import { FixedAspectRatioRootBox } from '~containers/root-box/fixed-aspect-ratio';
import { RoomBigTeacherStreamContainer } from '~containers/stream/room-big-player';
import { ToastContainer } from '~containers/toast';
import { ChatWidgetPC } from '~containers/widget/chat-widget';
import { BigWidgetWindowContainer } from '../../../containers/big-widget-window';
import { ScenesController } from '../../../containers/scenes-controller';
import Room from '../../room';

type Props = {
  children?: React.ReactNode;
};

const Content: FC<Props> = ({ children }) => {
  return <div className="flex-col flex-grow">{children}</div>;
};

export const StandardClassScenario = observer(() => {
  // layout
  const layoutCls = classnames('edu-room', 'big-class-room');
  const {
    classroomStore,
    streamUIStore,
    streamWindowUIStore: { containedStreamWindowCoverOpacity },
  } = useStore();
  const { teacherCameraStream } = streamUIStore;
  const { boardStore, streamStore, mediaStore, roomStore } = classroomStore;
  const { whiteboardWidgetActive } = boardStore;
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

  const handleCDNDelayUpdate = (cdnDelay: number) => {
    boardStore.setDelay(cdnDelay);
  };

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
    player.on(MediaPlayerEvents.CdnDelayUpdated, handleCDNDelayUpdate);
    return () => {
      player.off(MediaPlayerEvents.CdnDelayUpdated, handleCDNDelayUpdate);
    };
  }, [boardStore, mediaStore, handleCDNDelayUpdate]);

  return (
    <Room>
      <FixedAspectRatioRootBox trackMargin={{ top: 27 }}>
        <Layout className={layoutCls} direction="col">
          <NavigationBarContainer />
          <Layout className="horizontal">
            <Content>
              <BigWidgetWindowContainer>
                {whiteboardWidgetActive && <WhiteboardContainer></WhiteboardContainer>}
                <Aside className="aisde-fixed fcr-room-big">
                  <CollectorContainer />
                  {showHandsUpContainer ? <HandsUpContainer /> : null}
                </Aside>
              </BigWidgetWindowContainer>
              <ScenesController />
            </Content>
            <Aside style={{ opacity: containedStreamWindowCoverOpacity }}>
              <RoomBigTeacherStreamContainer />
              <ChatWidgetPC />
            </Aside>
          </Layout>
          <DialogContainer />
          <LoadingContainer />
        </Layout>
        <ExtensionAppContainer />
        <ToastContainer />
      </FixedAspectRatioRootBox>
    </Room>
  );
});
