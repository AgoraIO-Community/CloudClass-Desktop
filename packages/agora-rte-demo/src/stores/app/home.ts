import { GlobalStorage } from './../../utils/custom-storage';
import { LaunchOption } from "@/edu-sdk";
import { AppStore, UIStore } from "@/stores/app/index";

export class HomeStore {

  launchOption!: Omit<LaunchOption, 'listener'>

  uiStore!: UIStore

  constructor(context: any) {
    this.launchOption = GlobalStorage.read("launchConfig") || {}
    this.uiStore = new UIStore(this as any)
  }

  setLaunchConfig(payload: Omit<LaunchOption, 'listener'>) {
    this.launchOption = payload
    GlobalStorage.save("launchConfig", this.launchOption)
  }
}