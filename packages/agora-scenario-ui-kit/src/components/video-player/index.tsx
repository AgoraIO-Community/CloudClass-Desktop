import React, { FC, ReactNode, useCallback, useEffect, useRef } from 'react';
import classnames from 'classnames';
import { BaseProps } from '../interface/base-props';
import { Icon } from '~components/icon';
import { Popover } from '~components/popover';
import './index.css';
import { VolumeIndicator } from './volume-indicator';

export interface VideoPlayerProps extends BaseProps {
  /**
   * 是否是主持人，主持人可以操作所有人的摄像头，麦克风，授权白板操作权限，送出星星
   */
  isHost?: boolean;
  /**
   * 用户的唯一标识
   */
  uid: string | number;
  /**
   * 摄像头关闭时的占位图
   */
  placeholder?: string | ReactNode;
  /**
   * 是否现实控制条
   */
  hideControl?: boolean;
  /**
   * 是否你展示全体下讲台，默认 false
   */
  hideOffPodium?: boolean;
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
  onOffPodiumClick: (uid: string | number) => Promise<any>;
  /**
   * 点击白板操作授权按钮时的回调
   */
  onWhiteboardClick: (uid: string | number) => Promise<any>;
  /**
   * 发送星星给学生
   */
  onSendStar: (uid: string | number) => Promise<any>;
}

export const VideoPlayer: FC<VideoPlayerProps> = ({
  uid,
  children,
  className,
  placeholder,
  controlPlacement,
  hideControl,
  stars = 0,
  isHost,
  username,
  micEnabled,
  micVolume,
  cameraEnabled,
  whiteboardGranted,
  hideOffPodium,
  onCameraClick,
  onMicClick,
  onOffPodiumClick,
  onWhiteboardClick,
  onSendStar,
}) => {
  const cls = classnames({
    [`video-player`]: 1,
    [`${className}`]: !!className,
  });
  const micStateCls = classnames({
    [`mic-state`]: 1,
    [`disabled`]: !micEnabled,
  });

  const tools = (
    <div className={`video-player-tools ${isHost ? 'host' : ''}`}>
      <Icon
        className={micEnabled ? '' : 'red'}
        type={micEnabled ? 'microphone-on' : 'microphone-off'}
        onClick={() => onMicClick(uid)}
      />
      <Icon
        className={cameraEnabled ? '' : 'red'}
        type={cameraEnabled ? 'camera' : 'camera-off'}
        onClick={() => onCameraClick(uid)}
      />
      {isHost ? (
        <>
          {hideOffPodium ? null : (
            <Icon
              type="invite-to-podium"
              onClick={() => onOffPodiumClick(uid)}
            />
          )}
          <Icon
            className={cameraEnabled ? '' : 'yellow'}
            type="whiteboard"
            onClick={() => onWhiteboardClick(uid)}
          />
          <Icon type="star-outline" onClick={() => onSendStar(uid)} />
        </>
      ) : null}
    </div>
  );
  return (
    <Popover
      align={{
        offset: [-8, 0],
      }}
      overlayClassName="video-player-tools-popover"
      content={hideControl ? null : tools}
      placement={controlPlacement}>
      <div className={cls}>
        {children ? children : null}
        {placeholder ? <>{placeholder}</> : null}
        <div className="top-right-info">
          {stars > 0 ? (
            <>
              <Icon className="stars" type="star" />
              <span className="stars-label">x{stars}</span>
            </>
          ) : null}
        </div>
        <div className="bottom-left-info">
          <div>
            <VolumeIndicator volume={micVolume} />
            <Icon
              className={micStateCls}
              type={micEnabled ? 'microphone-on' : 'microphone-off'}
            />
          </div>
          <span className="username">{username}</span>
        </div>
        <div className="bottom-right-info">
          {whiteboardGranted ? (
            <Icon className="whiteboard-state" type="whiteboard" />
          ) : null}
        </div>
      </div>
    </Popover>
  );
};


export const VideoPlaceHolder = () => {
  return (
    <div className="placeholder-video">
      <img src="" alt=""/>
    </div>
  )
}

export interface VideoMarqueeListProps {
  videoList: VideoPlayerProps[]
}

export const VideoMarqueeList: React.FC<VideoMarqueeListProps> = ({videoList}) => {

  const videoContainerRef = useRef<HTMLDivElement | null>(null)

  const scroll = useCallback((direction: 'left' | 'right') => {
    const videoContainer = videoContainerRef.current
    if (!videoContainer) return
    const videoDOM = videoContainer.querySelector('.video-item') as HTMLDivElement
    if (!videoDOM) return
    const offsetWidth = videoDOM.offsetWidth
    if(direction === 'left') {
      videoContainer.scrollLeft -= offsetWidth
    }
    if(direction === 'right') {
      videoContainer.scrollLeft += offsetWidth
    }
  }, [videoContainerRef.current])

  const checkTargetScrollElementSatisfied = (target: HTMLDivElement): boolean => {
    const targetOffsetWidth = target.offsetWidth
    const videoItems: NodeListOf<HTMLDivElement> = target.querySelectorAll('.video-item')
    if (videoItems && videoItems[0]) {
      const contentOffsetWidth = videoItems[0].offsetWidth * videoItems.length
      return contentOffsetWidth > targetOffsetWidth
    }
    return false
  }

  const mountDOM = useCallback((dom: HTMLDivElement | null) => {
    if (dom) {
      videoContainerRef.current = dom

      if (videoContainerRef.current) {
        const satisfied = checkTargetScrollElementSatisfied(videoContainerRef.current)
        if (satisfied) {
          videoContainerRef.current.classList.add('show-scroll')
        } else {
          videoContainerRef.current.classList.remove('show-scroll')
        }
      }
      const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        const current = entries[0]
        const target = current.target as HTMLDivElement
        if (target) {
          const satisfied = checkTargetScrollElementSatisfied(target)
          if (satisfied) {
            target.classList.add('show-scroll')
          } else {
            target.classList.remove('show-scroll')
          }
        }
      })
      observer.observe(dom)
    }
  }, [])

  const attachVideoItem = useCallback(() => {
    if (videoContainerRef.current) {
      const satisfied = checkTargetScrollElementSatisfied(videoContainerRef.current)
      if (satisfied) {
        videoContainerRef.current.classList.add('show-scroll')
      } else {
        videoContainerRef.current.classList.remove('show-scroll')
      }
    }
  }, [videoContainerRef.current])

  return (
    <div className="video-container" ref={mountDOM}>
      <div className="left-container scroll-btn" onClick={() => {scroll('left')}}>
      <span className="offset">
        <Icon type="backward"></Icon>
      </span> 
      </div>
      {
        videoList.map((videoItem: VideoPlayerProps, idx: number) => 
          <div className="video-item" key={idx} ref={attachVideoItem}>
            <VideoPlayer {...videoItem}></VideoPlayer>
          </div>
        )
      }
      <div className="right-container scroll-btn" onClick={() => {scroll('right')}}>
        <span className="offset">
          <Icon type="forward"></Icon>
        </span> 
      </div>
    </div>
  )
}