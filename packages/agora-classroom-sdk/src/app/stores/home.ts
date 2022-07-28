import { LanguageEnum, LaunchOption } from '@/infra/api';
import { ToastType } from '@/infra/stores/common/share-ui';
import { FcrMultiThemeMode } from '@/infra/types/config';
import { getBrowserLanguage, GlobalStorage } from '@/infra/utils';
import { EduRegion } from 'agora-edu-core';
import { action, autorun, observable, toJS } from 'mobx';
import { changeLanguage } from '~ui-kit';

export type HomeLaunchOption = Omit<LaunchOption, 'listener'> & {
  appId: string;
  sdkDomain: string;
  region: EduRegion;
  curService?: string;
  scenes?: any;
  themes?: any;
};
const regionKey = `home_store_demo_launch_region`;
const launchKey = `home_store_demo_launch_options`;
const languageKey = `home_store_demo_launch_language`;
const themeKey = `home_store_demo_launch_theme`;

export const getRegion = (): EduRegion => {
  return GlobalStorage.read(regionKey) || regionByLang[getBrowserLanguage()] || EduRegion.NA;
};

export const getLanguage = (): LanguageEnum => {
  return GlobalStorage.read(languageKey) || getBrowserLanguage() || 'en';
};

export const getTheme = (): FcrMultiThemeMode => {
  return GlobalStorage.read(themeKey) || FcrMultiThemeMode.light;
};

const regionByLang = {
  zh: EduRegion.CN,
  en: EduRegion.NA,
};

export const clearHomeOption = () => {
  GlobalStorage.clear(launchKey);
  GlobalStorage.clear(regionKey);
  GlobalStorage.clear(languageKey);
  GlobalStorage.clear(themeKey);
};

export class HomeStore {
  launchOption!: HomeLaunchOption;

  @observable
  region: EduRegion = EduRegion.NA;

  @observable
  language: LanguageEnum = 'en';

  @observable
  theme: FcrMultiThemeMode = getTheme();

  @observable
  toastList: ToastType[] = [];

  constructor() {
    this.launchOption = GlobalStorage.read(launchKey) || {};
    this.setRegion(getRegion());
    this.setLanguage(getLanguage());
    autorun(() => {
      if (this.region) {
        GlobalStorage.save(regionKey, this.region);
      } else {
        GlobalStorage.clear(regionKey);
      }
      if (this.language) {
        GlobalStorage.save(languageKey, this.language);
      } else {
        GlobalStorage.clear(languageKey);
      }
      if (this.theme) {
        GlobalStorage.save(themeKey, this.theme);
      } else {
        GlobalStorage.clear(themeKey);
      }
    });
  }

  @action.bound
  addToast(toast: ToastType) {
    this.toastList.push(toast);
  }

  @action.bound
  removeToast(id: string) {
    this.toastList = this.toastList.filter((it) => it.id != id);
  }

  @action
  setRegion = (region: EduRegion) => {
    this.region = region;
  };

  @action
  setTheme = (theme: FcrMultiThemeMode) => {
    this.theme = theme;
  };

  @action
  setLanguage = (language: LanguageEnum) => {
    this.language = language;
    changeLanguage(language);
    this.launchOption.language = language;
  };

  @action
  setLaunchConfig(payload: HomeLaunchOption) {
    this.launchOption = payload;
    if (payload.region) {
      this.region = payload.region;
    }
    GlobalStorage.save(regionKey, toJS(this.region));
    GlobalStorage.save(launchKey, this.launchOption);
  }

  get launchConfig() {
    const config = GlobalStorage.read(launchKey) || {};
    config.region = GlobalStorage.read(regionKey);
    config.language = GlobalStorage.read(regionKey);
    return config;
  }

  clear() {
    clearHomeOption();
    this.region = getRegion();
    this.language = getLanguage();
    this.launchOption = GlobalStorage.read(launchKey) || {};
  }
}
