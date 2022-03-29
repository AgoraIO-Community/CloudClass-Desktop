import WebIM from '../utils/WebIM';
import { messageAction } from '../redux/actions/messageAction';
import { HISTORY_COUNT } from '../contants';
import _ from 'lodash';

export class ChatHistoryAPI {
  store = null;
  constructor(store, messageAPI) {
    this.store = store;
    this.messageAPI = messageAPI;
  }

  getHistoryMessages = (roomId) => {
    var options = {
      queue: roomId,
      isGroup: true,
      count: HISTORY_COUNT,
      success: (res) => {
        const historyMsg = _.reverse(res);
        let deleteMsgId = [];
        historyMsg.map((val, key) => {
          const {
            ext: { msgId },
          } = val;
          const { action, id } = val;
          if (action == 'DEL') {
            deleteMsgId.push(msgId);
            this.store.dispatch(messageAction(val, { showNotice: false, isHistory: true }));
          } else if (deleteMsgId.includes(id)) {
            return;
          } else {
            const newMessage = this.messageAPI.convertCustomMessage(val);
            this.store.dispatch(messageAction(newMessage, { showNotice: false, isHistory: true }));
          }
        });
      },
      fail: (err) => {
        // stop = true;
        console.log('漫游失败', err);
      },
    };
    WebIM.conn.fetchHistoryMessages(options);
  };
}
