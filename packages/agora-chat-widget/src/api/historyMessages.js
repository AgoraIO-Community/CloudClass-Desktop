import WebIM from "../utils/WebIM";
import store from '../redux/store'
import { roomMessages, qaMessages, moreHistory, loadGif } from '../redux/aciton'
import { HISTORY_COUNT } from '../components/MessageBox/constants'
import { getQAReadMsg } from './qaReadMsg'
import _ from 'lodash'

let deleteMsgId = [];           // 被删除消息数组
let reconnectHistoryMsgs = [];  // 重连拉取消息数组
export const getHistoryMessages = async (roomId, reconnectMsgId, isReconnect) => {
    let stop = false;
    const publicRoomId = store.getState().extData.chatroomId;
    const privateRoomId = store.getState().extData.privateChatRoom.chatRoomId;
    if (publicRoomId === roomId) {
        store.dispatch(loadGif(true))
    }
    var options = {
        queue: roomId,
        isGroup: true,
        count: HISTORY_COUNT,
        start: isReconnect ? '' : reconnectMsgId,
        success: function (res) {
            store.dispatch(loadGif(false))
            if (publicRoomId === roomId && res.length < HISTORY_COUNT) {
                store.dispatch(moreHistory(false))
            }
            if (privateRoomId === roomId && res.length < HISTORY_COUNT) {
                stop = true;
            }
            const historyMsg = _.reverse(res)
            historyMsg.map((val, key) => {
                const { ext: { msgtype, asker, msgId } } = val
                const { time, action, id, to } = val
                if (to === publicRoomId) {
                    // 是否为重连拉取消息
                    if (isReconnect) {
                        // 拉取消息到store中的ID
                        if (reconnectMsgId === id) {
                            stop = true;
                            return
                        }
                        if (action == "DEL") {
                            deleteMsgId.push(msgId)
                            reconnectHistoryMsgs.push(val)
                        } else if (deleteMsgId.includes(id)) {
                            return
                        } else {
                            reconnectHistoryMsgs.push(val)
                        }
                    } else {
                        if (action == "DEL") {
                            deleteMsgId.push(msgId)
                            store.dispatch(roomMessages(val, { showNotice: false, isHistory: true }))
                        } else if (deleteMsgId.includes(id)) {
                            return
                        } else {
                            store.dispatch(roomMessages(val, { showNotice: false, isHistory: true }))
                        }
                    }
                } else if (to === privateRoomId) {
                    let readMsgId = getQAReadMsg()[asker] || 0;
                    if (readMsgId < id) {
                        store.dispatch(qaMessages(val, asker, { showNotice: true, isHistory: true, unRead: true }, time))
                    } else {
                        store.dispatch(qaMessages(val, asker, { showNotice: false, isHistory: true, unRead: false }, time))
                    }
                }
            })
        },
        fail: function (err) {
            stop = true;
            console.log('漫游失败', err);
        }
    }
    if (privateRoomId === roomId) {
        while (!stop) {
            await WebIM.conn.fetchHistoryMessages(options)
        }
    } else if (isReconnect && publicRoomId === roomId) {
        while (!stop) {
            await WebIM.conn.fetchHistoryMessages(options)
        }
    } else {
        await WebIM.conn.fetchHistoryMessages(options)
    }
    if (isReconnect) {
        // 遍历结束后，将所有重连拉到的记录，添加到store
        const newMessages = _.reverse(reconnectHistoryMsgs)
        store.dispatch(roomMessages(newMessages, { showNotice: false, isHistory: true, isRejoin: true }))
    }
}