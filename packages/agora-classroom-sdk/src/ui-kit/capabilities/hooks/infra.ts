import { EduScenarioAppStore } from "~core";
import { useContext } from "react";
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
  constructor(appStore: EduScenarioAppStore) {
    this.navBar = NavigationBarStore.createFactory(appStore)
    this.screenShare = ScreenShareStore.createFactory(appStore)
    this.videoList = VideoStore.createFactory(appStore)
    this.roomChat = RoomChatStore.createFactory(appStore)
    this.boardStore = WhiteboardStore.createFactory(appStore)
    this.loadingStore = LoadingStore.createFactory(appStore)
    this.pretestStore = PretestUIStore.createFactory(appStore)
  }
}

export const useUIKitStore = () => {
  const context = useContext(UIKitContext)
  //@ts-ignore
  window.uiKitStore = context
  return context
}