import { useStore } from '@classroom/infra/hooks/ui-store';
import {
  CameraPlaceholderType,
  EduStreamUI,
  VideoPlacement,
} from '@classroom/infra/stores/common/stream/struct';
import { EduRoleTypeEnum } from 'agora-edu-core';
import classnames from 'classnames';
import { debounce } from 'lodash';
import { observer } from 'mobx-react';
import React, {
  useRef,
  CSSProperties,
  FC,
  Fragment,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import useMeasure from 'react-use-measure';
import {
  AudioVolume,
  CameraPlaceHolder,
  SoundPlayer,
  SvgaPlayer,
  SvgIconEnum,
  SvgImg,
} from '@classroom/ui-kit';
import { useDebounce } from '@classroom/ui-kit/utilities/hooks';
import RewardSound from './assets/audio/reward.mp3';
import RewardSVGA from './assets/svga/reward.svga';
import { DragableContainer, DragableStream } from './draggable-stream';
import './index.css';
import { StreamPlayerToolbar } from './stream-tool';
import { TrackPlayer } from './track-player';
import { AGRenderMode } from 'agora-rte-sdk';

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
      [`${className}`]: !!className,
    });

    return (
      <div style={style} className={cls}>
        <CameraPlaceHolder state={CameraPlaceholderType.notpresent} text={''} />
      </div>
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

const StreamPlayerWhiteboardGranted = observer(({ stream }: { stream: EduStreamUI }) => {
  const {
    streamUIStore: { whiteboardGrantUsers },
  } = useStore();

  const isTeacherOrAssistant = [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(
    stream.role,
  );

  return (
    <>
      {!isTeacherOrAssistant && whiteboardGrantUsers.has(stream.fromUser.userUuid) ? (
        <SvgImg size={22} type={SvgIconEnum.AUTHORIZED_SOLID} colors={{ iconPrimary: '#FFF500' }} />
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
          <SvgImg className="stars" type={SvgIconEnum.STAR} colors={{ iconPrimary: '#f58723' }} />
          <span className="stars-label">x {awards(stream)}</span>
        </>
      ) : null}
    </>
  );
});

export const StreamPlayerCameraPlaceholder = observer(({ stream }: { stream: EduStreamUI }) => {
  const { streamUIStore } = useStore();
  const { cameraPlaceholder } = streamUIStore;
  return (
    <CameraPlaceHolder style={{ position: 'absolute', top: 0 }} state={cameraPlaceholder(stream)} />
  );
});

const StreamPlaceholderWaveArmPlaceholder = observer(({ stream }: { stream: EduStreamUI }) => {
  const { streamUIStore } = useStore();
  const { isWaveArm } = streamUIStore;
  return isWaveArm(stream) ? <div className="wave-arm-placeholder"></div> : null;
});

const StreamPlayerOverlayName = observer(({ stream }: { stream: EduStreamUI }) => {
  return (
    <span title={stream.stream.fromUser.userName} className="username2 fcr-pointer-events-auto">
      {stream.stream.fromUser.userName}
    </span>
  );
});

export const StreamPlayerOverlay = observer(({ stream }: { stream: EduStreamUI }) => {
  const { streamUIStore } = useStore();
  const { layerItems } = streamUIStore;

  const rewardVisible = layerItems && layerItems.includes('reward');

  const grantVisible = layerItems && layerItems.includes('grant');

  return (
    <div className="video-player-overlay fcr-z-10 fcr-pointer-events-none">
      <AudioVolumeEffect stream={stream} minTriggerVolume={50} />
      <AwardAnimations stream={stream} />
      <div className="top-right-info">
        {rewardVisible && <StreamPlayerOverlayAwardNo stream={stream} />}
      </div>
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
      <div className="bottom-right-info">
        {grantVisible && <StreamPlayerWhiteboardGranted stream={stream} />}
      </div>
      <StreamPlaceholderWaveArmPlaceholder stream={stream} />
    </div>
  );
});

export const StreamPlayer: FC<{
  stream: EduStreamUI;
  renderAt: VideoPlacement;
  style?: CSSProperties;
  toolbarDisabled?: boolean;
  renderMode?: AGRenderMode;
}> = observer(({ stream, style, renderAt, toolbarDisabled, renderMode }) => {
  const { streamWindowUIStore } = useStore();
  const { visibleStream } = streamWindowUIStore;
  const hasDetached = visibleStream(stream.stream.streamUuid);
  const isBarPlayer = renderAt === 'Bar';
  const shouldRenderVideo = renderAt === stream.renderAt;
  // during dragging
  const invisible = hasDetached && isBarPlayer;

  // should render an empty DOM instead of the stream video, which has the same dimensions to the stream video
  // when:
  // the stream video is detached from bar
  // and
  // the current player is render at bar
  const [toolbarVisible, setToolbarVisible] = useState(false);

  const handleMouseEnter = () => {
    setToolbarVisible(true);
  };
  const handleMouseLeave = () => {
    setToolbarVisible(false);
  };

  return (
    <div
      className="fcr-stream-player-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      {!invisible && (
        <React.Fragment>
          <StreamPlayerCameraPlaceholder stream={stream} />
          {shouldRenderVideo && <TrackPlayer stream={stream} renderMode={renderMode} />}
          {shouldRenderVideo && <StreamPlayerOverlay stream={stream} />}
          {shouldRenderVideo && !toolbarDisabled && (
            <StreamPlayerToolbar stream={stream} visible={toolbarVisible} />
          )}
        </React.Fragment>
      )}
      <DragableContainer stream={stream} />
      <MeasuerContainer streamUuid={stream.stream.streamUuid} style={style} />
    </div>
  );
});

const ANIMATION_DELAY = 500;

export const CarouselGroup = observer(
  ({
    videoWidth,
    videoHeight,
    gap,
    carouselStreams,
  }: {
    videoWidth: number;
    videoHeight: number;
    carouselStreams: EduStreamUI[];
    gap: number;
  }) => {
    const fullWith = (videoWidth + gap) * carouselStreams.length - gap + 2;

    const width = useDebounce(carouselStreams.length ? fullWith : 0, ANIMATION_DELAY);

    return (
      <TransitionGroup className="fcr-flex fcr-overflow-hidden" style={{ width }}>
        {carouselStreams.map((stream: EduStreamUI, idx: number) => {
          const style = {
            marginRight: idx === carouselStreams.length - 1 ? 0 : gap - 2,
          };

          const playerStyle = {
            width: videoWidth,
            height: videoHeight,
          };

          return (
            <CSSTransition
              key={`carouse-${stream.stream.streamUuid}`}
              timeout={ANIMATION_DELAY}
              classNames="stream-player">
              <DragableStream stream={stream} style={style} playerStyle={playerStyle} />
            </CSSTransition>
          );
        })}
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
          <SvgImg type={SvgIconEnum.BACKWARD} size={35} />
        </div>
      </CSSTransition>
      <CSSTransition timeout={ANIMATION_DELAY} classNames="carousel-nav" in={visible}>
        <div className="carousel-next" onClick={onNext}>
          <SvgImg type={SvgIconEnum.FORWARD} size={35} />
        </div>
      </CSSTransition>
    </Fragment>
  );
};

export const MeasuerContainer: FC<{
  streamUuid: string;
  style?: CSSProperties;
}> = observer(({ streamUuid, style }) => {
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
  return <div className="stream-player-placement" style={style} ref={ref} />;
});
const AudioVolumeEffect = observer(
  ({
    stream,
    duration = 3000,
    minTriggerVolume = 35,
  }: {
    stream: EduStreamUI;
    duration?: number;
    minTriggerVolume?: number;
  }) => {
    const { streamUIStore } = useStore();
    const { localVolume, remoteStreamVolume, localMicOff } = streamUIStore;
    const [showAudioVolumeEffect, setShowAudioVolumeEffect] = useState(false);
    const timer = useRef<number | null>(null);
    const showAudioEffect = () => {
      setShowAudioVolumeEffect(true);
      if (timer.current) {
        window.clearTimeout(timer.current);
      }
      timer.current = window.setTimeout(() => {
        setShowAudioVolumeEffect(false);
        timer.current = null;
      }, duration);
    };
    useEffect(() => {
      if (stream.stream.isLocal) {
        if (localVolume > minTriggerVolume && !localMicOff) {
          showAudioEffect();
        }
      } else {
        const remoteVolume = remoteStreamVolume(stream);
        if (remoteVolume > minTriggerVolume && !stream.isMicMuted) {
          showAudioEffect();
        }
      }
    }, [localVolume, remoteStreamVolume(stream), localMicOff, stream.isMicMuted]);
    return showAudioVolumeEffect ? <div className={'fcr-audio-volume-effect'}></div> : null;
  },
);
