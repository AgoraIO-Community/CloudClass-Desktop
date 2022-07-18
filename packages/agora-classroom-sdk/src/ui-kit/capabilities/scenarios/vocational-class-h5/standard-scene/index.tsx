import { useStore } from '@/infra/hooks/ui-store';
import { WidgetContainer } from '@/ui-kit/capabilities/containers/widget';
import { EduClassroomConfig, EduRoleTypeEnum, EduRoomServiceTypeEnum } from 'agora-edu-core';
import { MediaPlayerEvents } from 'agora-rte-sdk';
import cls from 'classnames';
import { observer } from 'mobx-react';
import { useEffect, useMemo, useState } from 'react';
import { DialogContainer } from '~containers/dialog';
import { useInvitedModal } from '~containers/hand-up/invite-confirm';
import { ToastContainer } from '~containers/toast';
import Room from '../../room';
import { DocTitle } from '../components/doc-title';
import { H5Chat } from '../components/h5-chat';
import { MobileStreamPlayer } from '../components/mobile-stream-player';
import { MobileWhiteBoard } from '../components/mobile-whiteboard';
import { PageHeader } from '../components/page-header';
import { PodiumList } from '../components/podium-list';
import { useDoubleTap } from '../hooks/useDoubleTap';

export const StandardClassScenario = observer(() => {
  const { roomServiceType } = EduClassroomConfig.shared.sessionInfo;
  const { streamUIStore, handUpUIStore, shareUIStore, classroomStore, boardUIStore } = useStore();
  const { mediaStore, roomStore, streamStore } = classroomStore;
  const { teacherCameraStream, studentStreams } = streamUIStore;
  const { isOnPodium } = roomStore;

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

  useEffect(() => {
    if (isOnPodium) {
      streamStore.publishStreamToCdn();
    }
  }, [isOnPodium, streamStore]);

  useInvitedModal(handUpUIStore.beingInvited, handUpUIStore, shareUIStore);

  const showHandsUp = useMemo(() => {
    return (
      roomServiceType === EduRoomServiceTypeEnum.MixRTCCDN ||
      roomServiceType === EduRoomServiceTypeEnum.RTC ||
      roomServiceType === EduRoomServiceTypeEnum.Live
    );
  }, [roomServiceType]);

  const podiumStreams = useMemo(() => {
    return Array.from(studentStreams);
  }, [studentStreams]);

  return (
    <Room>
      <PageHeader />
      <DocTitle />
      <div
        className={cls({
          'm-vocational-class': 1,
          'cdn-class': roomServiceType === EduRoomServiceTypeEnum.BlendCDN,
        })}>
        <VocationalBoardContainer />
        <PodiumList streams={podiumStreams} />
        <H5Chat showHandsUp={showHandsUp} />
      </div>
      <DialogContainer />
      <WidgetContainer />
      <ToastContainer />
    </Room>
  );
});

const VocationalBoardContainer = observer(() => {
  const [minimizeWhiteboard, setMinimizeWhiteboard] = useState(false);
  const dbtEvent = useDoubleTap((e) => setMinimizeWhiteboard(!minimizeWhiteboard));
  return (
    <div className="main-section">
      <MobileStreamPlayer {...dbtEvent} minimized={!minimizeWhiteboard} />
      <MobileWhiteBoard {...dbtEvent} minimized={minimizeWhiteboard} />
    </div>
  );
});
