import { transI18n } from './../../../../agora-scenario-ui-kit/src/components/i18n/index';
import { AgoraEduSDK } from '@/infra/api';
import { EduRoomTypeEnum } from 'agora-edu-core';
import { homeApi } from '../api';

const defaultScenes = [
  { text: 'home.roomType_1v1', value: `${EduRoomTypeEnum.Room1v1Class}` },
  {
    text: 'home.roomType_interactiveSmallClass',
    value: `${EduRoomTypeEnum.RoomSmallClass}`,
  },
  {
    text: 'home.roomType_interactiveBigClass',
    value: `${EduRoomTypeEnum.RoomBigClass}`,
  },
];

type Scene = { text: string; value: string };

class BuilderConfig {
  ready = false;
  resource = {
    scenes: {},
    themes: {},
  };

  private _roomTypes: EduRoomTypeEnum[] = [];

  private _sceneOptions: Scene[] = [];

  get sceneOptions() {
    const result: Scene[] = this._sceneOptions.length ? this._sceneOptions : defaultScenes;
    return result.map(({ text, value }) => ({ text: transI18n(text), value }));
  }

  constructor() {
    const companyId = window.__launchCompanyId;
    const projectId = window.__launchProjectId;
    this._roomTypes = AgoraEduSDK.getLoadedScenes().map(({ roomType }) => roomType);
    this._sceneOptions = defaultScenes.filter(({ value }) => {
      return this._roomTypes.some((t) => `${t}` === value);
    });

    if (companyId && projectId) {
      homeApi.getBuilderResource(companyId, projectId).then(({ scenes, themes }) => {
        this.resource = {
          scenes: scenes ?? {},
          themes: themes ? { default: themes } : {},
        };

        AgoraEduSDK.setParameters(
          JSON.stringify({
            uiConfigs: this.resource.scenes,
            themes: this.resource.themes,
          }),
        );
        this.ready = true;
      });
      return;
    }
    this.ready = true;
  }
}

export const builderConfig = new BuilderConfig();
