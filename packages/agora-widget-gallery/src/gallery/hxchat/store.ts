import { action, autorun, computed, observable, reaction, runInAction } from 'mobx';
import {
  EduClassroomConfig,
  EduClassroomUIStore,
  EduRoomTypeEnum,
  UUAparser,
} from 'agora-edu-core';

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
  showChat: boolean = true;

  constructor(coreStore: EduClassroomUIStore) {
    runInAction(() => {
      this.coreStore = coreStore;
    });

    autorun(() => {
      let isFullSize = false;
      if (
        EduClassroomConfig.shared.sessionInfo.roomType === EduRoomTypeEnum.RoomBigClass &&
        UUAparser.mobileBrowser
      ) {
        isFullSize = this.orientation === 'portrait' ? false : true;
      } else {
        isFullSize =
          EduClassroomConfig.shared.sessionInfo.roomType === EduRoomTypeEnum.RoomBigClass ||
          EduClassroomConfig.shared.sessionInfo.roomType === EduRoomTypeEnum.Room1v1Class;
      }
      runInAction(() => (this.isFullSize = isFullSize));
    });

    autorun(() => {
      let isShowChat = false;
      if (
        EduClassroomConfig.shared.sessionInfo.roomType === EduRoomTypeEnum.RoomBigClass &&
        UUAparser.mobileBrowser
      ) {
        isShowChat = this.orientation === 'portrait' ? false : true;
      } else if (
        [EduRoomTypeEnum.Room1v1Class, EduRoomTypeEnum.RoomBigClass].includes(
          EduClassroomConfig.shared.sessionInfo.roomType,
        )
      ) {
        isShowChat = true;
      }
      runInAction(() => (this.showChat = isShowChat));
    });
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
