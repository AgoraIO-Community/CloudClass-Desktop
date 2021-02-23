import { GlobalStorage } from './../../utils/custom-storage';
import { LaunchOption } from "@/edu-sdk";
import { AppStore } from "@/stores/app/index";

export class HomeStore {

  appStore!: AppStore;

  launchOption!: Omit<LaunchOption, 'listener'>

  constructor(context: AppStore) {
    this.appStore = context
    this.launchOption = GlobalStorage.read("launchConfig") || {}
  }

  setLaunchConfig(payload: Omit<LaunchOption, 'listener'>) {
    this.launchOption = payload
    GlobalStorage.save("launchConfig", this.launchOption)
  }
}