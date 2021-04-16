import { UIKitModule } from "~utilities/types";
import {FC} from 'react';

export type UIKitBaseModule<ModelType, Traits> = 
  // UIKitModule<ModelType> &
  ModelType &
  Traits

export type BaseContainerProps<Type> = {
  store: Type
}

export type Capability<Type> = FC<BaseContainerProps<Type>>