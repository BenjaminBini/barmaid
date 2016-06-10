'use strict';

const electron = require('electron');
const Positioner = require('electron-positioner');
const {app, dialog, ipcMain, Tray, BrowserWindow, Menu} = electron;
const appRoot = require('app-root-path');
const ServersManager = require('./servers-manager');
const path = require('path');

let windows = [];
let trayIcon = null;
let contextMenu = null;
let serversManager = new ServersManager();

function startApp() {
  trayIcon = new Tray(path.join(appRoot.toString(), '/assets/icons/tray-icon.png'));
  /*
  serversManager.addServer({
    path: 'C:/benjamin/test',
    port: '7070'
  });
  serversManager.addServer({
    path: '/autre/serveur/de/test',
    port: '8081'
  });
  */
  updateMenu();
  trayIcon.on('click', () => trayIcon.popUpContextMenu(contextMenu));
  openAddServerDialog();
}

function updateMenu() {
  const activeServers = serversManager.servers.filter(s => s.isActive === true);
  const stoppedServers = serversManager.servers.filter(s => s.isActive === false);
  let menuTemplate = 
  [
    {
      label: 'Ajouter un serveur',
      click: openAddServerDialog,
    }, {
      type: 'separator'
    }, {
      label: 'Serveurs actifs',
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
    label: 'Serveurs arrêtés',
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
    label: 'Quitter',
    click: quitApp
  });

  contextMenu = Menu.buildFromTemplate(menuTemplate); 
  trayIcon.setContextMenu(contextMenu);
}

function getServerSubMenu(server) {
  let serverSubMenuTemplate = [
    {
      label: server.isActive ? 'Arrêter le serveur' : 'Démarrer le serveur',
      click: server.isActive ? () => stopServer(server) : () => startServer(server)
    }, {
      label: 'Supprimer le serveur',
      click: () => removeServer(server)
    }
  ];
  return Menu.buildFromTemplate(serverSubMenuTemplate);
}

function quitApp() {
  app.quit();
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
  let addServerWindow = new BrowserWindow({title: 'Ajouter un serveur', width: 250, height: 330, resizable: false, show: false, autoHideMenuBar: true});
  addServerWindow.loadURL(path.join(appRoot.toString(), '/views/add-server.html'));
  addServerWindow.show();
  //addServerWindow.openDevTools();
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
    event.sender.send('server-not-added', exception.message);
  }
});
