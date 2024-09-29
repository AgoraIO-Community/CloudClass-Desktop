import { ClassState, ClassroomState, RecordStatus } from 'agora-edu-core';
import { action, computed, observable, reaction } from 'mobx';
import { EduUIStoreBase } from '../base';
import { Scheduler, bound } from 'agora-rte-sdk';
import { CommonDialogType, DialogType, MobileCallState } from '../type';
import { v4 as uuidv4 } from 'uuid';

import { getIOSVersion, isIOS, isSafari, isWeChatBrowser } from '@classroom/utils';
import { AgoraExtensionWidgetEvent } from '@classroom/protocol/events';
import { transI18n } from 'agora-common-libs';
import { ToastTypeEnum } from '../share';
import { ConfirmDialogProps } from '@classroom/containers/confirm-dialog/confirm-dialog';
import dayjs from 'dayjs';
export enum TimeFormatType {
  Timeboard,
  Message,
}
export class LayoutUIStore extends EduUIStoreBase {
  private _disposers: (() => void)[] = [];
  @observable landscapeToolBarVisible = true;
  // private _landscapeToolBarVisibleTask: Scheduler.Task | null = null;
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
  formatCountDown(time: number, mode: TimeFormatType): string {
    const seconds = Math.floor(time / 1000);
    const duration = dayjs.duration(time);
    let formatItems: string[] = [];

    const hours_text = duration.hours() === 0 ? '' : `H :`;
    const mins_text = duration.minutes() === 0 ? '' : duration.seconds() === 0 ? `m :` : `m :`;
    const seconds_text = duration.seconds() === 0 ? '' : `s`;
    const short_hours_text = `HH :`;
    const short_mins_text = `mm :`;
    const short_seconds_text = `ss`;
    if (mode === TimeFormatType.Timeboard) {
      // always display all time segment
      if (seconds < 60 * 60) {
        // less than a min
        formatItems = [short_mins_text, short_seconds_text];
      } else {
        formatItems = [short_hours_text, short_mins_text, short_seconds_text];
      }
    } else {
      // do not display time segment if it's 0
      if (seconds < 60) {
        // less than a min
        formatItems = [seconds_text];
      } else if (seconds < 60 * 60) {
        [mins_text, seconds_text].forEach((item) => item && formatItems.push(item));
      } else {
        [hours_text, mins_text, seconds_text].forEach((item) => item && formatItems.push(item));
      }
    }
    return duration.format(formatItems.join(' '));
  }
  @computed
  get classStatusText() {
    const duration = this.getters.classTimeDuration || 0;

    if (duration < 0) {
      // return `-- ${transI18n('nav.short.minutes')} -- ${transI18n('nav.short.seconds')}`;
      return `-- : --`;
    }

    switch (this.classroomStore.roomStore.classroomSchedule.state) {
      case ClassState.beforeClass:
        return `${this.formatCountDown(duration, TimeFormatType.Timeboard)}`;
      case ClassState.ongoing:
        return `${this.formatCountDown(duration, TimeFormatType.Timeboard)}`;
      case ClassState.afterClass:
        return `${this.formatCountDown(duration, TimeFormatType.Timeboard)}`;
      default:
        // return `-- ${transI18n('nav.short.minutes')} -- ${transI18n('nav.short.seconds')}`;
        return `-- : --`;
    }
  }
  @observable
  awardAnims: { id: string }[] = [];

  @computed
  get isInSubRoom() {
    return this.getters.isInSubRoom;
  }

  @computed
  get loadingText() {
    return '';
  }

  /**
   * 所在房间名称
   */
  @computed
  get currentSubRoomName() {
    let groupName = null;
    const { currentSubRoom, groupDetails } = this.classroomStore.groupStore;
    if (currentSubRoom) {
      const group = groupDetails.get(currentSubRoom);

      groupName = group?.groupName;
    }
    return groupName;
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
            this._setLandscapeToolBarVisible(false);
            window.addEventListener('touchstart', this._handleTouchStart, { once: true });
            // this._landscapeToolBarVisibleTask = Scheduler.shared.addDelayTask(() => {
            //   window.removeEventListener('touchstart', this._handleTouchStart);
            //   this._setLandscapeToolBarVisible(false);
            // }, 4000);
          } else {
            window.removeEventListener('touchstart', this._handleTouchStart);
            // this._landscapeToolBarVisibleTask?.stop();
            this._setLandscapeToolBarVisible(true);
            this.setShareActionSheetVisible(false);
          }
        },
      ),
    );
    this._disposers.push(
      computed(() => {
        try{
          return this.classroomStore.userStore.mainRoomDataStore.teacherList.size;
        }catch{
          return 0
        }
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
          widgetController.removeBroadcastListener({
            messageType: AgoraExtensionWidgetEvent.QueryMobileCallState,
            onMessage: this._handleQueryMobileCallState,
          });
          widgetController.removeBroadcastListener({
            messageType: AgoraExtensionWidgetEvent.OrientationStatesChangedAgain,
            onMessage: this._updateOrientationStates,
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
          widgetController.addBroadcastListener({
            messageType: AgoraExtensionWidgetEvent.QueryMobileCallState,
            onMessage: this._handleQueryMobileCallState,
          });
          widgetController.addBroadcastListener({
            messageType: AgoraExtensionWidgetEvent.OrientationStatesChangedAgain,
            onMessage: this._updateOrientationStates,
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
    if (isIOS() && !isSafari() && getIOSVersion() < 14.3) {
      return false;
    }
    return true;
  }
  @computed
  get recordStatus() {
    if (
      this.classroomStore.roomStore.recordStatus === RecordStatus.started &&
      this.classroomStore.roomStore.recordReady
    ) {
      return RecordStatus.started;
    } else if (
      this.classroomStore.roomStore.recordStatus === RecordStatus.starting ||
      (this.classroomStore.roomStore.recordStatus === RecordStatus.started &&
        !this.classroomStore.roomStore.recordReady)
    ) {
      return RecordStatus.starting;
    } else {
      return RecordStatus.stopped;
    }
  }
  @computed
  get isRecording() {
    return this.recordStatus === RecordStatus.started;
  }
  @computed
  get h5ContainerCls() {
    return this.shareUIStore.orientation === 'portrait'
      ? ''
      : 'fcr-justify-center fcr-items-center';
  }
  @computed
  get classRoomPlacholderHeight() {
    const innerWidth = this.shareUIStore.isLandscape ? window.innerWidth : window.innerWidth;
    return innerWidth * (190 / 375);
  }
  @computed
  get classRoomPlacholderIngroupHeight() {
    //group tool height + group tool margin top + group tool margin bottom
    return 46 + 6 + 5;
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
  private _updateMobileLandscapeToolBarVisible(visible?: boolean) {
    if (visible) {
      this._setLandscapeToolBarVisible(false);
      return;
    }
    this.extensionApi.updateMobileLandscapeToolBarVisible(this.landscapeToolBarVisible);
  }
  @action.bound
  private _setLandscapeToolBarVisible(visible: boolean) {
    this.landscapeToolBarVisible = visible;
    this._updateMobileLandscapeToolBarVisible();
  }
  @action.bound
  forceLandscapeToolBarTrue() {
    if (!this.shareUIStore.isLandscape) return;
    // this._landscapeToolBarVisibleTask?.stop();
    this.landscapeToolBarVisible = true;
    this._updateMobileLandscapeToolBarVisible();
  }
  @action.bound
  toggleLandscapeToolBarVisible() {
    if (!this.shareUIStore.isLandscape) return;
    // this._landscapeToolBarVisibleTask?.stop();
    this.landscapeToolBarVisible = !this.landscapeToolBarVisible;
    this._updateMobileLandscapeToolBarVisible();
  }
  @bound
  private _handleTouchStart() {
    // this._landscapeToolBarVisibleTask?.stop();
  }
  private _callState: MobileCallState = MobileCallState.Processing;
  @bound
  broadcastCallState(callState: MobileCallState) {
    this._callState = callState;
    this.extensionApi.updateMobileCallState(callState);
  }
  @bound
  _handleQueryMobileCallState() {
    this.extensionApi.updateMobileCallState(this._callState);
  }
  @observable dialogMap: Map<string, { type: DialogType }> = new Map();

  hasDialogOf(type: DialogType) {
    let exist = false;
    this.dialogMap.forEach(({ type: dialogType }) => {
      if (dialogType === type) {
        exist = true;
      }
    });

    return exist;
  }
  isDialogIdExist(id: string) {
    return this.dialogMap.has(id);
  }
  addDialog(type: 'confirm', params?: CommonDialogType<ConfirmDialogProps>): void;

  @action.bound
  addDialog(type: unknown, params?: CommonDialogType<unknown>) {
    this.dialogMap.set(params?.id || uuidv4(), { ...(params as any), type: type as DialogType });
  }

  @action.bound
  deleteDialog = (id: string) => {
    this.dialogMap.delete(id);
  };

  @action.bound
  removeAward(id: string) {
    this.awardAnims = this.awardAnims.filter((anim) => anim.id !== id);
  }
  /**
   * 教室加载状态
   */
  @computed get loading(): boolean {
    const classroomState = this.classroomStore.connectionStore.classroomState;
    return (
      classroomState === ClassroomState.Connecting || classroomState === ClassroomState.Reconnecting
    );
  }
}
