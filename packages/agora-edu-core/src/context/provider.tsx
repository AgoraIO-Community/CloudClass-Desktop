import { eduSDKApi } from "../services/edu-sdk-api"
import { homeApi } from "../services/home-api"
import { StorageCourseWareItem } from "../types"
import { get } from "lodash"

import { EduRoleTypeEnum, EduStream } from "agora-rte-sdk"
import { useCallback, useState } from "react"
import { useCoreContext, useSceneStore, useBoardStore, useSmallClassStore, usePretestStore, useRoomStore, useUIStore} from "./core"
import { ChatContext, StreamContext, PretestContext,ScreenShareContext, RoomContext, RoomDiagnosisContext, GlobalContext, UserListContext, RecordingContext, HandsUpContext, BoardContext, VideoControlContext, SmallClassVideoControlContext, StreamListContext } from './type'

export type {
 CoreAppContext,
} from './core'

export {
  CoreContext,
  CoreContextProvider
} from './core'

/**
 * 
 * @returns 聊天能力池返回的内容
 */
export const useChatContext = (): ChatContext=> {
  const core = useCoreContext()
  const { roomStore, sceneStore, uiStore } = core
  return {
    isHost: sceneStore.sceneVideoConfig.isHost,
    getHistoryChatMessage: roomStore.getHistoryChatMessage,
    messageList: roomStore.chatMessageList,
    sendMessage: roomStore.sendMessage,
    muteChat: sceneStore.muteChat,
    unmuteChat: sceneStore.unmuteChat,
    chatCollapse: uiStore.chatCollapse,
    toggleChatMinimize: uiStore.toggleChatMinimize,
    unreadMessageCount: roomStore.unreadMessageCount,
    canChatting: sceneStore.canChatting,
    addChatMessage: roomStore.addChatMessage,
    addConversationChatMessage: roomStore.addConversationChatMessage,
    sendMessageToConversation: roomStore.sendMessageToConversation,
    conversationList: roomStore.chatConversationList,
    getConversationList: roomStore.getConversationList,
    getConversationHistoryChatMessage: roomStore.getConversationHistoryChatMessage
  }
}

export const useStreamListContext = (): StreamListContext => {

  const sceneStore = useSceneStore()

  const boardStore = useBoardStore()

  const smallClassStore = useSmallClassStore()

  const {
    teacherStream,
    studentStreams,
    muteAudio,
    unmuteAudio,
    muteVideo,
    unmuteVideo,
    streamList,
    cameraEduStream
  } = sceneStore

  const {
    revokeUserPermission,
    grantUserPermission
  } = boardStore

  const {
    studentStreams: onPodiumStudentStreams,
  } = smallClassStore

  return {
    streamList,
    teacherStream,
    studentStreams,
    onPodiumStudentStreams,
    muteAudio,
    unmuteAudio,
    muteVideo,
    unmuteVideo,
    revokeUserPermission,
    localStream: cameraEduStream,
    grantUserPermission,
  }
}

export const usePretestContext = (): PretestContext => {
  const pretestStore = usePretestStore()
  const [isMirror, setMirror] = useState<boolean>(false)

  const [cameraError, setCameraError] = useState<boolean>(false)
  const [microphoneError, setMicrophoneError] = useState<boolean>(false)

  const installPretest = () => {
    const removeEffect = pretestStore.onDeviceTestError(({ type, error }) => {
      if (type === 'video') {
        setCameraError(error)
      }
      if (type === 'audio') {
        setMicrophoneError(error)
      }
    })
    pretestStore.init({ video: true, audio: true })
    pretestStore.openTestCamera()
    pretestStore.openTestMicrophone({ enableRecording: true })
    return () => {
      pretestStore.closeTestCamera()
      pretestStore.closeTestMicrophone()
      removeEffect()
    }
  }

  return {
    cameraError,
    microphoneError,
    cameraList: pretestStore.cameraList,
    microphoneList: pretestStore.microphoneList,
    speakerList: pretestStore.speakerList,
    cameraId: pretestStore.cameraId,
    microphoneId: pretestStore.microphoneId,
    speakerId: pretestStore.speakerId,
    microphoneLevel: pretestStore.microphoneLevel,
    isMirror: isMirror,
    setMirror,
    installPretest,
    startPretestCamera: pretestStore.openTestCamera,
    stopPretestCamera: pretestStore.closeTestCamera,
    startPretestMicrophone: pretestStore.openTestMicrophone,
    stopPretestMicrophone: pretestStore.closeTestMicrophone,
    changeTestCamera: pretestStore.changeTestCamera,
    changeTestMicrophone: pretestStore.changeTestMicrophone,
    changeTestMicrophoneVolume: pretestStore.changeTestMicrophoneVolume,
    changeTestSpeakerVolume: pretestStore.changeTestSpeakerVolume,
    pretestCameraRenderer: pretestStore.cameraRenderer,
  }
}

export const useScreenShareContext = (): ScreenShareContext => {
  const {
    customScreenShareItems,
    screenShareStream,
    screenEduStream,
    startOrStopSharing,
  } = useSceneStore()

  const {
    isShareScreen,
    isBoardScreenShare
  } = useBoardStore()

  return {
    nativeAppWindowItems: customScreenShareItems,
    screenShareStream,
    screenEduStream,
    startOrStopSharing,
    isShareScreen,
    isBoardScreenShare
  }
}

export const useRoomContext = (): RoomContext => {

  const {
    destroyRoom,
  } = useCoreContext()

  const {
    startNativeScreenShareBy,
    roomInfo,
    classState,
    muteVideo,
    unmuteVideo,
    muteAudio,
    unmuteAudio,
    sceneType,
    muteUserChat,
    unmuteUserChat,
    removeScreenShareWindow
  } = useSceneStore()

  const {
    removeDialog,
  } = useUIStore()

  const {
    teacherAcceptHandsUp,
    teacherRejectHandsUp,
    handsUpStudentList,
    processUserCount,
  } = useSmallClassStore()

  const {
    kickOutBan,
    kickOutOnce,
    join,
    liveClassStatus
  } = useRoomStore()

  return {
    sceneType,
    destroyRoom,
    joinRoom: join,
    removeDialog,
    startNativeScreenShareBy,
    teacherAcceptHandsUp,
    teacherRejectHandsUp,
    handsUpStudentList,
    processUserCount,
    roomInfo,
    isCourseStart: !!classState,
    kickOutBan,
    kickOutOnce,
    liveClassStatus,
    removeScreenShareWindow,
    muteVideo,
    unmuteVideo,
    muteAudio,
    unmuteAudio,
    muteUserChat,
    unmuteUserChat
  }
}

export const useRoomDiagnosisContext = (): RoomDiagnosisContext => {
  const {
    navigationState
  } = useRoomStore()

  return {
    navigationState
  }
}

export const useGlobalContext = (): GlobalContext => {

  const { isFullScreen } = useBoardStore()
  const appStore = useCoreContext()

  const mainPath = useCoreContext().params.mainPath

  const {
    addDialog,
    removeDialog,
    addToast,
    toast$,
    fireToast,
    removeToast,
    toastQueue,
    checked,
    loading,
    dialogQueue,
    updateChecked,
    dialog$,
    fireDialog
  } = useUIStore()

  const {
    joined
  } = useRoomStore()

  return {
    loading,
    isFullScreen,
    addDialog,
    removeDialog,
    toast$,
    fireToast,
    addToast,
    checked,
    params: appStore.params,
    dialogQueue,
    removeToast,
    toastQueue,
    updateChecked,
    mainPath,
    language: appStore.params.language,
    toastEventObserver: toast$,
    dialogEventObserver: dialog$,
    fireDialog,
    joined,
  }
}

export const useBoardContext = (): BoardContext => {
  const {
    currentColor,
    currentStrokeWidth,
    hasPermission,
    currentSelector,
    lineSelector,
    activeMap,
    zoomValue,
    currentPage,
    totalPage,
    courseWareList,
    ready,
    downloadList,
    changeStroke,
    changeHexColor,
    mount,
    unmount,
    setTool,
    zoomBoard,
    setZoomScale,
    changeFooterMenu,
    putSceneByResourceUuid,
    startDownload,
    deleteSingle,
    refreshState,
    updatePen,
    setLaserPoint,
    tools,
    resourcesList,
    activeSceneName,
    boardPenIsActive,
    changeSceneItem,
    removeMaterialList,
    cancelUpload,
    room,
    closeMaterial,
    personalResources,
    installTools,
    handleUpload,
    publicResources,
    revokeBoardPermission,
    grantBoardPermission,
    showBoardTool,
    isShareScreen,
    canSharingScreen,
  } = useBoardStore()

  const {
    startOrStopSharing,
  } = useSceneStore()

  const {
    roomInfo
  } = useRoomStore()

  const mountToDOM = useCallback((dom: HTMLDivElement | null) => {
    if (dom) {
      mount(dom)
    } else {
      unmount()
    }
  }, [mount, unmount])

  return {
    room,
    zoomValue,
    currentPage,
    totalPage,
    courseWareList,
    currentColor,
    currentStrokeWidth,
    hasPermission,
    currentSelector,
    lineSelector,
    activeMap,
    ready,
    tools,
    changeStroke,
    changeHexColor,
    mountToDOM,
    setTool,
    zoomBoard,
    setZoomScale,
    changeFooterMenu,
    changeSceneItem,
    downloadList: downloadList.filter((it: StorageCourseWareItem) => it.taskUuid),
    openCloudResource: putSceneByResourceUuid,
    startDownload,
    deleteSingle,
    updatePen,
    boardPenIsActive,
    startOrStopSharing,
    setLaserPoint,
    resourcesList,
    activeSceneName,
    refreshCloudResources: refreshState,
    removeMaterialList,
    cancelUpload,
    closeMaterial,
    installTools,
    canSharingScreen,
    personalResources,
    publicResources,
    revokeBoardPermission,
    grantBoardPermission,
    doUpload: handleUpload,
    showBoardTool,
    isShareScreen
  }
}

export const useStreamContext = (): StreamContext => {
  const {streamList} = useSceneStore()

  return {
    streamList
  }
}

export const useUserListContext = (): UserListContext => {
  const appStore = useCoreContext()
  const smallClassStore = useSmallClassStore()

  const acceptedUserList = smallClassStore.acceptedList

  const localUserUuid = appStore.roomInfo.userUuid
  const teacherName = smallClassStore.teacherName
  const myRole = smallClassStore.role
  const rosterUserList = smallClassStore.rosterUserList
  const handleRosterClick = smallClassStore.handleRosterClick

  const userList = appStore.sceneStore.userList

  const {revokeCoVideo, teacherAcceptHandsUp} = smallClassStore

  return {
    localUserUuid,
    myRole,
    rosterUserList,
    teacherName,
    handleRosterClick,
    revokeCoVideo,
    teacherAcceptHandsUp,
    userList,
    acceptedUserList
  }
}

export const useRecordingContext = (): RecordingContext => {

  const {
    isRecording,
    roomUuid
  } = useSceneStore()

  const appStore = useCoreContext()

  const roomStore = useRoomStore()

  async function startRecording() {
    await eduSDKApi.updateRecordingState({
      roomUuid,
      state: 1,
      url: appStore.params.config.recordUrl
    })
  }

  async function stopRecording() {
    await eduSDKApi.updateRecordingState({
      roomUuid,
      state: 0,
    })
  }

  return {
    isRecording,
    startRecording,
    stopRecording,
  }
}

export const useHandsUpContext = (): HandsUpContext => {
  const {
    teacherUuid,
    handsUpState,
    teacherHandsUpState,
    studentHandsUp,
    studentCancelHandsUp,
    handsUpStudentList,
    coVideoUsers,
    onlineUserCount,
    processUserCount,
    teacherAcceptHandsUp,
    teacherRejectHandsUp,
  } = useSmallClassStore()

  return {
    teacherUuid,
    handsUpState,
    teacherHandsUpState,
    studentHandsUp,
    studentCancelHandsUp,
    handsUpStudentList,
    coVideoUsers,
    onlineUserCount,
    processUserCount,
    teacherAcceptHandsUp,
    teacherRejectHandsUp,
  }
}

export const useVideoControlContext = (): VideoControlContext => {

  const sceneStore = useSceneStore()
  const boardStore = useBoardStore()
  const smallClassStore = useSmallClassStore()
  const isHost = sceneStore.isHost
  const teacherStream = sceneStore.teacherStream
  const studentStreams = sceneStore.studentStreams

  const firstStudent = studentStreams[0]

  const sceneVideoConfig = sceneStore.sceneVideoConfig

  const userRole = sceneStore.roomInfo.userRole

  const onCameraClick = useCallback(async (userUuid: any) => {
    const targetStream = sceneStore.streamList.find((stream: EduStream) => get(stream.userInfo, 'userUuid', 0) === userUuid)
    if (targetStream) {
      const isLocal = sceneStore.roomInfo.userUuid === userUuid
      if (targetStream.hasVideo) {
        await sceneStore.muteVideo(userUuid, isLocal)
      } else {
        await sceneStore.unmuteVideo(userUuid, isLocal)
      }
    }
  }, [userRole, sceneStore, sceneStore.streamList, sceneStore.roomInfo.userUuid])

  const onMicClick = useCallback(async (userUuid: any) => {
    const targetStream = sceneStore.streamList.find((stream: EduStream) => get(stream.userInfo, 'userUuid', 0) === userUuid)
    if (targetStream) {
      const isLocal = sceneStore.roomInfo.userUuid === userUuid
      if (targetStream.hasAudio) {
        await sceneStore.muteAudio(userUuid, isLocal)
      } else {
        await sceneStore.unmuteAudio(userUuid, isLocal)
      }
    }
  }, [userRole, sceneStore, sceneStore.streamList, sceneStore.roomInfo.userUuid])

  const onSendStar = useCallback(async (uid: any) => {

  }, [userRole, sceneStore])

  const onWhiteboardClick = useCallback(async (userUuid: any) => {
    const targetUser = boardStore.grantUsers.find((uid: string) => uid === userUuid)
    if (isHost) {
      if (targetUser) {
        await boardStore.revokeUserPermission(userUuid)
      } else {
        await boardStore.grantUserPermission(userUuid)
      }
    }
  }, [isHost, boardStore])

  const onOffPodiumClick = useCallback(async (userUuid: any) => {
    if (isHost) {
      await sceneStore.revokeCoVideo(userUuid)
    }
  }, [isHost, sceneStore])

  const acceptedUserList = smallClassStore.acceptedList

  const onOffAllPodiumClick = useCallback(async () => {
    if (isHost && acceptedUserList.length) {
      await sceneStore.revokeAllCoVideo()
    }
  }, [isHost, sceneStore, acceptedUserList])


  return {
    teacherStream,
    firstStudent,
    studentStreams,
    onCameraClick,
    onMicClick,
    onSendStar,
    onWhiteboardClick,
    onOffPodiumClick,
    sceneVideoConfig,
    isHost,
    onOffAllPodiumClick,
    canHoverHideOffAllPodium: !!acceptedUserList.length as any
  }
}

export const useSmallClassVideoControlContext = (): SmallClassVideoControlContext => {

  const sceneStore = useSceneStore()
  const boardStore = useBoardStore()
  const smallClassStore = useSmallClassStore()
  const isHost = sceneStore.isHost
  const teacherStream = sceneStore.teacherStream
  const studentStreams = smallClassStore.studentStreams

  const firstStudent = studentStreams[0]

  const sceneVideoConfig = sceneStore.sceneVideoConfig

  const userRole = sceneStore.roomInfo.userRole

  const onCameraClick = useCallback(async (userUuid: any) => {
    const targetStream = sceneStore.streamList.find((stream: EduStream) => get(stream.userInfo, 'userUuid', 0) === userUuid)
    if (targetStream) {
      const isLocal = sceneStore.roomInfo.userUuid === userUuid
      if (targetStream.hasVideo) {
        await sceneStore.muteVideo(userUuid, isLocal)
      } else {
        await sceneStore.unmuteVideo(userUuid, isLocal)
      }
    }
  }, [userRole, sceneStore, sceneStore.streamList, sceneStore.roomInfo.userUuid])

  const onMicClick = useCallback(async (userUuid: any) => {
    const targetStream = sceneStore.streamList.find((stream: EduStream) => get(stream.userInfo, 'userUuid', 0) === userUuid)
    if (targetStream) {
      const isLocal = sceneStore.roomInfo.userUuid === userUuid
      if (targetStream.hasAudio) {
        await sceneStore.muteAudio(userUuid, isLocal)
      } else {
        await sceneStore.unmuteAudio(userUuid, isLocal)
      }
    }
  }, [userRole, sceneStore, sceneStore.streamList, sceneStore.roomInfo.userUuid])

  const onSendStar = useCallback(async (uid: any) => {
    await smallClassStore.sendReward(uid)
  }, [userRole, smallClassStore])

  const onWhiteboardClick = useCallback(async (userUuid: any) => {
    const targetUser = boardStore.grantUsers.find((uid: string) => uid === userUuid)
    if (isHost) {
      if (targetUser) {
        await boardStore.revokeUserPermission(userUuid)
      } else {
        await boardStore.grantUserPermission(userUuid)
      }
    }
  }, [isHost, boardStore])

  const onOffPodiumClick = useCallback(async (userUuid: any) => {
    if (isHost) {
      await sceneStore.revokeCoVideo(userUuid)
    }
  }, [isHost, sceneStore])

  return {
    teacherStream,
    firstStudent,
    studentStreams,
    onCameraClick,
    onMicClick,
    onSendStar,
    onWhiteboardClick,
    onOffPodiumClick,
    sceneVideoConfig,
    // videoStreamList,
  }
}
