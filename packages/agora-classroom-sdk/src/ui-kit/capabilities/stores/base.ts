import { SceneStore } from '~core';
export abstract class BaseStore<ModelType> {
    attributes: ModelType
    sceneStore!: SceneStore
    constructor(payload: ModelType)
    constructor(payload: ModelType, sceneStore?: SceneStore) {
      if (typeof sceneStore !== 'undefined') {
        this.bind(sceneStore)
      }
      this.attributes = payload
    }

    setAttributes(payload: ModelType) {
      this.attributes = payload
    }
    
    bind(store: SceneStore) {
      this.sceneStore = store
    }
}