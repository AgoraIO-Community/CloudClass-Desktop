import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '../interface/base-props';
import { Icon } from '~components/icon';
import { Popover } from '~components/popover';
import './index.css';

export interface VideoPlayerProps extends BaseProps {
  /**
   * 是否是主持人，主持人可以操作所有人的摄像头，麦克风，授权白板操作权限，送出星星
   */
  isHost?: boolean;
  /**
   * 是否本地用户
   */
  isLocal?: boolean;
  /**
   * 用户的唯一标识
   */
  uid: string | number;
  /**
   * 摄像头关闭时的封面
   */
  poster?: string;
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
   * 麦克风声音大小
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
   * 摄像头状态变更时的回调
   */
  onCameraStateChange: (uid: string | number, enabled: boolean) => void;
  /**
   * 摄像头状态变更时的回调
   */
  onMicStateChange: (uid: string | number, enabled: boolean) => void;
  /**
   * 白板操作授权变更时的回调
   */
  onWhiteboardGrantedStateChange: (
    uid: string | number,
    granted: boolean,
  ) => void;
  /**
   * 发送星星给学生
   */
  onSendStar: (uid: string | number) => void;
}

export const VideoPlayer: FC<VideoPlayerProps> = ({
  uid,
  className,
  stars = 0,
  isHost,
  username,
  micEnabled,
  cameraEnabled,
  whiteboardGranted,
  onCameraStateChange,
  onMicStateChange,
  onWhiteboardGrantedStateChange,
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
        onClick={() => onMicStateChange(uid, !micEnabled)}
      />
      <Icon
        className={cameraEnabled ? '' : 'red'}
        type={cameraEnabled ? 'camera' : 'camera-off'}
        onClick={() => onCameraStateChange(uid, !cameraEnabled)}
      />
      {isHost ? (
        <>
          <Icon
            className={cameraEnabled ? '' : 'yellow'}
            type="whiteboard"
            onClick={() =>
              onWhiteboardGrantedStateChange(uid, !whiteboardGranted)
            }
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
      placement="left"
      trigger="click">
      <div className={cls}>
        <div className="top-right-info">
          {stars > 0 ? (
            <>
              <Icon className="stars" type="star" />
              <span className="stars-label">x{stars}</span>
            </>
          ) : null}
        </div>
        <div className="bottom-left-info">
          <Icon
            className={micStateCls}
            type={micEnabled ? 'microphone-on' : 'microphone-off'}
          />
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
