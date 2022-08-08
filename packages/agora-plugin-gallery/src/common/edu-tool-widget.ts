import {
  AgoraExtensionWidgetEvent,
  AgoraTrackSyncedWidget,
  AgoraWidgetBase,
  AgoraWidgetLifecycle,
  AgoraWidgetTrackMode,
} from 'agora-classroom-sdk';
import {
  AgoraWidgetController,
  AgoraWidgetTrack,
  Dimensions,
  Point,
  Track,
  TrackOptions,
} from 'agora-edu-core';
import { bound } from 'agora-rte-sdk';

/**
 * 教学工具 Widget 基类，使用此抽象类作为基类实现可拖拽且轨迹同步的 Widget
 */
export abstract class AgoraEduToolWidget
  extends AgoraWidgetBase
  implements AgoraWidgetLifecycle, AgoraTrackSyncedWidget
{
  private _controlStateCallbacks: CallableFunction[] = [];
  onUninstall(controller: AgoraWidgetController) {}
  onInstall(controller: AgoraWidgetController) {}
  onCreate(properties: any, userProperties: any): void {}
  onPropertiesUpdate(properties: any): void {}
  onUserPropertiesUpdate(userProperties: any): void {}
  onDestroy(): void {}
  get track(): Track {
    return this.trackController?.track!;
  }
  get zIndex(): number {
    return this.trackController?.zIndex || 0;
  }
  @bound
  updateZIndexToRemote(zIndex: number) {
    this.trackController?.updateRemoteZIndex(zIndex);
    this.widgetController.zIndexController.setZIndex(zIndex);
  }
  @bound
  updateZIndexToLocal(zIndex: number) {
    this.trackController?.updateLocalZIndex(zIndex);
    this.widgetController.zIndexController.setZIndex(zIndex);
  }
  get draggable(): boolean {
    return true;
  }
  get resizable(): boolean {
    return false;
  }
  get dragHandleClassName(): string {
    return 'modal-title';
  }
  get dragCancelClassName(): string {
    return 'modal-title-close';
  }
  get boundaryClassName(): string {
    return 'widget-slot-board';
  }
  get minWidth(): number {
    return 0;
  }
  get minHeight(): number {
    return 0;
  }
  get trackMode(): AgoraWidgetTrackMode {
    return AgoraWidgetTrackMode.TrackPositionOnly;
  }

  @bound
  updateToRemote(
    end: boolean,
    pos: Point,
    dimensions?: Dimensions | undefined,
    options?: TrackOptions | undefined,
  ): void {
    this.trackController?.updateRemoteTrack(end, pos, dimensions, options);
  }

  @bound
  updateToLocal(trackProps: AgoraWidgetTrack): void {
    this.trackController?.updateLocalTrack(trackProps);
  }

  @bound
  handleResize({ width, height }: { width: number; height: number }) {
    this.track.setRealDimensions({ width, height });
    this.track.reposition(false);
  }

  @bound
  handleClose() {
    this.widgetController.broadcast(AgoraExtensionWidgetEvent.WidgetBecomeInactive, this.widgetId);

    this.deleteWidget();
  }

  @bound
  setVisibility(visible: boolean) {
    this.track.setVisibility(visible);
  }

  get controlled() {
    return this.hasPrivilege;
  }

  addControlStateListener(cb: (controlled: boolean) => void) {
    this._controlStateCallbacks.push(cb);
  }

  removeControlStateListener(cb: (controlled: boolean) => void) {
    this._controlStateCallbacks = this._controlStateCallbacks.filter((c) => c !== cb);
  }

  fireControlStateChanged() {
    const controled = this.controlled;
    this._controlStateCallbacks.forEach((cb) => {
      cb(controled);
    });
  }
}
