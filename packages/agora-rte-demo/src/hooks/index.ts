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
 } from '@/stores/app';

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

export const useDiskStore = (): DiskStore => {
  const context = useContext<appContext>(MobXProviderContext)
  return context.store.diskStore
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