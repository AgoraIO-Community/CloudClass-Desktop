// 灵动课堂获取到的数据
export const propsAction = (data) => {
  return { type: 'SAVE_PROPS_ACTION', data };
};
// 控制聊天Chat 显/隐
export const isShowChat = (data) => {
  return { type: 'IS_SHOW_CHAT', data };
};
export const isShowMiniIcon = (data) => {
  return { type: 'MINI_ICON_STATUE', data };
};

export const setAPIs = (data) => {
  return { type: 'SET_APIS', data };
};

// token config
export const setAgoraTokenConfig = data => {
  return { type: 'SET_AGORATOKEN_CONFIG', data };
}
