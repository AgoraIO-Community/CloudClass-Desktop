import {
  AGBeautyEffect,
  AGLighteningLevel,
  AgoraRtcLocalVideoCanvas,
  AgoraRteMediaSourceState,
  bound,
  Log,
} from 'agora-rte-sdk';
import { action, computed, IReactionDisposer, Lambda, observable, reaction } from 'mobx';
import { EduUIStoreBase } from '../base';
import { v4 as uuidv4 } from 'uuid';
import {
  AgoraEduClassroomEvent,
  BeautyType,
  DEVICE_DISABLE,
  EduClassroomConfig,
  EduEventCenter,
  EduRoleTypeEnum,
  EduRteEngineConfig,
  EduRteRuntimePlatform,
  Platform,
} from 'agora-edu-core';
import { transI18n } from 'agora-common-libs';
import { builtInExtensions, getProcessorInitializer } from '@classroom/infra/api/rtc-extensions';
import { IAIDenoiserProcessor } from 'agora-extension-ai-denoiser';
import { IVirtualBackgroundProcessor } from 'agora-extension-virtual-background';
import { IBeautyProcessor } from 'agora-extension-beauty-effect';
import { DeviceStateChangedReason } from './type';
import { CameraPlaceholderType } from '../stream/struct';
import { matchVirtualSoundCardPattern } from './helper';

export type PretestToast = {
  id: string;
  type: 'video' | 'audio_recording' | 'audio_playback' | 'error';
  info: string;
};

type AddToastArgs = Omit<PretestToast, 'id'>;
type EffectType = 'beauty' | 'virtualBackground';
type DeviceType = 'audio' | 'video';

const DEFAULT_BEAUTY_OPTION = {
  lighteningContrastLevel: AGLighteningLevel.low,
  lighteningLevel: 0,
  rednessLevel: 0,
  smoothnessLevel: 0,
  sharpnessLevel: 0,
};

@Log.attach()
export class PretestUIStore extends EduUIStoreBase {
  private _disposers: (Lambda | IReactionDisposer)[] = [];
  @observable currentEffectType: EffectType =
    EduRteEngineConfig.platform === EduRteRuntimePlatform.Web ? 'virtualBackground' : 'beauty'; // 视频效果选项
  @observable beautyEffectOptions: AGBeautyEffect = DEFAULT_BEAUTY_OPTION; // 美颜参数
  @observable currentPretestTab: DeviceType | 'stage' = 'video'; // 音视频选项
  @observable aiDenoiserEnabled = false; // 是否开启AI降噪
  @observable backgroundImage = []; // 虚拟背景
  @observable currentVirtualBackground = 'none'; // 当前选择虚拟背景选项

  private _virtualBackgroundProcessor?: IVirtualBackgroundProcessor;
  private _beautyEffectProcessor?: IBeautyProcessor;
  private _aiDenoiserProcessor?: IAIDenoiserProcessor;

  private _virtualBackgroundProcessorForPreview?: IVirtualBackgroundProcessor;
  private _beautyEffectProcessorForPreview?: IBeautyProcessor;
  private _aiDenoiserProcessorForPreview?: IAIDenoiserProcessor;

  onInstall() {
    this._disposers.push(
      reaction(
        () =>
          this.classroomStore.connectionStore.engine &&
          EduRteEngineConfig.platform === EduRteRuntimePlatform.Web &&
          EduClassroomConfig.shared.platform !== Platform.H5 &&
          EduClassroomConfig.shared.sessionInfo.role !== EduRoleTypeEnum.invisible,
        (processorsRequired) => {
          if (processorsRequired) {
            getProcessorInitializer<IVirtualBackgroundProcessor>(
              builtInExtensions.virtualBackgroundExtension,
            )
              .createProcessor()
              .then((processor) => {
                this.logger.info('VirtualBackgroundProcessor initialized');
                this._virtualBackgroundProcessor = processor;
                this.classroomStore.mediaStore.addCameraProcessors([processor]);
              });

            getProcessorInitializer<IBeautyProcessor>(builtInExtensions.beautyEffectExtension)
              .createProcessor()
              .then((processor) => {
                this.logger.info('BeautyEffectProcessor initialized');
                this._beautyEffectProcessor = processor;
                this.classroomStore.mediaStore.addCameraProcessors([processor]);
              });

            getProcessorInitializer<IAIDenoiserProcessor>(builtInExtensions.aiDenoiserExtension)
              .createProcessor()
              .then((processor) => {
                this.logger.info('AiDenoiserProcessor initialized');
                this._aiDenoiserProcessor = processor;
                this.classroomStore.mediaStore.addMicrophoneProcessors([processor]);
              });

            getProcessorInitializer<IVirtualBackgroundProcessor>(
              builtInExtensions.virtualBackgroundExtension,
            )
              .createProcessor()
              .then((processor) => {
                this.logger.info('VirtualBackgroundProcessor initialized');
                this._virtualBackgroundProcessorForPreview = processor;
                this.classroomStore.mediaStore.addPreviewCameraProcessors([processor]);
              });

            getProcessorInitializer<IBeautyProcessor>(builtInExtensions.beautyEffectExtension)
              .createProcessor()
              .then((processor) => {
                this.logger.info('BeautyEffectProcessor initialized');
                this._beautyEffectProcessorForPreview = processor;
                this.classroomStore.mediaStore.addPreviewCameraProcessors([processor]);
              });

            getProcessorInitializer<IAIDenoiserProcessor>(builtInExtensions.aiDenoiserExtension)
              .createProcessor()
              .then((processor) => {
                this.logger.info('AiDenoiserProcessor initialized');
                this._aiDenoiserProcessorForPreview = processor;
                this.classroomStore.mediaStore.addPreviewMicrophoneProcessors([processor]);
              });
          }
        },
      ),
    );

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

    this._disposers.push(videoDisposer);

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

    this._disposers.push(audioRecordingDisposer);

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

    this._disposers.push(playbackDisposer);

    this._disposers.push(
      reaction(
        () => ({
          engine: this.classroomStore.connectionStore.engine,
          activeBeautyType: this.activeBeautyType,
          beautyEffectOptions: this.beautyEffectOptions,
        }),
        ({ engine, activeBeautyType, beautyEffectOptions }) => {
          if (engine) {
            const mediaControl = engine.getAgoraMediaControl();

            if (activeBeautyType === 'none') {
              if (EduRteEngineConfig.platform === EduRteRuntimePlatform.Web) {
                this._beautyEffectProcessor?.disable();
                this._beautyEffectProcessorForPreview?.disable();
              } else {
                mediaControl.setBeautyEffectOptions(false, beautyEffectOptions);
              }
            } else {
              if (EduRteEngineConfig.platform === EduRteRuntimePlatform.Web) {
                this._beautyEffectProcessor?.setOptions(beautyEffectOptions);
                this._beautyEffectProcessor?.enable();
                this._beautyEffectProcessorForPreview?.setOptions(beautyEffectOptions);
                this._beautyEffectProcessorForPreview?.enable();
              } else {
                mediaControl.setBeautyEffectOptions(true, beautyEffectOptions);
              }
            }
          }
        },
      ),
    );

    this._disposers.push(
      reaction(
        () => ({
          aiDenoiserEnabled: this.aiDenoiserEnabled,
          engine: this.classroomStore.connectionStore.engine,
        }),
        ({ engine, aiDenoiserEnabled }) => {
          if (engine) {
            if (!aiDenoiserEnabled) {
              this._aiDenoiserProcessor?.disable();
              this._aiDenoiserProcessorForPreview?.disable();
            } else {
              this._aiDenoiserProcessor?.enable();
              this._aiDenoiserProcessorForPreview?.enable();
            }
          }
        },
      ),
    );

    EduEventCenter.shared.onClassroomEvents(this._handleInteractionEvents);
  }

  get virtualBackgroundSupported() {
    return EduRteEngineConfig.platform === EduRteRuntimePlatform.Web;
  }
  get beautySupported() {
    return true;
  }

  get aiDenoiserSupported() {
    return EduRteEngineConfig.platform === EduRteRuntimePlatform.Web;
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
    return this.classroomStore.mediaStore.audioRecordingDevices
      .slice()
      .filter(({ devicename }) => !matchVirtualSoundCardPattern(devicename))
      .sort((d) => {
        return d.isDefault ? -1 : 0;
      })
      .map((item) => ({
        label: item.deviceid === DEVICE_DISABLE ? transI18n('disabled') : item.devicename,
        value: item.deviceid,
      }));
  }

  /**
   * 扬声器设备列表
   * @returns
   */
  @computed get playbackDevicesList() {
    const playbackDevicesList = this.classroomStore.mediaStore.audioPlaybackDevices
      .slice()
      .filter(({ devicename }) => !matchVirtualSoundCardPattern(devicename))
      .sort((d) => {
        return d.isDefault ? -1 : 0;
      })
      .map((item) => ({
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
   * 本地音量（设备检测）
   * @returns
   */
  @computed get localPreviewVolume(): number {
    return this.classroomStore.mediaStore.recordingDeviceId === DEVICE_DISABLE
      ? 0
      : this.classroomStore.mediaStore.localPreviewMicAudioVolume * 100;
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
   * 本地摄像头设备状态（设备检测）
   * @returns
   */
  @computed get localPreviewCameraTrackState(): AgoraRteMediaSourceState {
    return this.classroomStore.mediaStore.localPreviewCameraTrackState;
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
   * 本地摄像头是否开启（设备检测）
   */
  @computed get localPreviewCameraOff() {
    return this.localCameraTrackState !== AgoraRteMediaSourceState.started;
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
   * 本地视频状态显示的占位符类型（设备检测）
   * @returns
   */
  @computed get localPreviewCameraPlaceholder(): CameraPlaceholderType {
    let placeholder = CameraPlaceholderType.none;
    switch (this.localPreviewCameraTrackState) {
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

  /**
   * 显示 Toast 信息
   * @param toast
   */
  @action.bound
  addToast(toast: AddToastArgs) {
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
    if (id === DEVICE_DISABLE) {
      this.stopCameraPreview();
    } else {
      this.startCameraPreview();
    }
  }

  /**
   * 设置当前使用麦克风设备
   * @param id
   */
  @action.bound
  setRecordingDevice(id: string) {
    this.classroomStore.mediaStore.setRecordingDevice(id);
    if (id === DEVICE_DISABLE) {
      this.stopAudioRecordingPreview();
      this.stopRecordingDeviceTest();
    } else {
      this.startAudioRecordingPreview();
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
    if (value === 'none') {
      this.beautyEffectOptions = DEFAULT_BEAUTY_OPTION;
    }
  }

  /**
   * 设置美颜参数
   * @param value (0 ~ 100)
   */
  @action.bound
  setActiveBeautyValue(value: number) {
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
  setCurrentEffectOption(type: EffectType) {
    this.currentEffectType = type;
  }

  @action.bound
  setCurrentTab(type: DeviceType | 'stage') {
    this.currentPretestTab = type;
  }

  @action.bound
  handleBackgroundChange(
    key: string,
    value?: { type: 'img'; url: string } | { type: 'video'; url: string },
  ) {
    this.currentVirtualBackground = key;
    if (key === 'none') {
      this._virtualBackgroundProcessor?.disable();
      this._virtualBackgroundProcessorForPreview?.disable();
    }
    if (value) {
      const { type, url } = value;
      if (type === 'img') {
        const image = new Image();
        image.src = url;
        image.addEventListener('load', () => {
          this.setVirtualBackground({ type: 'img', source: image });
        });
      } else {
        const video = document.createElement('video');
        video.src = url;
        video.addEventListener('loadeddata', () => {
          this.setVirtualBackground({ type: 'video', source: video });
        });
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
      }
    }
  }

  @action.bound
  setAIDenoiser(enable: boolean) {
    this.aiDenoiserEnabled = enable;
  }

  @bound
  setVirtualBackground({
    type,
    source,
  }: { type: 'img'; source: HTMLImageElement } | { type: 'video'; source: HTMLVideoElement }) {
    this._virtualBackgroundProcessor?.setOptions({ type, source });
    this._virtualBackgroundProcessor?.enable();
    this._virtualBackgroundProcessorForPreview?.setOptions({ type, source });
    this._virtualBackgroundProcessorForPreview?.enable();
  }

  @bound
  startCameraPreview() {
    const track = this.classroomStore.mediaStore.mediaControl.createCameraVideoTrack();
    const processors = [];

    if (this._virtualBackgroundProcessorForPreview) {
      processors.push(this._virtualBackgroundProcessorForPreview);
    }
    if (this._beautyEffectProcessorForPreview) {
      processors.push(this._beautyEffectProcessorForPreview);
    }
    track.startPreview(processors);
    console.log('start camera preview');
  }
  @bound
  stopCameraPreview() {
    const track = this.classroomStore.mediaStore.mediaControl.createCameraVideoTrack();
    track.stopPreview();
    console.log('stop camera preview');
  }
  @bound
  startAudioRecordingPreview() {
    const track = this.classroomStore.mediaStore.mediaControl.createMicrophoneAudioTrack();
    const processors = [];
    if (this._aiDenoiserProcessorForPreview) {
      processors.push(this._aiDenoiserProcessorForPreview);
    }
    track.startPreview(processors);
    console.log('start microphone preview');
  }
  @bound
  stopAudioRecordingPreview() {
    const track = this.classroomStore.mediaStore.mediaControl.createMicrophoneAudioTrack();

    track.stopPreview();
    console.log('stop microphone preview');
  }

  @bound
  setupLocalVideoPreview(dom: HTMLElement, mirror: boolean) {
    const track = this.classroomStore.mediaStore.mediaControl.createCameraVideoTrack();
    track.setPreviewView(new AgoraRtcLocalVideoCanvas(dom, mirror));
    console.log('setup local video preview');
  }

  @bound
  onDestroy() {
    EduEventCenter.shared.offClassroomEvents(this._handleInteractionEvents);
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}
