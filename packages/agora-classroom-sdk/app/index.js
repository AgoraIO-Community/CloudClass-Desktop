const electron = require('electron');
const { createMainWindow, mainWindow } = require('./main');

// Module to control application life.
const { app } = electron;
// using nodejs v8 flags to profiler memory
// app.commandLine.appendSwitch('js-flags', '--expose_gc --trace_gc_verbose --log-gc');

app.allowRendererProcessReuse = false;
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createMainWindow);

app.whenReady().then(() => {
  // more details: https://www.electronjs.org/docs/tutorial/keyboard-shortcuts
  electron.globalShortcut.register('Control+Shift+X', () => {
    // Open the DevTools.
    const currentWindow = electron.BrowserWindow.getFocusedWindow();
    currentWindow.webContents.openDevTools();
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') {
  app.quit();
  // }
});

app.on('activate', function () {
  console.log('main process activate');
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow.current === null) {
    createMainWindow();
  }

  if (mainWindow.current) {
    mainWindow.current.show();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

require('./ipc-listeners');
