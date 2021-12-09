import { action, computed, observable, reaction, when, runInAction, IReactionDisposer } from 'mobx';
import { AGError, AgoraRteEventType, bound } from 'agora-rte-sdk';
import { get } from 'lodash';
import { EduUIStoreBase } from './base';
import { EduRoomTypeEnum, WhiteboardState } from '../../..';
import { EduClassroomStore } from '../../domain';
import { EduShareUIStore } from './share-ui';
import { EduClassroomConfig, WhiteboardConfigs } from '../../../configs';

export class BoardUIStore extends EduUIStoreBase {
  private _disposer: IReactionDisposer[] = [];
  private _timeoutForConfig = 10000;
  private _joinDisposer?: IReactionDisposer;
  @observable
  configReady = false;

  protected heightRatio = 1;
  protected aspectRatio = 9 / 16;

  onInstall() {
    this._disposer.push(
      reaction(
        () => this.classroomStore.connectionStore.scene,
        (scene) => {
          if (scene) {
            scene.on(
              AgoraRteEventType.RoomPropertyUpdated,
              (changedRoomProperties: string[], roomProperties: any) => {
                changedRoomProperties.forEach((key) => {
                  const configs = get(roomProperties, 'board.info') as WhiteboardConfigs;
                  if (key === 'board' && configs) {
                    EduClassroomConfig.shared.setWhiteboardConfig(configs);
                    runInAction(() => {
                      this.configReady = true;
                    });
                  }
                });
              },
            );
          }
        },
      ),
    );
  }

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

  constructor(store: EduClassroomStore, shareUIStore: EduShareUIStore) {
    super(store, shareUIStore);
  }

  @action.bound
  joinWhiteboardWhenConfigReady() {
    this._joinDisposer = when(() => this.configReady, this.joinWhiteboard, {
      timeout: this._timeoutForConfig,
      onError: (e) => {
        this.shareUIStore.addGenericErrorDialog(e as AGError);
      },
    });
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
      await this.classroomStore.boardStore.mount(dom, { containerSizeRatio: this.aspectRatio });
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

  onDestroy() {
    this._disposer.forEach((disposer) => disposer());
  }
}
