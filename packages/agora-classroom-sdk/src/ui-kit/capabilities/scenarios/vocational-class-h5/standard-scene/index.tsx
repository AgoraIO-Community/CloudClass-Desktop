import { useStore } from '@/infra/hooks/use-edu-stores';
import { EduClassroomConfig, EduRoleTypeEnum, EduRoomServiceTypeEnum } from 'agora-edu-core';
import { MediaPlayerEvents } from 'agora-rte-sdk';
import cls from 'classnames';
import { observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { DialogContainer } from '~containers/dialog';
import { ExtensionAppContainer } from '~containers/extension-app-container';
import { useInvitedModal } from '~containers/hand-up/invite-confirm';
import { ScreenShareContainer } from '~containers/screen-share';
import { ToastContainer } from '~containers/toast';
import { ChatWidgetH5 } from '~containers/widget/chat-widget';
import Room from '../../room';
import { DocTitle } from '../components/doc-title';
import { HandsUp } from '../components/hands-up';
import { HostStream } from '../components/host-stream';
import { Podiums } from '../components/podium-list';
import Whiteboard from '../components/whiteboard-ui';
import { useDoubleTap } from '../hooks/useDoubleTap';
import './index.css';

export const StandardClassScenario = observer(() => {
  const [minimizeWhiteboard, setMinimizeWhiteboard] = useState(false);
  const dbtEvent = useDoubleTap((e) => setMinimizeWhiteboard(!minimizeWhiteboard));
  const { roomServiceType } = EduClassroomConfig.shared.sessionInfo;
  const { streamUIStore, handUpUIStore, shareUIStore, classroomStore } = useStore();
  const { boardStore, mediaStore, roomStore, streamStore } = classroomStore;
  const { teacherCameraStream } = streamUIStore;
  const showHandsUp =
    roomServiceType === EduRoomServiceTypeEnum.MixRTCCDN ||
    roomServiceType === EduRoomServiceTypeEnum.RTC ||
    roomServiceType === EduRoomServiceTypeEnum.Live;

  const { isOnPodium } = roomStore;

  const handleCDNDelayUpdate = (cdnDelay: number) => {
    boardStore.setDelay(cdnDelay);
  };

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

  useEffect(() => {
    if (isOnPodium) {
      streamStore.publishStreamToCdn();
    }
  }, [isOnPodium, streamStore]);

  useInvitedModal(handUpUIStore.beingInvited, handUpUIStore, shareUIStore);

  return (
    <Room>
      <Helmet>
        <meta
          name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
        />
        <meta content="yes" name="apple-mobile-web-app-capable" />
        <meta content="black" name="apple-mobile-web-app-status-bar-style" />
        <meta content="telephone=no" name="format-detection" />
      </Helmet>
      <DocTitle />
      <div
        className={cls({
          'm-vocational-class': 1,
          'mix-cdn-rtc-class': roomServiceType === EduRoomServiceTypeEnum.MixRTCCDN,
        })}>
        <div className="main-section">
          <HostStream {...dbtEvent} minimized={!minimizeWhiteboard} />
          <Whiteboard {...dbtEvent} minimized={minimizeWhiteboard}>
            <ScreenShareContainer />
          </Whiteboard>
        </div>
        <div
          className={cls({
            'podiums-section': 1,
            hide: streamUIStore.studentStreams.size === 0,
          })}>
          <Podiums />
        </div>
        <div
          className={cls({
            'im-section': 1,
            'with-podiums': streamUIStore.studentStreams.size > 0,
          })}>
          <ChatWidgetH5 visibleEmoji={true} />
          {showHandsUp ? <HandsUp /> : null}
        </div>
      </div>
      <DialogContainer />
      <ToastContainer />
      <ExtensionAppContainer />
    </Room>
  );
});
