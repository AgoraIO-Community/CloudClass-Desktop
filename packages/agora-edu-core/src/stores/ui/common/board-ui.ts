import { action, computed, when, IReactionDisposer } from 'mobx';
import { AGError, bound } from 'agora-rte-sdk';
import { EduUIStoreBase } from './base';
import { EduRoomTypeEnum, WhiteboardState } from '../../..';
import { EduClassroomStore } from '../../domain';
import { EduShareUIStore } from './share-ui';

export class BoardUIStore extends EduUIStoreBase {
  private _timeoutForConfig = 10000;
  private _joinDisposer?: IReactionDisposer;

  protected heightRatio = 1;
  protected aspectRatio = 9 / 16;

  private _collectorContainer: HTMLElement | undefined = undefined;

  onInstall() {}

  // computed
  @computed
  get readyToMount() {
    return this.classroomStore.boardStore.ready;
  }

  @computed
  get connectionLost() {
    return (
      this.readyToMount &&
      this.classroomStore.connectionStore.whiteboardState === WhiteboardState.Idle
    );
  }

  get boardHeight() {
    const { roomType } = this.classroomStore.roomStore;
    const viewportHeight = this.shareUIStore.classroomViewportSize.height;
    const height = this.heightRatio * viewportHeight;

    if (roomType === EduRoomTypeEnum.Room1v1Class) {
      return height - this.shareUIStore.navBarHeight;
    }

    return height;
  }

  set setCollectorContainer(collectorContainer: HTMLElement) {
    this._collectorContainer = collectorContainer;
  }

  constructor(store: EduClassroomStore, shareUIStore: EduShareUIStore) {
    super(store, shareUIStore);
  }

  @action.bound
  joinWhiteboardWhenConfigReady() {
    this._joinDisposer = when(
      () => this.classroomStore.boardStore.configReady,
      this.joinWhiteboard,
    );
  }

  @bound
  async rejoinWhiteboard() {
    try {
      await this.classroomStore.connectionStore.leaveWhiteboard();
      await this.classroomStore.connectionStore.joinWhiteboard();
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  @bound
  async joinWhiteboard() {
    try {
      await this.classroomStore.connectionStore.joinWhiteboard();
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  @bound
  async leaveWhiteboard() {
    try {
      if (this._joinDisposer) {
        this._joinDisposer();
      }
      await this.classroomStore.connectionStore.leaveWhiteboard();
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  @bound
  async mount(dom: HTMLDivElement) {
    try {
      const options = this._collectorContainer
        ? { containerSizeRatio: this.aspectRatio, collectorContainer: this._collectorContainer }
        : { containerSizeRatio: this.aspectRatio };
      await this.classroomStore.boardStore.mount(dom, options);
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  @bound
  async unmount() {
    try {
      await this.classroomStore.boardStore.unmount();
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  onDestroy() {}
}
