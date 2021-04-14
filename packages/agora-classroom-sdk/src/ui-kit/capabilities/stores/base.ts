import { observable } from "mobx"

export abstract class UIKitModel<T> {

  attributes!: T

  constructor(attributes: T) {
    this.updateAttributes(attributes)
  }

  protected updateAttributes(attributes: Partial<T>) {
    this.attributes = {
      ...this.attributes,
      ...attributes
    }
  }
}

export abstract class UIKitStore {

}

export function mixinStore()