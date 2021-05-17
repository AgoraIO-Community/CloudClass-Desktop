import { UserRenderer, LocalUserRenderer, EduUser, EduStream } from 'agora-rte-sdk'
import { AnimationMode, ApplianceNames, MemberState, Room, SceneDefinition, ViewMode } from 'white-web-sdk';
import { AppStoreInitParams, LanguageEnum, RoomInfo } from '../api/declare'
import { BehaviorSubject } from 'rxjs';
import { StorageCourseWareItem } from "../types"
import { MaterialDataResource } from "../services/upload-service"
import { ScreenShareType } from 'agora-rte-sdk/lib/core/media-service/interfaces';
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
    holderState: 'loading' | 'muted' | 'broken'
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
export type ChatContext = {
    /**
     * 发送私聊聊天消息
     */
    sendMessageToConversation: (message: any, userUuid: string) => void;
    /**
     * 会话列表
     */
    conversationList: any[];
    /**
     * 拉取会话列表
     */
    getConversationList: (data: any) => Promise<any>;
    /**
     * 拉取会话历史列表
     */
    getConversationHistoryChatMessage: (data: any) => Promise<any>;
    /**
     * 添加私聊聊天消息
     */
    addConversationChatMessage: (args: any, conversation: any) => void;
    /**
     * 是否为主持人
     */
    isHost: boolean,
    /**
     * 获取消息列表
     *  @param {
     *    nextId,
     *    sord
     * }
     * @param name 名称
     */
    getHistoryChatMessage: (data: {
        nextId: string;
        sort: number;
    })=>Promise<any>,
    /**
     * 消息列表
     */
    messageList: any[],
    /**
     * 发送消息
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
     */
    muteChat: () => void,
    /**
     * 禁止聊天
     */
    unmuteChat: () => void,
    /**
     * @param chatCollapse 是否折叠
     * ui使用，不应该提供
     */
    chatCollapse: boolean,
    /**
     * 切换最小化最大化聊天
     */
    toggleChatMinimize: () => void,
    /**
     * 未读取消息数量
     */
    unreadMessageCount: number,
    /**
     * 是否可以聊天
     */
    canChatting: boolean,
    /**
     * 添加消息
     */
    addChatMessage: (args: any) => void
}
export type StreamListContext = {
    /**
     * 全部媒体数据流列表
     */
    streamList: EduStream[],
    /**
     * 教师媒体数据流
     */
    teacherStream: any,
    /**
     * 学生媒体数据流列表
     */
    studentStreams: EduMediaStream[],
    /**
     * 当前上台的学生媒体数据流列表
     */
    onPodiumStudentStreams: EduMediaStream[],
    /**
     * 禁用音频
     * @param userUuid 用户id
     * @param isLocal 是否为本地用户
     */
    muteAudio: (userUuid: string, isLocal: boolean) => void,
    /**
     * 取消禁用音频
     * @param userUuid 用户id
     * @param isLocal 是否为本地用户
     */
    unmuteAudio: (userUuid: string, isLocal: boolean) => void,
    /**
     * 禁用视频
     * @param userUuid 用户id
     * @param isLocal 是否为本地用户
     */
    muteVideo: (userUuid: string, isLocal: boolean) => void,
    /**
     * 取消禁用视频
     * @param userUuid 用户id
     * @param isLocal 是否为本地用户
     */
    unmuteVideo: (userUuid: string, isLocal: boolean) => void,
    /**
     * 取消白板权限
     * @param userUuid 用户id
     */
    revokeUserPermission: (userUuid: string) => void,
    /**
     * 当前用户的媒体数据流
     */
    localStream: EduStream,
    /**
     * 授予白板权限
     * @param userUuid 用户id
     */
    grantUserPermission: (userUuid: string) => void,
}
export type PretestContext = {
    /**
     * 摄像头是否错误
     */
    cameraError: boolean,
    /**
     * 麦克风是否错误
     */
    microphoneError: boolean,
    /**
     * 摄像头设备列
     */
    cameraList: any[],
    /**
     * 麦克风设备列表
     */
    microphoneList: any[],
    /**
     * 扬声器列表
     */
    speakerList: any[],
    /**
     * 当前选中的摄像头ID
     */
    cameraId: string,
    /**
     * 当前选中的麦克风ID
     */
    microphoneId: string,
    /**
     * 当前选中的扬声器ID
     */
    speakerId: string,
    /**
     * 当前麦克风设备音量
     */
    microphoneLevel: number,
    /**
     * 当前摄像头画面是否镜
     */
    isMirror: boolean,
    /**
     * 设置是否镜像
     * @param isMirror 是否镜像的参数
     */
    setMirror: (isMirror: boolean) => void,
    /**
     * 按照预置 初始化摄像头麦克风，打开检测摄像头麦克风
     */
    installPretest: () => () => void,
    /**
     * 开启摄像头
     */
    startPretestCamera: () => Promise<void>,
    /**
     * 关闭摄像头
     */
    stopPretestCamera: () => void,
    /**
     * 开启麦克风
     */
    startPretestMicrophone: (payload: { enableRecording: boolean; }) => Promise<void>,
    /**
     * 关闭麦克风
     */
    stopPretestMicrophone: () => void,
    /**
     * 切换摄像头设备
     * @param deviceId 摄像头设备ID
     */
    changeTestCamera: (deviceId: string) => Promise<void>,
    /**
     * 切换麦克风设备
     * @param deviceId 麦克风设备ID
     */
    changeTestMicrophone: (deviceId: string) => Promise<void>,
    /**
     * 改变麦克风设备的音量
     * @param deviceId 麦克风设备ID
     */
    changeTestMicrophoneVolume: (deviceId: string) => Promise<void>,
    /**
     * 改变扬声器设备的音量
     * @param value 扬声器设备ID
     */
    changeTestSpeakerVolume: (value: any) => Promise<void>
    /**
     * 预置阶段摄像头渲染器
     */
    pretestCameraRenderer: LocalUserRenderer | undefined,
}
export type ScreenShareContext = {
    /**
     * 屏幕分享选择数据
     */
    nativeAppWindowItems: any[],
    /**
     * 屏幕共享流
     */
    screenShareStream: EduMediaStream,
    /**
     * 屏幕数据流
     */
    screenEduStream: EduStream,
    /**
     * 开始或者暂停共享屏幕
     */
    startOrStopSharing: (type?:ScreenShareType) => Promise<void>
    // /**
    //  * 正在屏幕共享
    //  */
    // isShareScreen: boolean;
    // /**
    //  * 正在共享白板
    //  */
    // isBoardScreenShare: boolean;
    /**
     * 当前正在共享屏幕
     */
    isScreenSharing: boolean
    /**
     * 当前显示的屏幕共享选择器类型
     */
    customScreenSharePickerType: ScreenShareType,
    /**
     * 屏幕分享
     * @param windowId 窗口ID
     */
    startNativeScreenShareBy: (windowId: number, type?: ScreenShareType) => Promise<void>,
}
export type RoomContext = {
    /**
     * 场景类型
     */
    sceneType: number,
    /**
     * 销毁房间
     */
    destroyRoom: () => Promise<void>,
    /**
     * 加入房间
     */
    joinRoom: () => Promise<void>,
    /**
     * 移除对话框
     * @param id 对话框ID
     */
    removeDialog: (id: string) => void,
    // TO-REVIEW REMOVED in v1.1.1
    // /**
    //  * 屏幕分享
    //  * @param windowId 窗口ID
    //  */
    // startNativeScreenShareBy: (windowId: number) => Promise<void>,
    /**
     * 关闭屏幕分享展示窗口
     */
     removeScreenShareWindow: () => void,
    /**
     * 教师接受举手
     * @param userUuid 举手用户uuid
     */
    teacherAcceptHandsUp: (userUuid: string) => Promise<void>,
    /**
     * 教师拒绝举手
     * @param userUuid 举手用户uuid
     */
    teacherRejectHandsUp: (userUuid: string) => Promise<void>,
    /**
     * 举手学生列表
     */
    handsUpStudentList: any[],
    /**
     * 打开使用用户总数
     */
    processUserCount: number,
    /**
     * 房间信息
     */
    roomInfo: RoomInfo,
    /**
     * 是否开始上课
     */
    isCourseStart: boolean,
    /**
     * 踢人，禁止再次进入教室
     * @param userUuid 用户uuid
     * @param roomUuid 房间uuid
     */
    kickOutBan: (userUuid: string, roomUuid: string) => Promise<void>,
    /**
     * 踢人，进移出教室一次
     * @param userUuid 用户uuid
     * @param roomUuid 房间uuid
     */
    kickOutOnce: (userUuid: string, roomUuid: string) => Promise<void>,
    /**
     * 课程状态
     */
    liveClassStatus: {
        classState: string;
        duration: number;
    },
    /**
     * 禁用视频
     * @param userUuid 用户uuid
     * @param isLocal 是否为本地用户
     */
    muteVideo: (userUuid: string, isLocal: boolean) => Promise<void>,
    /**
     * 取消禁用视频
     * @param userUuid 用户uuid
     * @param isLocal 是否为本地用户
     */
    unmuteVideo: (userUuid: string, isLocal: boolean) => Promise<void>,
    /**
     * 禁用音频
     * @param userUuid 用户uuid
     * @param isLocal 是否为本地用户
     */
    muteAudio: (userUuid: string, isLocal: boolean) => Promise<void>,
    /**
     * 取消禁用音频
     * @param userUuid 用户uuid
     * @param isLocal 是否为本地用户
     */
    unmuteAudio: (userUuid: string, isLocal: boolean) => Promise<void>,
    /**
     * 单个用户禁言
     */
    muteUserChat: (userUuid: string) => Promise<any>;
    /**
     * 取消单个用户禁言
     */
    unmuteUserChat: (userUuid: string) => Promise<any>;
}
export type RoomDiagnosisContext = {
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
     */
    loading: boolean,
    /**
     * 是否全屏
     */
    isFullScreen: boolean,
    /**
     * 向dialogQueue中新增一个dialog数据
     * @param component 对话框组件
     * @param this.props 对话框组件的props
     */
    addDialog: (component: any, props?: any) => any,
    /**
     * 移除dialogQueue中的一个dialog数据
     * @param id 对话框的ID
     */
    removeDialog: (id: string) => void,
    /**
     * BehaviorSubject实例化的对象 toastEventObserver
     * 参考：rxjs文档 地址 https://cn.rx.js.org/class/es6/BehaviorSubject.js~BehaviorSubject.html
     *  toastEventObserver.subscribe((evt)=>{
     *   //观察者订阅的事件 evt   事件名称：evt.eventname
     *   })
     */
    toast$: BehaviorSubject<any>,
    /**
     * 触发toastEventObserver订阅的事件
     * @param eventName 事件名称
     * @param props 事件的参数
     */
    fireToast: (eventName: string, props?: any) => void,
    /**
     * 向toastQueue中新增一个toast数据
     * @param desc toast内容
     * @param type toast类型
     */
    addToast: (desc: string, type?: "success" | "error" | "warning" | undefined) => string,
    /**
     * 是否选中
     */
    checked: boolean,
    /**
     * appStore的参数
     */
    params: AppStoreInitParams,
    /**
     * 对话框的数据队列
     */
    dialogQueue: DialogType[],
    /**
     * 移出toastQueue中的一个toast数据
     * @param id toast的ID
     */
    removeToast: (id: string) => string,
    /**
     * toast的数据队列
     */
    toastQueue: ToastType[],
    /**
     * 设置是否选中
     * @param v 设置参数
     */
    updateChecked: (v: boolean) => void,
    /**
     * 主路由
     */
    mainPath: string | undefined,
    /**
     * 语言
     */
    language: LanguageEnum,
    /**
     * BehaviorSubject实例化的对象 toastEventObserver
     * 参考：rxjs文档 地址 https://cn.rx.js.org/class/es6/BehaviorSubject.js~BehaviorSubject.html
     *  toastEventObserver.subscribe((evt)=>{
     *   //观察者订阅的事件 evt   事件名称：evt.eventname
     *   })
     */
    toastEventObserver: BehaviorSubject<any>,
    /**
     * BehaviorSubject实例化的对象 dialogEventObserver
     * 参考：rxjs文档 地址 https://cn.rx.js.org/class/es6/BehaviorSubject.js~BehaviorSubject.html
     *  dialogEventObserver.subscribe((evt)=>{
     *   //观察者订阅的事件 evt   事件名称：evt.eventname
     *   })
     */
    dialogEventObserver: BehaviorSubject<any>,
    /** 触发dialogEventObserver订阅的事件
     * @param eventName 事件名称
     * @param props 事件的参数
     */
    fireDialog: (eventName: string, props?: any) => void,
    /**
     * 已经加入房间
     */
    joined: boolean;
}
export type BoardContext = {
    /**
     * 白板所在的房间
     */
    room: Room,
    /**
     * 白板缩放的值
     */
    zoomValue: number,
    /**
     * 当前白板的页码
     */
    currentPage: number,
    /**
     * 白板总页数
     */
    totalPage: number,
    /**
     * 课件列表
     */
    courseWareList: any[],
    /**
     * 当前画笔颜色
     */
    currentColor: string,
    /**
     * 当前画笔宽度
     */
    currentStrokeWidth: number,
    /**
     * 是否拥有白板权限
     */
    hasPermission: boolean,
    /**
     * 当钱白板的选择工具
     */
    currentSelector: string,
    /**
     * 画线类工具
     */
    lineSelector: string,
    /**
     * 默认激活的工具
     * 例如默认激活画笔
     * ```
     * {
     *  "pen": true
     * }
     * ```
     */
    activeMap: Record<string, boolean>,
    /**
     * 白板是否只读
     */
    ready: boolean,
    /**
     * 白板的工具列表
     */
    tools: any[],
    /**
     * 修改画笔宽度
     * @param value 要修改的值
     */
    changeStroke: (value: any) => void,
    /**
     * 修改画笔颜色
     * @param value 颜色#xxxxxx
     */
    changeHexColor: (value: any) => void,
    /**
     * 将白板挂载在DOM节点上 或者卸载白板
     * @param dom 被挂载的DOM节点
     */
    mountToDOM: (dom: HTMLDivElement | null) => void,
    /**
     * 设置当前工具
     * @param tool 工具名称
     */
    setTool: (tool: string) => void,
    /**
     * 设置全屏
     * @param type 设置的值，fullscreen：全屏， fullscreenExit：退出全屏
     */
    zoomBoard: (type: string) => void,
    /**
     * 设置放大或者缩小
     * @param operation 操作类型 out：缩小， in：放大
     */
    setZoomScale: (operation: string) => void,
    /**
     * 底部菜单跳转到那一页
     * @param itemName 跳转目标 第一页：first_page 最后一页：last_page 下一页：next_page 上一页：prev_page
     */
    changeFooterMenu: (itemName: string) => void,
    /**
     * 改变场景
     * @param resourceUuid 资源uuid
     */
    changeSceneItem: (resourceUuid: string) => void,
    /**
     * 可下载的云盘资源列表 
     */
    downloadList: StorageCourseWareItem[],
    /**
     * 打开课件资源
     * @param uuid 资源uuid
     */
    openCloudResource: (uuid: string) => Promise<void>,
    /**
     * 下载课件资源
     * @param taskUuid 课件taskUuid
     */
    startDownload: (taskUuid: string) => Promise<void>,
    /**
     * 删除课件资源
     * @param taskUuid 课件taskUuid
     */
    deleteSingle: (taskUuid: string) => Promise<void>,
    /**
     * 更新画笔
     * @param value 画笔名称 pen square circle line
     */
    updatePen: (value: any) => void,
    /**
     * 当前白板使用的工具是否为画笔
     */
    boardPenIsActive: boolean,
    // /**
    //  * 切换屏幕共享状态
    //  */
    // startOrStopSharing: () => Promise<void>,
    /**
     * 设置当前工具为激光笔
     */
    setLaserPoint: () => void,
    /**
     * 所有云盘课件资源列
     */
    resourcesList: Resource[],
    /**
     * 活跃场景名称
     */
    activeSceneName: string,
    /**
     * 更新云盘资源列表
     */
    refreshCloudResources: () => Promise<void>,
    /**
     * 移除云盘课件资源
     * @param resourceUuids 课件资源uuid
     */
    removeMaterialList: (resourceUuids: string[]) => Promise<void>,
    /**
     * 取消上传
     */
    cancelUpload: () => Promise<void>,
    /**
     * 关闭课件资源
     * @param resourceUuid 资源uuid
     */
    closeMaterial: (resourceUuid: string) => void,
    /**
     * 安装白板工具
     * @param tools 白板工具列表 
     */
    installTools: (tools: any[]) => void,
    /**
     * 云盘个人资源列表
     */
    personalResources: MaterialDataResource[],
    /**
     * 云盘公共资源列表
     */
    publicResources: MaterialDataResource[],
    /**
     * 取消白板授权
     * @param userUuid 用户uuid
     */
    revokeBoardPermission: (userUuid: string) => Promise<void>,
    /**
     * 授予白板权限
     * @param userUuid 用户uuid
     */
    grantBoardPermission: (userUuid: string) => Promise<void>,
    /**
     * 上传云盘课件资源
     * @param payload 上传的资源参数
     */
    doUpload: (payload: any) => Promise<void>,

    //v1.1.1
    //@internal
    canSharingScreen: boolean;
    //@internal
    showBoardTool: [boolean, boolean];
    //@internal
    isCurrentScenePathScreenShare: boolean;
}
export type StreamContext = {
    /**
     * 媒体数据流列表
     */
    streamList: EduStream[]
}
export type UserListContext = {
    /**
     * 当前用户的uuid
     */
    localUserUuid: string,
    /**
     * 当前用户的角色
     */
    myRole: "teacher" | "assistant" | "student" | "invisible",
    /**
     * 当前课堂内点名册上的用户列表（只有学生）
     */
    rosterUserList: any[],
    /**
     * 当前课堂的老师名称
     */
    teacherName: string,
    /**
     * 对用户的点击事件如上台、授权白板、打开摄像头麦克风
     * @param actionType 动作类型 
     * 上台：podium 
     * 白板授权：whiteboard 
     * 打开摄像头：camera 
     * 打开麦克风：mic 
     * 踢人：kick-out
     * @param uid 用户的uid
     */
    handleRosterClick: (actionType: string, uid: string) => Promise<void>,
    /**
     * 关闭指定用户的摄像头
     * @param userUuid 用户uid
     */
    revokeCoVideo: (userUuid: string) => Promise<void>,
    /**
     * 老师同意用户的举手 
     * @param userUuid 用户uid
     */
    teacherAcceptHandsUp: (userUuid: string) => Promise<void>,
    /**
     * 当前课堂内的所有用户列表
     */
    userList: EduUser[],
    /**
     * 同意举手的用户列表
     */
    acceptedUserList: any
}
export type RecordingContext = {
    /**
     * 是否正在录制
     */
    isRecording: boolean,
    /**
     * 开始录制
     */
    startRecording: () => Promise<void>,
    /**
     * 停止录制
     */
    stopRecording: () => Promise<void>,
}
export type HandsUpContext = {
    /**
     * 老师的uuid
     */
    teacherUuid: string,
    /**
     * 学生的举手状态
     */
    handsUpState: "forbidden" | "actived" | "default",
    /**
     * 老师的举手状态
     */
    teacherHandsUpState: "actived" | "default",
    /**
     * 学生举手
     * @param teacherUuid 老师的uuid
     */
    studentHandsUp: (teacherUuid: string) => Promise<void>,
    /**
     * 学生取消举手
     */
    studentCancelHandsUp: () => Promise<void>,
    /**
     * 学生举手列表
     */
    handsUpStudentList: {
        userUuid: string;
        userName: string;
        coVideo: boolean;
    }[],
    /**
     * 使用用户列表
     */
    coVideoUsers: any,
    /**
     * 在线用户总数（不包含观众）
     */
    onlineUserCount: number,
    /**
     * 打开视频的用户总数
     */
    processUserCount: number,
    /**
     * 老师同样用户的举手
     * @param userUuid 用户uuid
     */
    teacherAcceptHandsUp: (userUuid: string) => Promise<void>,
    /**
     * 老师拒绝用户的举手
     * @param userUuid 用户uuid
     */
    teacherRejectHandsUp: (userUuid: string) => Promise<void>,
}
export type VideoControlContext = {
    /**
     * 老师的媒体数据流
     */
    teacherStream: any,
    /**
     * 第一个学生的媒体数据流
     */
    firstStudent: EduMediaStream,
    /**
     * 学生的媒体数据流列
     */
    studentStreams: EduMediaStream[],
    /**
     * 点击摄像头切换开关状态
     * @param userUuid 用户uuid
     */
    onCameraClick: (userUuid: any) => Promise<void>,
    /**
     * 点击麦克风切换开关状态
     * @param userUuid 用户uuid
     */
    onMicClick: (userUuid: any) => Promise<void>,
    /**
     * 奖励用户星星
     * @param uid 用户uuid
     */
    onSendStar: (uid: any) => Promise<void>,
    /**
     * 点击白板切换授权开关状
     * @param userUuid 用户uuid
     */
    onWhiteboardClick: (userUuid: any) => Promise<void>,
    /**
     * 点击取消上台（仅主持人可用）
     * @param userUuid 用户uuid
     */
    onOffPodiumClick: (userUuid: any) => Promise<void>,
    /**
     * 场景摄像头配置
     */
    sceneVideoConfig: {
        hideOffPodium: boolean;
        hideOffAllPodium: boolean;
        isHost: boolean;
        hideBoardGranted: boolean;
    },
    /**
     * 是否为主持人
     */
    isHost: boolean,
    /**
     * 击所有人下台（仅主持人可用）
     */
    onOffAllPodiumClick: () => Promise<void>,
    /**
     * 是否有上台用户
     */
    canHoverHideOffAllPodium: boolean
}
export type SmallClassVideoControlContext = {
    /**
     * 老师的媒体数据流
     */
    teacherStream: any,
    /**
     * 第一个学生的媒体数据流
     */
    firstStudent: EduMediaStream,
    /**
     * 学生的媒体数据流列
     */
    studentStreams: EduMediaStream[],
    /**
     * 点击摄像头切换开关状态
     * @param userUuid 用户uid
     */
    onCameraClick: (userUuid: any) => Promise<void>,
    /**
     * 点击麦克风切换开关状态
     * @param userUuid 用户uid
     */
    onMicClick: (userUuid: any) => Promise<void>,
    /**
     * 奖励用户星星
     * @param uid 用户uid
     */
    onSendStar: (uid: any) => Promise<void>,
    /**
     * 点击白板切换授权开关状态
     * @param userUuid 用户uid
     */
    onWhiteboardClick: (userUuid: any) => Promise<void>,
    /**
     * 点击取消上台（仅主持人可用）
     * @param userUuid 用户uuid
     */
    onOffPodiumClick: (userUuid: any) => Promise<void>,
    /**
     * 场景摄像头配置
     */
    sceneVideoConfig: {
        hideOffPodium: boolean;
        hideOffAllPodium: boolean;
        isHost: boolean;
        hideBoardGranted: boolean;
    },
    // videoStreamList,
}
export type PrivateChatContext = {
    /**
     * 开启私聊
     * @param toUuid 对方uid
     */
    onStartPrivateChat: (toUuid: string) => Promise<void>,
    /**
     * 关闭私聊
     * @param toUuid 对方uid
     */
    onStopPrivateChat: (toUuid: string) => Promise<void>,
    /**
     * 房间内是否存在私聊
     */
    hasPrivateConversation: boolean,
    /**
     * 当前用户是否处于私聊
     */
    inPrivateConversation: boolean
}
export type MediaContext = {
    /**
     * 是否为客户端应用
     */
    isNative: boolean,
    /**
     * CPU使用情况
     */
    cpuUsage: number,
    /**
     * 网络质量
     */
    networkQuality: string,
    /**
     * 网络延迟毫秒数
     */
    networkLatency: number,
    /**
     * 网络丢包率百分比
     */
    packetLostRate:   number,
    /**
     * 摄像头设备列表
     */
    cameraList: any[],
    /**
     * 麦克风设备列表
     */
    microphoneList: any[],
    /**
     * 扬声器设备列表
     */
    speakerList: any[],
    /**
     * 当前选中的摄像头ID
     */
    cameraId: string,
    /**
     * 当前选中的麦克风ID 
     */
    microphoneId: string,
    /**
     * 当前选中的扬声器ID
     */
    speakerId: string,
    /**
     * 预置阶段摄像头渲染器
     */
    cameraRenderer: LocalUserRenderer | undefined,
    /**
     * 当前麦克风设备音量
     */
    microphoneLevel: number,
    /**
     * 切换媒体设备（摄像头、麦克风、扬声器）
     * @param deviceType 设备类型：camera microphone speaker
     * @param value 改变的值
     */
    changeDevice: (deviceType: string, value: any) => Promise<void>,
    /**
     * 改变音量（麦克风、扬声器)
     * @param deviceType 设备类型 microphone speaker
     * @param value 改变的值
     */
    changeAudioVolume: (deviceType: string, value: any) => Promise<void>,
    /**
     * 关闭对话框
     * @param id 对话框id
     */
    removeDialog: (id: string) => void
}