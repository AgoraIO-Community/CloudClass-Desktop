import { useAppStore, useBoardStore, usePretestStore, useRoomStore, useSceneStore, useSmallClassStore, useUIStore } from "@/hooks"
import { useEffectOnce } from "@/hooks/utils"
import { eduSDKApi } from "@/services/edu-sdk-api"
import { homeApi } from "@/services/home-api"
import { mapFileType } from "@/services/upload-service"
import { EduMediaStream } from "@/stores/app/scene"
import { StorageCourseWareItem } from "@/stores/storage"
import { EduLogger, EduRoleTypeEnum, EduStream } from "agora-rte-sdk"
import { Button, CameraPlaceHolder, formatFileSize, StudentInfo, ZoomItemType, t, transI18n } from "agora-scenario-ui-kit"
import MD5 from "js-md5"
import { get } from "lodash"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useHistory } from "react-router-dom"
import { BehaviorSubject } from "rxjs"
import { PPTKind } from "white-web-sdk"
import { RendererPlayer } from "../common-comps/renderer-player"
import { calcUploadFilesMd5, uploadFileInfoProps } from "../common-containers/cloud-driver"
import { Exit } from "../common-containers/dialog"

export const useScreenShareContext = () => {
  const sceneStore = useSceneStore()
  const windowItems = sceneStore.customScreenShareItems
  return {
    subTitle: transI18n('screen_share'),
    windowItems,
  }
}

export const useKickDialogContext = () => {

  const roomStore = useRoomStore()

  const kickOutOnce = async (userUuid: string, roomUuid: string) => {
    await roomStore.kickOutOnce(userUuid, roomUuid)
  }

  const kickOutBan = async (userUuid: string, roomUuid: string) => {
    await roomStore.kickOutBan(userUuid, roomUuid)
  }

  return {
    kickOutOnce,
    kickOutBan
  }
}

export const useToastContext = () => {
  const uiStore = useUIStore()
  return {
    toastQueue: uiStore.toastQueue,
    removeToast: (id: string) => {
      uiStore.removeToast(`${id}`)
    }
  }
}

export const useToolCabinetContext = () => {

  const sceneStore = useSceneStore()

  const boardStore = useBoardStore()

  return {
    onClick: async (id: any) => {
      switch (id) {
        case 'screenShare': {
            await sceneStore.startOrStopSharing()
            return
        }
        case 'laserPoint': {
            await boardStore.setLaserPoint()
            return
        }
      }
    }
  }
}

export type VideoAction = (uid: any) => Promise<any>

export type VideoContainerContext = {
  teacherStream: EduMediaStream,
  studentStreams: EduMediaStream[],
  firstStudent: EduMediaStream,
  videoStreamList: any[],
  onCameraClick: VideoAction,
  onMicClick: VideoAction,
  onSendStar: VideoAction,
  sceneVideoConfig: {
    hideOffPodium: boolean,
    hideOffAllPodium: boolean,
    isHost: boolean,
  },
  onWhiteboardClick: VideoAction,
  onOffAllPodiumClick?: () => any,
  onOffPodiumClick: VideoAction
}

export const useVideoControlContext = (): VideoContainerContext => {

  const sceneStore = useSceneStore()
  const boardStore = useBoardStore()
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

  const videoStreamList = useMemo(() => {

    //@ts-ignore TODO: student stream empty workaround need fix design
    if (firstStudent && firstStudent.defaultStream === true) {
      return []
    }

    return studentStreams.map((stream: EduMediaStream) => ({
      isHost: isHost,
      hideOffPodium: sceneVideoConfig.hideOffPodium,
      username: stream.account,
      stars: stream.stars,
      uid: stream.userUuid,
      micEnabled: stream.audio,
      cameraEnabled: stream.video,
      whiteboardGranted: stream.whiteboardGranted,
      micVolume: stream.micVolume,
      controlPlacement: 'bottom',
      hideControl: stream.hideControl,
      children: (
        <>
        <CameraPlaceHolder state={stream.holderState} />
        {
          stream.renderer && stream.video ?
          <RendererPlayer
            key={stream.renderer && stream.renderer.videoTrack ? stream.renderer.videoTrack.getTrackId() : ''} track={stream.renderer} id={stream.streamUuid} className="rtc-video"
          />
          : null
        }
        </>
      )
      }))
  }, [
    firstStudent,
    studentStreams,
    sceneVideoConfig.hideOffPodium,
    sceneVideoConfig.isHost
  ])

  const onOffPodiumClick = useCallback(async (userUuid: any) => {
    if (isHost) {
      await sceneStore.revokeCoVideo(userUuid)
    }
  }, [isHost, sceneStore])

  const onOffAllPodiumClick = useCallback(async () => {
    if (isHost) {
      await sceneStore.revokeAllCoVideo()
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
    videoStreamList,
    onOffAllPodiumClick,
  }
}

export const useSmallClassVideoControlContext = (): VideoContainerContext => {

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

  const videoStreamList = useMemo(() => {

    return studentStreams.map((stream: EduMediaStream) => ({
      isHost: isHost,
      hideOffPodium: sceneVideoConfig.hideOffPodium,
      username: stream.account,
      stars: stream.stars,
      uid: stream.userUuid,
      micEnabled: stream.audio,
      cameraEnabled: stream.video,
      whiteboardGranted: stream.whiteboardGranted,
      micVolume: stream.micVolume,
      controlPlacement: 'bottom',
      placement: 'bottom',
      hideControl: stream.hideControl,
      children: (
        <>
        <CameraPlaceHolder state={stream.holderState} />
        {
          stream.renderer && stream.video ?
          <RendererPlayer
            key={stream.renderer && stream.renderer.videoTrack ? stream.renderer.videoTrack.getTrackId() : ''} track={stream.renderer} id={stream.streamUuid} className="rtc-video"
          />
          : null
        }
        </>
      )
      }))
  }, [
    firstStudent,
    studentStreams,
    sceneVideoConfig.hideOffPodium,
    sceneVideoConfig.isHost
  ])

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
    videoStreamList,
  }
}

export const useChatContext = () => {
  const boardStore = useBoardStore()
  const roomStore = useRoomStore()
  const sceneStore = useSceneStore()
  const uiStore = useUIStore()

  const [nextId, setNextID] = useState('')

  const isMounted = useRef<boolean>(true)

  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [isMounted])

  const handleClickMinimize = useCallback(() => {

  }, [])

  const refreshMessageList = useCallback(async () => {
    const res = nextId !== 'last' && await roomStore.getHistoryChatMessage({ nextId, sort: 0 })
    if (isMounted.current) {
      setNextID(get(res, 'nextId', 'last'))
    }
  }, [nextId, setNextID, isMounted.current])

  const fetchMessage = async () => {
    const res = nextId !== 'last' && await roomStore.getHistoryChatMessage({ nextId, sort: 0 })
    isMounted.current && setNextID(get(res, 'nextId', 'last'))
  }

  useEffect(() => {
    if (roomStore.joined) {
      fetchMessage()
    }
  }, [roomStore.joined])

  const [text, setText] = useState<string>('')

  const handleSendText = useCallback(async (): Promise<void> => {
    const message = await roomStore.sendMessage(text)
    roomStore.addChatMessage(message)
    setText('')
  }, [text, setText])

  const onCanChattingChange = useCallback(async (canChatting: boolean) => {
    if (canChatting) {
      await sceneStore.muteChat()
    } else {
      await sceneStore.unmuteChat()
    }
  }, [sceneStore])

  useEffect(() => {
    if (boardStore.isFullScreen) {
      uiStore.chatCollapse = true
    } else {
      uiStore.chatCollapse = false
    }
  }, [boardStore.isFullScreen, uiStore])

  const onChangeCollapse = useCallback(() => {
    uiStore.toggleChatMinimize()
  }, [uiStore])

  return {
    meUid: roomStore.roomInfo.userUuid,
    messageList: roomStore.chatMessageList,
    unreadMessageCount: roomStore.unreadMessageCount,
    text,
    onChangeText: (textValue: any) => {
      setText(textValue)
    },
    canChatting: sceneStore.canChatting,
    isHost: sceneStore.isHost,
    handleSendText,
    onCanChattingChange,
    onChangeCollapse,
    minimize: uiStore.chatCollapse,
    refreshMessageList,
    handleClickMinimize
  }
}

export const useSettingContext = (id: any) => {
  const pretestStore = usePretestStore()
  const uiStore = useUIStore()
  const {visibleSetting} = uiStore

  const [cameraError, setCameraError] = useState<boolean>(false)
  const [microphoneError, setMicrophoneError] = useState<boolean>(false)
  const [isMirror, setMirror] = useState<boolean>(false)

  const onChangeDevice = useCallback(async (deviceType: string, value: any) => {
      switch (deviceType) {
          case 'camera': {
              await pretestStore.changeCamera(value)
              break;
          }
          case 'microphone': {
              await pretestStore.changeMicrophone(value)
              break;
          }
          case 'speaker': {
              await pretestStore.changeTestSpeaker(value)
              break;
          }
      }
  }, [pretestStore])

  useEffect(() => {
      const uninstall = pretestStore.onDeviceTestError(({type, error}) => {
          if (type === 'video') {
              setCameraError(error)
          }
          if (type === 'audio') {
              setMicrophoneError(error)
          }
      })
      // TODO: need pipe
      pretestStore.init({video: true, audio: true})
      // pretestStore.openTestCamera()
      // TODO: don't use enable recording, it will cause noise 
      // pretestStore.openTestMicrophone({enableRecording: false})
      return () => {
          // pretestStore.closeTestCamera()
          // pretestStore.closeTestMicrophone()
          uninstall()
      }
  }, [setCameraError, setMicrophoneError])

  const {
      cameraList,
      microphoneList,
      speakerList,
      cameraId,
      microphoneId,
      speakerId,
      cameraRenderer,
      microphoneLevel,
  } = pretestStore

  const onChangeAudioVolume = useCallback(async (deviceType: string, value: any) => {
      switch (deviceType) {
          case 'speaker': {
              await pretestStore.changeSpeakerVolume(value)
              break;
          }
          case 'microphone': {
              await pretestStore.changeMicrophoneVolume(value)
              break;
          }
      }
  }, [pretestStore])

  const onSelectMirror = useCallback((evt: any) => {
      setMirror(!isMirror)
  }, [pretestStore, isMirror])


  const VideoPreviewPlayer = useCallback(() => {
      return (
          <RendererPlayer
              className="camera-placeholder"
              style={{width: 320, height: 216}}
              mirror={isMirror}
              key={cameraId}
              id="stream-player"
              track={cameraRenderer}
              preview={true}
          />
      )
  }, [cameraRenderer, cameraId, isMirror])

  const handleOk = useCallback(() => {
      uiStore.removeDialog(id)
  }, [id, uiStore])

  const handleCancel = useCallback(() => {
    uiStore.removeDialog(id)
  }, [id, uiStore])

  return {
      visibleSetting,
      isNative: false,
      cameraList,
      microphoneList,
      speakerList,
      cameraId,
      microphoneId,
      speakerId,
      onChangeAudioVolume,
      onSelectMirror,
      cameraError,
      microphoneError,
      VideoPreviewPlayer,
      microphoneLevel,
      isMirror,
      handleOk,
      handleCancel,
      onChangeDevice,
  }
}

export const useNativeScreenShareWindowContext = () => {

  const {customScreenShareItems} = useSceneStore()

  return {
    windowItems: customScreenShareItems
  }
}

export const useScreenSharePlayerContext = () => {
  const sceneStore = useSceneStore()
  const screenShareStream = sceneStore.screenShareStream;
  const screenEduStream = sceneStore.screenEduStream

  return {
    screenShareStream,
    screenEduStream,
    onClick: async () => {
      await sceneStore.startOrStopSharing()
    }
  }
}

export const usePretestContext = () => {

  const pretestStore = usePretestStore()

  const [cameraError, setCameraError] = useState<boolean>(false)
  const [microphoneError, setMicrophoneError] = useState<boolean>(false)
  const [isMirror, setMirror] = useState<boolean>(false)

  useEffect(() => {
      const uninstall = pretestStore.onDeviceTestError(({type, error}) => {
          if (type === 'video') {
              setCameraError(error)
          }
          if (type === 'audio') {
              setMicrophoneError(error)
          }
      })
      // TODO: need pipe
      pretestStore.init({video: true, audio: true})
      pretestStore.openTestCamera()
      pretestStore.openTestMicrophone({enableRecording: true})
      return () => {
          pretestStore.closeTestCamera()
          pretestStore.closeTestMicrophone()
          uninstall()
      }
  }, [setCameraError, setMicrophoneError])

  const {
      cameraList,
      microphoneList,
      speakerList,
      cameraId,
      microphoneId,
      speakerId,
      cameraRenderer,
      microphoneLevel,
  } = pretestStore

  const onChangeDevice = useCallback(async (deviceType: string, value: any) => {
      switch (deviceType) {
          case 'camera': {
              await pretestStore.changeTestCamera(value)
              break;
          }
          case 'microphone': {
              await pretestStore.changeTestMicrophone(value)
              break;
          }
          case 'speaker': {
              await pretestStore.changeTestSpeaker(value)
              break;
          }
      }
  }, [pretestStore])
  const onChangeAudioVolume = useCallback(async (deviceType: string, value: any) => {
      switch (deviceType) {
          case 'speaker': {
              await pretestStore.changeTestSpeakerVolume(value)
              break;
          }
          case 'microphone': {
              await pretestStore.changeTestMicrophoneVolume(value)
              break;
          }
      }
  }, [pretestStore])
  const onSelectMirror = useCallback((evt: any) => {
      setMirror(!isMirror)
  }, [pretestStore, isMirror])


  const VideoPreviewPlayer = useCallback(() => {
      return (
          <RendererPlayer
              className="camera-placeholder camera-muted-placeholder"
              style={{width: 320, height: 216}}
              mirror={isMirror}
              key={cameraId}
              id="stream-player"
              track={cameraRenderer}
              preview={true}
          />
      )
  }, [cameraRenderer, cameraId, isMirror])

  const history = useHistory()

  const appStore = useAppStore()

  const handleOk = useCallback(() => {
      const roomPath = appStore.params.roomPath!
      console.log('history path ', roomPath)
      pretestStore.closeTestCamera()
      pretestStore.closeTestMicrophone()
      history.push(roomPath)
  }, [history, appStore.params.roomPath, pretestStore])

  return {
      cameraList,
      microphoneList,
      speakerList,
      isNative: false,
      cameraId,
      microphoneId,
      speakerId,
      onChangeDevice,
      onChangeAudioVolume,
      onSelectMirror,
      cameraError,
      microphoneError,
      VideoPreviewPlayer,
      microphoneLevel,
      isMirror,
      handleOk,
  }
}

export const usePenContext = () => {
  const boardStore = useBoardStore()
  const lineSelector = boardStore.lineSelector

  return {
    lineSelector,
    currentSelector: boardStore.currentSelector,
    isActive: boardStore.boardPenIsActive,
    onClick: (pen: any) => {
      boardStore.setTool(pen)
      boardStore.updatePen(pen)
    }
  }
}

export const useNavigationBarContext = () => {

  const roomStore = useRoomStore()

  const navigationState = roomStore.navigationState

  const uiStore = useUIStore()

  const handleClick = useCallback(async (type: string) => {
    switch (type) {
      case 'exit': {
        uiStore.addDialog(Exit)
        break
      }
      case 'record': {
        console.log('record')
        console.log(roomStore, roomStore.roomInfo.roomType)
        const urlParams = {
          userUuid: '', // 用户uuid
          userName: 'string', // 用户昵称
          roomUuid: roomStore.roomInfo.roomUuid, // 房间uuid
          roleType: EduRoleTypeEnum.invisible, // 角色
          roomType: roomStore.roomInfo.roomType, // 房间类型
          roomName: 'string', // 房间名称
          listener: 'ListenerCallback', // launch状态 todo 在页面中处理
          pretest: false, // 开启设备检测
          rtmUid: 'string',
          rtmToken: 'string', // rtmToken
          language: 'LanguageEnum', // 国际化
          startTime: 'number', // 房间开始时间
          duration: 'number', // 课程时长
          recordUrl: 'string' // 回放页地址
        }
        const urlParamsStr = Object.keys(urlParams).map(key => key + '=' + encodeURIComponent(urlParams[key])).join('&')
        const url = `https://xxxx?${urlParamsStr}`
        console.log({url}) 
        // todo fetch 
        // await eduSDKApi.updateRecordingState({
        //   roomUuid: '',
        //   state: 1,
        //   url
        // })
        break
      }
      case 'setting': {
        uiStore.setVisibleSetting(true)
        break
      }
      case 'courseControl': {
        console.log('courseControl')
        break
      }
    }
  }, [navigationState.isStarted, uiStore])

  return {
    handleClick,
    navigationState,
  }
}

export const useLoadingContext = () => {

  const uiStore = useUIStore()

  return {
    loading: uiStore.loading
  }
}

export const useCloudDriverContext = (props: any) => {

  const boardStore = useBoardStore()

  const onResourceClick = async (resourceUuid: string) => {
    await boardStore.putSceneByResourceUuid(resourceUuid)
  }

  const checkList$ = new BehaviorSubject<string[]>([])

  const [checkedList, updateList] = useState<string[]>([])

  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    checkList$.subscribe({
      next: (ids: string[]) => {
        updateList(ids)
      }
    })
    return () => {
      checkList$.unsubscribe()
    }
  }, [])

  const captureCheckedItems = (items: string[]) => {
    checkList$.next(items)
  }

  const [showUploadModal, setShowUploadModal] = useState<boolean>(false)
  const [showUploadToast, setShowUploadToast] = useState<boolean>(false)
  const [uploadFileInfo, setUploadFileInfo] = useState<uploadFileInfoProps>({
    iconType: '',
    fileName: '',
    fileSize: '',
    uploadComplete: false,
  })
  const [currentProgress, setCurrentProgress] = useState<number>(0)

  const onCancel = () => {
    boardStore.setTool('')
    props.actionClose()
  }

  const [activeKey, setActiveKey] = useState<string>('1')

  const handleChange = (key: string) => {
    setActiveKey(key)
  }

  const showToastFn = () => {
    setShowUploadModal(false)
    setShowUploadToast(true)
    setTimeout(() => {
      setShowUploadToast(false)
    }, 1000)
  }

  const handleUpload = async (evt: any) => {

    setUploadFileInfo({
      iconType: '',
      fileName: '',
      fileSize: '',
      uploadComplete: false,
    })
    setCurrentProgress(0)

    const file = evt.target.files[0]
    const md5 = await calcUploadFilesMd5(file)
    const resourceUuid = MD5(`${md5}`)
    const name = file.name.split(".")[0]
    const ext = file.name.split(".").pop()
    // hideToast()
    const supportedFileTypes = ['bmp', 'jpg', 'png', 'gif', 'pdf', 'pptx', 'mp3', 'mp4', 'doc', 'docx']

    const needConvertingFile = ['ppt', 'pptx', 'doc', 'docx', 'pdf']
    const isNeedConverting = needConvertingFile.includes(ext)
    const needDynamicFileType = ['pptx']
    const isDynamic = needDynamicFileType.includes(ext)
    const payload = {
      file: file,
      fileSize: file.size,
      ext: ext,
      resourceName: name,
      resourceUuid: resourceUuid,
      converting: isNeedConverting,
      kind: isDynamic ? PPTKind.Dynamic : PPTKind.Static,
      onProgress: async (evt: any) => {
        const { progress, isTransFile = false, isLastProgress = false } = evt;
        const parent = Math.floor(progress * 100)
        setCurrentProgress(parent)

        if (isTransFile) {
          setUploadFileInfo({
            ...uploadFileInfo,
            iconType: 'format-' + mapFileType(ext),
            fileName: name,
            uploadComplete: true,
          })
        }

        if (isLastProgress && parent === 100) {
          showToastFn()
        }
      },
      pptConverter: boardStore.boardClient.client.pptConverter(boardStore.room.roomToken)
    }
    if (ext === 'pptx') {
      EduLogger.info("upload dynamic pptx")
    }
    // TODO: 渲染UI
    setUploadFileInfo({
      ...uploadFileInfo,
      iconType: 'format-' + mapFileType(ext),
      fileName: name,
      fileSize: formatFileSize(file.size),
      uploadComplete: false,
    })
    setShowUploadModal(true)
    try {
      await boardStore.handleUpload(payload)
      fileRef.current!.value = ""
    } catch (e) {
      fileRef.current!.value = ""
      throw e
    }

  }

  const handleDelete = async () => {
    await boardStore.removeMaterialList(checkList$.getValue())
  }

  useEffect(() => {
    if (activeKey === '2') {
      boardStore.refreshState()
    }
  }, [activeKey, boardStore])

  const triggerUpload = () => {
    if (fileRef.current) {
      fileRef.current.click()
    }
  }

  return {
    handleDelete,
    triggerUpload,
    setShowUploadModal,
    showUploadToast,
    showUploadModal,
    captureCheckedItems,
    uploadFileInfo,
    currentProgress,
    fileRef,
    handleUpload,
    activeKey,
    handleChange,
    onCancel,
    onResourceClick,
  }

}

export const useUploadContext = (handleUpdateCheckedItems: CallableFunction) => {

  const boardStore = useBoardStore()

  const [checkMap, setCheckMap] = useState<Record<string, any>>({})

  useEffect(() => {
    handleUpdateCheckedItems(Object.keys(checkMap))
  }, [checkMap, handleUpdateCheckedItems])

  const items = useMemo(() => {
    return boardStore.personalResources.map((it: any) => ({
      ...it,
      checked: !!checkMap[it.id]
    }))
  },[boardStore.personalResources.length, JSON.stringify(checkMap)])

  const hasSelected: any = useMemo(() => {
    return !!items.find((item: any) => !!item.checked)
  }, [items, checkMap])

  const isSelectAll: any = useMemo(() => {
    const selected = items.filter((item: any) => !!item.checked)
    return items.length > 0 && selected.length === items.length ? true : false
  }, [items, checkMap])

  const handleSelectAll = useCallback((evt: any) => {
    if (isSelectAll) {
      const ids = items.map((item: any) => ({[`${item.id}`]: 0})).reduce((acc: any, it: any) => ({...acc, ...it}))
      const v = {
        ...checkMap,
        ...ids
      }
      setCheckMap(v)
    } else {
      const ids = items.map((item: any) => ({[`${item.id}`]: 1})).reduce((acc: any, it: any) => ({...acc, ...it}))
      const v = {
        ...checkMap,
        ...ids
      }
      setCheckMap(v)
    }
  }, [items, isSelectAll, checkMap])

  const changeChecked = useCallback((id: any, checked: boolean) => {
    const idx = items.findIndex((item: any) => item.id === id)
    if (idx >= 0) {
      setCheckMap({
        ...checkMap,
        ...{[`${id}`]: +checked},
      })
    }
  }, [items, checkMap])

  const onResourceClick = async (resourceUuid: string) => {
    await boardStore.putSceneByResourceUuid(resourceUuid)
  }

  return {
    changeChecked,
    handleSelectAll,
    hasSelected,
    setCheckMap,
    checkMap,
    boardStore,
    items,
    isSelectAll,
    onResourceClick,
  }
}

export const useStorageContext = () => {
  const boardStore = useBoardStore()

  const onResourceClick = async (resourceUuid: string) => {
    await boardStore.putSceneByResourceUuid(resourceUuid)
  }

  const itemList = boardStore.allResources

  useEffect(() => {
    boardStore.refreshState()
  }, [boardStore])

  return {
    itemList,
    onResourceClick
  }
}


export const useColorContext = () => {
  const boardStore = useBoardStore()

  const activeColor = boardStore.currentColor
  const strokeWidth = boardStore.currentStrokeWidth
  return {
    activeColor,
    strokeWidth,
    changeStroke: (width: any) => {
      boardStore.changeStroke(width)
    },
    changeHexColor: (color: any) => {
      boardStore.setTool('color')
      boardStore.changeHexColor(color)
    }
  }
}


const getHandsType = (role: EduRoleTypeEnum) => {

  const defaultType = null

  const map = {
      [EduRoleTypeEnum.teacher]: 'manager',
      [EduRoleTypeEnum.student]: 'receiver',
  }

  return map[role] || defaultType
}


export const useHandsUpContext = () => {
  const sceneStore = useSceneStore()

  const userRole = sceneStore.roomInfo.userRole

  return {
      handsType: getHandsType(userRole)
  }
}


export const useHandsUpSender = () => {

  const smallClass = useSmallClassStore()

  const teacherUuid = smallClass.teacherUuid

  const handsUpState = smallClass.handsUpState as any

  const handleClick = useCallback(async () => {
      if (handsUpState === 'default') {
        await smallClass.studentHandsUp(teacherUuid)
      }
      if (handsUpState === 'apply') {
        await smallClass.studentCancelHandsUp()
      }
  }, [handsUpState, smallClass, teacherUuid])

  return {
    handsUpState,
    handleClick
  }
}

export const useHandsUpManager = () => {

  const smallClassStore = useSmallClassStore()

  const coVideoUsers = smallClassStore.handsUpStudentList

  const handsUpState = 'default' as any

  const handleUpdateList = useCallback(async (type: string, info: StudentInfo) => {
      if (type === 'confirm') {
          await smallClassStore.teacherAcceptHandsUp(info.userUuid)
      }

      if (type === 'cancel') {
          await smallClassStore.teacherRejectHandsUp(info.userUuid)
      }
  }, [coVideoUsers, smallClassStore])

  return {
    handsUpState,
    handleUpdateList,
    coVideoUsers
  }
}

export const useErrorContext = (id: string) => {
  const uiStore = useUIStore()
  const appStore = useAppStore()

  const onOK = async () => {
    uiStore.removeDialog(id)
    await appStore.destroyRoom()
  }

  const onCancel = () => {
    uiStore.removeDialog(id)
  }

  const ButtonGroup = useCallback(() => {
    return [
      <Button type={'primary'} action="ok">{t('toast.confirm')}</Button>,
    ]
  }, [t])
  
  return {
    onOK,
    onCancel,
    ButtonGroup
  }
}


export const useOpenDialogContext = (id: string) => {

  const uiStore = useUIStore()

  const [windowId, setWindowId] = useState<string>('')

  const onConfirm = useCallback(async () => {
    await sceneStore.startNativeScreenShareBy(+windowId)
  }, [windowId])

  const sceneStore = useSceneStore()

  const onOK = async () => {
    await onConfirm()
    uiStore.removeDialog(id)
  }

  const onCancel = () => {
    uiStore.removeDialog(id)
  }

  const ButtonGroup = useCallback(() => {
    return [
      <Button type={'secondary'} action="cancel">{t('toast.cancel')}</Button>,
      <Button type={'primary'} action="ok">{t('toast.confirm')}</Button>,
    ]
  }, [t])
  
  return {
    onOK,
    onCancel,
    ButtonGroup,
    setWindowId,
    windowId,
  }
}

export const useCloseConfirmContext = (id: string, resourceUuid: string) => {

  const uiStore = useUIStore()
  const boardStore = useBoardStore()

  const onOK = async () => {
    boardStore.closeMaterial(resourceUuid)
    uiStore.removeDialog(id)
  }

  const onCancel = () => {
    uiStore.removeDialog(id)
  }

  const ButtonGroup = useCallback(() => {
    return [
      <Button type={'secondary'} action="cancel">{t('toast.cancel')}</Button>,
      <Button type={'primary'} action="ok">{t('toast.confirm')}</Button>,
    ]
  }, [])

  return {
    onOK,
    onCancel,
    ButtonGroup
  }
}

export const useRoomEndContext = (id: string) => {
  const roomStore = useRoomStore()
  // const {t} = useTranslation()
  const uiStore = useUIStore()
  const appStore = useAppStore()
  const isStarted = roomStore.navigationState.isStarted

  const onOK = async () => {
    await appStore.destroyRoom()
    uiStore.removeDialog(id)
  }

  const onCancel = () => {
    uiStore.removeDialog(id)
  }

  const ButtonGroup = useCallback(() => {
    return [
      <Button type={isStarted ? 'primary' : 'secondary'} action="cancel">{t('toast.cancel')}</Button>,
      <Button type={!isStarted ? 'primary' : 'secondary'} action="ok">{t('toast.confirm')}</Button>,
    ]
  }, [isStarted])
  
  return {
    onOK,
    onCancel,
    ButtonGroup
  }
}

export const useExitContext = (id: string) => {
  const roomStore = useRoomStore()
  const appStore = useAppStore()

  const uiStore = useUIStore()
  const isStarted = roomStore.navigationState.isStarted

  const onOK = async () => {
    await appStore.destroyRoom()
    uiStore.removeDialog(id)
    console.log('id', id)
  }

  const onCancel = () => {
    uiStore.removeDialog(id)
    console.log('id', id)
  }

  const ButtonGroup = useCallback(() => {
    return [
      <Button type={isStarted ? 'primary' : 'secondary'} action="cancel">{t('toast.cancel')}</Button>,
      <Button type={!isStarted ? 'primary' : 'secondary'} action="ok">{t('toast.confirm')}</Button>,
    ]
  }, [isStarted])

  return {
    onOK,
    onCancel,
    ButtonGroup
  }
}

export const useKickEndContext = (id: string) => {
  const roomStore = useRoomStore()
  const appStore = useAppStore()
  // const {t} = useTranslation()

  const navigationState = roomStore.navigationState

  const uiStore = useUIStore()
  const isStarted = navigationState.isStarted

  const onOK = async () => {
    await appStore.destroyRoom()
    uiStore.removeDialog(id)
  }

  const onCancel = async () => {
    await appStore.destroyRoom()
    uiStore.removeDialog(id)
  }

  const ButtonGroup = useCallback(() => {
    return [
      <Button type={!isStarted ? 'primary' : 'secondary'} action="ok">{t('toast.confirm')}</Button>,
    ]
  }, [isStarted])


  return {
    onOK,
    onCancel,
    ButtonGroup
  }
}

export const useDialogContext = () => {
  const uiStore = useUIStore()

  return {
    dialogQueue: uiStore.dialogQueue
  }
}

export const use1v1Store = () => {
  const roomStore = useRoomStore()
  const boardStore = useBoardStore()
  useEffectOnce(() => {
    roomStore.join()
  })

  return {
    isFullScreen: boardStore.isFullScreen
  }
}

export const useWhiteboardState = () => {
  const boardStore = useBoardStore()
  const roomStore = useRoomStore()

  const boardRef = useRef<HTMLDivElement | null>(null)

  const mountToDOM = useCallback((dom: any) => {
    if (dom) {
      boardStore.mount(dom)
    } else {
      boardStore.unmount()
    }
  }, [boardRef.current, boardStore])

  const handleToolBarChange = async (type: string) => {
    boardStore.setTool(type)
  }

  const handleZoomControllerChange = async (type: ZoomItemType) => {
    const toolbarMap: Record<ZoomItemType, CallableFunction> = {
      'max': () => {
        boardStore.zoomBoard('fullscreen')
      },
      'min': () => {
        boardStore.zoomBoard('fullscreenExit')
      },
      'zoom-out': () => {
        boardStore.setZoomScale('out')
      },
      'zoom-in': () => {
        boardStore.setZoomScale('in')
      },
      'forward': () => boardStore.changeFooterMenu('next_page'),
      'backward': () => boardStore.changeFooterMenu('prev_page'),
    }
    toolbarMap[type] && toolbarMap[type]()
  }

  const [showToolBar, showZoomControl] = useMemo(() => {
    if ([EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(roomStore.roomInfo.userRole)) {
      return [true, true]
    }
    if (roomStore.roomInfo.userRole === EduRoleTypeEnum.student) {
      return [boardStore.hasPermission, boardStore.hasPermission]
    }

    return [false, false]
  }, [roomStore.roomInfo.roomType, boardStore.hasPermission, roomStore.roomInfo.userRole])

  return {
    zoomValue: boardStore.zoomValue,
    currentPage: boardStore.currentPage,
    totalPage: boardStore.totalPage,
    courseWareList: [],
    handleToolBarChange,
    handleZoomControllerChange,
    ready: boardStore.ready,
    mountToDOM,
    isFullScreen: boardStore.isFullScreen,
    currentSelector: boardStore.currentSelector,
    tools: boardStore.tools,
    activeMap: boardStore.activeMap,
    hasBoardPermission: boardStore.hasPermission,
    showToolBar,
    showZoomControl,
    showTab: roomStore.roomInfo.userRole === EduRoleTypeEnum.student ? false : true
  }
}

export const useDownloadContext = () => {

  const boardStore = useBoardStore()

  const itemList = boardStore.downloadList.filter((it: StorageCourseWareItem) => it.taskUuid)

  const onResourceClick = useCallback(async(id: string) => {
    await boardStore.putSceneByResourceUuid(id)
  }, [boardStore])

  return {
    itemList,
    onResourceClick,
    startDownload: async (taskUuid: string) => {
      await boardStore.startDownload(taskUuid)
    },
    deleteDownload: async (taskUuid: string) => {
      await boardStore.deleteSingle(taskUuid)
    }
  }
}

export const useUserListContext = () => {

  const smallClassStore = useSmallClassStore()

  const teacherName = smallClassStore.teacherName
  const role = smallClassStore.role
  const rosterUserList = smallClassStore.rosterUserList
  const onClick = useCallback(async (actionType: any, uid: any) => {
      await smallClassStore.handleRosterClick(actionType, uid)
  }, [smallClassStore])

  return {
    dataSource: rosterUserList,
    teacherName,
    onClick,
    role
  }
}

export const useRecordingContext = () => {
  const sceneStore = useSceneStore()
  const roomStore = useRoomStore()
  const appStore = useAppStore()

  const onStartRecording = async () => {
    const roomUuid = roomStore.roomInfo.roomUuid
    const tokenRule = `${roomUuid}-record-${Date.now()}`
    // 生成token home-api login
    const { rtmToken, userUuid } = await homeApi.login(tokenRule)
    const urlParams = {
      userUuid, // 用户uuid
      userName: 'agora incognito', // 用户昵称
      roomUuid, // 房间uuid
      roleType: EduRoleTypeEnum.invisible, // 角色
      roomType: roomStore.roomInfo.roomType, // 房间类型
      roomName: roomStore.roomInfo.roomName, // 房间名称x
      // listener: 'ListenerCallback', // launch状态 todo 在页面中处理
      pretest: false, // 开启设备检测
      rtmUid: userUuid,
      rtmToken, // rtmToken
      language: appStore.params.language, // 国际化
      startTime: appStore.params.startTime, // 房间开始时间
      duration: appStore.params.duration, // 课程时长
      recordUrl: appStore.params.config.recordUrl, // 回放页地址
      appId: appStore.params.config.agoraAppId,
      userRole: EduRoleTypeEnum.invisible
    }
    if (!urlParams.recordUrl) {
      // urlParams.recordUrl = 'https://webdemo.agora.io/aclass/#/invisible/courses'
      urlParams.recordUrl = 'https://webdemo.agora.io/gqf-incognito-record'
      // throw GenericErrorWrapper()
      // return;
    }
    const urlParamsStr = Object.keys(urlParams).map(key => key + '=' + encodeURIComponent(urlParams[key])).join('&')
    const url = `${urlParams.recordUrl}?${urlParamsStr}`
    console.log({urlParams, url}) 
    // todo fetch 
    await eduSDKApi.updateRecordingState({
      roomUuid,
      state: 1,
      url
    })
  }

  const onStopRecording = async () => {
    const roomUuid = roomStore.roomInfo.roomUuid
    await eduSDKApi.updateRecordingState({
      roomUuid,
      state: 0
    })
  }

  return {
    isRecording: sceneStore.isRecording,
    onStartRecording,
    onStopRecording
  }
}