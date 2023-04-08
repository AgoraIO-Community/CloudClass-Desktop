/**
 * 此类事件从教室发出，在Widget中监听
 */
/** @en
 * Events that come from SDK toward widget
 */
export enum AgoraExtensionRoomEvent {
  /** 白板 */
  // 设置白板工具
  BoardSelectTool = 'board-select-tool',
  // 添加一页白板
  BoardAddPage = 'board-add-page',
  // 删除一页白板
  BoardRemovePage = 'board-remove-page',
  // 设置白板页面
  BoardGotoPage = 'board-goto-page',
  // 撤销
  BoardUndo = 'board-undo',
  // 重做
  BoardRedo = 'board-redo',
  // 清空白板
  BoardClean = 'board-clean',
  // 放置一张图片到白板上
  BoardPutImageResource = 'board-put-image-resource',
  // 放置一张图片到指定白板窗口
  BoardPutImageResourceIntoWindow = 'board-put-image-resource-into-window',
  // 打开文档类课件
  BoardOpenMaterialResourceWindow = 'board-open-material-resource-window',
  // 打开多媒体文件
  BoardOpenMediaResourceWindow = 'board-open-media-resource-window',
  // 打开一个Web窗口
  BoardOpenH5ResourceWindow = 'board-open-h5-resource-window',
  // 设置白板图形工具
  BoardDrawShape = 'board-draw-shape',
  // 授予白板权限
  BoardGrantPrivilege = 'board-grant-privilege',
  // 设置白板笔迹宽度
  BoardChangeStrokeWidth = 'board-change-stroke-width',
  // 设置白板笔迹颜色
  BoardChangeStrokeColor = 'board-change-stroke-color',
  // 保存白板笔迹
  BoardSaveAttributes = 'board-save-attributes',
  // 加在白板笔迹
  BoardLoadAttributes = 'board-load-attributes',
  // 获取白板快照图片
  BoardGetSnapshotImageList = 'board-get-snapshot-image-list',
  // 设置白板操作延时
  BoardSetDelay = 'board-set-delay',
  // 设置课件动画渲染参数
  BoardSetAnimationOptions = 'board-set-animation-options',
  // 开关白板
  ToggleBoard = 'toggle-board',
  // 打开 Webview
  OpenWebview = 'open-webview',
  // 打开流媒体播放器
  OpenStreamMediaPlayer = 'open-stream-media-player',
  // 返回授权用户列表
  ResponseGrantedList = 'response-granted-list',
  // 横竖屏切换
  OrientationStatesChanged = 'orientation-changed',
  // 移动端大班课横屏清屏状态变化
  MobileLandscapeToolBarVisibleChanged = 'mobile-landscape-tool-bar-visible-changed',
}

/**
 * 此事件从Widget发出，在教室内监听
 */
/** @en
 * Events that come from widget toward SDK
 */
export enum AgoraExtensionWidgetEvent {
  /** 白板 */
  // 连接状态变更
  BoardConnStateChanged = 'board-connection-state-changed',
  // 挂载状态变更
  BoardMountStateChanged = 'board-mount-state-changed',
  // 房间属性变更
  BoardMemberStateChanged = 'board-member-state-changed',
  // 页码属性变更
  BoardPageInfoChanged = 'board-page-info-changed',
  // 重做步数变更
  BoardRedoStepsChanged = 'board-redo-steps-changed',
  // 撤销步数变更
  BoardUndoStepsChanged = 'board-undo-steps-changed',
  // 授权用户变更
  BoardGrantedUsersUpdated = 'board-granted-users-updated',
  // 收到白板截图
  BoardSnapshotImageReceived = 'board-snapshot-image-received',
  // 白板文件拖入事件
  BoardDragOver = 'board-drag-over',
  // 白板文件放入事件
  BoardDrop = 'board-drop',
  // Widget 即将打开
  WidgetBecomeActive = 'widget-become-active',
  // Widget 即将关闭
  WidgetBecomeInactive = 'widget-become-inactive',
  // 向工具栏注册工具
  RegisterCabinetTool = 'register-cabinet-tool',
  // 向工具栏反注册工具
  UnregisterCabinetTool = 'unregister-cabinet-tool',
  // 请求授权用户列表
  RequestGrantedList = 'request-granted-list',
  //请求当前横竖屏状态
  RequestOrientationStates = 'request-orientation',
  //取消强制横屏
  QuitForceLandscape = 'quit-force-landscape',
  //唤起单例Toast
  AddSingletonToast = 'add-singleton-toast',
  //投票器激活状态变更
  PollActiveStateChanged = 'poll-active-state-changed',
  //请求当前横屏清屏状态
  RequestMobileLandscapeToolBarVisible = 'request-mobile-landscape-tool-bar-visible',
}
