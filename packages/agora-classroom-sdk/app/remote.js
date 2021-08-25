const { ipcRenderer: ipc } = require('electron');

const remote = {
    getAppPath: (type) => {
        return new Promise((resolve, _) => {
            ipc.once('GET_APP_PATH_RES', (e, path) => {
                resolve(path)
            })
            ipc.send('GET_APP_PATH_REQ', type)
        })
    }
}

module.exports = {
    remote
}