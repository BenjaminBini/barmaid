const {remote, ipcRenderer, nativeImage} = require('electron');
const {dialog} = remote;

let directoryButton = document.getElementById('directory-button');
let directoryInput = document.getElementById('directory-input');
let directoryLabel = document.getElementById('directory-label');
let closeButton = document.getElementById('close-button');
let saveButton = document.getElementById('save-button');
let portInput = document.getElementById('port-input');
let pugInput = document.getElementById('pug-input');
//let indexInput = document.getElementById('index-input');
//let downloadInput = document.getElementById('download-input');
let startInput = document.getElementById('start-input');

let server = undefined;
if (remote.getCurrentWindow().server) {
  server = remote.getCurrentWindow().server;
}

directoryButton.addEventListener('click', (e) => {
  e.preventDefault();
  dialog.showOpenDialog(remote.getCurrentWindow(), {
    properties: ['openDirectory']
  }, function(directories) {
    if (directories && directories.length === 1) {
      directoryInput.value = directories[0];
      directoryLabel.innerHTML = directories[0];
    }
  });
});

closeButton.addEventListener('click', () => {
  remote.getCurrentWindow().close();
});

saveButton.addEventListener('click', () => {
  let options = {
    path: directoryInput.value,
    port: portInput.value,
    pug: pugInput.checked,
    //autoIndex: indexInput.checked,
    //download: downloadInput.checked,
    isActive: startInput.checked,
  }

  if (server) {
    options.id = server.id;
    ipcRenderer.send('edit-server', options);
  } else {
    ipcRenderer.send('add-server', options);
  }
});

ipcRenderer.on('server-added', () => {
  remote.getCurrentWindow().close();
});

ipcRenderer.on('server-not-added', (event, arg) => {
  dialog.showMessageBox(remote.getCurrentWindow(), {
    title: 'Error',
    message: arg.message,
    type: 'warning',
    buttons: ['Ok'],
    icon: arg.icon
  });
});

if (server) {
  directoryInput.value = server.params.path;
  directoryLabel.innerHTML = server.params.path;
  portInput.value = server.params.port;
  pugInput.checked = server.params.pug;
  startInput.checked = server.isActive;
}
