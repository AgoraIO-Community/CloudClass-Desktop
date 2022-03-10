import { EduRegion } from 'agora-edu-core';
import { autorun, observable, action, toJS } from 'mobx';
import { LaunchOption } from '@/infra/api';
import { GlobalStorage } from '../utils';
import { ToastType } from './common/share-ui';

export type HomeLaunchOption = Omit<LaunchOption, 'listener'> & {
  appId: string;
  sdkDomain: string;
  region: EduRegion;
  userRole: string;
  curScenario: string;
};
const regionKey = `home_store_demo_launch_region`;
const launchKey = `home_store_demo_launch_options`;

export const clearHomeOption = () => {
  GlobalStorage.clear(launchKey);
  GlobalStorage.clear(regionKey);
};

export class HomeStore {
  launchOption!: HomeLaunchOption;

  @observable
  region?: EduRegion;

  @observable
  toastList: ToastType[] = [];

  constructor() {
    this.setRegion(GlobalStorage.read(regionKey) || this.region);
    this.launchOption = GlobalStorage.read(launchKey) || {};
    autorun(() => {
      if (this.region) {
        GlobalStorage.save(regionKey, toJS(this.region));
      } else {
        GlobalStorage.clear(regionKey);
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
  setRegion(region: EduRegion) {
    this.region = region;
  }

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
    return GlobalStorage.read(launchKey) || {};
  }

  clear() {
    clearHomeOption();
    this.region = GlobalStorage.read(regionKey) || 'NA';
    this.launchOption = GlobalStorage.read(launchKey) || {};
  }
}
