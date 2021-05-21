import { eduSDKApi } from "../services/edu-sdk-api"
import { homeApi } from "../services/home-api"
import { StorageCourseWareItem } from "../types"
import { get } from "lodash"

import { EduRoleTypeEnum, EduStream, EduUser } from "agora-rte-sdk"
import { useCallback, useState } from "react"
import { useCoreContext, useSceneStore, useBoardStore, useSmallClassStore, usePretestStore, useRoomStore} from "./core"
import { VideoControlContext, ChatContext, /*StreamContext, */PretestContext,ScreenShareContext, RoomContext, RoomDiagnosisContext, GlobalContext, UserListContext, RecordingContext, HandsUpContext, BoardContext, SmallClassVideoControlContext, StreamListContext, CloudDriveContext, VolumeContext } from './type'
import { EduUserRoleEnum2EduUserRole } from "../utilities/typecast"

export {
  ControlTool
} from './type'

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
  const { roomStore, sceneStore } = core
  return {
    isHost: sceneStore.isHost,
    messageList: roomStore.chatMessageList,
    conversationList: roomStore.chatConversationList,
    unreadMessageCount: roomStore.unreadMessageCount,
    canChatting: sceneStore.canChatting,
    sendMessage: roomStore.sendMessage,
    sendMessageToConversation: roomStore.sendMessageToConversation,
    muteChat: sceneStore.muteChat,
    unmuteChat: sceneStore.unmuteChat,
    muteUserChat: sceneStore.muteUserChat,
    unmuteUserChat: sceneStore.unmuteUserChat,
    addChatMessage: roomStore.addChatMessage,
    addConversationChatMessage: roomStore.addConversationChatMessage,
    getHistoryChatMessage: roomStore.getHistoryChatMessage,
    getConversationList: roomStore.getConversationList,
    getConversationHistoryChatMessage: roomStore.getConversationHistoryChatMessage
    // REMOVED v1.1.1
    // chatCollapse: uiStore.chatCollapse,
    // toggleChatMinimize: uiStore.toggleChatMinimize,
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
    onPodiumStudentStreams,
    muteAudio,
    unmuteAudio,
    muteVideo,
    unmuteVideo,
    revokeUserPermission,
    grantUserPermission,
  }
}

export const useVolumeContext = (): VolumeContext => {
  const pretestStore = usePretestStore()

  return {
    microphoneLevel: pretestStore.microphoneLevel
  }
}

export const usePretestContext = (): PretestContext => {
  const pretestStore = usePretestStore()
  const appStore = useCoreContext()
  // const uiStore = useUIStore()
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
    pretestNoticeChannel: appStore.pretestNotice$
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
    // ADDED v1.1.1
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
    sceneType,
    removeScreenShareWindow
  } = useSceneStore()

  const {
    isJoiningRoom,
    kickOutBan,
    kickOutOnce,
    join,
    liveClassStatus,
    toast$,
    dialog$,
    seq$
  } = useRoomStore()

  return {
    sceneType,
    destroyRoom,
    joinRoom: join,
    // TO-REVIEW
    // ui context?
    // removeDialog,
    // TO-REVIEW REMOVED in v1.1.1
    // startNativeScreenShareBy,
    // teacherAcceptHandsUp,
    // teacherRejectHandsUp,
    // handsUpStudentList,
    // processUserCount,
    // muteVideo,
    // unmuteVideo,
    // muteAudio,
    // unmuteAudio,
    // muteUserChat,
    // unmuteUserChat
    roomInfo,
    isCourseStart: !!classState,
    kickOutBan,
    kickOutOnce,
    liveClassStatus,
    // TO-REVIEW
    // ui context?
    removeScreenShareWindow,
    // v1.1.1
    toastEventObserver: toast$,
    dialogEventObserver: dialog$,
    sequenceEventObserver: seq$,
    isJoiningRoom
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

  // const {
  //   addDialog,
  //   removeDialog,
  //   addToast,
  //   toast$,
  //   fireToast,
  //   removeToast,
  //   toastQueue,
  //   checked,
  //   loading,
  //   dialogQueue,
  //   updateChecked,
  //   dialog$,
  //   fireDialog
  // } = useUIStore()

  const {
    joined,
    // joining,
  } = useRoomStore()

  return {
    //TO-REVIEW
    //add isLoading
    // loading,
    isFullScreen,
    //TO-REVIEW
    //ui context?
    // addDialog,
    // removeDialog,
    // toast$,
    // fireToast,
    // addToast,
    //TO-REVIEW
    //??
    // checked,
    params: appStore.params,
    //TO-REVIEW
    //ui context?
    // dialogQueue,
    // removeToast,
    // toastQueue,
    //TO-REVIEW
    //??
    // updateChecked,
    mainPath,
    language: appStore.params.language,
    //TO-REVIEW
    //ui context?
    // fireDialog,
    // joined,
    //v1.1.1
    // isLoading: loading,
    isJoined: joined
    // inRoom: joining
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
    changeStroke,
    changeHexColor,
    mount,
    unmount,
    setTool,
    zoomBoard,
    setZoomScale,
    changeFooterMenu,
    updatePen,
    setLaserPoint,
    tools,
    activeSceneName,
    boardPenIsActive,
    changeSceneItem,
    room,
    installTools,
    revokeBoardPermission,
    grantBoardPermission,
    showBoardTool,
    canSharingScreen,
    isBoardScreenShare
  } = useBoardStore()

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
    //??setTools?
    installTools,
    //TO-REVIEW
    //room context?
    canSharingScreen,
    revokeBoardPermission,
    grantBoardPermission,
    //TO-REVIEW
    //ui context?
    showBoardTool,
    // v1.1.1
    isCurrentScenePathScreenShare:isBoardScreenShare
  }
}

export const useCloudDriveContext = (): CloudDriveContext => {
  const {
    courseWareList,
    downloadList,
    putSceneByResourceUuid,
    startDownload,
    deleteSingle,
    refreshState,
    resourcesList,
    removeMaterialList,
    cancelUpload,
    closeMaterial,
    personalResources,
    handleUpload,
    publicResources,
  } = useBoardStore()


  return {
    //TO-REVIEW
    //clouddriver context?
    courseWareList,
    downloadList: downloadList.filter((it: StorageCourseWareItem) => it.taskUuid),
    openCloudResource: putSceneByResourceUuid,
    startDownload,
    deleteSingle,
    resourcesList,
    refreshCloudResources: refreshState,
    removeMaterialList,
    cancelUpload,
    closeMaterial,
    personalResources,
    publicResources,
    doUpload: handleUpload,
  }
}

//TO-REVIEW
//to remove in v1.1.1
// export const useStreamContext = (): StreamContext => {
//   const {streamList} = useSceneStore()

//   return {
//     streamList
//   }
// }


export const useUserListContext = (): UserListContext => {
  const appStore = useCoreContext()
  const {
    isHost
  } = useSceneStore()

  const {
    acceptedList:acceptedUserList,
    teacherInfo,
    rosterUserList,
    togglePodium,
    toggleWhiteboardPermission,
    toggleCamera,
    toggleMic,
    kick
  } = useSmallClassStore()

  const {roomInfo} = appStore
  const {
    sceneType,
    controlTools
  } = useSceneStore()
  // const localUserUuid = appStore.roomInfo.userUuid
  let localUserInfo:EduUser = {
    userUuid: roomInfo.userUuid,
    userName: roomInfo.userName,
    role: EduUserRoleEnum2EduUserRole(roomInfo.userRole, sceneType),
    // TODO need merge with userlist properties
    userProperties: {}
  }

  const userList = appStore.sceneStore.userList

  // const {revokeCoVideo} = smallClassStore

  return {
    //TO-REVIEW removed in v1.1.1
    // localUserUuid,
    // myRole,
    // teacherName,
    // handleRosterClick,
    // revokeCoVideo,
    // teacherAcceptHandsUp,
    userList,
    acceptedUserList,
    rosterUserList,
    //v1.1.1
    localUserInfo,
    teacherInfo,
    togglePodium,
    toggleWhiteboardPermission,
    toggleCamera,
    toggleMic,
    controlTools,
    kick,
    isHost
  }
}

export const useRecordingContext = (): RecordingContext => {

  const {
    isRecording,
    roomUuid
  } = useSceneStore()

  const appStore = useCoreContext()

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
    acceptedUserList: coVideoUsers,
    onlineUserCount,
    processUserCount,
    teacherAcceptHandsUp,
    teacherRejectHandsUp,
    revokeCoVideo
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
    //v1.1.1
    exitCoVideo: revokeCoVideo
  }
}

export const useVideoControlContext = (): VideoControlContext => {

  const sceneStore = useSceneStore()
  const boardStore = useBoardStore()
  const smallClassStore = useSmallClassStore()
  const isHost = sceneStore.isHost

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
    onCameraClick,
    onMicClick,
    onSendStar,
    onWhiteboardClick,
    onOffPodiumClick,
    onOffAllPodiumClick,
    canHoverHideOffAllPodium: !!acceptedUserList.length as any
    //TO-REVIEW removed in v1.1.1
    // teacherStream,
    // firstStudent,
    // studentStreams,
    // sceneVideoConfig,
    // isHost,
  }
}

export const useSmallClassVideoControlContext = (): SmallClassVideoControlContext => {

  const sceneStore = useSceneStore()
  const boardStore = useBoardStore()
  const smallClassStore = useSmallClassStore()
  const isHost = sceneStore.isHost
  const teacherStream = sceneStore.teacherStream
  const studentStreams = smallClassStore.studentStreams

  // const firstStudent = studentStreams[0]

  // const sceneVideoConfig = sceneStore.sceneVideoConfig

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
    studentStreams,
    onCameraClick,
    onMicClick,
    onSendStar,
    onWhiteboardClick,
    onOffPodiumClick,
    //TO-REVIEW removed in v1.1.1
    // firstStudent,
    // sceneVideoConfig,
    // videoStreamList,
  }
}
