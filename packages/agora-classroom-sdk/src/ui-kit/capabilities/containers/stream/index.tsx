import { EduClassroomConfig, EduRoleTypeEnum, EduStream } from 'agora-edu-core';
import { observer } from 'mobx-react';
import React, {
  CSSProperties,
  FC,
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useStore } from '~hooks/use-edu-stores';
import classnames from 'classnames';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import useMeasure from 'react-use-measure';
import { useDebounce } from '~ui-kit/utilities/hooks';
import './index.css';
import {
  CameraPlaceHolder,
  Popover,
  SvgaPlayer,
  SvgImg,
  Tooltip,
  SoundPlayer,
  SvgIcon,
  AudioVolume,
} from '~ui-kit';
import RewardSVGA from './assets/svga/reward.svga';
import RewardSound from './assets/audio/reward.mp3';
import { EduStreamUI } from '@/infra/stores/common/stream/struct';
import { CameraPlaceholderType } from '@/infra/stores/common/type';
import { DragableContainer } from './room-mid-player';
import { debounce } from 'lodash';
import { AgoraRteMediaSourceState, MediaPlayerEvents } from 'agora-rte-sdk';

export const AwardAnimations = observer(({ stream }: { stream: EduStreamUI }) => {
  const {
    streamUIStore: { streamAwardAnims, removeAward },
  } = useStore();

  return (
    <div className="center-reward">
      {streamAwardAnims(stream).map((anim: { id: string; userUuid: string }) => {
        return (
          <SvgaPlayer
            key={anim.id}
            style={{ position: 'absolute' }}
            url={RewardSVGA}
            onFinish={() => {
              removeAward(anim.id);
            }}></SvgaPlayer>
        );
      })}

      {streamAwardAnims(stream).map((anim: { id: string; userUuid: string }) => {
        return <SoundPlayer url={RewardSound} key={anim.id} />;
      })}
    </div>
  );
});

export const StreamPlaceholder = observer(
  ({ className, style }: { role: EduRoleTypeEnum; className?: string; style?: CSSProperties }) => {
    const cls = classnames({
      [`video-player`]: 1,
      [`${className}`]: !!className,
    });

    return (
      <div style={style} className={cls}>
        <CameraPlaceHolder state={CameraPlaceholderType.notpresent} text={''} />
      </div>
    );
  },
);

type RemoteTrackPlayerProps = {
  stream: EduStream;
  style?: CSSProperties;
  className?: string;
  mirrorMode?: boolean;
  canSetupVideo?: boolean;
  isFullScreen?: boolean;
};

type LocalTrackPlayerProps = Omit<RemoteTrackPlayerProps, 'stream'>;

export const LocalTrackPlayer: React.FC<LocalTrackPlayerProps> = observer(
  ({ style, className, canSetupVideo = true }) => {
    const {
      streamUIStore: { setupLocalVideo, isMirror },
    } = useStore();
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (ref.current && canSetupVideo) {
        setupLocalVideo(ref.current, isMirror);
      }
    }, [isMirror, setupLocalVideo, canSetupVideo]);

    return <div style={style} className={className} ref={ref}></div>;
  },
);

export const RemoteTrackPlayer: React.FC<RemoteTrackPlayerProps> = observer(
  ({ style, stream, className, mirrorMode = true, canSetupVideo = true }) => {
    const [readyPlay, setReadyPlay] = useState(false);
    const [interactiveNeeded, setInteractiveNeeded] = useState(false);
    const { classroomStore } = useStore();
    const { streamStore, mediaStore, roomStore } = classroomStore;
    const { setupRemoteVideo, muteRemoteAudioStream, muteRemoteVideoStream } = streamStore;
    const { isCDNMode } = roomStore;

    const rtcRef = useRef<HTMLDivElement | null>(null);
    const cdnRef = useRef<HTMLDivElement | null>(null);

    const handleReadyPlay = () => setReadyPlay(true);
    const handleInteractiveNeeded = (interactiveNeeded: boolean) =>
      setInteractiveNeeded(interactiveNeeded);

    const handlePlay = useCallback(async () => {
      const { streamHlsUrl } = stream;
      if (!streamHlsUrl || !isCDNMode) {
        return;
      }
      const player = mediaStore.getMediaTrackPlayer(streamHlsUrl);
      if (!player) {
        return;
      }
      player.play(
        stream.videoSourceState === AgoraRteMediaSourceState.started,
        stream.audioSourceState === AgoraRteMediaSourceState.started,
      );
    }, [mediaStore, stream]);

    useEffect(() => {
      if (cdnRef.current && canSetupVideo && stream.streamHlsUrl && isCDNMode) {
        muteRemoteVideoStream(stream, true);
        muteRemoteAudioStream(stream, true);
        mediaStore.setupMediaStream(
          stream.streamHlsUrl,
          cdnRef.current,
          true,
          stream.audioSourceState === AgoraRteMediaSourceState.started,
          stream.videoSourceState === AgoraRteMediaSourceState.started,
        );
      }
      if (rtcRef.current && canSetupVideo && stream.streamHlsUrl && !isCDNMode) {
        const mediaTrackPlayer = mediaStore.getMediaTrackPlayer(stream.streamHlsUrl);
        if (mediaTrackPlayer) {
          mediaTrackPlayer.dispose();
        }
        muteRemoteVideoStream(stream, false);
        muteRemoteAudioStream(stream, false);
      }
      if (rtcRef.current && canSetupVideo && !isCDNMode) {
        setupRemoteVideo(stream, rtcRef.current, mirrorMode);
      }
    }, [
      stream,
      setupRemoteVideo,
      muteRemoteAudioStream,
      muteRemoteVideoStream,
      canSetupVideo,
      isCDNMode,
      mediaStore,
    ]);

    useEffect(() => {
      const { streamHlsUrl } = stream;
      if (!streamHlsUrl || !isCDNMode) {
        return;
      }
      const player = mediaStore.getMediaTrackPlayer(streamHlsUrl);
      if (!player) {
        return;
      }
      player.on(MediaPlayerEvents.ReadyToPlay, handleReadyPlay);
      player.on(MediaPlayerEvents.InteractiveNeeded, handleInteractiveNeeded);
      return () => {
        player.off(MediaPlayerEvents.ReadyToPlay, handleReadyPlay);
        player.off(MediaPlayerEvents.InteractiveNeeded, handleInteractiveNeeded);
      };
    }, [stream, mediaStore, handleReadyPlay, handleInteractiveNeeded]);
    return (
      <>
        <div
          style={style}
          className={`${className} ${isCDNMode ? '' : 'hidden'}`}
          ref={cdnRef}></div>
        <div
          style={style}
          className={`${className} ${isCDNMode ? 'hidden ' : ''}`}
          ref={rtcRef}></div>
        {isCDNMode && !interactiveNeeded && !readyPlay ? (
          <div className="video-player-video-loading"></div>
        ) : null}
        {isCDNMode && interactiveNeeded ? (
          <div className="video-player-play-btn" onClick={handlePlay}></div>
        ) : null}
      </>
    );
  },
);

const LocalStreamPlayerVolume = observer(({ stream }: { stream: EduStreamUI }) => {
  const { streamUIStore } = useStore();
  const { localVolume, localMicOff } = streamUIStore;

  const isMicMuted = localMicOff ? true : stream.isMicMuted;

  return (
    <AudioVolume
      isMicMuted={isMicMuted}
      currentVolume={Math.floor(localVolume)}
      className={stream.micIconType}
    />
  );
});

const RemoteStreamPlayerVolume = observer(({ stream }: { stream: EduStreamUI }) => {
  const { streamUIStore } = useStore();
  const { remoteStreamVolume } = streamUIStore;

  const volumePercentage = remoteStreamVolume(stream);

  return (
    <AudioVolume
      isMicMuted={stream.isMicMuted}
      currentVolume={Math.floor(volumePercentage)}
      className={stream.micIconType}
    />
  );
});

export const LocalStreamPlayerTools = observer(
  ({ isFullScreen = true }: { isFullScreen?: boolean }) => {
    const { streamUIStore } = useStore();
    const { localStreamTools, toolbarPlacement, fullScreenToolTipPlacement } = streamUIStore;

    return localStreamTools.length > 0 ? (
      <div className={`video-player-tools`}>
        {localStreamTools.map((tool, key) => (
          <Tooltip
            key={key}
            title={tool.toolTip}
            placement={isFullScreen ? fullScreenToolTipPlacement : toolbarPlacement}>
            <span>
              <SvgIcon
                canHover={tool.interactable}
                style={tool.style}
                hoverType={tool.hoverIconType}
                type={tool.iconType}
                size={22}
                onClick={tool.interactable ? tool.onClick : () => { }}
              />
            </span>
          </Tooltip>
        ))}
      </div>
    ) : (
      <></>
    );
  },
);

export const RemoteStreamPlayerTools = observer(
  ({ stream, isFullScreen = true }: { stream: EduStreamUI; isFullScreen?: boolean }) => {
    const { streamUIStore } = useStore();
    const { remoteStreamTools, toolbarPlacement, fullScreenToolTipPlacement } = streamUIStore;
    const toolList = remoteStreamTools(stream);

    return toolList.length > 0 ? (
      <div className={`video-player-tools`}>
        {toolList.map((tool, idx) => (
          <Tooltip
            key={`${idx}`}
            title={tool.toolTip}
            placement={isFullScreen ? fullScreenToolTipPlacement : toolbarPlacement}>
            <span>
              <SvgIcon
                canHover={tool.interactable}
                style={tool.style}
                hoverType={tool.hoverIconType}
                type={tool.iconType}
                size={22}
                onClick={tool.interactable ? tool.onClick : () => { }}
              />
            </span>
          </Tooltip>
        ))}
      </div>
    ) : (
      <></>
    );
  },
);

const StreamPlayerWhiteboardGranted = observer(({ stream }: { stream: EduStreamUI }) => {
  const {
    streamUIStore: { whiteboardGrantUsers },
  } = useStore();
  const isTeacherOrAssistant = [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(EduClassroomConfig.shared.sessionInfo.role)

  return (
    <>
      {!isTeacherOrAssistant && whiteboardGrantUsers.has(stream.fromUser.userUuid) ? (
        <div className="bottom-right-granted"></div>
      ) : null}
    </>
  );
});

const StreamPlayerOverlayAwardNo = observer(({ stream }: { stream: EduStreamUI }) => {
  const {
    streamUIStore: { awards },
  } = useStore();
  return (
    <>
      {stream.role !== EduRoleTypeEnum.teacher ? (
        <>
          <SvgImg className="stars" type="star" />
          <span className="stars-label">x {awards(stream)}</span>
        </>
      ) : null}
    </>
  );
});

const StreamPlayerCameraPlaceholder = observer(
  ({ stream, canSetupVideo = true }: { stream: EduStreamUI; canSetupVideo?: boolean }) => {
    const { streamUIStore } = useStore();
    const { cameraPlaceholder } = streamUIStore;
    return (
      <CameraPlaceHolder
        style={{ position: 'absolute', top: 0 }}
        state={cameraPlaceholder(stream, canSetupVideo)}
        text={''}
      />
    );
  },
);

const StreamPlaceholderWaveArmPlaceholder = observer(({ stream }: { stream: EduStreamUI }) => {
  const { streamUIStore } = useStore();
  const { isWaveArm } = streamUIStore;
  return isWaveArm(stream) ? <div className="wave-arm-placeholder"></div> : null;
});

const StreamPlayerOverlayName = observer(({ stream }: { stream: EduStreamUI }) => {
  return (
    <span title={stream.stream.fromUser.userName} className="username2">
      {stream.stream.fromUser.userName}
    </span>
  );
});

export const StreamPlayerOverlay = observer(
  ({
    stream,
    className,
    children,
    isFullscreen = false,
    canSetupVideo = true,
  }: {
    stream: EduStreamUI;
    className?: string;
    children: ReactNode;
    isFullscreen?: boolean;
    canSetupVideo?: boolean;
  }) => {
    const { streamUIStore } = useStore();
    const { toolbarPlacement, layerItems, fullScreenToolbarPlacement } = streamUIStore;

    const rewardVisible = layerItems && layerItems.includes('reward');

    const grantVisible = layerItems && layerItems.includes('grant');

    const cls = classnames({
      [`video-player-overlay`]: 1,
      ['video-player-overlay-no-margin']: isFullscreen,
      [`${className}`]: !!className,
    });

    return (
      <Popover
        // trigger={'click'} // 调试使用
        align={{
          offset: isFullscreen ? [0, -58] : [0, -8],
        }}
        overlayClassName="video-player-tools-popover"
        content={
          canSetupVideo ? (
            stream.stream.isLocal ? (
              <LocalStreamPlayerTools isFullScreen={isFullscreen} />
            ) : (
              <RemoteStreamPlayerTools
                isFullScreen={isFullscreen}
                stream={stream}></RemoteStreamPlayerTools>
            )
          ) : null
        }
        placement={isFullscreen ? fullScreenToolbarPlacement : toolbarPlacement}>
        <div className={cls}>
          <StreamPlayerCameraPlaceholder canSetupVideo={canSetupVideo} stream={stream} />
          {children ? children : null}
          <AwardAnimations stream={stream} />
          <div className="top-right-info">
            {rewardVisible && <StreamPlayerOverlayAwardNo stream={stream} />}
          </div>
          {canSetupVideo && (
            <div className="bottom-left-info">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}>
                {stream.stream.isLocal ? (
                  <LocalStreamPlayerVolume stream={stream} />
                ) : (
                  <RemoteStreamPlayerVolume stream={stream} />
                )}
              </div>
              <StreamPlayerOverlayName stream={stream} />
            </div>
          )}
          <div className="bottom-right-info">
            {grantVisible && <StreamPlayerWhiteboardGranted stream={stream} />}
          </div>
          <StreamPlaceholderWaveArmPlaceholder stream={stream} />
        </div>
      </Popover>
    );
  },
);

export const StreamPlayer = observer(
  ({
    stream,
    className,
    style: css,
    isFullScreen = false,
    canSetupVideo = true,
  }: {
    stream: EduStreamUI;
    className?: string;
    style?: CSSProperties;
    isFullScreen?: boolean;
    canSetupVideo?: boolean;
  }) => {
    const { streamUIStore, widgetUIStore } = useStore();
    const { cameraPlaceholder } = streamUIStore;
    const cls = classnames({
      [`video-player`]: 1,
      [`${className}`]: !!className,
    });
    let style: CSSProperties = {
      ...css,
      ...(isFullScreen ? { width: '100%', height: '100%', flex: 1 } : {}),
    };

    if (cameraPlaceholder(stream, true) !== CameraPlaceholderType.none) {
      style = { ...css, visibility: 'hidden' };
    }
    return (
      <StreamPlayerOverlay
        canSetupVideo={canSetupVideo}
        isFullscreen={isFullScreen}
        className={isFullScreen ? 'video-player-fullscreen' : ''}
        stream={stream}>
        {stream.stream.isLocal ? (
          <LocalTrackPlayer
            canSetupVideo={canSetupVideo}
            className={cls}
            style={style}
            isFullScreen={isFullScreen}
          />
        ) : (
          <RemoteTrackPlayer
            className={cls}
            style={style}
            stream={stream.stream}
            mirrorMode={stream.isMirrorMode}
            canSetupVideo={canSetupVideo}
            isFullScreen={isFullScreen}
          />
        )}
      </StreamPlayerOverlay>
    );
  },
);

const ANIMATION_DELAY = 500;

export const CarouselGroup = observer(
  ({
    videoWidth,
    videoHeight,
    gap,
    carouselStreams,
    invisible,
    handleDBClick,
  }: {
    videoWidth: number;
    videoHeight: number;
    carouselStreams: EduStreamUI[];
    gap: number;
    invisible?: (streamUuid: string) => boolean;
    handleDBClick?: (stream: EduStreamUI) => void;
  }) => {
    const videoStreamStyle = useMemo(
      () => ({
        width: videoWidth,
        height: videoHeight,
      }),
      [videoWidth, videoHeight],
    );

    const fullWith = (videoWidth + gap) * carouselStreams.length - gap + 2;

    const width = useDebounce(carouselStreams.length ? fullWith : 0, ANIMATION_DELAY);

    return (
      <TransitionGroup className="flex overflow-hidden" style={{ width }}>
        {carouselStreams.map((stream: EduStreamUI, idx: number) => (
          <CSSTransition
            key={`${stream.stream.streamUuid}`}
            timeout={ANIMATION_DELAY}
            classNames="stream-player">
            <div
              style={{
                marginRight: idx === carouselStreams.length - 1 ? 0 : gap - 2,
                position: 'relative',
              }}>
              <MeasuerContainer streamUuid={stream.stream.streamUuid}>
                {invisible && invisible(stream.stream.streamUuid) ? (
                  <VisibilityDOM style={videoStreamStyle} />
                ) : (
                  <StreamPlayer
                    key={`carouse-${stream.stream.streamUuid}`}
                    stream={stream}
                    style={videoStreamStyle}></StreamPlayer>
                )}
                {invisible ? (
                  <DragableContainer
                    stream={stream}
                    visibleTools={!invisible(stream.stream.streamUuid)}
                    onDoubleClick={() => {
                      handleDBClick && handleDBClick(stream);
                    }}
                  />
                ) : null}
              </MeasuerContainer>
            </div>
          </CSSTransition>
        ))}
      </TransitionGroup>
    );
  },
);

export const NavGroup: FC<{ onNext: () => void; onPrev: () => void; visible: boolean }> = ({
  onNext,
  onPrev,
  visible,
}) => {
  const ANIMATION_DELAY = 200;
  return (
    <Fragment>
      <CSSTransition timeout={ANIMATION_DELAY} classNames="carousel-nav" in={visible}>
        <div className="carousel-prev" onClick={onPrev}>
          <SvgImg type="backward" size={35} />
        </div>
      </CSSTransition>
      <CSSTransition timeout={ANIMATION_DELAY} classNames="carousel-nav" in={visible}>
        <div className="carousel-next" onClick={onNext}>
          <SvgImg type="forward" size={35} />
        </div>
      </CSSTransition>
    </Fragment>
  );
};

export const VisibilityDOM = ({ style }: { style?: CSSProperties }) => {
  return <div style={style} className="invisible"></div>;
};

export const MeasuerContainer = observer(
  ({ children, streamUuid }: { children: ReactNode; streamUuid: string }) => {
    const [ref, bounds] = useMeasure();
    const {
      streamUIStore: { setStreamBoundsByStreamUuid },
    } = useStore();

    const handleStreamBoundsUpdate = useCallback(
      debounce((id, bounds) => {
        setStreamBoundsByStreamUuid(id, bounds);
      }, 330),
      [],
    );

    useEffect(
      debounce(() => {
        streamUuid && handleStreamBoundsUpdate(streamUuid, bounds);
      }, 330),
      [bounds],
    );
    return <div ref={ref}>{children}</div>;
  },
);
