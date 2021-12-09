import { GlobalStorage } from '../utils';
import { autorun, observable, action, toJS } from 'mobx';
import { LaunchOption } from '@/infra/api';
import { EduRegion } from 'agora-edu-core';

export type HomeLaunchOption = Omit<LaunchOption, 'listener'> & {
  appId: string;
  sdkDomain: string;
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
  region: EduRegion = EduRegion.CN;

  constructor() {
    this.setRegion(GlobalStorage.read(regionKey) || this.region);
    this.launchOption = GlobalStorage.read(launchKey) || {};
    autorun(() => {
      GlobalStorage.save(regionKey, toJS(this.region));
    });
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

  clear() {
    clearHomeOption();
    this.region = GlobalStorage.read(regionKey) || 'NA';
    this.launchOption = GlobalStorage.read(launchKey) || {};
  }
}
