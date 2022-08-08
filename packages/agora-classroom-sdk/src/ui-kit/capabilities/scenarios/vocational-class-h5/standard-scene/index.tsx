import { useStore, useVocationalH5UIStores } from '@/infra/hooks/ui-store';
import { EduVocationalH5UIStore } from '@/infra/stores/vocational-h5';
import { WidgetContainer } from '@/ui-kit/capabilities/containers/widget';
import { EduClassroomConfig, EduRoleTypeEnum, EduRoomServiceTypeEnum } from 'agora-edu-core';
import { MediaPlayerEvents } from 'agora-rte-sdk';
import cls from 'classnames';
import { observer } from 'mobx-react';
import { FC, useEffect, useMemo, useState } from 'react';
import { DialogContainer } from '~containers/dialog';
import { useInvitedModal } from '~containers/hand-up/invite-confirm';
import { ToastContainer } from '~containers/toast';
import Room from '../../room';
import { ChatH5 } from '../components/chat';
import { DocTitle } from '../components/doc-title';
import { PageHeader } from '../components/page-header';
import { PodiumList } from '../components/podium-list';
import { MobileTeacherStreamPlayer } from '../components/teacher-stream-player';
import { MobileWhiteBoardH5 } from '../components/whiteboard';
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
      roomServiceType === EduRoomServiceTypeEnum.Fusion ||
      roomServiceType === EduRoomServiceTypeEnum.LivePremium ||
      roomServiceType === EduRoomServiceTypeEnum.LiveStandard
    );
  }, [roomServiceType]);

  const podiumStreams = useMemo(() => {
    return Array.from(studentStreams);
  }, [studentStreams]);

  return (
    <Room>
      <H5LayoutContainer>
        <PageHeader />
        <DocTitle />
        <div
          className={cls({
            'm-vocational-class': 1,
            'cdn-class': roomServiceType === EduRoomServiceTypeEnum.CDN,
          })}>
          <VocationalBoardContainer />
          <PodiumList streams={podiumStreams} />
          <ChatH5 showHandsUp={showHandsUp} />
        </div>
        <DialogContainer />
        <WidgetContainer />
        <ToastContainer />
      </H5LayoutContainer>
    </Room>
  );
});

const VocationalBoardContainer = observer(() => {
  const [minimizeWhiteboard, setMinimizeWhiteboard] = useState(false);
  const dbtEvent = useDoubleTap((e) => setMinimizeWhiteboard(!minimizeWhiteboard));
  return (
    <div className="main-section">
      <MobileTeacherStreamPlayer {...dbtEvent} minimized={!minimizeWhiteboard} />
      <MobileWhiteBoardH5 {...dbtEvent} minimized={minimizeWhiteboard} />
    </div>
  );
});

type Props = {
  children?: React.ReactNode;
};

const H5LayoutContainer: FC<Props> = observer(({ children }) => {
  const {
    layoutUIStore: { h5ContainerCls },
    shareUIStore: { classroomViewportClassName },
  } = useVocationalH5UIStores() as EduVocationalH5UIStore;
  return (
    <section
      className={`h5-layout-container flex h-full ${h5ContainerCls}  ${classroomViewportClassName}`}
      style={{ backgroundColor: '#f9f9fc' }}>
      {children}
    </section>
  );
});
