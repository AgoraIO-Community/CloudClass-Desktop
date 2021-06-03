import { UserRenderer, LocalUserRenderer, EduUser, EduStream, EduRoleTypeEnum } from 'agora-rte-sdk'
import { AnimationMode, ApplianceNames, MemberState, Room, SceneDefinition, ViewMode } from 'white-web-sdk';
import { AppStoreInitParams, LanguageEnum, RoomInfo } from '../api/declare'
import { BehaviorSubject, Subject } from 'rxjs';
import { StorageCourseWareItem } from "../types"
import { MaterialDataResource } from "../services/upload-service"
import { RosterUserInfo } from '../stores/small-class';
import { ScreenShareType } from 'agora-rte-sdk';

export type DeviceErrorCallback = (evt: {type: 'video' | 'audio', error: boolean}) => void

export type Resource = {
    file: {
        name: string,
        type: string,
    },
    resourceName: string,
    resourceUuid: string,
    taskUuid: string,
    currentPage: number,
    totalPage: number,
    scenePath: string,
    show: boolean,
}
export type EduMediaStream = {
    streamUuid: string,
    userUuid: string,
    renderer?: UserRenderer,
    account: string,
    local: boolean,
    audio: boolean,
    video: boolean,
    hideControl: boolean,
    whiteboardGranted: boolean,
    micVolume: number,
    placement: string,
    stars: number,
    isLocal: boolean;
    online: boolean;
    onPodium: boolean;
    cameraDevice: number;
    micDevice: number;
    hasStream: boolean;
    holderState: 'loading' | 'muted' | 'broken' | 'disabled'
}
export type ToastType = {
    id: string,
    desc: string,
    type?: 'success' | 'error' | 'warning'
}
export type DialogType = {
    id: string,
    component: any,
    props?: any,
}

export enum ControlTool {
    offPodium = 0,
    offPodiumAll = 1,
    grantBoard = 2
}

export type ChatContext = {
    /**
     * 是否为IM主持人
     * @version v1.1.0
     */
    isHost: boolean,
    /**
     * 获取消息列表
     *  @param {
     *    nextId,
     *    sord
     * }
     * @param name 名称
     * @version v1.1.0
     */
    getHistoryChatMessage: (data: {
        nextId: string;
        sort: number;
    })=>Promise<any>,
    /**
     * 消息列表
     * @version v1.1.0
     */
    messageList: any[],
    /**
     * 发送消息
     * @version v1.1.0
     */
    sendMessage: (message: any) => Promise<{
        /**
         * 用户id
         */
        id: string
        /**
         * 时间戳
         */
        ts: number
        /**
         * 消息内容
         */
        text: any,
        /**
         * 用户名
         */
        account: string,
        sender: boolean,
        /**
         * 消息id
         */
        messageId: string,
        /**
         * 房间名称
         */
        fromRoomName: string,
    }>,
    /**
     * 开启聊天
     * @version v1.1.0
     */
    muteChat: () => void,
    /**
     * 禁止聊天
     * @version v1.1.0
     */
    unmuteChat: () => void,
    /**
     * 未读取消息数量
     * @version v1.1.0
     */
    unreadMessageCount: number,
    /**
     * 是否可以聊天
     * @version v1.1.0
     */
    canChatting: boolean,
    /**
     * 添加消息到本地消息列表
     * @version v1.1.0
     */
    addChatMessage: (args: any) => void
    /**
     * 发送私聊聊天消息
     * @version v1.1.2
     */
    sendMessageToConversation: (message: any, userUuid: string) => void;
    /**
     * 会话列表
     * @version v1.1.2
     */
    conversationList: any[];
    /**
     * 拉取会话列表
     * @version v1.1.2
     */
    getConversationList: (data: any) => Promise<any>;
    /**
     * 拉取会话历史列表
     * @version v1.1.2
     */
    getConversationHistoryChatMessage: (data: any) => Promise<any>;
    /**
     * 添加私聊聊天消息
     * @version v1.1.2
     */
    addConversationChatMessage: (args: any, conversation: any) => void;
    /**
     * 操作指定用户聊天禁言
     * @version v1.1.2
     */
    muteUserChat: (userUuid:string) => Promise<void>
    /**
     * 操作指定用户聊天解禁
     * @version v1.1.2
     */
    unmuteUserChat: (userUuid:string) => Promise<void>
}
export type StreamListContext = {
    /**
     * 全部媒体数据流列表
     * @version v1.1.0
     */
    streamList: EduStream[],
    /**
     * 教师媒体数据流
     * @version v1.1.0
     */
    teacherStream: any,
    /**
     * 学生媒体数据流列表
     * @version v1.1.0
     */
    studentStreams: EduMediaStream[],
    /**
     * 当前上台的学生媒体数据流列表
     * @version v1.1.0
     */
    onPodiumStudentStreams: EduMediaStream[],
    /**
     * 禁用音频
     * @param userUuid 用户id
     * @param isLocal 是否为本地用户
     * @version v1.1.0
     */
    muteAudio: (userUuid: string, isLocal: boolean) => void,
    /**
     * 取消禁用音频
     * @param userUuid 用户id
     * @param isLocal 是否为本地用户
     * @version v1.1.0
     */
    unmuteAudio: (userUuid: string, isLocal: boolean) => void,
    /**
     * 禁用视频
     * @param userUuid 用户id
     * @param isLocal 是否为本地用户
     * @version v1.1.0
     */
    muteVideo: (userUuid: string, isLocal: boolean) => void,
    /**
     * 取消禁用视频
     * @param userUuid 用户id
     * @param isLocal 是否为本地用户
     * @version v1.1.0
     */
    unmuteVideo: (userUuid: string, isLocal: boolean) => void,
    /**
     * 取消白板权限
     * @param userUuid 用户id
     * @version v1.1.0
     */
    revokeUserPermission: (userUuid: string) => void,
    /**
     * 当前用户的媒体数据流
     * @version v1.1.0
     */
    localStream: EduStream,
    /**
     * 授予白板权限
     * @param userUuid 用户id
     * @version v1.1.0
     */
    grantUserPermission: (userUuid: string) => void,
}
export type VolumeContext = {
    /**
     * 当前麦克风设备音量
     * @version v1.1.2
     */
    microphoneLevel: number,
}
export type PretestContext = {
    /**
     * 摄像头是否错误
     * @version v1.1.0
     */
    cameraError: boolean,
    /**
     * 麦克风是否错误
     * @version v1.1.0
     */
    microphoneError: boolean,
    /**
     * 摄像头设备列表
     * @version v1.1.0
     */
    cameraList: any[],
    /**
     * 麦克风设备列表
     * @version v1.1.0
     */
    microphoneList: any[],
    /**
     * 扬声器列表
     * @version v1.1.0
     */
    speakerList: any[],
    /**
     * 当前选中的摄像头ID
     * @version v1.1.0
     */
    cameraId: string,
    /**
     * 当前选中的麦克风ID
     * @version v1.1.0
     */
    microphoneId: string,
    /**
     * 当前选中的扬声器ID
     * @version v1.1.0
     */
    speakerId: string,
    /**
     * 当前麦克风的音量
     * @version v1.1.0
     * @deprecated 该回调已在1.1.2废弃，请使用 VolumeContext 中的同名方法
     */
    microphoneLevel: number,
    /**
     * 当前摄像头画面是否镜像
     * @version v1.1.0
     */
    isMirror: boolean,
    /**
     * 设置是否镜像
     * @param isMirror 是否镜像的参数
     * @version v1.1.0
     */
    setMirror: (isMirror: boolean) => void,
    /**
     * 按照预置 初始化摄像头麦克风，打开检测摄像头麦克风
     * @version v1.1.0
     */
    installPretest: (error: DeviceErrorCallback) => () => void,
    /**
     * 开启摄像头
     * @version v1.1.0
     */
    startPretestCamera: () => Promise<void>,
    /**
     * 关闭摄像头
     * @version v1.1.0
     */
    stopPretestCamera: () => void,
    /**
     * 开启麦克风
     * @version v1.1.0
     */
    startPretestMicrophone: (payload: { enableRecording: boolean; }) => Promise<void>,
    /**
     * 关闭麦克风
     * @version v1.1.0
     */
    stopPretestMicrophone: () => void,
    /**
     * 切换摄像头设备
     * @param deviceId 摄像头设备ID
     * @version v1.1.0
     */
    changeTestCamera: (deviceId: string) => Promise<void>,
    /**
     * 切换麦克风设备
     * @param deviceId 麦克风设备ID
     * @version v1.1.0
     */
    changeTestMicrophone: (deviceId: string) => Promise<void>,
    /**
     * 改变麦克风设备的音量
     * @param deviceId 麦克风设备ID
     * @version v1.1.0
     */
    changeTestMicrophoneVolume: (deviceId: string) => Promise<void>,
    /**
     * 改变扬声器设备的音量
     * @param value 扬声器设备ID
     * @version v1.1.0
     */
    changeTestSpeakerVolume: (value: any) => Promise<void>
    /**
     * 预置阶段摄像头渲染器
     * @version v1.1.0
     */
    pretestCameraRenderer: LocalUserRenderer | undefined,
    /**
     * 设备频道通知
     * @version v1.1.2
     */
    pretestNoticeChannel: Subject<any>;
}
export type ScreenShareContext = {
    /**
     * 屏幕分享选择数据
     * @version v1.1.0
     */
    nativeAppWindowItems: any[],
    /**
     * 屏幕共享流
     * @version v1.1.0
     */
    screenShareStream: EduMediaStream,
    /**
     * 屏幕数据流
     * @version v1.1.0
     */
    screenEduStream: EduStream,
    /**
     * 开始或暂停共享屏幕流程
     * @param type 分享类型, 默认为窗口
     * @version v1.1.0
     */
    startOrStopSharing: (type?:ScreenShareType) => Promise<void>
    /**
     * 当前正在共享屏幕
     * @version v1.1.2
     */
    isScreenSharing: boolean
    /**
     * 当前显示的屏幕共享选择器类型
     * @version v1.1.2
     */
    customScreenSharePickerType: ScreenShareType,
    /**
     * 使用指定的窗口/屏幕ID进行分享
     * @param windowId 窗口ID
     * @param type 分享类型, 默认为窗口
     * @version v1.1.2
     */
    startNativeScreenShareBy: (windowId: number, type?: ScreenShareType) => Promise<void>,
    /**
     * 当前是否允许屏幕共享
     * @version v1.1.2
     */
    canSharingScreen: boolean;
}
export type RoomContext = {
    /**
     * 场景类型
     * @version v1.1.0
     */
    sceneType: number,
    /**
     * 销毁房间
     * @version v1.1.0
     */
    destroyRoom: () => Promise<void>,
    /**
     * 加入房间
     * @version v1.1.0
     */
    joinRoom: () => Promise<void>,
    /**
     * 屏幕分享
     * @param windowId 窗口ID
     * @version v1.1.0
     * @deprecated 该方法已在1.1.2废弃，请使用 ScreenShareContext 中的同名方法
     */
    startNativeScreenShareBy: (windowId: number) => Promise<void>,
    /**
     * 关闭屏幕分享展示窗口
     * @version v1.1.0
     */
    removeScreenShareWindow: () => void,
    /**
     * 教师接受举手
     * @param userUuid 举手用户uuid
     * @version v1.1.0
     * @deprecated 该方法已在1.1.2废弃，请使用 HandsUpContext 中的同名方法
     */
    teacherAcceptHandsUp: (userUuid: string) => Promise<void>,
    /**
     * 教师拒绝举手
     * @param userUuid 举手用户uuid
     * @version v1.1.0
     * @deprecated 该方法已在1.1.2废弃，请使用 HandsUpContext 中的同名方法
     */
    teacherRejectHandsUp: (userUuid: string) => Promise<void>,
    /**
     * 举手学生列表
     * @version v1.1.0
     * @deprecated 该方法已在1.1.2废弃，请使用 HandsUpContext 中的同名方法
     */
    handsUpStudentList: any[],
    /**
     * 申请上台的用户总数
     * @version v1.1.0
     * @deprecated 该方法已在1.1.2废弃，请使用 HandsUpContext 中的同名方法
     */
    processUserCount: number,
    /**
     * 房间信息
     * @version v1.1.0
     */
    roomInfo: RoomInfo,
    /**
     * 是否开始上课
     * @version v1.1.0
     */
    isCourseStart: boolean,
    /**
     * 踢人，禁止再次进入教室
     * @param userUuid 用户uuid
     * @param roomUuid 房间uuid
     * @version v1.1.0
     */
    kickOutBan: (userUuid: string, roomUuid: string) => Promise<void>,
    /**
     * 踢人，进移出教室一次
     * @param userUuid 用户uuid
     * @param roomUuid 房间uuid
     * @version v1.1.0
     */
    kickOutOnce: (userUuid: string, roomUuid: string) => Promise<void>,
    /**
     * 课程状态
     * @version v1.1.0
     */
    liveClassStatus: {
        classState: string;
        duration: number;
    },
    /**
     * 禁用视频
     * @param userUuid 用户uuid
     * @param isLocal 是否为本地用户
     * @version v1.1.0
     * @deprecated 该方法已在1.1.2废弃，请使用 StreamListContext 中的同名方法
     */
    muteVideo: (userUuid: string, isLocal: boolean) => Promise<void>,
    /**
     * 取消禁用视频
     * @param userUuid 用户uuid
     * @param isLocal 是否为本地用户
     * @version v1.1.0
     * @deprecated 该方法已在1.1.2废弃，请使用 StreamListContext 中的同名方法
     */
    unmuteVideo: (userUuid: string, isLocal: boolean) => Promise<void>,
    /**
     * 禁用音频
     * @param userUuid 用户uuid
     * @param isLocal 是否为本地用户
     * @version v1.1.0
     * @deprecated 该方法已在1.1.2废弃，请使用 StreamListContext 中的同名方法
     */
    muteAudio: (userUuid: string, isLocal: boolean) => Promise<void>,
    /**
     * 取消禁用音频
     * @param userUuid 用户uuid
     * @param isLocal 是否为本地用户
     * @version v1.1.0
     * @deprecated 该方法已在1.1.2废弃，请使用 StreamListContext 中的同名方法
     */
    unmuteAudio: (userUuid: string, isLocal: boolean) => Promise<void>,
    /**
     * 查询摄像头设备状态
     * @param userList 查询的用户列表
     * @param userUuid 查询目标用户Uuid
     * @param streamUuid 查询目标用户流Uuid
     * @version v1.1.2
     */
    queryCameraDeviceState: (userList: EduUser[], userUuid: string, streamUuid: string) => any;
    /**
     * 查询麦克风设备状态
     * @param userList 查询的用户列表
     * @param userUuid 查询目标用户Uuid
     * @param streamUuid 查询目标用户流Uuid
     * @version v1.1.2
     */
    queryMicrophoneDeviceState: (userList: EduUser[], userUuid: string, streamUuid: string) => any;
    /**
     * 是否正在加载房间
     * @version v1.1.2
     */
    isJoiningRoom: boolean,
    /**
     * 当前房间属性
     * @version v1.1.2
     */
    roomProperties: any
    /**
     * 更新flexProps
     * @version v1.1.2
     */
    updateFlexRoomProperties: (properties: any, cause: any) => Promise<any>;
    /**
     * 获取flexProps
     * @version v1.1.2
     */
    flexRoomProperties: any;
}
export type RoomDiagnosisContext = {
    /**
     * 当前实时网络质量诊断
     * @version v1.1.0
     */
    navigationState: {
        cpuUsage: number;
        isStarted: boolean;
        title: string;
        signalQuality: any;
        networkLatency: number;
        networkQuality: string;
        packetLostRate: number;
        isNative: boolean;
    }
}
export type GlobalContext = {
    /**
     * 正在加载中
     * @version v1.1.0
     * @deprecated v1.1.2废弃, 请使用 RoomContext 的 isJoiningRoom
     */
    loading: boolean,
    /**
     * 是否全屏
     * @version v1.1.0
     */
    isFullScreen: boolean,
    /**
     * 教室初始化参数
     * @version v1.1.0
     */
    params: AppStoreInitParams,
    /**
     * 主路由
     * @version v1.1.0
     */
    mainPath: string | undefined,
    /**
     * 语言
     * @version v1.1.0
     */
    language: LanguageEnum,
    /**
     * 是否已成功加入教室
     * @version v1.1.2
     */
    isJoined: boolean;
    /**
     * 事件序列观察器
     * @version v1.1.2
     */
    sequenceEventObserver: Subject<any>,
    /**
     * toast观察器
     * @version v1.1.0
     */
    toastEventObserver: Subject<any>,
    /**
     * dialog观察器
     * @version v1.1.0
     */
    dialogEventObserver: Subject<any>,
}
export type BoardContext = {
    /**
     * 白板所在的房间
     * @version v1.1.0
     */
    room: Room,
    /**
     * 白板缩放的值
     * @version v1.1.0
     */
    zoomValue: number,
    /**
     * 当前白板的页码
     * @version v1.1.0
     */
    currentPage: number,
    /**
     * 白板总页数
     * @version v1.1.0
     */
    totalPage: number,
    /**
     * 当前画笔颜色
     * @version v1.1.0
     */
    currentColor: string,
    /**
     * 当前画笔宽度
     * @version v1.1.0
     */
    currentStrokeWidth: number,
    /**
     * 是否拥有白板权限
     * @version v1.1.0
     */
    hasPermission: boolean,
    /**
     * 当前白板的选择工具
     * @version v1.1.0
     */
    currentSelector: string,
    /**
     * 画线类工具
     * @version v1.1.0
     */
    lineSelector: string,
    /**
     * 默认激活的工具
     * @version v1.1.0
     * @example 例如默认激活画笔
     * ```
     * {
     *  "pen": true
     * }
     * ```
     */
    activeMap: Record<string, boolean>,
    /**
     * 白板是否就绪
     * @version v1.1.0
     */
    ready: boolean,
    /**
     * 白板的工具列表
     * @version v1.1.0
     */
    tools: any[],
    /**
     * 修改画笔宽度
     * @param value 要修改的值
     * @version v1.1.0
     */
    changeStroke: (value: any) => void,
    /**
     * 修改画笔颜色
     * @param value 颜色#xxxxxx
     * @version v1.1.0
     */
    changeHexColor: (value: any) => void,
    /**
     * 将白板挂载在DOM节点上 或者卸载白板
     * @param dom 被挂载的DOM节点
     * @version v1.1.0
     */
    mountToDOM: (dom: HTMLDivElement | null) => void,
    /**
     * 设置当前工具
     * @param tool 工具名称
     * @version v1.1.0
     */
    setTool: (tool: string) => void,
    /**
     * 设置全屏
     * @param type 设置的值，fullscreen：全屏， fullscreenExit：退出全屏
     * @version v1.1.0
     */
    zoomBoard: (type: string) => void,
    /**
     * 设置放大或者缩小
     * @param operation 操作类型 out：缩小， in：放大
     * @version v1.1.0
     */
    setZoomScale: (operation: string) => void,
    /**
     * 底部菜单跳转到那一页
     * @param itemName 跳转目标 第一页：first_page 最后一页：last_page 下一页：next_page 上一页：prev_page
     * @version v1.1.0
     */
    changeFooterMenu: (itemName: string) => void,
    /**
     * 改变场景
     * @param resourceUuid 资源uuid
     * @version v1.1.0
     */
    changeSceneItem: (resourceUuid: string) => void,
    /**
     * 更新画笔
     * @param value 画笔名称 pen square circle line
     * @version v1.1.0
     */
    updatePen: (value: any) => void,
    /**
     * 当前白板使用的工具是否为画笔
     * @version v1.1.0
     */
    boardPenIsActive: boolean,
    /**
     * 切换屏幕共享状态
     * @version v1.1.0
     * @deprecated v1.1.2弃用, 请使用ScreenShareContext中的同名方法
     */
    startOrStopSharing: () => Promise<void>,
    /**
     * 设置当前工具为激光笔
     * @version v1.1.0
     */
    setLaserPoint: () => void,
    /**
     * 安装白板工具
     * @param tools 白板工具列表 
     * @version v1.1.0
     */
    installTools: (tools: any[]) => void,
    /**
     * 取消白板授权
     * @param userUuid 用户uuid
     * @version v1.1.0
     */
    revokeBoardPermission: (userUuid: string) => Promise<void>,
    /**
     * 授予白板权限
     * @param userUuid 用户uuid
     * @version v1.1.0
     */
    grantBoardPermission: (userUuid: string) => Promise<void>,
    /**
     * 当前激活的scene名称
     * @version v1.1.0
     */
    activeSceneName: string,
    /**
     * 当前是否显示白板工具栏/zoom工具栏
     * @version v1.1.2
     */
    showBoardTool: [boolean, boolean];
    /**
     * 当前白板scenePath是否为屏幕共享的scenePath
     * @version v1.1.2
     */
    isCurrentScenePathScreenShare: boolean;
    /**
     * 可下载的云盘资源列表
     * @version v1.1.0
     * @deprecated 废弃, 请使用CloudDriverContext同名方法
     */
    downloadList: StorageCourseWareItem[],
    /**
     * 打开课件资源
     * @param uuid 资源uuid
     * @version v1.1.0
     * @deprecated 废弃, 请使用CloudDriverContext同名方法
     */
    openCloudResource: (uuid: string) => Promise<void>,
    /**
     * 下载课件资源
     * @param taskUuid 课件taskUuid
     * @version v1.1.0
     * @deprecated 废弃, 请使用CloudDriverContext同名方法
     */
    startDownload: (taskUuid: string) => Promise<void>,
    /**
     * 删除课件资源
     * @param taskUuid 课件taskUuid
     * @version v1.1.0
     * @deprecated 废弃, 请使用CloudDriverContext同名方法
     */
    deleteSingle: (taskUuid: string) => Promise<void>,
    /**
     * 云盘个人资源列表
     * @version v1.1.0
     * @deprecated 废弃, 请使用CloudDriverContext同名方法
     */
    personalResources: MaterialDataResource[],
    /**
     * 云盘公共资源列表
     * @version v1.1.0
     * @deprecated 废弃, 请使用CloudDriverContext同名方法
     */
    publicResources: MaterialDataResource[],
    /**
     * 所有云盘课件资源列表
     * @version v1.1.0
     * @deprecated 废弃, 请使用CloudDriverContext同名方法
     */
    resourcesList: Resource[],
    /**
     * 更新云盘资源列表
     * @version v1.1.0
     * @deprecated 废弃, 请使用CloudDriverContext同名方法
     */
    refreshCloudResources: () => Promise<void>,
    /**
     * 移除云盘课件资源
     * @param resourceUuids 课件资源uuid
     * @version v1.1.0
     * @deprecated 废弃, 请使用CloudDriverContext同名方法
     */
    removeMaterialList: (resourceUuids: string[]) => Promise<void>,
    /**
     * 取消上传
     * @version v1.1.0
     * @deprecated 废弃, 请使用CloudDriverContext同名方法
     */
    cancelUpload: () => Promise<void>,
    /**
     * 关闭课件资源
     * @param resourceUuid 资源uuid
     * @version v1.1.0
     * @deprecated 废弃, 请使用CloudDriverContext同名方法
     */
    closeMaterial: (resourceUuid: string) => void,
    /**
     * 上传云盘课件资源
     * @param payload 上传的资源参数
     * @version v1.1.0
     * @deprecated 废弃, 请使用CloudDriverContext同名方法
     */
    doUpload: (payload: any) => Promise<void>,
    /**
     * 课件列表
     * @version v1.1.0
     * @deprecated 废弃
     */
    courseWareList: any[],
}

export type StreamContext = {
    /**
     * 媒体数据流列表
     * @version v1.1.0
     * @deprecated 已废弃, 请使用StreamListContext中的streamList
     */
    streamList: EduStream[]
}

export type UserListContext = {
    /**
     * 当前用户的uuid
     * @version v1.1.0
     * @deprecated 弃用, 请使用UserListContext中的localUserInfo
     */
    localUserUuid: string,
    /**
     * 当前用户的角色
     * @version v1.1.0
     * @deprecated 弃用, 请使用UserListContext中的localUserInfo
     */
    myRole: "teacher" | "assistant" | "student" | "invisible",
    /**
     * 当前课堂内点名册上的用户列表（只有学生）
     * @version v1.1.0
     */
    rosterUserList: any[],
    /**
     * 当前课堂的老师名称
     * @version v1.1.0
     * @deprecated 弃用, 请使用UserListContext中的teacherInfo
     */
    teacherName: string,
    /**
     * 老师同意用户的举手 
     * @param userUuid 用户uid
     * @version v1.1.0
     * @deprecated 弃用, 请使用HandsUpContext中的同名函数
     */
    teacherAcceptHandsUp: (userUuid: string) => Promise<void>,
    /**
     * 当前课堂内的所有用户列表
     * @version v1.1.0
     */
    userList: EduUser[],
    /**
     * 同意举手的用户列表
     * @version v1.1.0
     */
    acceptedUserList: any
    /**
     * 当前用户信息
     * @version v1.1.2
     */
    localUserInfo: EduUser,
    /**
     * 当前教室老师信息
     * @version v1.1.2
     */
    teacherInfo?: EduUser,
    /**
     * 切换白板权限
     * @param userUuid 用户uuid
     * @param whiteboardGranted 给与/不给与权限
     * @version v1.1.2
     */
    toggleWhiteboardPermission: (userUuid:string, whiteboardGranted: boolean) => Promise<any>,
    /**
     * 切换视频开关
     * @param userUuid 用户uuid
     * @param enabled 打开/关闭
     * @version v1.1.2
     */
    toggleCamera: (userUuid:string, enabled: boolean) => Promise<any>,
    /**
     * 切换音频开关
     * @param userUuid 用户uuid
     * @param enabled 打开/关闭
     * @version v1.1.2
     */
    toggleMic: (userUuid:string, enabled: boolean) => Promise<any>,
    /**
     * 踢人
     * @param userUuid 用户uuid
     * @version v1.1.2
     */
    kick: (userUuid:string) => Promise<any>,
    /**
     * 可用的人员控制工具
     * @version v1.1.2
     */
    controlTools: ControlTool[],
    /**
     * 是否为房主
     * @version v1.1.2
     */
    isHost: boolean
}

export type RecordingContext = {
    /**
     * 是否正在录制
     * @version v1.1.0
     */
    isRecording: boolean,
    /**
     * 开始录制
     * @version v1.1.0
     */
    startRecording: () => Promise<void>,
    /**
     * 停止录制
     * @version v1.1.0
     */
    stopRecording: () => Promise<void>,
}
export type HandsUpContext = {
    /**
     * 老师的uuid
     * @version v1.1.0
     */
    teacherUuid: string,
    /**
     * 学生的举手状态
     * @version v1.1.0
     */
    handsUpState: "forbidden" | "actived" | "default",
    /**
     * 老师的举手状态
     * @version v1.1.0
     */
    teacherHandsUpState: "actived" | "default",
    /**
     * 学生举手
     * @param teacherUuid 老师的uuid
     * @version v1.1.0
     */
    studentHandsUp: (teacherUuid: string) => Promise<void>,
    /**
     * 学生取消举手
     * @version v1.1.0
     */
    studentCancelHandsUp: () => Promise<void>,
    /**
     * 学生举手列表
     * @version v1.1.0
     */
    handsUpStudentList: {
        userUuid: string;
        userName: string;
        coVideo: boolean;
    }[],
    /**
     * 已上台用户列表
     * @version v1.1.0
     */
    coVideoUsers: any,
    /**
     * 已上台用户总数
     * @version v1.1.0
     */
    onlineUserCount: number,
    /**
     * 申请上台的用户总数
     * @version v1.1.0
     */
    processUserCount: number,
    /**
     * 老师同样用户的举手
     * @param userUuid 用户uuid
     * @version v1.1.0
     */
    teacherAcceptHandsUp: (userUuid: string) => Promise<void>,
    /**
     * 老师拒绝用户的举手
     * @param userUuid 用户uuid
     * @version v1.1.0
     */
    teacherRejectHandsUp: (userUuid: string) => Promise<void>,
    /**
     * 老师使指定用户下麦
     * @param userUuid 用户uid
     * @version v1.1.2
     */
    teacherRevokeCoVideo: (userUuid: string) => Promise<void>,
    /**
     * 学生主动下麦
     * @version v1.1.2
     */
    studentExitCoVideo: () => Promise<void>,
}
export type VideoControlContext = {
    /**
     * 老师的媒体数据流
     * @version v1.1.0
     * @deprecated 已弃用, 请使用StreamListContext中的同名方法
     */
    teacherStream: any,
    /**
     * 第一个学生的媒体数据流
     * @version v1.1.0
     * @deprecated 已弃用, 请使用StreamListContext中的studentStreams
     */
    firstStudent: EduMediaStream,
    /**
     * 学生的媒体数据流列
     * @version v1.1.0
     * @deprecated 已弃用, 请使用StreamListContext中的studentStreams
     */
    studentStreams: EduMediaStream[],
    /**
     * 点击摄像头切换开关状态
     * @param userUuid 用户uuid
     * @version v1.1.0
     */
    onCameraClick: (userUuid: any) => Promise<void>,
    /**
     * 点击麦克风切换开关状态
     * @param userUuid 用户uuid
     * @version v1.1.0
     */
    onMicClick: (userUuid: any) => Promise<void>,
    /**
     * 奖励用户星星
     * @param uid 用户uuid
     * @version v1.1.0
     */
    onSendStar: (uid: any) => Promise<void>,
    /**
     * 点击白板切换授权开关状
     * @param userUuid 用户uuid
     * @version v1.1.0
     */
    onWhiteboardClick: (userUuid: any) => Promise<void>,
    /**
     * 点击取消上台（仅主持人可用）
     * @param userUuid 用户uuid
     * @version v1.1.0
     */
    onOffPodiumClick: (userUuid: any) => Promise<void>,
    /**
     * 场景摄像头配置
     * @version v1.1.0
     * @deprecated 已弃用, 请使用UserListContext的controlTools以及isHost替代
     */
    sceneVideoConfig: {
        hideOffPodium: boolean;
        hideOffAllPodium: boolean;
        isHost: boolean;
        hideBoardGranted: boolean;
    },
    /**
     * 是否为主持人
     * @version v1.1.0
     * @deprecated 已弃用, 请使用UserListContext的controlTools以及isHost替代
     */
    isHost: boolean,
    /**
     * 击所有人下台（仅主持人可用）
     * @version v1.1.0
     */
    onOffAllPodiumClick: () => Promise<void>,
    /**
     * 是否有上台用户
     * @version v1.1.0
     */
    canHoverHideOffAllPodium: boolean
}
export type SmallClassVideoControlContext = {
    /**
     * 老师的媒体数据流, 注意这与StreamListContext的teacherStream不同
     * @version v1.1.0
     */
    teacherStream: any,
    /**
     * 第一个学生的媒体数据流
     * @version v1.1.0
     * @deprecated 已废弃，请使用SmallClassVideoControlContext的studentStreams替代
     */
    firstStudent: EduMediaStream,
    /**
     * 学生的媒体数据流列, 注意这与StreamListContext的studentStreams不同
     * @version v1.1.0
     */
    studentStreams: EduMediaStream[],
    /**
     * 点击摄像头切换开关状态
     * @param userUuid 用户uid
     * @version v1.1.0
     */
    onCameraClick: (userUuid: any) => Promise<void>,
    /**
     * 点击麦克风切换开关状态
     * @param userUuid 用户uid
     * @version v1.1.0
     */
    onMicClick: (userUuid: any) => Promise<void>,
    /**
     * 奖励用户星星
     * @param uid 用户uid
     * @version v1.1.0
     */
    onSendStar: (uid: any) => Promise<void>,
    /**
     * 点击白板切换授权开关状态
     * @param userUuid 用户uid
     * @version v1.1.0
     */
    onWhiteboardClick: (userUuid: any) => Promise<void>,
    /**
     * 点击取消上台（仅主持人可用）
     * @param userUuid 用户uuid
     * @version v1.1.0
     */
    onOffPodiumClick: (userUuid: any) => Promise<void>,
    /**
     * 场景摄像头配置
     * @version v1.1.0
     * @deprecated 已弃用, 请使用UserListContext的controlTools以及isHost替代
     */
    sceneVideoConfig: {
        hideOffPodium: boolean;
        hideOffAllPodium: boolean;
        isHost: boolean;
        hideBoardGranted: boolean;
    },
}
export type PrivateChatContext = {
    /**
     * 开启私聊
     * @param toUuid 对方uid
     * @version v1.1.0
     */
    onStartPrivateChat: (toUuid: string) => Promise<void>,
    /**
     * 关闭私聊
     * @param toUuid 对方uid
     * @version v1.1.0
     */
    onStopPrivateChat: (toUuid: string) => Promise<void>,
    /**
     * 房间内是否存在私聊
     * @version v1.1.0
     */
    hasPrivateConversation: boolean,
    /**
     * 当前用户是否处于私聊
     * @version v1.1.0
     */
    inPrivateConversation: boolean
}
export type MediaContext = {
    /**
     * 是否为客户端应用
     * @version v1.1.0
     */
    isNative: boolean,
    /**
     * CPU使用情况
     * @version v1.1.0
     */
    cpuUsage: number,
    /**
     * 网络质量
     * @version v1.1.0
     */
    networkQuality: string,
    /**
     * 网络延迟毫秒数
     * @version v1.1.0
     */
    networkLatency: number,
    /**
     * 网络丢包率百分比
     * @version v1.1.0
     */
    packetLostRate:   number,
    /**
     * 摄像头设备列表
     * @version v1.1.0
     */
    cameraList: any[],
    /**
     * 麦克风设备列表
     * @version v1.1.0
     */
    microphoneList: any[],
    /**
     * 扬声器设备列表
     * @version v1.1.0
     */
    speakerList: any[],
    /**
     * 当前选中的摄像头ID
     * @version v1.1.0
     */
    cameraId: string,
    /**
     * 当前选中的麦克风ID 
     * @version v1.1.0
     */
    microphoneId: string,
    /**
     * 当前选中的扬声器ID
     * @version v1.1.0
     */
    speakerId: string,
    /**
     * 预置阶段摄像头渲染器
     * @version v1.1.0
     */
    cameraRenderer: LocalUserRenderer | undefined,
    /**
     * 切换媒体设备（摄像头、麦克风、扬声器）
     * @param deviceType 设备类型：camera microphone speaker
     * @param value 改变的值
     * @version v1.1.0
     */
    changeDevice: (deviceType: string, value: any) => Promise<void>,
    /**
     * 改变音量（麦克风、扬声器)
     * @param deviceType 设备类型 microphone speaker
     * @param value 改变的值
     * @version v1.1.0
     */
    changeAudioVolume: (deviceType: string, value: any) => Promise<void>,
    /**
     * 切换摄像头
     * @version v1.1.2
     */
    changeCamera: (deviceId: string) => Promise<void>
    /**
     * 切换麦克风
     * @version v1.1.2
     */
    changeMicrophone: (deviceId: string) => Promise<void>
    /**
     * 设置扬声器设备音量，仅electron
     * @version v1.1.2
     */
    changeSpeakerVolume: (v: number) => Promise<void>
    /**
     * 设置麦克风设备音量，仅electron
     * @version v1.1.2
     */
    changeMicrophoneVolume: (v: number) => Promise<void>
}

export type ReportContext = {
    eduManger: any
}

export type CloudDriveContext = {
    /**
     * 可下载的云盘资源列表
     * @version v1.1.2
     */
    downloadList: StorageCourseWareItem[],
    /**
     * 打开课件资源
     * @param uuid 资源uuid
     * @version v1.1.2
     */
    openCloudResource: (uuid: string) => Promise<void>,
    /**
     * 下载课件资源
     * @param taskUuid 课件taskUuid
     * @version v1.1.2
     */
    startDownload: (taskUuid: string) => Promise<void>,
    /**
     * 删除课件资源
     * @param taskUuid 课件taskUuid
     * @version v1.1.2
     */
    deleteSingle: (taskUuid: string) => Promise<void>,
    /**
     * 云盘个人资源列表
     * @version v1.1.2
     */
    personalResources: MaterialDataResource[],
    /**
     * 云盘公共资源列表
     * @version v1.1.2
     */
    publicResources: MaterialDataResource[],
    /**
     * 所有云盘课件资源列表
     * @version v1.1.2
     */
    resourcesList: Resource[],
    /**
     * 更新云盘资源列表
     * @version v1.1.2
     */
    refreshCloudResources: () => Promise<void>,
    /**
     * 移除云盘课件资源
     * @param resourceUuids 课件资源uuid
     * @version v1.1.2
     */
    removeMaterialList: (resourceUuids: string[]) => Promise<void>,
    /**
     * 取消上传
     * @version v1.1.2
     */
    cancelUpload: () => Promise<void>,
    /**
     * 关闭课件资源
     * @param resourceUuid 资源uuid
     * @version v1.1.2
     */
    closeMaterial: (resourceUuid: string) => void,
    /**
     * 上传云盘课件资源
     * @param payload 上传的资源参数
     * @version v1.1.2
     */
    doUpload: (payload: any) => Promise<void>,
}