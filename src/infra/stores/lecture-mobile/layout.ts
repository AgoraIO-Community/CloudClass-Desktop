import { transI18n } from 'agora-common-libs';
import { ClassroomState } from 'agora-edu-core';
import { bound, Scheduler } from 'agora-rte-sdk';
import { action, computed, observable, reaction } from 'mobx';
import { LayoutUIStore } from '../common/layout';
import { ToastTypeEnum } from '../common/share';
import { AgoraExtensionWidgetEvent } from '@classroom/infra/protocol/events';
import { getIOSVersion, isIOS, isWeChatBrowser } from '@classroom/infra/utils';
export enum MobileCallState {
  Initialize = 'initialize',
  Processing = 'processing',
  VoiceCall = 'voiceCall',
  VideoCall = 'videoCall',
  VideoAndVoiceCall = 'videoAndVoiceCall',
  DeviceOffCall = 'deviceOffCall',
}
export class LectureH5LayoutUIStore extends LayoutUIStore {
  private _disposers: (() => void)[] = [];
  @observable landscapeToolBarVisible = true;
  private _landscapeToolBarVisibleTask: Scheduler.Task | null = null;
  @observable shareActionSheetVisible = false;

  @action.bound
  setShareActionSheetVisible(visible: boolean) {
    this.shareActionSheetVisible = visible;
  }

  @observable handsUpActionSheetVisible = false;
  @action.bound
  setHandsUpActionSheetVisible(visible: boolean) {
    this.handsUpActionSheetVisible = visible;
  }
  @action.bound
  openHandsUpActionSheet() {
    const isSupported = this.checkIsSupportCall();
    if (!isSupported) {
      this.shareUIStore.addSingletonToast(
        transI18n('fcr_raisehand_tips_not_supported_browser'),
        'info',
      );
      return;
    }
    this.setHandsUpActionSheetVisible(true);
  }

  checkIsSupportCall() {
    if (isIOS() && isWeChatBrowser() && getIOSVersion() < 14.3) {
      return false;
    }
    return true;
  }
  @computed
  get h5ContainerCls() {
    return this.shareUIStore.orientation === 'portrait' ? '' : 'justify-center items-center';
  }
  @computed
  get classRoomPlacholderMobileHeight() {
    const innerWidth = this.shareUIStore.isLandscape ? window.innerWidth : window.innerWidth;
    return innerWidth * (190 / 375);
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
  @bound
  private _handlePollWidgetActiveStateChanged(active: boolean) {
    if (active) {
      this.shareUIStore.addSingletonToast(transI18n('fcr_H5_tips_chat_pollopened'), 'info');
    } else {
      this.shareUIStore.addSingletonToast(transI18n('fcr_H5_tips_chat_pollclosed'), 'info');
    }
  }
  @bound
  private _updateMobileLandscapeToolBarVisible() {
    this.extensionApi.updateMobileLandscapeToolBarVisible(this.landscapeToolBarVisible);
  }
  @action.bound
  private _setLandscapeToolBarVisible(visible: boolean) {
    this.landscapeToolBarVisible = visible;
    this._updateMobileLandscapeToolBarVisible();
  }
  @action.bound
  toggleLandscapeToolBarVisible() {
    if (!this.shareUIStore.isLandscape) return;
    this._landscapeToolBarVisibleTask?.stop();
    this.landscapeToolBarVisible = !this.landscapeToolBarVisible;
    this._updateMobileLandscapeToolBarVisible();
  }
  @bound
  private _handleTouchStart() {
    this._landscapeToolBarVisibleTask?.stop();
  }
  @bound
  broadcastCallState(callState: MobileCallState) {
    this.extensionApi.updateMobileCallState(callState);
  }
  onInstall(): void {
    this._disposers.push(
      reaction(
        () => {
          return {
            isLandscape: this.shareUIStore.isLandscape,
            isConnected:
              this.classroomStore.connectionStore.classroomState === ClassroomState.Connected,
          };
        },
        ({ isLandscape, isConnected }) => {
          if (isLandscape && isConnected) {
            this._setLandscapeToolBarVisible(true);
            window.addEventListener('touchstart', this._handleTouchStart, { once: true });
            this._landscapeToolBarVisibleTask = Scheduler.shared.addDelayTask(() => {
              window.removeEventListener('touchstart', this._handleTouchStart);
              this._setLandscapeToolBarVisible(false);
            }, 4000);
          } else {
            window.removeEventListener('touchstart', this._handleTouchStart);
            this._landscapeToolBarVisibleTask?.stop();
            this._setLandscapeToolBarVisible(true);
            this.setShareActionSheetVisible(false);
          }
        },
      ),
    );
    this._disposers.push(
      computed(() => {
        return this.classroomStore.userStore.teacherList.size;
      }).observe(({ oldValue, newValue }) => {
        if (oldValue && oldValue > 0 && newValue <= 0) {
          this.shareUIStore.addSingletonToast(transI18n('fcr_home_status_teacher_leave'), 'info');
        }
      }),
    );

    this._disposers.push(
      computed(() => ({
        orientation: this.shareUIStore.orientation,
        forceLandscape: this.shareUIStore.forceLandscape,
        widgetController: this.classroomStore.widgetStore.widgetController,
      })).observe(({ newValue, oldValue }) => {
        if (oldValue?.widgetController) {
          const widgetController = oldValue.widgetController;
          widgetController.removeBroadcastListener({
            messageType: AgoraExtensionWidgetEvent.OpenMobileHandsActionSheet,
            onMessage: this.openHandsUpActionSheet,
          });
          widgetController.removeBroadcastListener({
            messageType: AgoraExtensionWidgetEvent.RequestMobileLandscapeToolBarVisible,
            onMessage: this._updateMobileLandscapeToolBarVisible,
          });
          widgetController.removeBroadcastListener({
            messageType: AgoraExtensionWidgetEvent.PollActiveStateChanged,
            onMessage: this._handlePollWidgetActiveStateChanged,
          });
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
            messageType: AgoraExtensionWidgetEvent.OpenMobileHandsActionSheet,
            onMessage: this.openHandsUpActionSheet,
          });
          widgetController.addBroadcastListener({
            messageType: AgoraExtensionWidgetEvent.RequestMobileLandscapeToolBarVisible,
            onMessage: this._updateMobileLandscapeToolBarVisible,
          });
          widgetController.addBroadcastListener({
            messageType: AgoraExtensionWidgetEvent.PollActiveStateChanged,
            onMessage: this._handlePollWidgetActiveStateChanged,
          });
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
