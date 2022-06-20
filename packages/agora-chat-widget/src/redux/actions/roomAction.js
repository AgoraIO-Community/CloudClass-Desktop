// 聊天室详情
export const roomInfo = (data) => {
  return { type: 'ROOM_INFO', data };
};
// 聊天室成员
export const roomUsers = (data, option) => {
  return { type: 'ROOM_USERS', data, option };
};

// 成员数
export const roomUserCount = (data) => {
  return { type: 'ROOM_USERS_COUNT', data };
};

// 聊天室成员属性
export const roomUsersInfo = (data) => {
  return { type: 'ROOM_USERS_INFO', data };
};
// 聊天室公告
export const roomAnnouncement = (data) => {
  return { type: 'ROOM_ANNOUNCEMENT', data };
};
// 聊天室全局禁言
export const roomAllMute = (data) => {
  return { type: 'ROOM_ALL_MUTE', data };
};
// 聊天室单人禁言
export const roomUserMute = (data) => {
  return { type: 'ROOM_USER_MUTE', data };
};
// 判断当前是否被禁言
export const isUserMute = (data) => {
  return { type: 'IS_USER_MUTE', data };
};
// 聊天室公告状态
export const announcementStatus = (data) => {
  return { type: 'ANNOUNCEMENT_STATUS', data };
};
// 聊天室公告更新通知
export const announcementNotice = (data) => {
  return { type: 'ANNOUNCEMENT_NOTICE', data };
};
// 设置 UI 配置
export const setVisibleUI = (data) => ({ type: 'SET_VISIBLE_UI', data });
// 切换提问状态
export const setQuestioinStateAction = (data) => {
  return { type: 'SET_QUESTION_STATE', data };
};
