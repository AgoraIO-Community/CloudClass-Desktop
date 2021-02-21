import { ReplayAppStore } from '@/stores/replay-app';
import { SceneStore } from './../stores/app/scene';
import { MediaStore } from './../stores/app/media';
import { MobXProviderContext } from 'mobx-react';
import { useContext } from 'react';
import { 
  AppStore,
  RoomStore,
  MiddleRoomStore,
  ExtensionStore,
  BoardStore,
  DeviceStore,
  UIStore,
  BreakoutRoomStore,
  ReplayStore,
  RecordingStore
 } from '@/stores/app';
import { PlayerStore } from '@/stores/replay-app/player';
import { ReplayUIStore } from '@/stores/replay-app/ui';

export type appContext = Record<string, AppStore>

export const useAppStore = (): AppStore => {
  const context = useContext<appContext>(MobXProviderContext);
  return context.store
}

export const useUIStore = (): UIStore => {
  const context = useContext<appContext>(MobXProviderContext);
  return context.store.uiStore
}

export const useRoomStore = (): RoomStore => {
  const context = useContext<appContext>(MobXProviderContext)
  return context.store.roomStore;
}

export const useMiddleRoomStore = (): MiddleRoomStore => {
  const context = useContext<appContext>(MobXProviderContext)
  return context.store.middleRoomStore as MiddleRoomStore;
}

export const useExtensionStore = (): ExtensionStore => {
  const context = useContext<appContext>(MobXProviderContext)
  return context.store.extensionStore;
}

export const useBreakoutRoomStore = (): BreakoutRoomStore => {
  const context = useContext<appContext>(MobXProviderContext)
  return context.store.breakoutRoomStore;
}

export const useBoardStore = (): BoardStore => {
  const context = useContext<appContext>(MobXProviderContext)
  return context.store.boardStore
}

export const useRecordingStore = (): RecordingStore => {
  const context = useContext<appContext>(MobXProviderContext)
  return context.store.recordingStore
}

export const useDeviceStore = (): DeviceStore => {
  const context = useContext<appContext>(MobXProviderContext)
  return context.store.deviceStore
}

export const useReplayStore = (): ReplayStore => {
  const context = useContext<appContext>(MobXProviderContext)
  return context.store.replayStore
}

export const useMediaStore = (): MediaStore => {
  const context = useContext<appContext>(MobXProviderContext)
  return context.store.mediaStore
}

export const useSceneStore = (): SceneStore => {
  const context = useContext<appContext>(MobXProviderContext)
  return context.store.sceneStore
}

export type replayAppContext = Record<string, ReplayAppStore>

export const useReplayPlayerStore = (): PlayerStore => {
  const context = useContext<replayAppContext>(MobXProviderContext)
  return context.store.playerStore
}

export const useReplayUIStore = (): ReplayUIStore => {
  const context = useContext<replayAppContext>(MobXProviderContext)
  return context.store.uiStore
 }