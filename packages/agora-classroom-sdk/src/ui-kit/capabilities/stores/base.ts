export abstract class BaseStore<ModelType> {
    attributes: ModelType
    constructor(payload: ModelType) {
      this.attributes = payload
    }
    setAttributes(payload: ModelType) {
      this.attributes = payload
    }
}

// type Constructor<T = {}> = new (...args: any[]) => T;
// export const ExtendBaseStore = <ModelType extends Constructor>(BaseClass: ModelType) => {
//   return class BizStore extends BaseClass {

//   };
// }