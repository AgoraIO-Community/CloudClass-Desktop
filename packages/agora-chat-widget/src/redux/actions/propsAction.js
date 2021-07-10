
// 灵动课堂获取到的数据
export const propsAction = (data) => {
    return { type: 'SAVE_PROPS_ACTION', data }
}
// 控制聊天Chat 显/隐
export const isShowChat = (data) => {
    return { type: 'IS_SHOW_CHAT', data }
}
// 控制窗口最小化，消息提示
export const isShowChatRed = (data) => {
    return { type: 'IS_SHOW_CHAT_RED', data }
}