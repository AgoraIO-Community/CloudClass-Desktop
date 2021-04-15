import { SceneStore } from '@/stores/app/scene';
export abstract class BaseStore<ModelType> {
    attributes: ModelType
    sceneStore!: SceneStore
    constructor(payload: ModelType) {
      this.attributes = payload
    }
    setAttributes(payload: ModelType) {
      this.attributes = payload
    }
    
    bind(store: SceneStore) {
      this.sceneStore = store
    }
}

// type Constructor<T = {}> = new (...args: any[]) => T;
// export const ExtendBaseStore = <ModelType extends Constructor>(BaseClass: ModelType) => {
//   return class BizStore extends BaseClass {

//   };
// }