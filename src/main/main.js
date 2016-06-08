const electron = require('electron');
const Positioner = require('electron-positioner')
const {app, dialog, Tray, BrowserWindow, Menu} = electron;
const ipc = electron.ipcMain;
const appRoot = require('app-root-path');


// Global reference to the app tray icon
let trayIcon;

// Global reference to the app main window
let mainWindow;

// Global reference to the window positioner
let positioner;

function toggleWindow() {
  if (!mainWindow) {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 453, height: 250, frame: false, skipTaskbar: true, hasShadow: false, resizable: false, alwaysOnTop: true});
    positioner = new Positioner(mainWindow);
    positioner.move('bottomRight');

    // and load the index.html of the app.
    mainWindow.loadURL(appRoot + '/views/main-window.html');

    mainWindow.on('closed', function() {
      mainWindow = null;
    });

    //mainWindow.webContents.openDevTools();

  } else {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  }
}

function launchApp() {
  toggleWindow();
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Quitter', 'click': app.quit}
  ]);  
  trayIcon = new Tray(appRoot + '/images/tray-icon.png');
  trayIcon.setToolTip('Click to configure your server');
  trayIcon.setContextMenu(contextMenu);
  trayIcon.on('click', trayIconClicked);
}

function trayIconClicked(event, bounds) {
  positioner.move('trayBottomCenter', bounds);
  toggleWindow();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', launchApp);

app.on('activate', function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    toggleWindow();
  }
});

ipc.on('open-directory-dialog', function(e) {
  const window = BrowserWindow.fromWebContents(e.sender);
  dialog.showOpenDialog(window, {
    properties: ['openDirectory']
  }, selectedDirectories => e.sender.send('directories-selected', selectedDirectories));
});
