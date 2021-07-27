import WebIM from "../utils/WebIM";
import store from '../redux/store'
import { messageAction } from '../redux/actions/messageAction'
import { HISTORY_COUNT } from '../contants'
import _ from 'lodash'

export const getHistoryMessages = (roomId) => {
    var options = {
        queue: roomId,
        isGroup: true,
        count: HISTORY_COUNT,
        success: function (res) {
            const historyMsg = _.reverse(res)
            let deleteMsgId = [];
            historyMsg.map((val, key) => {
                const { ext: { msgId } } = val
                const { action, id } = val
                if (action == "DEL") {
                    deleteMsgId.push(msgId)
                    store.dispatch(messageAction(val, { showNotice: false, isHistory: true }))
                } else if (deleteMsgId.includes(id)) {
                    return
                } else {
                    store.dispatch(messageAction(val, { showNotice: false, isHistory: true }))
                }
            })
        },
        fail: function (err) {
            stop = true;
            console.log('漫游失败', err);
        }
    }
    WebIM.conn.fetchHistoryMessages(options)
}