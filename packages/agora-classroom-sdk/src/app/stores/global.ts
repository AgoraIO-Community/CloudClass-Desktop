import { LanguageEnum, LaunchOption } from '@/infra/api';
import { ToastType } from '@/infra/stores/common/share-ui';
import { FcrMultiThemeMode } from '@/infra/types/config';
import { getBrowserLanguage } from '@/infra/utils';
import { EduRegion } from 'agora-edu-core';
import { AgoraRegion } from 'agora-rte-sdk';
import { action, autorun, observable, toJS } from 'mobx';
import { changeLanguage } from '~ui-kit';
import { clearLSStore, getLSStore, setLSStore } from '../utils';

export type GlobalLaunchOption = Omit<LaunchOption, 'listener'> & {
  appId: string;
  sdkDomain: string;
  region: EduRegion;
  scenes?: any;
  themes?: any;
};
const LS_REGION = `region`;
const LS_LAUNCH = `launch_options`;
const LS_LANGUAGE = `language`;
const LS_THEME = `theme`;

export const regionByLang = {
  zh: EduRegion.CN,
  en: EduRegion.NA,
};

const regionList = [AgoraRegion.AP, AgoraRegion.CN, AgoraRegion.EU, AgoraRegion.NA];

export const getRegion = (): EduRegion => {
  return getLSStore(LS_REGION) || regionByLang[getBrowserLanguage()] || EduRegion.NA;
};

export const getLanguage = (): LanguageEnum => {
  return getLSStore(LS_LANGUAGE) || getBrowserLanguage() || 'en';
};

export const getTheme = (): FcrMultiThemeMode => {
  return getLSStore(LS_THEME) || FcrMultiThemeMode.light;
};

export const clearHomeOption = () => {
  clearLSStore(LS_LAUNCH);
  clearLSStore(LS_REGION);
  clearLSStore(LS_LANGUAGE);
  clearLSStore(LS_THEME);
};

export class GlobalStore {
  @observable
  launchOption: Partial<GlobalLaunchOption> = getLSStore<GlobalLaunchOption>(LS_LAUNCH) || {};

  @observable
  region: EduRegion = getRegion();

  @observable
  language: LanguageEnum = getLanguage();

  @observable
  theme: FcrMultiThemeMode = getTheme();

  @observable
  toastList: ToastType[] = [];

  constructor() {
    autorun(() => {
      setLSStore(LS_REGION, this.region);
    });

    autorun(() => {
      setLSStore(LS_THEME, this.theme);
    });

    autorun(() => {
      changeLanguage(this.language);
      setLSStore(LS_LANGUAGE, this.language);
    });

    autorun(() => {
      setLSStore(LS_LAUNCH, toJS(this.launchOption));
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

  @action.bound
  setRegion(region: EduRegion) {
    if (regionList.includes(region)) {
      this.region = region;
      this.launchOption.region = region;
    }
  }

  @action.bound
  setTheme(theme: FcrMultiThemeMode) {
    this.theme = theme;
  }

  @action.bound
  setLanguage(language: LanguageEnum) {
    // TODO:language和launchOption最好要拆开
    this.language = language;
    this.launchOption.language = language;
  }

  @action.bound
  setLaunchConfig(payload: GlobalLaunchOption) {
    this.launchOption = payload;
    if (payload.region) {
      this.region = payload.region;
    }
  }

  get launchConfig() {
    const config = toJS(this.launchOption);
    config.region = this.region;
    config.language = this.language;
    return config;
  }

  @action.bound
  clear() {
    clearHomeOption();
    this.region = getRegion();
    this.language = getLanguage();
    //@ts-ignore
    this.launchOption = getLSStore(LS_LAUNCH) || {};
    this.theme = getTheme();
  }

  @observable
  loading = false;

  @action.bound
  setLoading(loading: boolean) {
    this.loading = loading;
  }
}

export const globalStore = new GlobalStore();
