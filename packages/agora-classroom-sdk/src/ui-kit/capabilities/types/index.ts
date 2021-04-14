import { UIKitModule } from "~utilities/types";

export type UIKitBaseModule<ModelType, Traits> = 
  UIKitModule<ModelType> &
  ModelType &
  Traits &
  {updateAttributes: (attrs: ModelType) => void}

export abstract class UIKitClass {
}