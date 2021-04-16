import { AppStore as CoreAppStore } from '~core';
export abstract class BaseStore<ModelType> {
    attributes: ModelType
    appStore!: CoreAppStore
    constructor(payload: ModelType)
    constructor(payload: ModelType, appStore?: CoreAppStore) {
      if (typeof appStore !== 'undefined') {
        this.bind(appStore)
      }
      this.attributes = payload
    }

    setAttributes(payload: ModelType) {
      this.attributes = payload
    }
    
    bind(store: CoreAppStore) {
      this.appStore = store
    }
}