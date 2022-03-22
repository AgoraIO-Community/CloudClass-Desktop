// 聊天消息
export const messageAction = (data, options) => {
  return { type: 'SAVE_ROOM_MESSAGE', data, options };
};

// 选中的Tab
export const selectTabAction = (data, options) => {
  return { type: 'SELECT_TAB_ACTION', data, options };
};
// 红点提示
export const showRedNotification = (data) => {
  return { type: 'SHOW_RED_NOTIFICSTION', data };
};
