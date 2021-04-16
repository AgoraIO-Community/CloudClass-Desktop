import { SceneStore } from "@/core";
import { createContext, useContext, useState } from "react";
import { VideoStore } from '~capabilities/containers/video-player/store';
import { RoomChatStore } from "@/ui-kit/capabilities/containers/room-chat/store";
import { NavigationBarStore } from "~capabilities/containers/nav/store";
import { ScreenShareStore } from "~capabilities/containers/screen-share/store";
import { WhiteboardStore } from "~capabilities/containers/board/store";
import { LoadingStore } from "~capabilities/containers/loading";
import { PretestUIStore } from "~capabilities/containers/pretest/store";
import { UIKitContext } from "./uikit-provider";

export class AppUIKitStore {
  navBar: NavigationBarStore;
  screenShare: ScreenShareStore;
  videoList: VideoStore;
  roomChat: RoomChatStore;
  boardStore: WhiteboardStore;
  loadingStore: LoadingStore;
  pretestStore: PretestUIStore;
  constructor(sceneStore: SceneStore) {
    this.navBar = NavigationBarStore.createFactory(sceneStore)
    this.screenShare = ScreenShareStore.createFactory(sceneStore)
    this.videoList = VideoStore.createFactory(sceneStore)
    this.roomChat = RoomChatStore.createFactory(sceneStore)
    this.boardStore = WhiteboardStore.createFactory(sceneStore)
    this.loadingStore = LoadingStore.createFactory(sceneStore)
    this.pretestStore = PretestUIStore.createFactory(sceneStore)
  }
}


export const useUIKitStore = (sceneStore?: SceneStore) => {
  const context = useContext(UIKitContext)
  return context
}