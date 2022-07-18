import { action, autorun, observable, runInAction } from 'mobx';
import { EduRoomTypeEnum, EduRoomSubtypeEnum, Platform } from 'agora-edu-core';
import { AgoraHXChatWidget } from '.';

enum orientationEnum {
  portrait = 'portrait',
  landscape = 'landscape',
}

export class WidgetChatUIStore {
  private _matchMedia = window.matchMedia('(orientation: portrait)');

  @observable
  orientation: orientationEnum = orientationEnum.portrait;

  @observable
  isFullSize: boolean = false;

  @observable
  showChat: boolean = false;

  constructor(private _widget: AgoraHXChatWidget) {
    const { sessionInfo, platform } = _widget.classroomConfig;
    const isH5 = platform === Platform.H5;
    this.handleOrientationchange();
    autorun(() => {
      let isFullSize = false;
      if (
        sessionInfo.roomType === EduRoomTypeEnum.RoomBigClass &&
        isH5 &&
        sessionInfo.roomSubtype === EduRoomSubtypeEnum.Vocational
      ) {
        isFullSize = true;
      } else if (sessionInfo.roomType === EduRoomTypeEnum.RoomBigClass && isH5) {
        isFullSize = this.orientation === 'portrait' ? false : true;
      } else {
        isFullSize =
          sessionInfo.roomType === EduRoomTypeEnum.RoomBigClass ||
          sessionInfo.roomType === EduRoomTypeEnum.Room1v1Class;
      }
      runInAction(() => (this.isFullSize = isFullSize));
    });

    autorun(() => {
      let isShowChat = isH5 ? true : false;

      if (
        sessionInfo.roomType === EduRoomTypeEnum.RoomBigClass &&
        isH5 &&
        sessionInfo.roomSubtype === EduRoomSubtypeEnum.Vocational
      ) {
        isShowChat = true;
      } else if (sessionInfo.roomType === EduRoomTypeEnum.RoomBigClass && isH5) {
        isShowChat = this.orientation === 'portrait' ? false : true;
      } else if (
        [EduRoomTypeEnum.Room1v1Class, EduRoomTypeEnum.RoomBigClass].includes(sessionInfo.roomType)
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
