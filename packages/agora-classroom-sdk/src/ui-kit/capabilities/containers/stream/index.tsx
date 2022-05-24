import { EduRoleTypeEnum, EduStream } from 'agora-edu-core';
import { observer } from 'mobx-react';
import React, { CSSProperties, FC, Fragment, ReactNode, useEffect, useMemo, useRef } from 'react';
import { useStore } from '~hooks/use-edu-stores';
import classnames from 'classnames';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
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
  transI18n,
} from '~ui-kit';
import RewardSVGA from './assets/svga/reward.svga';
import RewardSound from './assets/audio/reward.mp3';
import { EduStreamUI } from '@/infra/stores/common/stream/struct';
import { CameraPlaceholderType } from '@/infra/stores/common/type';
import { debounce } from 'lodash';

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
  ({
    className,
    style,
    role,
    flexProps,
    noText,
  }: {
    role: EduRoleTypeEnum;
    className?: string;
    style?: CSSProperties;
    flexProps?: any;
    noText?: boolean;
  }) => {
    const cls = classnames({
      [`video-player`]: 1,
      [`${className}`]: !!className,
    });

    let placeholderText = '';
    if (role === EduRoleTypeEnum.student) {
      const studentFirstLogin = flexProps?.studentFirstLogin;
      placeholderText = transI18n(
        studentFirstLogin ? 'placeholder.student_left' : 'placeholder.wait_student',
      );
    } else if (role === EduRoleTypeEnum.teacher) {
      const teacherFirstLogin = flexProps?.teacherFirstLogin;
      placeholderText = transI18n(
        teacherFirstLogin ? 'placeholder.teacher_left' : 'placeholder.wait_teacher',
      );
    }

    if (noText) {
      placeholderText = '';
    }

    return (
      // <StreamPlayerOverlay stream={stream}>
      <div style={style} className={cls}>
        <CameraPlaceHolder state={CameraPlaceholderType.notpresent} text={placeholderText} />
      </div>
      // </StreamPlayerOverlay>
    );
  },
);

type TrackPlayerProps = {
  stream: EduStream;
  style?: CSSProperties;
  className?: string;
  mirrorMode?: boolean;
};

export const LocalTrackPlayer: React.FC<TrackPlayerProps> = observer(
  ({ style, stream, className }) => {
    const {
      streamUIStore: { setupLocalVideo, isMirror },
    } = useStore();
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (ref.current) {
        setupLocalVideo(stream, ref.current, isMirror);
      }
    }, [stream, isMirror, setupLocalVideo]);

    return <div style={style} className={className} ref={ref}></div>;
  },
);

export const RemoteTrackPlayer: React.FC<TrackPlayerProps> = observer(
  ({ style, stream, className, mirrorMode = true }) => {
    const { classroomStore } = useStore();
    const { streamStore } = classroomStore;
    const { setupRemoteVideo } = streamStore;

    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (ref.current) {
        setupRemoteVideo(stream, ref.current, mirrorMode);
      }
    }, [stream, setupRemoteVideo]);

    return <div style={style} className={className} ref={ref}></div>;
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

const LocalStreamPlayerTools = observer(() => {
  const { streamUIStore } = useStore();
  const { localStreamTools, toolbarPlacement } = streamUIStore;

  return localStreamTools.length > 0 ? (
    <div className={`video-player-tools`}>
      {localStreamTools.map((tool, key) => (
        <Tooltip key={key} title={tool.toolTip} placement={toolbarPlacement}>
          <span>
            <SvgIcon
              canHover={tool.interactable}
              style={tool.style}
              // hoverType={tool.hoverIconType}
              type={tool.iconType}
              size={22}
              onClick={tool.interactable ? debounce(tool.onClick!, 300) : () => {}}
            />
          </span>
        </Tooltip>
      ))}
    </div>
  ) : (
    <></>
  );
});

const RemoteStreamPlayerTools = observer(({ stream }: { stream: EduStreamUI }) => {
  const { streamUIStore } = useStore();
  const { remoteStreamTools, toolbarPlacement } = streamUIStore;
  const toolList = remoteStreamTools(stream);

  return toolList.length > 0 ? (
    <div className={`video-player-tools`}>
      {toolList.map((tool, idx) => (
        <Tooltip key={`${idx}`} title={tool.toolTip} placement={toolbarPlacement}>
          <span>
            <SvgIcon
              canHover={tool.interactable}
              style={tool.style}
              // hoverType={tool.hoverIconType}
              type={tool.iconType}
              size={22}
              onClick={tool.interactable ? debounce(tool.onClick!, 300) : () => {}}
            />
          </span>
        </Tooltip>
      ))}
    </div>
  ) : (
    <></>
  );
});

const StreamPlayerWhiteboardGranted = observer(({ stream }: { stream: EduStreamUI }) => {
  const {
    streamUIStore: { whiteboardGrantUsers },
  } = useStore();
  return (
    <>
      {whiteboardGrantUsers.has(stream.fromUser.userUuid) ? (
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

const StreamPlayerCameraPlaceholder = observer(({ stream }: { stream: EduStreamUI }) => {
  const { streamUIStore } = useStore();
  const { cameraPlaceholder } = streamUIStore;
  return (
    <CameraPlaceHolder
      style={{ position: 'absolute', top: 0 }}
      state={cameraPlaceholder(stream)}
      text={''}
    />
  );
});

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

const StreamPlayerOverlay = observer(
  ({
    stream,
    className,
    children,
    offsetY,
    marginBottom,
  }: {
    stream: EduStreamUI;
    className?: string;
    children: ReactNode;
    offsetY?: number;
    marginBottom?: number;
  }) => {
    const { streamUIStore } = useStore();
    const { toolbarPlacement, layerItems } = streamUIStore;

    const rewardVisible = layerItems && layerItems.includes('reward');

    const grantVisible = layerItems && layerItems.includes('grant');

    const cls = classnames({
      [`video-player-overlay`]: 1,
      [`${className}`]: !!className,
    });

    return (
      <Popover
        // trigger={'click'} // 调试使用
        align={{
          offset: [0, offsetY ?? -8],
        }}
        overlayClassName="video-player-tools-popover"
        content={
          stream.stream.isLocal ? (
            <LocalStreamPlayerTools />
          ) : (
            <RemoteStreamPlayerTools stream={stream}></RemoteStreamPlayerTools>
          )
        }
        placement={toolbarPlacement}>
        <div className={cls} style={{ marginBottom }}>
          <StreamPlayerCameraPlaceholder stream={stream} />
          {children ? children : null}
          <AwardAnimations stream={stream} />
          <div className="top-right-info">
            {rewardVisible && <StreamPlayerOverlayAwardNo stream={stream} />}
          </div>
          <div className="bottom-left-info">
            <StreamPlayerOverlayName stream={stream} />
          </div>
          <div className="bottom-right-info">
            {grantVisible && <StreamPlayerWhiteboardGranted stream={stream} />}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginLeft: 6,
              }}>
              {stream.stream.isLocal ? (
                <LocalStreamPlayerVolume stream={stream} />
              ) : (
                <RemoteStreamPlayerVolume stream={stream} />
              )}
            </div>
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
    toolbarStyle,
  }: {
    stream: EduStreamUI;
    className?: string;
    style?: CSSProperties;
    toolbarStyle?: {
      offsetY?: number;
      marginBottom?: number;
    };
  }) => {
    const { streamUIStore } = useStore();
    const { cameraPlaceholder } = streamUIStore;
    const cls = classnames({
      [`video-player`]: 1,
      [`${className}`]: !!className,
    });

    let style: CSSProperties = { ...css };

    if (cameraPlaceholder(stream) !== CameraPlaceholderType.none) {
      style = { ...css, visibility: 'hidden' };
    }

    return (
      <StreamPlayerOverlay
        stream={stream}
        offsetY={toolbarStyle?.offsetY}
        marginBottom={toolbarStyle?.marginBottom}>
        {stream.stream.isLocal ? (
          <LocalTrackPlayer className={cls} style={style} stream={stream.stream} />
        ) : (
          <RemoteTrackPlayer
            className={cls}
            style={style}
            stream={stream.stream}
            mirrorMode={stream.isMirrorMode}
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
  }: {
    videoWidth: number;
    videoHeight: number;
    carouselStreams: EduStreamUI[];
    gap: number;
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
            <div style={{ marginRight: idx === carouselStreams.length - 1 ? 0 : gap - 2 }}>
              <StreamPlayer stream={stream} style={videoStreamStyle}></StreamPlayer>
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
