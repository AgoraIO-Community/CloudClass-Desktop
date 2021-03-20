import React, { FC, ReactNode } from 'react';
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