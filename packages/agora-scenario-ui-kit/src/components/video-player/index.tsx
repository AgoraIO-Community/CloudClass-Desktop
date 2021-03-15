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
  className,
  placeholder,
  stars = 0,
  isHost,
  username,
  micEnabled,
  micVolume,
  cameraEnabled,
  whiteboardGranted,
  onCameraClick,
  onMicClick,
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
      content={tools}
      placement="left">
      <div className={cls}>
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
