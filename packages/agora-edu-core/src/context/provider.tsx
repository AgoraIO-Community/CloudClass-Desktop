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
    messageList: roomStore.chatMessageList,
    conversationList: roomStore.chatConversationList,
    //TO-REVIEW
    //ui store?
    chatCollapse: uiStore.chatCollapse,
    unreadMessageCount: roomStore.unreadMessageCount,
    canChatting: sceneStore.canChatting,
    sendMessage: roomStore.sendMessage,
    sendMessageToConversation: roomStore.sendMessageToConversation,
    muteChat: sceneStore.muteChat,
    unmuteChat: sceneStore.unmuteChat,
    toggleChatMinimize: uiStore.toggleChatMinimize,
    addChatMessage: roomStore.addChatMessage,
    addConversationChatMessage: roomStore.addConversationChatMessage,
    getHistoryChatMessage: roomStore.getHistoryChatMessage,
    getConversationList: roomStore.getConversationList,
    getConversationHistoryChatMessage: roomStore.getConversationHistoryChatMessage
  }
}

export const useStreamListContext = (): StreamListContext => {

  const sceneStore = useSceneStore()

  const boardStore = useBoardStore()

  const smallClassStore = useSmallClassStore()

  const {
    muteAudio,
    unmuteAudio,
    muteVideo,
    unmuteVideo,
    teacherStream,
    studentStreams,
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
    localStream: cameraEduStream,
    streamList,
    teacherStream,
    studentStreams,
    //TO-REVIEW
    //maybe roomProperties + stream = roomContext?
    onPodiumStudentStreams,
    muteAudio,
    unmuteAudio,
    muteVideo,
    unmuteVideo,
    revokeUserPermission,
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
    customScreenSharePickerItems,
    customScreenSharePickerType,
    screenShareStream,
    screenEduStream,
    startOrStopSharing,
    startNativeScreenShareBy
  } = useSceneStore()

  const {
    isShareScreen
  } = useBoardStore()

  return {
    nativeAppWindowItems: customScreenSharePickerItems,
    screenShareStream,
    screenEduStream,
    startOrStopSharing,
    // v1.1.1 - TO-REVIEW
    // isShareScreen,
    // isBoardScreenShare
    // is screensharing going on
    isScreenSharing: isShareScreen,
    customScreenSharePickerType,
    startNativeScreenShareBy
  }
}

export const useRoomContext = (): RoomContext => {

  const {
    destroyRoom,
  } = useCoreContext()

  const {
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

  // const {
    // teacherAcceptHandsUp,
    // teacherRejectHandsUp,
  //   handsUpStudentList,
  //   processUserCount,
  // } = useSmallClassStore()

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
    // TO-REVIEW
    // ui context?
    removeDialog,
    // TO-REVIEW REMOVED in v1.1.1
    // startNativeScreenShareBy,
    // TO-REVIEW REMOVED in v1.1.1
    // teacherAcceptHandsUp,
    // teacherRejectHandsUp,
    // TO-REVIEW
    // need change
    handsUpStudentList,
    processUserCount,
    roomInfo,
    isCourseStart: !!classState,
    kickOutBan,
    kickOutOnce,
    liveClassStatus,
    // TO-REVIEW
    // ui context?
    removeScreenShareWindow,
    // TO-REVIEW
    // to remove in v1.1.1
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
    //TO-REVIEW
    //add isLoading
    loading,
    isFullScreen,
    //TO-REVIEW
    //ui context?
    addDialog,
    removeDialog,
    toast$,
    fireToast,
    addToast,
    //TO-REVIEW
    //??
    checked,
    params: appStore.params,
    //TO-REVIEW
    //ui context?
    dialogQueue,
    removeToast,
    toastQueue,
    //TO-REVIEW
    //??
    updateChecked,
    mainPath,
    language: appStore.params.language,
    toastEventObserver: toast$,
    dialogEventObserver: dialog$,
    //TO-REVIEW
    //ui context?
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
    ready,
    courseWareList,
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
    canSharingScreen,
    isBoardScreenShare
  } = useBoardStore()

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
    //TO-REVIEW
    //clouddriver context?
    courseWareList,
    downloadList: downloadList.filter((it: StorageCourseWareItem) => it.taskUuid),
    currentColor,
    currentStrokeWidth,
    hasPermission,
    currentSelector,
    lineSelector,
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
    //TO-REVIEW
    //clouddriver context?
    openCloudResource: putSceneByResourceUuid,
    startDownload,
    //TO-REVIEW
    //name, clouddriver context
    deleteSingle,
    //TO-REVIEW
    //setPenType?
    updatePen,
    //TO-REVIEW
    //need merge
    activeMap,
    boardPenIsActive,
    // REMOVED in v1.1.1
    // startOrStopSharing,
    setLaserPoint,
    activeSceneName,
    //TO-REVIEW
    //clouddriver context?
    resourcesList,
    refreshCloudResources: refreshState,
    removeMaterialList,
    cancelUpload,
    closeMaterial,
    //TO-REVIEW
    //??setTools?
    installTools,
    //TO-REVIEW
    //room context?
    canSharingScreen,
    //TO-REVIEW
    //clouddriver context?
    personalResources,
    publicResources,
    revokeBoardPermission,
    grantBoardPermission,
    //TO-REVIEW
    //clouddriver context?
    doUpload: handleUpload,
    //TO-REVIEW
    //ui context?
    showBoardTool,
    // v1.1.1
    isCurrentScenePathScreenShare:isBoardScreenShare
  }
}

//TO-REVIEW
//to remove in v1.1.1
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
    //TO-REVIEW
    //merged into localUserInfo
    localUserUuid,
    myRole,
    //TO-REVIEW
    //merged into teacherInfo
    teacherName,
    //TO-REVIEW
    //split to separate func
    handleRosterClick,
    //TO-REVIEW
    //separate func?
    revokeCoVideo,
    //TO-REVIEW
    //room context?
    teacherAcceptHandsUp,
    userList,
    //TO-REVIEW
    //room context?
    acceptedUserList,
    rosterUserList
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
