const electron = require('electron');
const { mainWindow } = require('../main');
const ShortcutCapture = require('electron-screenshots');
const IPCDelegate = require('./base');

function addScreenShotListeners() {
  let screenShot = new IPCDelegate();
  let shortcutCapture = new ShortcutCapture.default();
  let isCapturing = false,
    module = '';

  let stopScreen = () => {
    mainWindow.current.show();
    isCapturing = false;
  };

  shortcutCapture.on('ok', (e, { dataURL, viewer }) => {
    mainWindow.current.webContents.send('short-cut-capture', {
      type: 'ShortCutCaptureDone',
      payload: {
        dataURL,
        viewer,
        module,
      },
    });
    stopScreen();
  });

  shortcutCapture.on('finish', (e, { dataURL, viewer }) => {
    mainWindow.current.webContents.send('short-cut-capture', {
      type: 'ShortCutCaptureDone',
      payload: {
        dataURL,
        viewer,
        module,
      },
    });
    stopScreen();
  });

  shortcutCapture.on('cancel', (e) => {
    stopScreen();
  });

  shortcutCapture.on('save', (e) => {
    stopScreen();
  });

  const showScreenShot = (event) => {
    if (shortcutCapture) {
      shortcutCapture.startCapture();
    }
  };

  screenShot.on('short-cut-capture', (event, payload) => {

    
    if (payload.hideWindow) {
      const permission = electron.systemPreferences.getMediaAccessStatus('screen') 
      if (permission !== 'granted') {
       // send denied
        mainWindow.current.webContents.send('short-cut-capture', {
          type: 'ShortCutCaptureDenied',
          payload: {},
        });
        return
      }
    }

    if (!isCapturing) {
      isCapturing = true;
      let hideWindow = false;
      hideWindow = payload.hideWindow;
      module = payload.module;

      hideWindow && mainWindow.current.hide();
      if (!shortcutCapture) {
        shortcutCapture = new ShortcutCapture.default();
      }
      showScreenShot(event);
    }
  });
}

electron.app.on('ready', () => {
  addScreenShotListeners();
});
