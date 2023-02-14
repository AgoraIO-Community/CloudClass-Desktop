import { AgoraExtensionWidgetEvent } from '@classroom/infra/api';
import { bound } from 'agora-rte-sdk';
import { action, computed, IReactionDisposer, reaction } from 'mobx';
import { LayoutUIStore } from '../common/layout';
import { ToastTypeEnum } from '../common/share';
export class LectureH5LayoutUIStore extends LayoutUIStore {
  private _disposers: (() => void)[] = [];
  @computed
  get flexOrientationCls() {
    return this.shareUIStore.orientation === 'portrait' ? 'col-reverse' : 'row';
  }

  @computed
  get chatWidgetH5Cls() {
    return this.shareUIStore.orientation === 'portrait' ? 'aisde-fixed' : 'flex-1';
  }

  @computed
  get h5ContainerCls() {
    return this.shareUIStore.orientation === 'portrait' ? '' : 'justify-center items-center';
  }

  @computed
  get h5LayoutUIDimensions() {
    return this.shareUIStore.orientation === 'portrait'
      ? {}
      : {
          height: this.shareUIStore.classroomViewportSize.h5Height,
          width: this.shareUIStore.classroomViewportSize.h5Width,
        };
  }
  @bound
  private _updateOrientationStates() {
    this.extensionApi.updateOrientationStates({
      orientation: this.shareUIStore.orientation,
      forceLandscape: this.shareUIStore.forceLandscape,
    });
  }
  @bound
  private _quitForceLandscape() {
    this.shareUIStore.setForceLandscape(false);
  }
  @bound
  private _addSingletonToast({ desc, type }: { desc: string; type: ToastTypeEnum }) {
    this.shareUIStore.addSingletonToast(desc, type);
  }
  onInstall(): void {
    this._disposers.push(
      computed(() => ({
        orientation: this.shareUIStore.orientation,
        forceLandscape: this.shareUIStore.forceLandscape,
        widgetController: this.classroomStore.widgetStore.widgetController,
      })).observe(({ newValue, oldValue }) => {
        if (oldValue?.widgetController) {
          const widgetController = oldValue.widgetController;
          widgetController.removeBroadcastListener({
            messageType: AgoraExtensionWidgetEvent.RequestOrientationStates,
            onMessage: this._updateOrientationStates,
          });
          widgetController.removeBroadcastListener({
            messageType: AgoraExtensionWidgetEvent.QuitForceLandscape,
            onMessage: this._quitForceLandscape,
          });
          widgetController.removeBroadcastListener({
            messageType: AgoraExtensionWidgetEvent.AddSingletonToast,
            onMessage: this._addSingletonToast,
          });
        }
        if (newValue.widgetController) {
          const widgetController = newValue.widgetController;
          widgetController.addBroadcastListener({
            messageType: AgoraExtensionWidgetEvent.RequestOrientationStates,
            onMessage: this._updateOrientationStates,
          });
          widgetController.addBroadcastListener({
            messageType: AgoraExtensionWidgetEvent.QuitForceLandscape,
            onMessage: this._quitForceLandscape,
          });
          widgetController.addBroadcastListener({
            messageType: AgoraExtensionWidgetEvent.AddSingletonToast,
            onMessage: this._addSingletonToast,
          });
          this._updateOrientationStates();
        }
      }),
    );
  }
  onDestroy(): void {
    this._disposers.forEach((d) => {
      d();
    });
    this._disposers = [];
  }
}
