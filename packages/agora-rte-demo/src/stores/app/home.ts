import { LaunchOption } from "@/edu-sdk";
import { AppStore } from "@/stores/app/index";

export class HomeStore {

  appStore!: AppStore;

  launchOption!: LaunchOption

  constructor(context: AppStore) {
    this.appStore = context
  }

  setLaunchConfig(payload: LaunchOption) {
    this.launchOption = payload
  }
}