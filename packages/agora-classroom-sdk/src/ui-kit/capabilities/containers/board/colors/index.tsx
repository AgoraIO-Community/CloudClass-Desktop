import { Colors, t } from '~ui-kit'
import { observer } from 'mobx-react'
import { BaseStore } from '~capabilities/stores/base'
import { Capability, UIKitBaseModule } from '~capabilities/types'
import { SceneStore } from '@/core'

export type ColorModel = {
  color: string,
  strokeWidth: number;
}

export const model: ColorModel = {
  color: '#999999',
  strokeWidth: 10,
}

export interface ColorTraits {
  switchColor(type: string): unknown
  switchStroke(width: number): unknown
}

type ColorUIKitModule = UIKitBaseModule<ColorModel, ColorTraits>

export abstract class ColorUIKitStore extends BaseStore<ColorModel> implements ColorUIKitModule {
  abstract switchColor(type: string): unknown;
  abstract switchStroke(width: number): unknown;
  get color() {
    return this.attributes.color;
  }
  get strokeWidth() {
    return this.attributes.strokeWidth;
  }
}

export class ColorStore extends ColorUIKitStore {

  static createFactory(sceneStore: SceneStore, payload?: ColorModel) {
    const store = new ColorStore(payload ?? model)
    store.bind(sceneStore)
    return store
  }

  switchColor(type: string) {
    this.sceneStore.boardStore.changeHexColor(type)
  }
  switchStroke(width: number) {
    this.sceneStore.boardStore.changeStroke(width)
  }
}

export const ColorsContainer: Capability<ColorUIKitStore> = observer(({store}) => {

  const changeStroke = (width: number) => {
    store.switchStroke(width)
  }

  const changeHexColor = (color: string) => {
    store.switchColor(color)
  }

  return (
    <Colors
      value='color'
      label={t('scaffold.color')}
      icon='color'
      colorSliderMin={1}
      colorSliderMax={31}
      colorSliderDefault={store.strokeWidth}
      colorSliderStep={0.3}
      onSliderChange={changeStroke}
      activeColor={store.color}
      onClick={changeHexColor}
    />
  )
})