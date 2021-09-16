import {
  ControlTool,
  EduMediaStream,
  useGlobalContext,
  useRoomContext,
  useSmallClassVideoControlContext,
  usePrivateChatContext,
  useStreamListContext,
  useUserListContext,
  useVideoControlContext,
  usePretestContext,
  useVolumeContext,
} from 'agora-edu-core';
import { observer } from 'mobx-react';
import * as React from 'react';
import { useMemo } from 'react';
import { CameraPlaceHolder, VideoMarqueeList, VideoPlayer, VolumeIndicator } from '~ui-kit';
import { RendererPlayer } from '~utilities/renderer-player';
import { useUIStore } from '@/infra/hooks';

export const CustomizeVolumeIndicator = observer(({ streamUuid }: { streamUuid: any }) => {
  const { speakers } = useVolumeContext();
  return <VolumeIndicator volume={speakers.get(+streamUuid) || 0} />;
});

export const VideoPlayerTeacher = observer(
  ({ style, className, controlPlacement = 'left', placement = 'left' }: any) => {
    const {
      // teacherStream: userStream,
      onCameraClick,
      onMicClick,
      onSendStar,
      onWhiteboardClick,
      onOffPodiumClick,
      onOffAllPodiumClick,
      // sceneVideoConfig,
      canHoverHideOffAllPodium,
    } = useVideoControlContext();
    const { teacherStream: userStream } = useStreamListContext();
    const { controlTools, isHost } = useUserListContext();

    const { roomInfo } = useRoomContext();

    const { eduRole2UIRole } = useUIStore();

    const { isMirror } = usePretestContext();

    return (
      <VideoPlayer
        isMirror={isMirror}
        isHost={isHost}
        hideOffPodium={true}
        username={userStream.account}
        stars={userStream.stars}
        uid={userStream.userUuid}
        micEnabled={userStream.audio}
        cameraEnabled={userStream.video}
        hideControl={userStream.hideControl}
        micDevice={userStream.micDevice}
        cameraDevice={userStream.cameraDevice}
        isLocal={userStream.isLocal}
        online={userStream.online}
        isOnPodium={userStream.onPodium}
        hasStream={userStream.hasStream}
        whiteboardGranted={userStream.whiteboardGranted}
        hideBoardGranted={true}
        hideStars={true}
        micVolume={userStream.micVolume}
        hideOffAllPodium={!controlTools.includes(ControlTool.offPodiumAll)}
        canHoverHideOffAllPodium={canHoverHideOffAllPodium}
        onOffAllPodiumClick={onOffAllPodiumClick!}
        onCameraClick={onCameraClick}
        onMicClick={onMicClick}
        onWhiteboardClick={onWhiteboardClick}
        onSendStar={onSendStar}
        controlPlacement={controlPlacement}
        placement={placement}
        onOffPodiumClick={onOffPodiumClick}
        userType={eduRole2UIRole(roomInfo.userRole)}
        streamUuid={userStream.streamUuid}
        className={className}
        renderVolumeIndicator={() => (
          <CustomizeVolumeIndicator streamUuid={userStream.streamUuid} />
        )}
        style={style}>
        {
          <>
            {userStream.renderer && userStream.video ? (
              <RendererPlayer
                key={
                  userStream.renderer && userStream.renderer.videoTrack
                    ? userStream.renderer.videoTrack.getTrackId()
                    : ''
                }
                track={userStream.renderer}
                id={userStream.streamUuid}
                className="rtc-video"
              />
            ) : null}
            <CameraPlaceHolder state={userStream.holderState} />
          </>
        }
      </VideoPlayer>
    );
  },
);

export type VideoProps = {
  controlPlacement: 'left' | 'bottom';
  style?: any;
  className?: string;
};

export const VideoPlayerStudent: React.FC<VideoProps> = observer(
  ({ controlPlacement, style, className }) => {
    const {
      // firstStudent: userStream,
      onCameraClick,
      onMicClick,
      onSendStar,
      onWhiteboardClick,
      // sceneVideoConfig,
      onOffPodiumClick,
    } = useVideoControlContext();

    const { roomInfo } = useRoomContext();

    const { eduRole2UIRole } = useUIStore();

    const { studentStreams } = useStreamListContext();

    const userStream = studentStreams[0];

    const { isHost } = useUserListContext();

    const { isMirror } = usePretestContext();

    return (
      <VideoPlayer
        isMirror={isMirror}
        isHost={isHost}
        hideOffPodium={true}
        username={userStream.account}
        stars={userStream.stars}
        uid={userStream.userUuid}
        micEnabled={userStream.audio}
        cameraEnabled={userStream.video}
        micDevice={userStream.micDevice}
        cameraDevice={userStream.cameraDevice}
        isLocal={userStream.isLocal}
        online={userStream.online}
        isOnPodium={userStream.onPodium}
        hasStream={userStream.hasStream}
        whiteboardGranted={userStream.whiteboardGranted}
        hideStars={true}
        // micVolume={userStream.micVolume}
        streamUuid={userStream.streamUuid}
        hideControl={userStream.hideControl}
        onCameraClick={onCameraClick}
        onMicClick={onMicClick}
        onWhiteboardClick={onWhiteboardClick}
        onSendStar={onSendStar}
        onOffPodiumClick={onOffPodiumClick}
        controlPlacement={controlPlacement}
        placement={controlPlacement}
        style={style}
        className={className}
        showGranted={true}
        renderVolumeIndicator={() => (
          <CustomizeVolumeIndicator streamUuid={userStream.streamUuid} />
        )}
        userType={eduRole2UIRole(roomInfo.userRole)}>
        {
          <>
            {userStream.renderer && userStream.video ? (
              <RendererPlayer
                key={
                  userStream.renderer && userStream.renderer.videoTrack
                    ? userStream.renderer.videoTrack.getTrackId()
                    : ''
                }
                track={userStream.renderer}
                id={userStream.streamUuid}
                className="rtc-video"
              />
            ) : null}
            <CameraPlaceHolder state={userStream.holderState} />
          </>
        }
      </VideoPlayer>
    );
  },
);

export const VideoMarqueeStudentContainer = observer(() => {
  const {
    onCameraClick,
    onMicClick,
    onSendStar,
    onWhiteboardClick,
    onOffPodiumClick,
    studentStreams,
    // sceneVideoConfig,
    // firstStudent
  } = useSmallClassVideoControlContext();

  const { roomInfo } = useRoomContext();

  const { isHost, controlTools } = useUserListContext();

  const firstStudentStream = studentStreams[0];

  const videoStreamList = useMemo(() => {
    return studentStreams.reduce((acc: any[], stream: EduMediaStream) => {
      const streamItem = {
        isHost: isHost,
        username: stream.account,
        stars: stream.stars,
        uid: stream.userUuid,
        micEnabled: stream.audio,
        cameraEnabled: stream.video,
        whiteboardGranted: stream.whiteboardGranted,
        controlPlacement: 'bottom' as any,
        placement: 'bottom' as any,
        hideControl: stream.hideControl,
        canHoverHideOffAllPodium: true,
        hasStream: stream.hasStream,
        online: stream.online,
        isLocal: stream.isLocal,
        isOnPodium: stream.onPodium,
        micDevice: stream.micDevice,
        cameraDevice: stream.cameraDevice,
        streamUuid: stream.streamUuid,
        hideBoardGranted: !controlTools.includes(ControlTool.grantBoard),
        renderVolumeIndicator: () => <CustomizeVolumeIndicator streamUuid={stream.streamUuid} />,
        children: (
          <>
            {stream.renderer && stream.video ? (
              <RendererPlayer
                key={
                  stream.renderer && stream.renderer.videoTrack
                    ? stream.renderer.videoTrack.getTrackId()
                    : ''
                }
                track={stream.renderer}
                id={stream.streamUuid}
                className="rtc-video"
              />
            ) : null}
            <CameraPlaceHolder state={stream.holderState} />
          </>
        ),
      };
      if (stream.userUuid === roomInfo.userUuid) {
        acc = [streamItem].concat(acc);
      } else {
        acc = acc.concat([streamItem]);
      }
      return acc;
    }, []);
  }, [firstStudentStream, studentStreams, isHost, controlTools.includes(ControlTool.offPodium)]);

  const { onStartPrivateChat, onStopPrivateChat, inPrivateConversation } = usePrivateChatContext();

  const onPrivateChat = async (toUuid: string | number) => {
    if (inPrivateConversation) {
      await onStopPrivateChat(`${toUuid}`);
    } else {
      await onStartPrivateChat(`${toUuid}`);
    }
  };

  const { sceneType } = useRoomContext();

  const { eduRole2UIRole } = useUIStore();

  return videoStreamList.length ? (
    <div className="video-marquee-pin big-class">
      <VideoMarqueeList
        teacherStreams={[]}
        hideStars={sceneType === 2}
        videoStreamList={videoStreamList}
        userType={eduRole2UIRole(roomInfo.userRole)}
        onCameraClick={onCameraClick}
        onMicClick={onMicClick}
        onSendStar={onSendStar}
        onWhiteboardClick={onWhiteboardClick}
        onOffPodiumClick={onOffPodiumClick}
        onPrivateChat={onPrivateChat}
        roomType={'big-class'}
      />
    </div>
  ) : null;
});

export const MidVideoMarqueeContainer = observer(() => {
  const { teacherStream: userStream } = useStreamListContext();

  const {
    onCameraClick,
    onMicClick,
    onSendStar,
    onWhiteboardClick,
    onOffPodiumClick,
    studentStreams,
    // sceneVideoConfig,
    // firstStudent
  } = useSmallClassVideoControlContext();

  const { isHost, controlTools } = useUserListContext();

  const { isMirror } = usePretestContext();

  const firstStudentStream = studentStreams[0];

  const videoStreamList = useMemo(() => {
    return studentStreams.map((stream: EduMediaStream) => ({
      isHost: isHost,
      username: stream.account,
      stars: stream.stars,
      uid: stream.userUuid,
      micEnabled: stream.audio,
      cameraEnabled: stream.video,
      whiteboardGranted: stream.whiteboardGranted,
      controlPlacement: 'bottom' as any,
      placement: 'bottom' as any,
      hideControl: stream.hideControl,
      canHoverHideOffAllPodium: true,
      hasStream: stream.hasStream,
      online: stream.online,
      isLocal: stream.isLocal,
      // TODO: isMirror is consider as part of camera model state in future refactor plain.
      isMirror: stream.isLocal ? isMirror : false,
      isOnPodium: stream.onPodium,
      micDevice: stream.micDevice,
      cameraDevice: stream.cameraDevice,
      streamUuid: stream.streamUuid,
      hideBoardGranted: !controlTools.includes(ControlTool.grantBoard),
      renderVolumeIndicator: () => <CustomizeVolumeIndicator streamUuid={stream.streamUuid} />,
      children: (
        <>
          {stream.renderer && stream.video ? (
            <RendererPlayer
              key={
                stream.renderer && stream.renderer.videoTrack
                  ? stream.renderer.videoTrack.getTrackId()
                  : ''
              }
              track={stream.renderer}
              id={stream.streamUuid}
              className="rtc-video"
            />
          ) : null}
          <CameraPlaceHolder state={stream.holderState} />
        </>
      ),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    firstStudentStream,
    studentStreams,
    isHost,
    isMirror,
    controlTools.includes(ControlTool.offPodium),
  ]);

  const { onStartPrivateChat, onStopPrivateChat, inPrivateConversation } = usePrivateChatContext();

  const onPrivateChat = async (toUuid: string | number) => {
    if (inPrivateConversation) {
      await onStopPrivateChat(`${toUuid}`);
    } else {
      await onStartPrivateChat(`${toUuid}`);
    }
  };

  const { sceneType } = useRoomContext();

  const { roomInfo, roomProperties } = useRoomContext();

  const { eduRole2UIRole } = useUIStore();

  const { onOffAllPodiumClick } = useVideoControlContext();

  const teacherVideoList = useMemo(() => {
    if (!userStream.online) return [];
    return [userStream].map((stream: EduMediaStream) => ({
      isHost: isHost,
      hideOffPodium: true,
      username: stream.account,
      stars: stream.stars,
      uid: stream.userUuid,
      micEnabled: stream.audio,
      cameraEnabled: stream.video,
      hideControl: stream.hideControl,
      micDevice: stream.micDevice,
      cameraDevice: stream.cameraDevice,
      isLocal: stream.isLocal,
      isMirror: stream.isLocal ? isMirror : false,
      online: stream.online,
      isOnPodium: stream.onPodium,
      hasStream: stream.hasStream,
      whiteboardGranted: false,
      hideBoardGranted: true,
      hideStars: true,
      streamUuid: stream.streamUuid,
      hideOffAllPodium: !controlTools.includes(ControlTool.offPodiumAll),
      controlPlacement: 'bottom' as any,
      placement: 'bottom' as any,
      canHoverHideOffAllPodium: true,
      renderVolumeIndicator: () => <CustomizeVolumeIndicator streamUuid={stream.streamUuid} />,
      onOffAllPodiumClick: onOffAllPodiumClick,
      // hideBoardGranted: !controlTools.includes(ControlTool.grantBoard),
      children: (
        <>
          {stream.renderer && stream.video ? (
            <RendererPlayer
              key={
                stream.renderer && stream.renderer.videoTrack
                  ? stream.renderer.videoTrack.getTrackId()
                  : ''
              }
              track={stream.renderer}
              id={stream.streamUuid}
              className="rtc-video"
            />
          ) : null}
          <CameraPlaceHolder state={stream.holderState} />
        </>
      ),
    }));
  }, [
    isMirror,
    userStream,
    userStream.online,
    onOffAllPodiumClick,
    // studentStreams,
    isHost,
    controlTools.includes(ControlTool.offPodium),
  ]);

  // const {
  //   teacherStream,
  // } = useTeacherVideoPlayerContext()

  return videoStreamList.length || teacherVideoList.length ? (
    <div className="video-marquee-pin">
      <VideoMarqueeList
        openCarousel={!!roomProperties.carousel?.state}
        teacherStreams={teacherVideoList.length ? teacherVideoList : []}
        hideStars={sceneType === 2}
        videoStreamList={videoStreamList.length ? videoStreamList : []}
        userType={eduRole2UIRole(roomInfo.userRole)}
        onCameraClick={onCameraClick}
        onMicClick={onMicClick}
        onSendStar={onSendStar}
        onWhiteboardClick={onWhiteboardClick}
        onOffPodiumClick={onOffPodiumClick}
        onPrivateChat={onPrivateChat}
        roomType="mid-class"
      />
    </div>
  ) : null;
});

export const VideoList = observer(() => {
  const { isFullScreen } = useGlobalContext();

  return (
    <>
      <VideoPlayerTeacher className={isFullScreen ? 'full-teacher-1v1' : 'teacher-1v1'} />
      <VideoPlayerStudent
        className={isFullScreen ? 'full-student-1v1' : 'student-1v1'}
        controlPlacement="left"
      />
    </>
  );
});
