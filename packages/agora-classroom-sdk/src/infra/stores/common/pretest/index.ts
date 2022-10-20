import {
  AGBaseProcessor,
  AGBeautyEffect,
  AGLighteningLevel,
  AgoraRteMediaSourceState,
  bound,
  Logger,
} from 'agora-rte-sdk';
import { action, computed, Lambda, observable, reaction } from 'mobx';
import { EduUIStoreBase } from '../base';
import { CameraPlaceholderType, DeviceStateChangedReason } from '../type';
import { v4 as uuidv4 } from 'uuid';
import { computedFn } from 'mobx-utils';
import {
  AgoraEduClassroomEvent,
  BeautyType,
  DEVICE_DISABLE,
  EduClassroomConfig,
  EduEventCenter,
} from 'agora-edu-core';
import { transI18n } from '~ui-kit';

export type PretestToast = {
  id: string;
  type: 'video' | 'audio_recording' | 'audio_playback' | 'error';
  info: string;
};

type AddToastArgs = Omit<PretestToast, 'id'>;
type effectType = 'beauty' | 'virtualBackground';
type deviceType = 'audio' | 'video';

const DEFAULT_BEAUTY_OPTION = {
  lighteningContrastLevel: AGLighteningLevel.low,
  lighteningLevel: 0,
  rednessLevel: 0,
  smoothnessLevel: 0,
  sharpnessLevel: 0,
};

export class PretestUIStore extends EduUIStoreBase {
  private readonly _disposers = new Set<Lambda>();
  private _cameraVirtualBackgroundProcessor = null;
  private _cameraBeautyProcessor = null;

  @observable currentEffectType: effectType = 'virtualBackground';
  @observable currentPretestTab: deviceType = 'video';
  @observable backgroundImage = []; // 虚拟背景
  @observable currentVirtualBackground = ''; // 当前选择虚拟背景选项
  @observable underlineLeft = 0;

  /**
   * 美颜配置
   **/
  /** @en
   * The image enhancement options
   */
  @observable beautyEffectOptions: AGBeautyEffect = DEFAULT_BEAUTY_OPTION;

  onInstall() {
    // 处理视频设备变动
    const videoDisposer = computed(() => this.classroomStore.mediaStore.videoCameraDevices).observe(
      ({ newValue, oldValue }) => {
        // 避免初始化阶段触发新设备的弹窗通知
        if (oldValue && oldValue.length > 1) {
          if (newValue.length > oldValue.length) {
            this.addToast({
              type: 'video',
              info: DeviceStateChangedReason.newDeviceDetected,
            });
          }
        }
      },
    );

    this._disposers.add(videoDisposer);

    // 处理录音设备变动
    const audioRecordingDisposer = computed(
      () => this.classroomStore.mediaStore.audioRecordingDevices,
    ).observe(({ newValue, oldValue }) => {
      // 避免初始化阶段触发新设备的弹窗通知
      if (oldValue && oldValue.length > 1) {
        if (newValue.length > oldValue.length) {
          this.addToast({
            type: 'audio_recording',
            info: DeviceStateChangedReason.newDeviceDetected,
          });
        }
      }
    });

    this._disposers.add(audioRecordingDisposer);

    // 处理扬声器设备变动
    const playbackDisposer = computed(
      () => this.classroomStore.mediaStore.audioPlaybackDevices,
    ).observe(({ newValue, oldValue }) => {
      // 避免初始化阶段触发新设备的弹窗通知
      if (oldValue && oldValue.length > 0) {
        if (newValue.length > oldValue.length) {
          this.addToast({
            type: 'audio_playback',
            info: DeviceStateChangedReason.newDeviceDetected,
          });
        }
      }
    });

    this._disposers.add(playbackDisposer);

    this._disposers.add(
      reaction(
        () => this.beautyEffectOptions,
        () => {
          if (this._cameraBeautyProcessor) {
            (this._cameraBeautyProcessor as any).enable();
            (this._cameraBeautyProcessor as any).setOptions(this.beautyEffectOptions);
          }
        },
      ),
    );

    this._disposers.add(
      reaction(
        () => this.activeBeautyType,
        (type) => {
          if (type === 'none') {
            this.resetBeautyValue();
          }
        },
      ),
    );
    EduEventCenter.shared.onClassroomEvents(this._handleInteractionEvents);
  }

  /**
   * 交互事件通知
   * @param type
   */
  @bound
  private _handleInteractionEvents(type: AgoraEduClassroomEvent) {
    switch (type) {
      case AgoraEduClassroomEvent.CurrentCamUnplugged:
        this.addToast({
          type: 'error',
          info: DeviceStateChangedReason.cameraUnplugged,
        });
        break;
      case AgoraEduClassroomEvent.CurrentMicUnplugged:
        this.addToast({
          type: 'error',
          info: DeviceStateChangedReason.micUnplugged,
        });
        break;
      case AgoraEduClassroomEvent.CurrentSpeakerUnplugged:
        this.addToast({
          type: 'error',
          info: DeviceStateChangedReason.playbackUnplugged,
        });
        break;
    }
  }

  private _timer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Toast 消息列表
   */
  @observable
  toastQueue: PretestToast[] = [];

  /**
   * 美颜类型
   */
  @observable activeBeautyType: BeautyType | 'none' = 'none';

  /**
   * 是否正在测试扬声器
   */
  @observable playbackTesting = false;

  /**
   * 视频消息 Toast 列表
   * @returns
   */
  @computed
  get videoToastQueue() {
    return this.toastQueue.filter((t) => t.type === 'video');
  }

  /**
   * 扬声器消息 Toast 列表
   * @returns
   */
  @computed
  get audioPlaybackToastQueue() {
    return this.toastQueue.filter((t) => t.type === 'audio_playback');
  }

  /**
   * 麦克风消息 Toast 列表
   * @returns
   */
  @computed
  get audioRecordingToastQueue() {
    return this.toastQueue.filter((t) => t.type === 'audio_recording');
  }

  /**
   * 错误消息 Toast 列表
   * @returns
   */
  @computed
  get errorToastQueue() {
    return this.toastQueue.filter((t) => t.type === 'error');
  }

  /**
   * 摄像头设备列表
   * @returns
   */
  @computed get cameraDevicesList() {
    return this.classroomStore.mediaStore.videoCameraDevices.map((item) => ({
      label: item.deviceid === DEVICE_DISABLE ? transI18n('disabled') : item.devicename,
      value: item.deviceid,
    }));
  }

  /**
   * 麦克风设备列表
   * @returns
   */
  @computed get recordingDevicesList() {
    return this.classroomStore.mediaStore.audioRecordingDevices.map((item) => ({
      label: item.deviceid === DEVICE_DISABLE ? transI18n('disabled') : item.devicename,
      value: item.deviceid,
    }));
  }

  /**
   * 扬声器设备列表
   * @returns
   */
  @computed get playbackDevicesList() {
    const playbackDevicesList = this.classroomStore.mediaStore.audioPlaybackDevices.map((item) => ({
      label: item.devicename,
      value: item.deviceid,
    }));
    return playbackDevicesList.length
      ? playbackDevicesList
      : [
          {
            label: transI18n(`media.default`),
            value: 'default',
          },
        ];
  }

  /**
   * 当前摄像头设备ID
   * @returns
   */
  @computed get currentCameraDeviceId(): string {
    return this.classroomStore.mediaStore.cameraDeviceId ?? '';
  }

  /**
   * 当前麦克风设备ID
   * @returns
   */
  @computed get currentRecordingDeviceId(): string {
    return this.classroomStore.mediaStore.recordingDeviceId ?? '';
  }

  /**
   * 当前扬声器设备ID
   * @returns
   */
  @computed get currentPlaybackDeviceId(): string {
    return this.classroomStore.mediaStore.playbackDeviceId ?? 'default';
  }

  /**
   * 麦克风音量
   * @returns 音量 0 ~ 1
   */
  @computed get localVolume(): number {
    return this.classroomStore.mediaStore.recordingDeviceId === DEVICE_DISABLE
      ? 0
      : this.classroomStore.mediaStore.localMicAudioVolume * 100;
  }

  /**
   * 扬声器测试音量
   * @returns 音量 0 ~ 1
   */
  @computed get localPlaybackTestVolume(): number {
    return this.classroomStore.mediaStore.localPlaybackTestVolume * 100;
  }

  /**
   * 本地摄像头设备状态
   * @returns
   */
  @computed get localCameraTrackState(): AgoraRteMediaSourceState {
    return this.classroomStore.mediaStore.localCameraTrackState;
  }

  /**
   * 本地麦克风设备状态
   * @returns
   */
  @computed get localMicTrackState(): AgoraRteMediaSourceState {
    return this.classroomStore.mediaStore.localMicTrackState;
  }

  /**
   * 本地摄像头是否开启
   * @returns
   */
  @computed get localCameraOff() {
    return this.localCameraTrackState !== AgoraRteMediaSourceState.started;
  }

  /**
   * 本地麦克风设备是否开启
   * @returns
   */
  @computed get localMicOff() {
    return this.localMicTrackState !== AgoraRteMediaSourceState.started;
  }

  /**
   * 本地音频设备状态显示的 Icon 类型
   * microphone-off 麦克风开启
   * microphone-on  麦克风关闭
   * @returns Icon 类型
   */
  @computed get localMicIconType() {
    return this.localMicOff ? 'microphone-off' : 'microphone-on';
  }

  /**
   * 本地视频状态显示的占位符类型
   * @returns
   */
  @computed get localCameraPlaceholder(): CameraPlaceholderType {
    let placeholder = CameraPlaceholderType.none;
    switch (this.localCameraTrackState) {
      case AgoraRteMediaSourceState.started:
        placeholder = CameraPlaceholderType.none;
        break;
      case AgoraRteMediaSourceState.starting:
        placeholder = CameraPlaceholderType.loading;
        break;
      case AgoraRteMediaSourceState.stopped:
        placeholder = CameraPlaceholderType.muted;
        break;
      case AgoraRteMediaSourceState.error:
        placeholder = CameraPlaceholderType.broken;
        break;
    }
    return placeholder;
  }

  /**
   * @ignore
   */
  @computed get disable(): boolean {
    return false;
  }

  /**
   * 是否开启镜像
   * @returns
   */
  @computed
  get isMirror() {
    return this.classroomStore.mediaStore.isMirror;
  }

  /**
   * 是否开启美颜
   * @returns
   */
  @computed
  get isBeauty() {
    return this.classroomStore.mediaStore.isBeauty;
  }

  /**
   * 美白参数 (0 ~ 100)
   * @returns
   */
  @computed
  get whiteningValue() {
    return Math.ceil(this.beautyEffectOptions.lighteningLevel * 100);
  }

  /**
   * 红润参数 (0 ~ 100)
   * @returns
   */
  @computed
  get ruddyValue() {
    return Math.ceil(this.beautyEffectOptions.rednessLevel * 100);
  }

  /**
   * 磨皮参数 (0 ~ 100)
   * @returns
   */
  @computed
  get buffingValue() {
    return Math.ceil(this.beautyEffectOptions.smoothnessLevel * 100);
  }

  /**
   * 美颜调整参数类型
   * @returns
   */
  @computed
  get activeBeautyValue() {
    switch (this.activeBeautyType) {
      case BeautyType.buffing:
        return this.buffingValue;
      case BeautyType.ruddy:
        return this.ruddyValue;
      case BeautyType.whitening:
        return this.whiteningValue;
      case 'none':
        return 0;
    }
  }

  @computed
  get cameraVirtualBackgroundProcessor() {
    return this._cameraVirtualBackgroundProcessor;
  }

  @computed
  get cameraBeautyProcessor() {
    return this._cameraBeautyProcessor;
  }

  /**
   * 美颜类型 Icon
   */
  activeBeautyTypeIcon = computedFn((item) =>
    this.activeBeautyType === item.id
      ? { icon: item.icon, color: '#fff' }
      : { icon: item.icon, color: 'rgba(255,255,255,.5)' },
  );

  /**
   * 显示 Toast 信息
   * @param toast
   */
  @action.bound
  addToast(toast: AddToastArgs) {
    Logger.info(`[pretest] add toast ${toast.type}`);
    this.toastQueue.push({
      id: uuidv4(),
      ...toast,
    });
  }

  /**
   * 移除 Toast 信息
   * @param id
   * @returns
   */
  @action.bound
  removeToast(id: string) {
    this.toastQueue = this.toastQueue.filter((value) => value.id !== id);
    return id;
  }

  /**
   * 设置镜像开启或关闭
   * @param v 开启或关闭
   */
  @bound
  setMirror(v: boolean) {
    this.classroomStore.mediaStore.setMirror(v);
  }

  /**
   * 设置美颜开启或关闭
   * @param v
   */
  @bound
  setBeauty(v: boolean) {
    this.classroomStore.mediaStore.setBeauty(v);
  }

  /**
   * 开始扬声器测试
   * @param url
   */
  @action.bound
  startPlaybackDeviceTest(url: string) {
    this.playbackTesting = true;
    this.classroomStore.mediaStore.startPlaybackDeviceTest(url);
    this._timer && clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      this.stopPlaybackDeviceTest();
    }, 3000);
  }

  /**
   * 停止扬声器测试
   */
  @action.bound
  stopPlaybackDeviceTest() {
    this.playbackTesting = false;
    this.classroomStore.mediaStore.stopPlaybackDeviceTest();
  }

  /**
   * 开始麦克风测试
   */
  @bound
  startRecordingDeviceTest() {
    this.classroomStore.mediaStore.startRecordingDeviceTest(500);
  }

  /**
   * 停止麦克风测试
   */
  @bound
  stopRecordingDeviceTest() {
    this.classroomStore.mediaStore.stopRecordingDeviceTest();
  }

  /**
   * 打开本地摄像头
   * @param value 开启或关闭
   */
  @bound
  enableLocalVideo(value: boolean) {
    this.classroomStore.mediaStore.enableLocalVideo(value);
  }

  /**
   * 打开本地麦克风
   * @param value 开启或关闭
   */
  @bound
  enableLocalAudio(value: boolean) {
    this.classroomStore.mediaStore.enableLocalAudio(value);
  }

  /**
   * 设置当前使用摄像头设备
   * @param id
   */
  @action.bound
  setCameraDevice(id: string) {
    this.classroomStore.mediaStore.setCameraDevice(id);
  }

  /**
   * 设置当前使用麦克风设备
   * @param id
   */
  @action.bound
  setRecordingDevice(id: string) {
    this.classroomStore.mediaStore.setRecordingDevice(id);
    if (id === DEVICE_DISABLE) {
      this.stopRecordingDeviceTest();
    } else {
      this.startRecordingDeviceTest();
    }
  }

  /**
   * 设置美颜类型
   * @param value
   */
  @action.bound
  setActiveBeautyType(value: BeautyType | 'none') {
    this.activeBeautyType = value;
  }

  /**
   * 设置美颜参数
   * @param value (0 ~ 100)
   */
  @action.bound
  setActiveBeautyValue(value: number) {
    if (!this._cameraBeautyProcessor) return;
    const transformValue = Number((value / 100).toFixed(2));
    switch (this.activeBeautyType) {
      case BeautyType.buffing:
        this.beautyEffectOptions = {
          ...this.beautyEffectOptions,
          smoothnessLevel: transformValue,
        };

        break;
      case BeautyType.ruddy:
        this.beautyEffectOptions = {
          ...this.beautyEffectOptions,
          rednessLevel: transformValue,
        };
        break;
      case BeautyType.whitening:
        this.beautyEffectOptions = {
          ...this.beautyEffectOptions,
          lighteningLevel: transformValue,
        };
        break;
    }
  }

  /**
   * 重置美颜
   */
  @action.bound
  resetBeautyValue() {
    if (this._cameraBeautyProcessor) {
      (this._cameraBeautyProcessor as any).disable();
      this.beautyEffectOptions = DEFAULT_BEAUTY_OPTION;
    }
  }

  /**
   * 设置当前使用扬声器设备
   * @param id
   */
  @bound
  setPlaybackDevice(id: string) {
    this.classroomStore.mediaStore.setPlaybackDevice(id);
  }

  /**
   * 渲染本地视频
   * @param dom
   * @param mirror
   */
  @bound
  setupLocalVideo(dom: HTMLElement, mirror: boolean) {
    this.classroomStore.mediaStore.setupLocalVideo(dom, mirror);
  }
  /**
   * 设置单当前效果tab
   */
  @action.bound
  setCurrentEffectOption(type: effectType) {
    this.currentEffectType = type;
  }

  @action.bound
  setCurrentTab(type: deviceType) {
    this.currentPretestTab = type;
  }

  @action.bound
  handleBackgroundChange(
    key: string,
    value?: { type: 'img'; url: string } | { type: 'video'; url: string },
  ) {
    console.log('handleBackgroundChange');
    this.currentVirtualBackground = key;
    if (key === 'none') {
      this.disableVirtualBackground();
    }
    if (value) {
      const { type, url } = value;
      if (type === 'img') {
        const image = new Image();
        image.src = url;
        image.addEventListener('load', () => {
          console.log('handleBackgroundChange img load');
          this.setVirtualBackground({ type: 'img', source: image });
        });
      } else {
        const video = document.createElement('video');
        video.src = url;
        video.addEventListener('loadeddata', () => {
          console.log('handleBackgroundChange loadeddata load');
          this.setVirtualBackground({ type: 'video', source: video });
        });
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
      }
    }
  }

  @bound
  setVirtualBackground({
    type,
    source,
  }: { type: 'img'; source: HTMLImageElement } | { type: 'video'; source: HTMLVideoElement }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log('setVirtualBackground');
    console.log(source);
    this._cameraVirtualBackgroundProcessor &&
      (this._cameraVirtualBackgroundProcessor as any).setOptions({ type, source });
    this._cameraVirtualBackgroundProcessor &&
      (this._cameraVirtualBackgroundProcessor as any).enable();
  }

  @action.bound
  setUnderlineLeft(value: number) {
    this.underlineLeft = value;
  }

  /**
   * 初始化 virtual background processor
   * @returns
   */
  @action.bound
  initVirtualBackground() {
    return new Promise((resolve, reject) => {
      if (this._cameraVirtualBackgroundProcessor) reject();
      const target = EduClassroomConfig.shared.rteEngineConfig.rtcSDKExtensions.find(
        (item) => item.name === 'VirtualBackgroundExtension',
      );
      if (target) {
        const processor = target.instance.createProcessor();
        processor
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          .init('.')
          .then(() => {
            // this.classroomStore.mediaStore.addCameraProcessors([processor]);
            this._cameraVirtualBackgroundProcessor = processor;
            resolve(processor);
          })
          .catch((e: any) => {
            this.shareUIStore.addGenericErrorDialog(e);
          });
      }
    });
  }

  /**
   * 初始化美颜插件
   * @returns
   */
  @action.bound
  initBeauty() {
    return new Promise((resolve, reject) => {
      if (this._cameraBeautyProcessor) reject();
      const target = EduClassroomConfig.shared.rteEngineConfig.rtcSDKExtensions.find(
        (item) => item.name === 'BeautyEffectExtension',
      );
      if (target) {
        const processor = target.instance.createProcessor();
        // this.classroomStore.mediaStore.addCameraProcessors([processor]);
        this._cameraBeautyProcessor = processor;
        resolve(processor);
      }
    });
  }

  @action.bound
  async initVideoEffect() {
    const virtualProcessor = await this.initVirtualBackground();
    const beautyProcessor = await this.initBeauty();
    this.classroomStore.mediaStore.addCameraProcessors([
      virtualProcessor as AGBaseProcessor,
      beautyProcessor as AGBaseProcessor,
    ]);
  }

  /**
   * 关闭美颜
   */
  disableBeauty() {
    this._cameraBeautyProcessor && (this._cameraBeautyProcessor as any).disable();
  }

  /**
   * 关闭虚拟背景
   */
  @bound
  disableVirtualBackground() {
    this._cameraVirtualBackgroundProcessor &&
      (this._cameraVirtualBackgroundProcessor as any).disable();
  }

  @bound
  onDestroy() {
    EduEventCenter.shared.offClassroomEvents(this._handleInteractionEvents);
    for (const disposer of this._disposers) {
      disposer();
    }
    this._disposers.clear();
  }
}
