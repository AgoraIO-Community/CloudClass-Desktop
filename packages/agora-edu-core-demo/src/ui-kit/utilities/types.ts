export type OnChangeEvents<Type> = {
  [Property in keyof Type as `onChange${Capitalize<string & Property>}`]: (
    newValue: Type[Property],
  ) => void;
};

export type HomeModule<CustomizeVanillaType> = OnChangeEvents<CustomizeVanillaType> &
  CustomizeVanillaType;

export type IncludeUIKitSetter<Type> = {
  [Property in keyof Type as `set${Capitalize<string & Property>}`]: (
    newValue: Type[Property],
  ) => void;
};

export type UIKitModule<EntityType> = IncludeUIKitSetter<EntityType> & EntityType;
