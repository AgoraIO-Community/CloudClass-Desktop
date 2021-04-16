import { Card, Loading } from '~ui-kit'
import { observer } from 'mobx-react'
import { SceneStore } from '@/core'
import { BaseStore } from '~capabilities/stores/base'
import { UIKitBaseModule } from '~capabilities/types'
import { Exit, Record } from '../dialog'
import { SettingContainer } from '../setting'
import { v4 as uuidv4 } from 'uuid'

export const LoadingContainer = observer(({store}: {store: LoadingStore}) => {

  const loading = store.loading

  return loading ? <PageLoading /> : null
})

const PageLoading = () => {
  return (
    <Card width={90} height={90} className="card-loading-position">
      <Loading></Loading>
    </Card>
  )
}

export type LoadingModel = {
  loading: boolean
}

export const model: LoadingModel = {
  loading: false
}

export interface LoadingTraits {
}


export abstract class LoadingUIKitStore
  extends BaseStore<LoadingModel>
  implements UIKitBaseModule<LoadingModel, LoadingTraits> {

  get loading() {
    return this.attributes.loading
  }
}

export class LoadingStore extends LoadingUIKitStore {

  static createFactory(sceneStore: SceneStore) {
    const store = new LoadingStore(model)
    store.bind(sceneStore)
    return store
  }

  constructor(payload: LoadingModel = model) {
    super(payload)
  }

  showDialog(type: string): void {
    switch (type) {
      case 'exit': {
        this.sceneStore.uiStore.addDialog(Exit)
        break;
      }
      case 'record': {
        this.sceneStore.uiStore.addDialog(Record, {id: uuidv4()})
        break;
      }
      case 'setting': {
        this.sceneStore.uiStore.addDialog(SettingContainer)
        break;
      }
    }
  }
}