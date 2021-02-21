import { AppStore } from '@/stores/app';
import {observable, computed, action} from 'mobx'

export class RecordingStore {

  appStore!: AppStore

  constructor(appStore: AppStore) {
    this.appStore = appStore
  }


  @observable
  isRecording: boolean = false

  @observable
  loading: boolean = false

  @action
  async startOrStopRecording() {
    try {
      this.loading = true
    } catch (err) {
      throw err
    } finally {
      this.loading = false
    }
  }
}