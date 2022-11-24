/**
 * 教室事件
 * 此类事件从教室发出，在Widget中监听
 */
export enum AgoraExtensionRoomEvent {
  /** 白板 */
  BoardSelectTool = 'board-select-tool',
  BoardAddPage = 'board-add-page',
  BoardRemovePage = 'board-remove-page',
  BoardGotoPage = 'board-goto-page',
  BoardUndo = 'board-undo',
  BoardRedo = 'board-redo',
  BoardClean = 'board-clean',
  BoardPutImageResource = 'board-put-image-resource',
  BoardPutImageResourceIntoWindow = 'board-put-image-resource-into-window',
  BoardOpenMaterialResourceWindow = 'board-open-material-resource-window',
  BoardOpenMediaResourceWindow = 'board-open-media-resource-window',
  BoardOpenH5ResourceWindow = 'board-open-h5-resource-window',
  BoardDrawShape = 'board-draw-shape',
  BoardGrantPrivilege = 'board-grant-privilege',
  BoardChangeStrokeWidth = 'board-change-stroke-width',
  BoardChangeStrokeColor = 'board-change-stroke-color',
  BoardSaveAttributes = 'board-save-attributes',
  BoardLoadAttributes = 'board-load-attributes',
  BoardGetSnapshotImageList = 'board-get-snapshot-image-list',
  BoardSetDelay = 'board-set-delay',
  // 开关白板
  ToggleBoard = 'toggle-board',
  // 打开 Webview
  OpenWebview = 'open-webview',
  // 打开流媒体播放器
  OpenStreamMediaPlayer = 'open-stream-media-player',
  // 返回授权用户列表
  ResponseGrantedList = 'response-granted-list',
}

/**
 * Widget事件
 * 此事件从Widget发出，在教室内监听
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
}
