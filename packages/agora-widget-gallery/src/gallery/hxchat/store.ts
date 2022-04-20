import { action, autorun, observable, runInAction } from 'mobx';
import { EduRoomTypeEnum, UUAparser, EduClassroomConfig } from 'agora-edu-core';

type EduClassroomUIStore = any;

enum orientationEnum {
  portrait = 'portrait',
  landscape = 'landscape',
}

export class WidgetChatUIStore {
  private _matchMedia = window.matchMedia('(orientation: portrait)');

  @observable
  coreStore!: EduClassroomUIStore;

  @observable
  orientation: orientationEnum = orientationEnum.portrait;

  @observable
  isFullSize: boolean = false;

  @observable
  showChat: boolean = false;

  constructor(coreStore: EduClassroomUIStore, private _classroomConfig: EduClassroomConfig) {
    runInAction(() => {
      this.coreStore = coreStore;
    });

    autorun(() => {
      let isFullSize = false;
      if (
        _classroomConfig.sessionInfo.roomType === EduRoomTypeEnum.RoomBigClass &&
        UUAparser.mobileBrowser
      ) {
        isFullSize = this.orientation === 'portrait' ? false : true;
      } else {
        isFullSize =
          _classroomConfig.sessionInfo.roomType === EduRoomTypeEnum.RoomBigClass ||
          _classroomConfig.sessionInfo.roomType === EduRoomTypeEnum.Room1v1Class;
      }
      runInAction(() => (this.isFullSize = isFullSize));
    });

    autorun(() => {
      let isShowChat = false;
      if (
        _classroomConfig.sessionInfo.roomType === EduRoomTypeEnum.RoomBigClass &&
        UUAparser.mobileBrowser
      ) {
        isShowChat = this.orientation === 'portrait' ? false : true;
      } else if (
        [EduRoomTypeEnum.Room1v1Class, EduRoomTypeEnum.RoomBigClass].includes(
          _classroomConfig.sessionInfo.roomType,
        )
      ) {
        isShowChat = true;
      }
      runInAction(() => (this.showChat = isShowChat));
    });
  }

  get classroomConfig() {
    return this._classroomConfig;
  }

  @action.bound
  handleOrientationchange() {
    // If there are matches, we're in portrait
    if (this._matchMedia.matches) {
      // Portrait orientation
      this.orientation = orientationEnum.portrait;
    } else {
      // Landscape orientation
      this.orientation = orientationEnum.landscape;
    }
  }

  addOrientationchange = () => {
    this._matchMedia.addListener(this.handleOrientationchange);
    this.handleOrientationchange();
  };

  removeOrientationchange = () => {
    this._matchMedia.removeListener(this.handleOrientationchange);
  };
}
