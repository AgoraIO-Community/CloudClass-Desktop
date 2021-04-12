import { GlobalStorage } from './../../utils/utils';
import { LaunchOption } from "@/edu-sdk";
import { AppStore, UIStore } from "@/stores/app/index";

export class HomeStore {

  launchOption!: Omit<LaunchOption, 'listener'>

  uiStore!: UIStore

  launchKey: string

  constructor(context: any) {
    this.launchKey = `home_store_demo_launch_key`
    this.launchOption = GlobalStorage.read(this.launchKey) || {}
    this.uiStore = new UIStore(this as any)
  }

  setLaunchConfig(payload: Omit<LaunchOption, 'listener'>) {
    this.launchOption = payload
    GlobalStorage.save(this.launchKey, this.launchOption)
  }
}