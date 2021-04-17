import { GlobalStorage } from './../../utils/utils';
import { LaunchOption } from "agora-edu-sdk";

export class HomeStore {

  launchOption!: Omit<LaunchOption, 'listener'>

  launchKey: string

  constructor(context: any) {
    this.launchKey = `home_store_demo_launch_key`
    this.launchOption = GlobalStorage.read(this.launchKey) || {}
  }

  setLaunchConfig(payload: Omit<LaunchOption, 'listener'>) {
    this.launchOption = payload
    GlobalStorage.save(this.launchKey, this.launchOption)
  }
}