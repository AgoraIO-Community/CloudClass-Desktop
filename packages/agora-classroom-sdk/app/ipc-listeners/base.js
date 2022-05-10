const electron = require('electron');
const { ipcMain } = electron;

class IPCDelegate {
  on(channel, callback) {
    ipcMain.on(channel, async (event, replyEventName, ...args) => {
      console.log(`receive [${channel}] message with arguments ${JSON.stringify(args)}`);
      const resp = {
        code: 0,
        message: 'success',
      };
      try {
        const rv = await callback(event, ...args);
        resp.data = rv;
      } catch (e) {
        resp.code = 1;
        resp.message = e.message;
      }
      if (replyEventName) {
        console.log(`reply to channel ${replyEventName}, with response ${JSON.stringify(resp)}`);
        event.sender.send(replyEventName, resp);
      }
    });
  }
}

module.exports = IPCDelegate;
