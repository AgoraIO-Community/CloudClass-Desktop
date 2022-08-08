import { FcrUIConfig } from '@/infra/types/config';
import {
  Track,
  Dimensions,
  AgoraWidgetTrack,
  AgoraWidgetController,
  EduClassroomStore,
  AgoraWidgetMessageListener,
  TrackOptions,
} from 'agora-edu-core';
import { Point } from 'electron';
import { FcrTheme } from '~ui-kit';
import { EduShareUIStore } from '../share-ui';
import { AgoraWidgetTrackMode } from './type';
import { AgoraWidgetTrackController } from './widget-track';

export interface AgoraWidgetLifecycle {
  /**
   * Widget被安装
   * @param controller
   */
  onInstall(controller: AgoraWidgetController): void;
  /**
   * Widget被实例化完成
   * @param properties
   * @param userProperties
   */
  onCreate(properties: any, userProperties: any): void;
  /**
   * Widget属性变更
   * @param properties
   */
  onPropertiesUpdate(properties: any): void;
  /**
   * Widget用户属性变更
   * @param userProperties
   */
  onUserPropertiesUpdate(userProperties: any): void;
  /**
   * Widget被销毁
   */
  onDestroy(): void;

  /**
   * Widget被卸载
   * @param controller
   */
  onUninstall(controller: AgoraWidgetController): void;
}

export interface AgoraWidgetRenderable {
  /**
   * 组件渲染
   * @param dom
   */
  render(dom: HTMLElement): void;
  /**
   * 组件卸载
   */
  unload(): void;

  /**
   * 挂载点
   */
  locate(): HTMLElement | undefined | null;
}

/**
 * 多实例 Widget
 */
export interface AgoraMultiInstanceWidget {
  /**
   * 设置实例ID
   * @param instId
   */
  setInstanceId(instId: string): void;

  /**
   * 实例ID
   */
  get instanceId(): string;
}

export interface AgoraTrackSyncedWidget {
  /**
   * 轨迹信息
   */
  get track(): Track;

  /**
   * 层级
   */
  get zIndex(): number;

  /**
   * 更新层级到远端
   */
  updateZIndexToRemote(zIndex: number): void;

  /**
   * 更新层级到本地
   */
  updateZIndexToLocal(zIndex: number): void;

  /**
   * 是否可拖拽
   */
  get draggable(): boolean;

  /**
   * 是否可调整大小
   */
  get resizable(): boolean;

  /**
   * 可拖拽区域元素类名
   */
  get dragHandleClassName(): string;

  /**
   * 不可拖拽区域元素类名
   */
  get dragCancelClassName(): string;

  /**
   * 拖拽大小调整区域
   */
  get boundaryClassName(): string;

  /**
   * 最小宽度
   */
  get minWidth(): number;

  /**
   * 最小高度
   */
  get minHeight(): number;

  /**
   * 轨迹同步模式
   */
  get trackMode(): AgoraWidgetTrackMode;

  /**
   * 是否可控
   */
  get controlled(): boolean;

  /**
   * 更新轨迹到远端
   */
  updateToRemote(end: boolean, pos: Point, dimensions?: Dimensions, options?: TrackOptions): void;

  /**
   * 更新轨迹到本地
   */
  updateToLocal(trackProps: AgoraWidgetTrack): void;

  /**
   * 增加 Widget 控制状态监听
   * @param controlled
   */
  addControlStateListener(cb: (controlled: boolean) => void): void;

  /**
   * 移除 Widget 控制状态监听
   * @param controlled
   */
  removeControlStateListener(cb: (controlled: boolean) => void): void;
}

/**
 * Widget 基类，提供 Widget 相关操作API
 */
export abstract class AgoraWidgetBase implements AgoraWidgetRenderable, AgoraMultiInstanceWidget {
  private _trackController?: AgoraWidgetTrackController;
  private _instanceId = '';

  constructor(
    private _widgetController: AgoraWidgetController,
    private _classroomStore: EduClassroomStore,
    private _shareUIStore: EduShareUIStore,
    private _uiConfig: FcrUIConfig,
    private _theme: FcrTheme,
  ) {}

  setInstanceId(instId: string): void {
    this._instanceId = instId;
  }

  get instanceId() {
    return this._instanceId;
  }

  /**
   * Widget的名称
   */
  abstract get widgetName(): string;

  /**
   * 是否有 Widget 权限
   * @returns
   */
  abstract get hasPrivilege(): boolean;

  /**
   * Widget唯一ID
   */
  get widgetId() {
    if (this._instanceId) {
      return this.widgetName + '-' + this._instanceId;
    }
    return this.widgetName;
  }

  /**
   * 容器层级
   */
  get zContainer(): 0 | 10 {
    return 0;
  }

  /**
   * 轨迹同步控制器
   */
  get trackController() {
    return this._trackController;
  }

  /**
   * Widget控制器
   */
  get widgetController() {
    return this._widgetController;
  }

  /**
   * 教室 Store
   */
  get classroomStore() {
    return this._classroomStore;
  }

  /**
   * 共享UIStore
   */
  get shareUIStore() {
    return this._shareUIStore;
  }

  /**
   * 教室配置
   */
  get classroomConfig() {
    return this._widgetController.classroomConfig;
  }

  /**
   * UI配置
   */
  get uiConfig() {
    return this._uiConfig;
  }

  /**
   * 主题
   */
  get theme() {
    return this._theme;
  }

  /**
   * 发送消息
   * @param messageType
   * @param message
   */
  sendMessage(toWidgetId: string, messageType: string, message: unknown) {
    this._widgetController.sendMessage(toWidgetId, messageType, message);
  }

  /**
   * 增加一个消息监听器
   * @param listener
   */
  addMessageListener(listener: Pick<AgoraWidgetMessageListener, 'messageType' | 'onMessage'>) {
    this._widgetController.addWidgetMessageListener({
      widgetId: this.widgetId,
      messageType: listener.messageType,
      onMessage: listener.onMessage,
    });
  }

  /**
   * 移除一个消息监听器
   * @param listener
   */
  removeMessageListener(listener: Pick<AgoraWidgetMessageListener, 'messageType' | 'onMessage'>) {
    this._widgetController.removeWidgetMessageListener({
      widgetId: this.widgetId,
      messageType: listener.messageType,
      onMessage: listener.onMessage,
    });
  }

  /**
   * 广播消息
   * @param messageType
   * @param message
   */
  broadcast(messageType: string, message: unknown) {
    this._widgetController.broadcast(messageType, message);
  }

  /**
   * 增加广播监听
   * @param listener
   */
  addBroadcastListener(listener: Omit<AgoraWidgetMessageListener, 'widgetId'>) {
    this._widgetController.addBroadcastListener(listener);
  }

  /**
   * 移除广播监听
   * @param listener
   */
  removeBroadcastListener(listener: Omit<AgoraWidgetMessageListener, 'widgetId'>) {
    this._widgetController.removeBroadcastListener(listener);
  }

  /**
   * 更新属性
   * @param properties
   * @returns
   */
  updateWidgetProperties(properties: any) {
    return this._widgetController.updateWidgetProperties(this.widgetId, properties);
  }

  /**
   * 更新用户属性
   * @param userProperties
   * @returns
   */
  updateWidgetUserProperties(userProperties: any) {
    return this._widgetController.updateWidgetUserProperties(this.widgetId, userProperties);
  }

  /**
   * 删除 Widget
   * @returns
   */
  deleteWidget() {
    return this.widgetController.deleteWidget(this.widgetId);
  }
  /**
   * 删除 Widget 用户属性
   * @param keys
   * @returns
   */
  removeWidgetUserProperties(keys: string[]) {
    return this.widgetController.removeWidgetUserProperties(this.widgetId, keys);
  }
  /**
   * 删除 Widget 扩展属性
   * @param keys
   * @returns
   */
  removeWidgetExtraProperties(keys: string[]) {
    return this.widgetController.removeWidgetExtraProperties(this.widgetId, keys);
  }

  /**
   * 设置 Widget 为活跃状态
   * @param props
   */
  setActive(props: any = {}) {
    const trackProps: any = {};
    const track = this.trackController?.track;
    const posOnly = this.trackController?.posOnly;
    if (track) {
      trackProps.position = {
        xaxis: track.ratioVal.ratioPosition.x,
        yaxis: track.ratioVal.ratioPosition.y,
      };
      if (!posOnly) {
        trackProps.size = {
          width: track.ratioVal.ratioDimensions.width,
          height: track.ratioVal.ratioDimensions.height,
        };
      }
    }
    this.widgetController.setWidegtActive(this.widgetId, { ...props, ...trackProps });
  }

  /**
   * 设置 Widget 为不活跃状态
   */
  setInactive(props: any = {}) {
    this.widgetController.setWidgetInactive(this.widgetId, props);
  }

  locate(): HTMLElement | undefined | null {
    return undefined;
  }

  render(dom: HTMLElement) {}

  unload() {}

  /**
   * 获取最新组件层级
   */
  get latestZIndex() {
    const latest = this.widgetController.zIndexController.incrementZIndex();
    return latest;
  }

  setTrackController(controller: AgoraWidgetTrackController) {
    this._trackController = controller;
  }
}
