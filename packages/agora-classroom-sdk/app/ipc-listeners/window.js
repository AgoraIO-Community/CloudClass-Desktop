const electron = require('electron');
const { mainWindow, startUrl } = require('../main');
const IPCDelegate = require('./base');

const { URLSearchParams } = require('url');

const windowMap = {};

function createBrowserWindow(queryStr, options) {
  const display =
    electron.screen.getAllDisplays()[options.openAtScreenIndex] ||
    electron.screen.getPrimaryDisplay();

  const offsetX = (display.workAreaSize.width - options.width) / 2;
  const offsetY = (display.workAreaSize.height - options.height) / 2;
  const x = display.bounds.x + offsetX;
  const y = display.bounds.y + offsetY;

  electron.app.allowRendererProcessReuse = true;

  const window = new electron.BrowserWindow({
    x: options.x ?? x,
    y: options.y ?? y,
    width: options.width,
    height: options.height,
    backgroundColor: options.backgroundColor,
    transparent: options.transparent ?? false,
    alwaysOnTop: options.alwaysOnTop ?? false,
    frame: options.frame ?? true,
    resizable: options.resizable ?? true,
    fullscreen: options.fullscreen ?? false, // Whether the window should show in fullscreen. When explicitly set to false the fullscreen button will be hidden or disabled on macOS. Default is false.
    show: options.show ?? true,
    hasShadow: options.hasShadow ?? true,
    focusable: options.focusable ?? true,
    // useContentSize: options.useContentSize ?? false,
    // center: options.center ?? true,
    webPreferences: {
      autoplayPolicy: 'no-user-gesture-required',
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      webviewTag: true,
      enableRemoteModule: true,
      nativeWindowOpen: true,
      backgroundThrottling: false,
    },
  });
  window.loadURL(`${startUrl}?${queryStr}`).finally(() => {
    electron.app.allowRendererProcessReuse = false;
  });

  return window;
}

function getWindow(id) {
  return windowMap[id];
}

function addListeners() {
  const delegate = new IPCDelegate();

  delegate.on('open-browser-window', (event, windowID, args, options, language) => {
    const window = getWindow(windowID);

    if (!window) {
      const params = new URLSearchParams({ id: windowID, language });
      if (args) {
        params.append('args', args);
      }
      windowMap[windowID] = createBrowserWindow(params.toString(), options);

      windowMap[windowID].on('closed', () => {
        delete windowMap[windowID];
      });
    } else {
      console.log(`window with ID [${windowID}] exists`);
    }
  });

  delegate.on('show-browser-window', (event, windowID) => {
    const window = getWindow(windowID);
    if (window) {
      window.show();
    } else {
      console.log(`window with ID [${windowID}] not exist`);
    }
  });

  delegate.on('hide-browser-window', (event, windowID) => {
    const window = getWindow(windowID);
    if (window) {
      window.hide();
    } else {
      console.log(`window with ID [${windowID}] not exist`);
    }
  });

  delegate.on('close-browser-window', (event, windowID) => {
    const window = getWindow(windowID);

    if (window) {
      window.close();
    } else {
      console.log(`window with ID [${windowID}] not exist`);
    }
  });

  delegate.on('browser-window-message', (event, payload) => {
    const { channel, to = 'main', args } = payload;
    const from =
      Object.keys(windowMap).find((winKey) => windowMap[winKey].webContents === event.sender) ||
      'main';
    let toWindow = windowMap[to];

    if (to === 'main') {
      toWindow = mainWindow.current;
    }

    if (toWindow) {
      console.log(
        `send [${channel}] message from [${from}] to [${to}] with arguments ${JSON.stringify(
          args,
        )}`,
      );
      toWindow.webContents.send(channel, args);
    } else {
      console.log(`IPC call failed, cannot find window with id [${to}]`);
    }
  });

  delegate.on('update-browser-window', (event, windowID, bounds) => {
    const window = getWindow(windowID);
    if (window) {
      const { x, y, width, height } = bounds;
      const passIn = {};
      if (x) {
        passIn.x = x;
      }
      if (y) {
        passIn.y = y;
      }
      if (width) {
        passIn.width = width;
      }
      if (height) {
        passIn.height = height;
      }
      window.setBounds(passIn);
      console.log(`set window [${windowID}] bounds to`, bounds);
    } else {
      console.log(`window with ID [${windowID}] not exist`);
    }
  });
  delegate.on('move-window-to-target-screen', (event, windowID, screenId, options) => {
    const window = getWindow(windowID);
    if (window) {
      const display =
        electron.screen.getAllDisplays().find((i) => i.id === screenId) ||
        electron.screen.getPrimaryDisplay();

      const offsetX = (display.workAreaSize.width - options.width) / 2;
      const offsetY = (display.workAreaSize.height - options.height) / 2;
      const x = options.x ?? display.bounds.x + offsetX;
      const y = options.y ?? display.bounds.y;
      window.setBounds({ x: parseInt(x), y: parseInt(y) });

      console.log(`set window [${windowID}] bounds to screen`, screenId);
    } else {
      console.log(`window with ID [${windowID}] not exist`);
    }
  });

  mainWindow.current.on('closed', () => {
    Object.keys(windowMap).forEach((k) => {
      windowMap[k].close();
    });
  });
}

electron.app.on('ready', () => {
  addListeners();
});
