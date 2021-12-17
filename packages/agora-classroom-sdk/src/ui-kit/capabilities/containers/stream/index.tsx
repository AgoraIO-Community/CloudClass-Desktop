import { CameraPlaceholderType, EduRoleTypeEnum, EduStream, EduStreamUI } from 'agora-edu-core';
import { observer } from 'mobx-react';
import React, { CSSProperties, ReactNode, useEffect, useRef } from 'react';
import { useStore } from '~hooks/use-edu-stores';
import classnames from 'classnames';
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
import WaveArmSVGA from './assets/svga/hands-up.svga';
import RewardSound from './assets/audio/reward.mp3';

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
      // <StreamPlayerOverlay stream={stream}>
      <div style={style} className={cls}>
        <CameraPlaceHolder state={CameraPlaceholderType.notpresent} text={''} />
      </div>
      // </StreamPlayerOverlay>
    );
  },
);

type TrackPlayerProps = {
  stream: EduStream;
  style?: CSSProperties;
  className?: string;
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
  ({ style, stream, className }) => {
    const { classroomStore } = useStore();
    const { streamStore } = classroomStore;
    const { setupRemoteVideo } = streamStore;

    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (ref.current) {
        setupRemoteVideo(stream, ref.current);
      }
    }, [stream, setupRemoteVideo]);

    return <div style={style} className={className} ref={ref}></div>;
  },
);

const LocalStreamPlayerVolume = observer(({ stream }: { stream: EduStreamUI }) => {
  const { streamUIStore } = useStore();
  const { localVolume } = streamUIStore;

  return (
    <AudioVolume
      isMicMuted={stream.isMicMuted}
      currentVolume={Math.floor(localVolume * 10)}
      className={stream.micIconType}
    />
  );
});

const RemoteStreamPlayerVolume = observer(({ stream }: { stream: EduStreamUI }) => {
  const { streamUIStore } = useStore();
  const { streamVolumes } = streamUIStore;

  const volumePercentage = streamVolumes.get(stream.stream.streamUuid) || 0;

  return (
    <AudioVolume
      isMicMuted={stream.isMicMuted}
      currentVolume={Math.floor(volumePercentage * 10)}
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
              hoverType={tool.hoverIconType}
              type={tool.iconType}
              size={22}
              onClick={tool.interactable ? tool.onClick : () => {}}
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
              hoverType={tool.hoverIconType}
              type={tool.iconType}
              size={22}
              onClick={tool.onClick}
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
  }: {
    stream: EduStreamUI;
    className?: string;
    children: ReactNode;
  }) => {
    const { streamUIStore } = useStore();
    const { toolbarPlacement } = streamUIStore;

    const cls = classnames({
      [`video-player-overlay`]: 1,
      [`${className}`]: !!className,
    });

    return (
      <Popover
        // trigger={'click'} // 调试使用
        align={{
          offset: [-8, 0],
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
        <div className={cls}>
          <StreamPlayerCameraPlaceholder stream={stream} />
          {children ? children : null}
          <AwardAnimations stream={stream} />
          <div className="top-right-info">
            <StreamPlayerOverlayAwardNo stream={stream} />
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
            <StreamPlayerWhiteboardGranted stream={stream} />
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
  }: {
    stream: EduStreamUI;
    className?: string;
    style?: CSSProperties;
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
      <StreamPlayerOverlay stream={stream}>
        {stream.stream.isLocal ? (
          <LocalTrackPlayer className={cls} style={style} stream={stream.stream} />
        ) : (
          <RemoteTrackPlayer className={cls} style={style} stream={stream.stream} />
        )}
      </StreamPlayerOverlay>
    );
  },
);
