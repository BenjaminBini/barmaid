'use strict';

const electron = require('electron');
const Positioner = require('electron-positioner');
const {app, dialog, Tray, BrowserWindow, Menu} = electron;
const appRoot = require('app-root-path');
const Server = require('./server.js');
const path = require('path');

let windows = [];

let trayIcon = null;
let contextMenu = null;

function startApp() {
  trayIcon = new Tray(path.join(appRoot.toString(), '/assets/icons/tray-icon.png'));

  var testServer = new Server('server/de/test', 8080, true, {});
  updateMenu([testServer]);
  trayIcon.on('click', () => trayIcon.popUpContextMenu(contextMenu));
}

function updateMenu(servers) {
  const activeServers = servers.filter(s => s.isActive === true);
  const stoppedServers = servers.filter(s => s.isActive === false);
  console.log(servers[0]);
  let menuTemplate = 
  [
    {
      label: 'Ajouter un serveur'
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
      click: () => stopServer(server)
    }
  ];
  return Menu.buildFromTemplate(serverSubMenuTemplate);
}

function quitApp() {
  app.quit();
}

function stopServer(server) {
  server.stop();
  updateSubMenu();
}

app.on('ready', startApp);
