import { computed } from 'mobx';
import { AGError, bound } from 'agora-rte-sdk';
import { EduUIStoreBase } from './base';
import { EduRoomTypeEnum, WhiteboardState } from '../../..';
import { EduClassroomStore } from '../../domain';
import { EduShareUIStore } from './share-ui';
import { CloudDriveResource } from '../../domain/common/cloud-drive/struct';

export class BoardUIStore extends EduUIStoreBase {
  private _heightRatios = {
    [EduRoomTypeEnum.Room1v1Class]: 1,
    [EduRoomTypeEnum.RoomSmallClass]: 59 / 72,
    [EduRoomTypeEnum.RoomBigClass]: 59 / 72,
  };
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
    const heightRatio = this._heightRatios[roomType];
    const viewportHeight = this.shareUIStore.classroomViewportSize.height;
    const height = heightRatio * viewportHeight;

    if (roomType === EduRoomTypeEnum.Room1v1Class) {
      return height - this.shareUIStore.navBarHeight;
    }

    return height;
  }

  constructor(store: EduClassroomStore, shareUIStore: EduShareUIStore) {
    super(store, shareUIStore);
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
      await this.classroomStore.connectionStore.leaveWhiteboard();
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  @bound
  async mount(dom: HTMLDivElement) {
    try {
      await this.classroomStore.boardStore.mount(dom);
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
