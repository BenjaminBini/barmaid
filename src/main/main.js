'use strict';

const electron = require('electron');
const {app, dialog, ipcMain, Tray, BrowserWindow, Menu} = electron;
const appRoot = require('app-root-path');
const ServersManager = require('./servers-manager');
const path = require('path');

let windows = [];
let trayIcon = null;
let contextMenu = null;
let serversManager = new ServersManager();

function startApp() {
  if (app.dock) {
    app.dock.setIcon(path.join(__dirname, '../../assets/icons/tray-icon.png'));
    app.dock.hide();
  }
  trayIcon = new Tray(path.join(appRoot.toString(), '/assets/icons/tray-icon.png'));
  trayIcon.setPressedImage(path.join(appRoot.toString(), '/assets/icons/tray-icon-active.png'));

  updateMenu();
  trayIcon.on('click', () => trayIcon.popUpContextMenu(contextMenu));

}

function updateMenu() {
  const activeServers = serversManager.servers.filter(s => s.isActive === true);
  const stoppedServers = serversManager.servers.filter(s => s.isActive === false);
  let menuTemplate = 
  [
    {
      label: 'Add a server',
      click: openAddServerDialog,
    }, {
      type: 'separator'
    }, {
      label: 'Enabled servers',
      enabled: false
    }
  ];
  for (let server of activeServers) {
    menuTemplate.push({
      label: server.path,
      sublabel: server.port,
      submenu: getServerSubMenu(server)
    });
  }
  menuTemplate.push({
    type: 'separator'
  });
  menuTemplate.push({
    label: 'Stopped servers',
    enabled: false
  });
  for (let server of stoppedServers) {
    menuTemplate.push({
      label: server.path,
      sublabel: server.port,
      submenu: getServerSubMenu(server)
    });
  }
  menuTemplate.push({
    type: 'separator'
  });
  menuTemplate.push({
    label: 'Quit',
    role: 'quit'
  });

  contextMenu = Menu.buildFromTemplate(menuTemplate); 
  trayIcon.setContextMenu(contextMenu);
}

function getServerSubMenu(server) {
  let serverSubMenuTemplate = [
    {
      label: server.isActive ? 'Running on port ' + server.port : 'Will run on port ' + server.port,
      enabled: false
    },
    {
      label: server.isActive ? 'Stop the server' : 'Start the server',
      click: server.isActive ? () => stopServer(server) : () => startServer(server)
    }, {
      label: 'Delete the server',
      click: () => removeServer(server)
    }
  ];
  return Menu.buildFromTemplate(serverSubMenuTemplate);
}

function stopServer(server) {
  server.stop();
  updateMenu();
}

function startServer(server) {
  server.start();
  updateMenu();
}

function removeServer(server) {
  serversManager.removeServer(server);
  updateMenu();
}

function openAddServerDialog() {
  let addServerWindow = new BrowserWindow({
    title: 'Add a server', 
    width: 250, 
    height: 330, 
    resizable: false, 
    autoHideMenuBar: true, 
    icon: path.join(__dirname, '/assets/icons/tray-icon.png')
  });
  addServerWindow.loadURL('file:' + appRoot.toString() + '/views/add-server.html');
  addServerWindow.focus();
}

app.on('window-all-closed', e => {
  e.preventDefault();
});

app.on('ready', startApp);

ipcMain.on('add-server', (event, arg) => {
  try {
    serversManager.addServer(arg);
    updateMenu();
    event.sender.send('server-added');
  } catch (exception) {
    console.log(exception);
    event.sender.send('server-not-added', {message: exception.message, icon: path.join(appRoot.toString(), '/assets/icons/tray-icon@4x.png')});
  }
});
