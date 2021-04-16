import { UIKitBaseModule } from '~capabilities/types';
import { BaseStore } from '../../stores/base';
import { AppStore as CoreAppStore } from '~core';
import { EduMediaStream } from '~core/scene';
import { EduStream, EduUser } from 'agora-rte-sdk';

export type VideoModel = {
  isHost?: boolean;
  /**
   * 用户的唯一标识
   */
  uid: number;
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

  placement?: any;

  userType?: 'student' | 'teacher';
}

export const defaultVideoModel: VideoModel = {
  isHost: false,
  uid: 0,
  hideControl: true,
  hideOffAllPodium: false,
  hideOffPodium: false,
  hideStars: false,
  controlPlacement: 'left',
  stars: 0,
  username: 'default',
  micEnabled: false,
  micVolume: 0,
  cameraEnabled: false,
  whiteboardGranted: false,
  canHoverHideOffAllPodium: false,
  hideBoardGranted: true,
  placement: 'bottom',
  userType: 'student',
}

type VideoUIKitModule = UIKitBaseModule<VideoModel, any>

export abstract class VideoUIKitStore extends BaseStore<VideoModel> implements VideoUIKitModule {
  get isHost() {
    return this.attributes.isHost
  }
  get uid() {
    return this.attributes.uid
  }
  get hideControl() {
    return this.attributes.hideControl
  }
  get hideOffAllPodium() {
    return this.attributes.hideOffAllPodium
  }
  get hideOffPodium() {
    return this.attributes.hideOffPodium
  }
  get hideStars() {
    return this.attributes.hideStars
  }
  get controlPlacement() {
    return this.attributes.controlPlacement
  }
  get stars() {
    return this.attributes.stars
  }
  get username() {
    return this.attributes.username
  }
  get micEnabled() {
    return this.attributes.micEnabled
  }
  get micVolume() {
    return this.attributes.micVolume
  }
  get cameraEnabled() {
    return this.attributes.cameraEnabled
  }
  get whiteboardGranted() {
    return this.attributes.whiteboardGranted
  }
  get canHoverHideOffAllPodium() {
    return this.attributes.canHoverHideOffAllPodium
  }
  get hideBoardGranted() {
    return this.attributes.hideBoardGranted
  }
  get isOnPodium() {
    return this.attributes.isOnPodium
  }
  get placement() {
    return this.attributes.placement
  }
  get userType() {
    return this.attributes.userType
  }
  abstract updateVideoState(uid: any): any;
  abstract updateAudioState(uid: any): any;
  abstract sendStar(uid: any): any;
  abstract updateWhiteboardState (uid: any): any;
  abstract setOffAllPodium(): any;
  abstract updateOffPodium(uid: any): any;
}

export class VideoStore extends VideoUIKitStore {
  static createFactory(appStore: CoreAppStore): VideoStore {
    const store = new VideoStore(defaultVideoModel)
    store.bind(appStore)
    return store
  }
  updateVideoState (uid: any) {
    const stream = this.appStore.sceneStore.streamList.find((stream: EduStream) => stream.userInfo.userUuid === uid)
    if (stream) {
      const isLocal = this.appStore.sceneStore.localStreamUuid === uid
      if (!!stream.hasVideo) {
        return this.appStore.sceneStore.muteVideo(uid, isLocal)
      } else {
        return this.appStore.sceneStore.unmuteVideo(uid, isLocal)
      }
    }
  }

  updateAudioState (uid: any) {
    const stream = this.appStore.sceneStore.streamList.find((stream: EduStream) => stream.userInfo.userUuid === uid)
    if (stream) {
      const isLocal = this.appStore.sceneStore.localStreamUuid === uid
      if (!!stream.hasAudio) {
        return this.appStore.sceneStore.muteAudio(uid, isLocal)
      } else {
        return this.appStore.sceneStore.unmuteAudio(uid, isLocal)
      }
    }
  }

  sendStar(uid: any) {
    const user = this.appStore.sceneStore.userList.find((user: EduUser) => user.userUuid === uid)
    if (user) {
      return this.appStore.roomStore.sendReward(user.userUuid, 1)
    }
  }

  updateWhiteboardState(uid: any) {
    const user = this.appStore.sceneStore.userList.find((user: EduUser) => user.userUuid === uid)
    if (user) {
      return this.appStore.roomStore.sendReward(user.userUuid, 1)
    }
  }

  setOffAllPodium() {
    return this.appStore.sceneStore.revokeAllCoVideo()
  }

  updateOffPodium(uid: any) {
    const user = this.appStore.sceneStore.userList.find((user: EduUser) => user.userUuid === uid)
    if (user) {
      return this.appStore.sceneStore.revokeCoVideo(user.userUuid)
    }
  }
  
}