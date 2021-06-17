import { StorageStore } from '@/stores/storage';
import { HomeStore } from '@/stores/app/home';
import { SceneStore } from './../stores/app/scene';
import { MediaStore } from './../stores/app/media';
import { MobXProviderContext } from 'mobx-react';
import { useContext } from 'react';
import { 
  AppStore,
  BoardStore,
  UIStore,
  AcadsocRoomStore,
  PretestStore,
  DiskStore,
  StatisticsStore,
} from '@/stores/app';
import { APIStore } from '@/stores/app/api';

export type appContext = Record<string, AppStore>

export const useAppStore = (): AppStore => {
  const context = useContext<appContext>(MobXProviderContext);
  return context.store
}

export const useUIStore = (): UIStore => {
  const context = useContext<appContext>(MobXProviderContext);
  return context.store.uiStore
}

export const useBoardStore = (): BoardStore => {
  const context = useContext<appContext>(MobXProviderContext)
  return context.store.boardStore
}

export const useStatsStore = (): StatisticsStore => {
  const context = useContext<appContext>(MobXProviderContext)
  return context.store.statisticsStore
}

export const useAPIStore = (): APIStore => {
  const context = useContext<appContext>(MobXProviderContext)
  return context.store.apiStore
}

export const useMediaStore = (): MediaStore => {
  const context = useContext<appContext>(MobXProviderContext)
  return context.store.mediaStore
}

export const useSceneStore = (): SceneStore => {
  const context = useContext<appContext>(MobXProviderContext)
  return context.store.sceneStore
}

export const useAcadsocRoomStore = (): AcadsocRoomStore => {
  const context = useContext<appContext>(MobXProviderContext)
  return context.store.acadsocStore
}

export const usePretestStore = (): PretestStore => {
  const context = useContext<appContext>(MobXProviderContext)
  return context.store.pretestStore
}

export const useHomeStore = (): HomeStore => {
  const context = useContext<HomeContext>(MobXProviderContext)
  return context.store
}

export type HomeContext = Record<string, HomeStore>

export const useHomeUIStore = (): UIStore => {
  const context = useContext<HomeContext>(MobXProviderContext)
  return context.store.uiStore
}
export type AudienceParams = Record<string, any>
export const useAudienceParams = (params?: string): string | { [key: string]: any } | null => {
  const searchString = location.href.split('?').pop()
  const urlParams = new URLSearchParams(searchString)
  const audienceParams: Record<string, any> = {}
  if (!params) {
    for (let key of urlParams.keys()) {
      audienceParams[key] = urlParams.get(key)
    }
    return audienceParams
  }
  return urlParams.get(params)
}

export type StorageContext = Record<string, StorageStore>

export const useStorageStore = (): StorageStore => {
  const context = useContext<StorageContext>(MobXProviderContext)
  return context.store
}