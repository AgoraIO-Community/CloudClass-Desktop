import { UIKitModule } from "~utilities/types";

export type UIKitBaseModule<ModelType, Traits> = 
  UIKitModule<ModelType> &
  ModelType &
  Traits

export abstract class UIKitClass {
}