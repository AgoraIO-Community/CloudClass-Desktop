import WebIM from "../utils/WebIM";
import store from '../redux/store'
import { roomMessages, qaMessages, moreHistory, loadGif } from '../redux/aciton'
import { HISTORY_COUNT } from '../components/MessageBox/constants'
import { getQAReadMsg } from './qaReadMsg'
import _ from 'lodash'

export const getHistoryMessages = async (isQA) => {
    let stop = false;
    let counts = HISTORY_COUNT;
    store.dispatch(loadGif(true))
    const roomId = store.getState().extData.chatroomId;
    var options = {
        queue: roomId,
        isGroup: true,
        count: HISTORY_COUNT,
        success: function (res) {
            if (res.length < HISTORY_COUNT) {
                store.dispatch(moreHistory(false))
                stop = true;
            }
            const historyMsg = _.reverse(res)
            let deleteMsgId = [];
            historyMsg.map((val, key) => {
                const { ext: { msgtype, asker, msgId } } = val
                const { time, action, id } = val
                if (msgtype === 0) {
                    counts--;
                    if (action == "DEL") {
                        deleteMsgId.push(msgId)
                        store.dispatch(roomMessages(val, { showNotice: false, isHistory: true }))
                    } else if (deleteMsgId.includes(id)) {
                        return
                    } else {
                        store.dispatch(roomMessages(val, { showNotice: false, isHistory: true }))
                    }
                } else if ([1, 2].includes(msgtype)) {
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
    if (!isQA) {
        while (counts > 0 && !stop) {
            await WebIM.conn.fetchHistoryMessages(options)
        }
    } else {
        await WebIM.conn.fetchHistoryMessages(options)
    }
    store.dispatch(loadGif(false))
}