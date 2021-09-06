import classnames from 'classnames';
import React, { FC, ReactNode, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { v4 as uuidv4 } from 'uuid';
import { getMediaIconProps, Icon, MediaIcon } from '~components/icon';
import { Popover } from '~components/popover';
import { SvgaPlayer } from '~components/svga-player';
import { Tooltip } from '~components/tooltip';
import { usePrevious } from '~utilities/hooks';
// import { useMediaStore } from '../../../../agora-edu-core/src/context/core';
import { BaseProps } from '../interface/base-props';
import { SvgImg } from '../svg-img';
import './index.css';
import { VolumeIndicator } from './volume-indicator';
import { observer } from 'mobx-react';
import { COLOR_RULES } from '../../utilities/style-config';

export const CustomizeVolumeIndicator = ({
  streamUuid,
  volume,
}: {
  streamUuid: any;
  volume: number;
}) => {
  return <VolumeIndicator volume={volume} />;
};

// // TODO: 优化音量条
// export const StreamVolumeIndicator = observer(
//   ({ streamUuid }: { streamUuid: any }) => {
//     const speakers = new Map<any, any>();

//     const speaker = speakers.get(+streamUuid);

//     const currentVolume = speaker ?? 0;

//     return <VolumeIndicator volume={currentVolume} />;
//   },
// );

export interface BaseVideoPlayerProps {
  /**
   * 是否镜像
   */
  isMirror?: boolean;
  isHost?: boolean;
  /**
   * 用户的唯一标识
   */
  uid: string | number;
  /**
   * 用户的流id
   */
  streamUuid: string;
  /**
   * 摄像头关闭时的占位图
   */
  placeholder?: string | ReactNode;
  /**
   * 是否现实控制条
   */
  hideControl?: boolean;
  /**
   * 是否展示全体下台，默认 false
   */
  hideOffAllPodium?: boolean;
  /**
   * 是否你展示全体下讲台，默认 false
   */
  hideOffPodium?: boolean;
  /**
   * 是否展示star，默认 false
   */
  hideStars?: boolean;
  /**
   * 视频流类型 老师流 teacher 学生流 student
   */
  streamRoleType?: String;
  /**
   * hover 时控制条 展示的位置
   */
  controlPlacement: 'top' | 'right' | 'bottom' | 'left';
  /**
   * 学生获得的星星数量
   */
  stars?: number;
  /**
   * 用户的名称
   */
  username?: string;
  /**
   * 麦克风是否启用
   */
  micEnabled?: boolean;
  /**
   * 麦克风声音大小 0-1
   */
  micVolume?: number;
  /**
   * 摄像头是否启用
   */
  cameraEnabled?: boolean;
  /**
   * 是否授权操作白板
   */
  whiteboardGranted?: boolean;
  /**
   * 是否可点击上下台
   */
  canHoverHideOffAllPodium?: boolean;
  /**
   * 隐藏白板控制按钮
   */
  hideBoardGranted?: boolean;

  isOnPodium?: boolean;

  privateCallEnabled?: boolean;

  /**
   * 控制条中svg tooltip的位置
   */
  placement?: any;

  /**
   * 隐藏私密聊天按钮
   */
  hidePrivateChat?: boolean;
  /**
   * 在线状态
   */
  online?: boolean;
  hasStream?: boolean;
  userType?: 'student' | 'teacher' | 'assistant';
  isLocal?: boolean;
  cameraDevice?: number;
  micDevice?: number;
  showGranted?: boolean;
  roomType?: string;
  renderVolumeIndicator?: typeof CustomizeVolumeIndicator;
}

type VideoPlayerType = BaseVideoPlayerProps & BaseProps;

export interface VideoPlayerProps extends VideoPlayerType {
  /**
   * 是否是主持人，主持人可以操作所有人的摄像头，麦克风，授权白板操作权限，送出星星
   */
  /**
   * 点击摄像头的按钮时的回调
   */
  onCameraClick: (uid: string | number) => Promise<any>;
  /**
   * 点击麦克风按钮时的回调
   */
  onMicClick: (uid: string | number) => Promise<any>;
  /**
   * 全体下讲台
   */
  onOffAllPodiumClick?: () => Promise<any>;
  /**
   * 下讲台
   */
  onOffPodiumClick: (uid: string | number) => Promise<any>;
  /**
   * 点击白板操作授权按钮时的回调
   */
  onWhiteboardClick: (uid: string | number) => Promise<any>;
  /**
   * 发送星星给学生
   */
  onSendStar: (uid: string | number) => Promise<any>;
  /**
   * 私密语音聊天
   */
  onPrivateChat?: (uid: string | number) => Promise<any>;
}

interface AnimSvga {
  id: string;
}

export const VideoPlayer: FC<VideoPlayerProps> = ({
  isMirror = false,
  uid,
  children,
  className,
  placeholder,
  controlPlacement,
  stars = 0,
  username,
  micEnabled,
  streamUuid,
  micVolume = 0,
  cameraEnabled,
  whiteboardGranted,
  isHost = false,
  hideControl = false,
  hideOffAllPodium = true,
  hideOffPodium = false,
  hideStars = false,
  hideBoardGranted = false,
  privateCallEnabled = false,
  placement = 'bottom',
  canHoverHideOffAllPodium = false,
  online = false,
  hasStream = false,
  isLocal = false,
  isOnPodium = false,
  userType = 'student',
  streamRoleType = 'teacher',
  micDevice = 1,
  cameraDevice = 1,
  onCameraClick,
  onMicClick,
  onOffAllPodiumClick = () => console.log('on clear podiums'),
  onOffPodiumClick,
  onWhiteboardClick,
  onSendStar,
  hidePrivateChat = true,
  showGranted = false,
  onPrivateChat = (uid: string | number) => console.log('onPrivateChat', uid),
  renderVolumeIndicator = CustomizeVolumeIndicator,
  roomType,
  ...restProps
}) => {
  const [animList, setAnimList] = useState<AnimSvga[]>([]);
  const previousState = usePrevious<{ stars: number; uid: string | number }>({
    stars: stars,
    uid: `${uid}`,
  });
  const animListCb = useCallback(() => {
    setAnimList([
      ...animList,
      {
        id: uuidv4(),
      },
    ]);
  }, [animList, setAnimList]);

  const onClose = useCallback(
    (id) => {
      setAnimList([...animList.filter((it: any) => it.id !== id)]);
    },
    [animList, setAnimList],
  );

  useEffect(() => {
    if (`${uid}` === `${previousState.uid}` && +stars > +previousState.stars) {
      animListCb();
    }
  }, [stars, previousState.uid, previousState.stars, animListCb]);
  const { t } = useTranslation();
  const cls = classnames({
    [`video-player`]: 1,
    [`mirror`]: !!isMirror,
    [`${className}`]: !!className,
  });
  const micStateCls = classnames({
    [`mic-state`]: 1,
    [`disabled`]: !micEnabled,
  });

  const tools = (
    <div className={`video-player-tools ${isHost ? 'host' : ''}`}>
      <Tooltip title="" placement="bottom">
        <MediaIcon
          {...getMediaIconProps({
            muted: !!micEnabled,
            deviceState: micDevice,
            online: !!online,
            onPodium: isOnPodium,
            userType: userType,
            hasStream: hasStream,
            isLocal: isLocal,
            uid: uid,
            type: 'microphone',
          })}
          placement={placement}
          onClick={() => {
            if (micDevice === 1) {
              onMicClick(uid);
            }
          }}
        />
      </Tooltip>
      <MediaIcon
        {...getMediaIconProps({
          muted: !!cameraEnabled,
          deviceState: cameraDevice,
          online: !!online,
          onPodium: isOnPodium,
          userType: userType,
          hasStream: hasStream,
          isLocal: isLocal,
          uid: uid,
          type: 'camera',
        })}
        placement={placement}
        onClick={() => {
          if (cameraDevice === 1) {
            onCameraClick(uid);
          }
        }}
      />
      {isHost ? (
        <>
          {hideOffAllPodium ? null : (
            <Tooltip title={t('Clear Podiums')} placement={placement}>
              <span>
                <SvgImg
                  canHover={canHoverHideOffAllPodium}
                  style={{
                    color: canHoverHideOffAllPodium
                      ? COLOR_RULES.activeColor
                      : COLOR_RULES.deactiveColor,
                  }}
                  type="invite-to-podium"
                  size={22}
                  onClick={() => onOffAllPodiumClick()}
                />
              </span>
            </Tooltip>
          )}
          {hideOffPodium ? null : (
            <Tooltip title={t('Clear Podium')} placement={placement}>
              <span>
                <SvgImg
                  canHover
                  type="invite-to-podium"
                  className={isOnPodium ? 'podium' : 'no_podium'}
                  style={{ color: COLOR_RULES.activeColor }}
                  size={22}
                  onClick={() => onOffPodiumClick(uid)}
                />
              </span>
            </Tooltip>
          )}
          {hideBoardGranted ? null : (
            <Tooltip
              title={whiteboardGranted ? t('Close Whiteboard') : t('Open Whiteboard')}
              placement={placement}>
              <span>
                <SvgImg
                  type="no-authorized"
                  style={{
                    color: whiteboardGranted ? COLOR_RULES.activeColor : COLOR_RULES.deactiveColor,
                  }}
                  onClick={() => onWhiteboardClick(uid)}
                  size={22}
                  canHover
                />
              </span>
            </Tooltip>
          )}
          {hideStars ? null : (
            <Tooltip title={t('Star')} placement={placement}>
              <span>
                <SvgImg
                  canHover
                  type="star-outline"
                  onClick={() => {
                    onSendStar(uid);
                  }}
                  size={22}
                  style={{ color: COLOR_RULES.activeColor }}
                />
              </span>
            </Tooltip>
          )}
          {hidePrivateChat ? null : (
            <Tooltip
              title={privateCallEnabled ? t('Close Private Call') : t('Open Private Call')}
              placement={placement}>
              <div
                className={privateCallEnabled ? 'private-call-active' : 'private-call-default'}
                onClick={() => {
                  onPrivateChat(uid);
                }}></div>
            </Tooltip>
          )}
        </>
      ) : null}
    </div>
  );
  // teacher and assistant can see stars, student can see stars if stars > 0 and big class can not see stars
  const isShowStarNum = useMemo(
    () =>
      (stars > 0 || ['teacher', 'assistant'].includes(userType)) &&
      streamRoleType !== 'teacher' &&
      roomType !== 'big-class',
    [stars, userType, streamRoleType, roomType],
  );
  return (
    <Popover
      // trigger={'click'} // 调试使用
      align={{
        offset: [-8, 0],
      }}
      overlayClassName="video-player-tools-popover"
      content={hideControl ? null : tools}
      placement={controlPlacement}>
      <div className={cls} {...restProps}>
        {children ? children : null}
        {placeholder ? <>{placeholder}</> : null}
        {animList.length
          ? animList.map((item) => (
              <div key={item.id} className="center-reward">
                <SvgaPlayer
                  type="reward"
                  audio="reward"
                  duration={2000}
                  onClose={() => onClose(item.id)}
                />
              </div>
            ))
          : ''}
        <div className="top-right-info">
          {isShowStarNum ? (
            <>
              <SvgImg className="stars" type="star" />
              <span className="stars-label">x{stars}</span>
            </>
          ) : null}
        </div>
        <div className="bottom-left-info">
          <div>
            {micEnabled && micDevice === 1
              ? renderVolumeIndicator({ volume: micVolume, streamUuid })
              : null}
            <MediaIcon
              className={micStateCls}
              {...getMediaIconProps({
                muted: !!micEnabled,
                deviceState: micDevice,
                online: !!online,
                onPodium: isOnPodium,
                userType: 'teacher',
                hasStream: hasStream,
                isLocal: isLocal,
                type: 'microphone',
                uid: uid,
                disabled: true,
              })}
              volumeIndicator={true}
              onClick={() => {}}
            />
          </div>
          <span title={username} className="username">
            {username}
          </span>
        </div>
        <div className="bottom-right-info">
          {whiteboardGranted && showGranted ? <div className="bottom-right-granted"></div> : null}
        </div>
      </div>
    </Popover>
  );
};

export const VideoPlaceHolder = () => {
  return (
    <div className="placeholder-video">
      <img src="" alt="" />
    </div>
  );
};

export type VideoItemProps = Omit<
  VideoPlayerProps,
  | 'onCameraClick'
  | 'onMicClick'
  | 'onOffPodiumClick'
  | 'onWhiteboardClick'
  | 'onSendStar'
  | 'onPrivateChat'
>;

export interface VideoMarqueeListProps {
  /**
   * 显示发送奖励的icon
   */
  hideStars: boolean;
  /**
   * video stream list
   */
  videoStreamList: BaseVideoPlayerProps[];
  // teacherStream: any,
  /**
   * teacher stream
   */
  teacherStreams: any[];
  /**
   * 点击摄像头的按钮时的回调
   */
  onCameraClick: (uid: string | number) => Promise<any>;
  /**
   * 点击麦克风按钮时的回调
   */
  onMicClick: (uid: string | number) => Promise<any>;
  /**
   * 下讲台
   */
  onOffPodiumClick: (uid: string | number) => Promise<any>;
  /**
   * 点击白板操作授权按钮时的回调
   */
  onWhiteboardClick: (uid: string | number) => Promise<any>;
  /**
   * 发送星星给学生
   */
  onSendStar: (uid: string | number) => Promise<any>;
  /**
   * 开启私密语音聊天
   */
  onPrivateChat?: (uid: string | number) => Promise<any>;
  /**
   * 用户类型
   */
  userType: 'teacher' | 'student' | 'assistant';

  /**
   * 轮播功能开启轮播需要隐藏箭头
   */
  openCarousel?: boolean;
  roomType?: 'mid-class' | 'big-class';
}

export const VideoMarqueeList: React.FC<VideoMarqueeListProps> = ({
  hideStars,
  // teacherStream,
  teacherStreams = [],
  videoStreamList,
  onCameraClick,
  onMicClick,
  onOffPodiumClick,
  onWhiteboardClick,
  onSendStar,
  userType,
  openCarousel = false,
  onPrivateChat = (uid: string | number) => console.log('onPrivateChat', uid),
  roomType = 'mid-class',
}) => {
  const videoContainerRef = useRef<HTMLDivElement | null>(null);

  const videoContainerParentRef = useRef<HTMLDivElement | null>(null);

  const scroll = useCallback(
    (direction: 'left' | 'right') => {
      const videoContainer = videoContainerRef.current;
      if (!videoContainer) return;
      const videoDOM = videoContainer.querySelector('.video-item') as HTMLDivElement;
      if (!videoDOM) return;
      const offsetWidth = videoDOM.offsetWidth;
      if (direction === 'left') {
        videoContainer.scrollLeft -= offsetWidth;
      }
      if (direction === 'right') {
        videoContainer.scrollLeft += offsetWidth;
      }
    },
    [videoContainerRef.current],
  );

  const checkTargetScrollElementSatisfied = (target: HTMLDivElement): boolean => {
    // const targetOffsetWidth = target.offsetWidth
    const videoItems: NodeListOf<HTMLDivElement> = target.querySelectorAll('.video-item');
    if (videoItems && videoItems.length && videoItems[0].offsetWidth) {
      return videoItems.length >= 6;
    }
    return false;
  };

  const mountDOM = useCallback((_dom: HTMLDivElement | null) => {
    const dom: HTMLDivElement = _dom?.querySelector('#animation-group')!;

    if (dom) {
      videoContainerRef.current = dom;
      videoContainerParentRef.current = _dom!;

      if (videoContainerRef.current && videoContainerParentRef.current) {
        const satisfied = checkTargetScrollElementSatisfied(videoContainerRef.current);
        if (satisfied) {
          videoContainerRef.current.classList.add('show-scroll');
        } else {
          videoContainerRef.current.classList.remove('show-scroll');
        }
      }
      const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        const current = entries[0];
        const target = current.target as HTMLDivElement;
        if (target) {
          const satisfied = checkTargetScrollElementSatisfied(target);
          if (satisfied) {
            target.classList.add('show-scroll');
          } else {
            target.classList.remove('show-scroll');
          }
        }
      });
      observer.observe(videoContainerParentRef.current);
    }
  }, []);

  const attachVideoItem = useCallback(() => {
    if (videoContainerRef.current) {
      const satisfied = checkTargetScrollElementSatisfied(videoContainerRef.current);
      if (satisfied) {
        videoContainerRef.current.classList.add('show-scroll');
      } else {
        videoContainerRef.current.classList.remove('show-scroll');
      }
    }
  }, [videoContainerRef.current]);

  const cls = classnames({
    'marque-video-container': 1,
    [`${roomType}`]: 1,
  });

  return (
    <div className={cls}>
      <>
        <CSSTransition
          in={!!teacherStreams[0]?.uid}
          timeout={500}
          classNames="video-player-animates">
          <div className="video-item" ref={attachVideoItem}>
            {teacherStreams[0] && (
              <VideoPlayer
                streamRoleType="teacher"
                hideStars={hideStars}
                {...teacherStreams[0]}
                userType={userType}
                onCameraClick={onCameraClick}
                onMicClick={onMicClick}
                onOffPodiumClick={onOffPodiumClick}
                onWhiteboardClick={onWhiteboardClick}
                onSendStar={async () => {
                  await onSendStar(teacherStreams[0].uid);
                }}
                onPrivateChat={async () => {
                  await onPrivateChat(teacherStreams[0].uid);
                }}
                roomType={roomType}></VideoPlayer>
            )}
          </div>
        </CSSTransition>
        <div className="video-flex-container" ref={mountDOM}>
          {/* {teacherStreams[0] ?  */}
          {!openCarousel ? (
            <div
              className="left-container scroll-btn"
              onClick={() => {
                scroll('left');
              }}>
              <span className="offset">
                <Icon type="backward"></Icon>
              </span>
            </div>
          ) : null}
          <TransitionGroup id="animation-group" className="video-list video-container">
            {/* <div className="video-container" ref={mountDOM}> */}
            {videoStreamList.map((videoStream: BaseVideoPlayerProps, idx: number) => (
              <CSSTransition
                key={`student-${videoStream.uid}`}
                // key={videoStream.uid}
                timeout={500}
                classNames="video-player-animates">
                <div className="video-item" ref={attachVideoItem}>
                  <VideoPlayer
                    streamRoleType="student"
                    hideStars={hideStars}
                    {...videoStream}
                    // showGranted={true}
                    userType={userType}
                    onCameraClick={onCameraClick}
                    onMicClick={onMicClick}
                    onOffPodiumClick={onOffPodiumClick}
                    onWhiteboardClick={onWhiteboardClick}
                    onSendStar={async () => {
                      await onSendStar(videoStream.uid);
                    }}
                    onPrivateChat={async () => {
                      await onPrivateChat(videoStream.uid);
                    }}
                    roomType={roomType}></VideoPlayer>
                </div>
              </CSSTransition>
            ))}
            {/* </div> */}
          </TransitionGroup>
          {!openCarousel ? (
            <div
              className="right-container scroll-btn"
              onClick={() => {
                scroll('right');
              }}>
              <span className="offset">
                <Icon type="forward"></Icon>
              </span>
            </div>
          ) : null}
        </div>
      </>
    </div>
  );
};

export interface MidClassVideoMarqueeListProps extends VideoMarqueeListProps {
  teacherStream: any;
}

export const MidClassVideoMarqueeList: React.FC<MidClassVideoMarqueeListProps> = ({
  teacherStream,
  videoStreamList = [],
  hideStars,
  onCameraClick,
  onMicClick,
  onOffPodiumClick,
  onWhiteboardClick,
  onSendStar,
  userType,
  onPrivateChat = (uid: string | number) => console.log('onPrivateChat', uid),
}) => {
  return (
    <div className="mid-class-carousel">
      <div className="carousel-item video-teacher">
        <VideoPlayer
          {...teacherStream}
          controlPlacement={'bottom'}
          placement={'bottom'}></VideoPlayer>
      </div>
      <div className="video-students">
        {videoStreamList.length > 6 ? (
          <div className="left-container scroll-btn">
            <span className="offset">
              <Icon type="backward"></Icon>
            </span>
          </div>
        ) : null}
        {videoStreamList.length
          ? videoStreamList.map((videoStream, index) => (
              <div
                className={['carousel-item', `video-student`].join(' ')}
                key={index}
                onAnimationEnd={(e: any) => {
                  e.target.style.opacity = 1;
                  e.target.style.width = 204 + 'px';
                }}>
                <VideoPlayer
                  {...videoStream}
                  controlPlacement={'bottom'}
                  placement={'bottom'}
                  hideStars={hideStars}
                  showGranted={true}
                  userType={userType}
                  onCameraClick={onCameraClick}
                  onMicClick={onMicClick}
                  onOffPodiumClick={onOffPodiumClick}
                  onWhiteboardClick={onWhiteboardClick}
                  onSendStar={async () => {
                    await onSendStar(videoStream.uid);
                  }}
                  onPrivateChat={async () => {
                    await onPrivateChat(videoStream.uid);
                  }}></VideoPlayer>
              </div>
            ))
          : null}
        {videoStreamList.length > 6 ? (
          <div className="right-container scroll-btn">
            <span className="offset">
              <Icon type="forward"></Icon>
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
