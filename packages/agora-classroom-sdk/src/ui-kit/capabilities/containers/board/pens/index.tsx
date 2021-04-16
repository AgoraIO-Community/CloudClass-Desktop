import { Pens, t } from '~components'
import { observer } from 'mobx-react'
import { Capability, UIKitBaseModule } from '~capabilities/types';
import { BaseStore } from '~capabilities/stores/base';
import { SceneStore } from '~core';

export type PenModel = {
  lineSelector: string,
  isActive: boolean;
}

export const model: PenModel = {
  lineSelector: 'pen',
  isActive: false,
}

export interface PenTraits {
  switchSelector(type: string): Promise<void>
}

type PenUIKitModule = UIKitBaseModule<PenModel, PenTraits>

export abstract class PenUIKitStore extends BaseStore<PenModel> implements PenUIKitModule {
  switchSelector(type: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  get lineSelector() {
    return this.attributes.lineSelector;
  }
  get isActive() {
    return this.attributes.isActive;
  }
}

export class PenStore extends PenUIKitStore {

  static createFactory(sceneStore: SceneStore, payload?: PenModel) {
    const store = new PenStore(payload ?? model)
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

export const PensContainer: Capability<PenUIKitStore> = observer(({store}) => {

  const onClick = (type: string) => {
    store.switchSelector(type)
  }
  
  return (
    <Pens
      value='pen'
      label={t('scaffold.pencil')}
      icon='pen'
      activePen={store.lineSelector}
      onClick={onClick}
      isActive={store.isActive}
    />
  )
})