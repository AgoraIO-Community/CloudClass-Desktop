import { useStore } from '@/infra/hooks/ui-store';
import { SceneSwitch } from '@/ui-kit/capabilities/containers/scene-switch';
import { ScenesController } from '@/ui-kit/capabilities/containers/scenes-controller';
import { ScreenShareContainer } from '@/ui-kit/capabilities/containers/screen-share';
import { StreamWindowsContainer } from '@/ui-kit/capabilities/containers/stream-windows-container';
import { WhiteboardToolbar } from '@/ui-kit/capabilities/containers/toolbar';
import { WidgetContainer } from '@/ui-kit/capabilities/containers/widget';
import { Chat, Whiteboard } from '@/ui-kit/capabilities/containers/widget/slots';
import { EduClassroomConfig, EduRoleTypeEnum, EduRoomServiceTypeEnum } from 'agora-edu-core';
import { MediaPlayerEvents } from 'agora-rte-sdk';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { useEffect, useMemo } from 'react';
import { Layout } from '~components/layout';
import { BigClassAside as Aside } from '~containers/aside';
import { DialogContainer } from '~containers/dialog';
import { HandsUpContainer } from '~containers/hand-up';
import { LoadingContainer } from '~containers/loading';
import { NavigationBar } from '~containers/nav';
import { FixedAspectRatioRootBox } from '~containers/root-box/fixed-aspect-ratio';
import { RoomBigTeacherStreamContainer } from '~containers/stream/room-big-player';
import { ToastContainer } from '~containers/toast';
import { Float } from '~ui-kit';
import Room from '../../room';

const layoutCls = classnames('edu-room', 'big-class-room', 'bg-white');

export const StandardClassScenario = observer(() => {
  // layout
  const { classroomStore, streamUIStore, boardUIStore } = useStore();
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
    EduClassroomConfig.shared.sessionInfo.roomServiceType !== EduRoomServiceTypeEnum.CDN &&
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
    const handleCDNDelayUpdate = (t: number) => {
      boardUIStore.setDelay(t);
      if (boardUIStore.boardApi.connected) {
        player.clearDelayTask();
      }
    };
    player.on(MediaPlayerEvents.CdnDelayUpdated, handleCDNDelayUpdate);
    return () => {
      player.off(MediaPlayerEvents.CdnDelayUpdated, handleCDNDelayUpdate);
    };
  }, [mediaStore, teacherCameraStream, boardUIStore.setDelay]);

  return (
    <Room>
      <FixedAspectRatioRootBox trackMargin={{ top: 27 }}>
        <SceneSwitch>
          <Layout className={layoutCls} direction="col">
            <NavigationBar />
            <Layout className="flex-grow items-stretch fcr-room-bg h-full">
              <Layout
                className="flex-grow items-stretch relative"
                direction="col"
                style={{ paddingTop: 2 }}>
                <Whiteboard />
                <ScreenShareContainer />
                <WhiteboardToolbar />
                <ScenesController />
                <Float bottom={15} right={10} align="flex-end" gap={2}>
                  {showHandsUpContainer ? <HandsUpContainer /> : null}
                </Float>
                <StreamWindowsContainer />
              </Layout>
              <Aside>
                <RoomBigTeacherStreamContainer />
                <Chat />
              </Aside>
            </Layout>
            <DialogContainer />
            <LoadingContainer />
          </Layout>
          <WidgetContainer />
          <ToastContainer />
        </SceneSwitch>
      </FixedAspectRatioRootBox>
    </Room>
  );
});
