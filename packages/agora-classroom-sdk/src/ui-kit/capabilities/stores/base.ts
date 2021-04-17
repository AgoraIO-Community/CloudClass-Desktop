import { EduScenarioAppStore } from '~core';
export abstract class BaseStore<ModelType> {
    attributes: ModelType
    appStore!: EduScenarioAppStore
    constructor(payload: ModelType)
    constructor(payload: ModelType, appStore?: EduScenarioAppStore) {
      if (typeof appStore !== 'undefined') {
        this.bind(appStore)
      }
      this.attributes = payload
    }

    setAttributes(payload: ModelType) {
      this.attributes = payload
    }
    
    bind(store: EduScenarioAppStore) {
      this.appStore = store
    }
}