import { EduClassroomConfig, EduRoleTypeEnum, EduStream, RteRole2EduRole } from 'agora-edu-core';
import { AgoraFromUser, AgoraRteMediaPublishState, AgoraRteMediaSourceState } from 'agora-rte-sdk';
import { action, computed, observable } from 'mobx';

export type VideoPlacement = 'Window' | 'Bar' | 'Setting' | 'Gallery';

/**
 * 业务流 UI 对象
 */
export class EduStreamUI {
  @observable
  private _renderAt: VideoPlacement = 'Bar';
  readonly stream: EduStream;

  constructor(stream: EduStream) {
    this.stream = stream;
  }

  get micIconType() {
    const deviceDisabled = this.stream.audioSourceState === AgoraRteMediaSourceState.stopped;
    if (deviceDisabled) {
      return 'microphone-disabled';
    }
    if (
      this.stream.audioSourceState === AgoraRteMediaSourceState.started &&
      this.stream.audioState === AgoraRteMediaPublishState.Published
    ) {
      return 'microphone-on';
    }
    return 'microphone-off';
  }

  get isCameraMuted() {
    return (
      this.stream.videoSourceState !== AgoraRteMediaSourceState.started ||
      this.stream.videoState === AgoraRteMediaPublishState.Unpublished
    );
  }

  get isMicMuted() {
    return this.micIconType.endsWith('off') || this.micIconType.endsWith('disabled');
  }

  get fromUser(): AgoraFromUser {
    return this.stream.fromUser;
  }

  get isMirrorMode() {
    return false;
  }

  get role(): EduRoleTypeEnum {
    return RteRole2EduRole(EduClassroomConfig.shared.sessionInfo.roomType, this.fromUser.role);
  }

  @computed
  get renderAt() {
    return this._renderAt;
  }

  @action.bound
  setRenderAt(at: VideoPlacement) {
    this._renderAt = at;
  }
}

export interface StreamBounds {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
  [key: string]: number;
}

/**
 * 视频流占位符类型
 */
export enum CameraPlaceholderType {
  /**
   * 摄像头打开
   */
  none = 'none',
  /**
   * 设备正在打开
   */
  loading = 'loading',
  /**
   * 摄像头关闭
   */
  muted = 'muted',
  /**
   * 摄像头损坏
   */
  broken = 'broken',
  /**
   * 摄像头禁用
   */
  disabled = 'disabled',
  /**
   * 老师不在教室
   */
  notpresent = 'notpresent',
  /**
   * 老师摄像头占位符（大小窗场景）
   */
  nosetup = 'nosetup',
}
