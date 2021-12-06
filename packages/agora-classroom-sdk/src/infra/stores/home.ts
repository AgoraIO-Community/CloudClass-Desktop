import { GlobalStorage } from '../utils';
import { autorun, observable, action } from 'mobx';
import { LaunchOption } from '@/infra/api';
import { EduRegion } from 'agora-edu-core';

export type HomeLaunchOption = Omit<LaunchOption, 'listener'> & {
  appId: string;
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

  regionKey: string = regionKey;
  launchKey: string = launchKey;
  sdkDomain: string = '';

  constructor() {
    this.setRegion(GlobalStorage.read(this.regionKey) || this.region);
    this.launchOption = GlobalStorage.read(this.launchKey) || {};
    autorun(() => {
      const data = this.region;
      GlobalStorage.save(this.regionKey, data);
    });
  }

  @action setRegion(region: EduRegion) {
    this.region = region;
  }

  @action
  setLaunchConfig(payload: HomeLaunchOption) {
    this.launchOption = payload;
    if (payload.region) {
      this.region = payload.region;
    }
    GlobalStorage.save(this.regionKey, this.region);
    GlobalStorage.save(this.launchKey, this.launchOption);
  }

  clear() {
    clearHomeOption();
    //@ts-ignore
    this.region = GlobalStorage.read(this.regionKey) || 'NA';
    this.launchOption = GlobalStorage.read(this.launchKey) || {};
  }
}
