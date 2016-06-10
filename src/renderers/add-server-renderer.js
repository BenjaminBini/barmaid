const {remote, ipcRenderer} = require('electron');
const {dialog} = remote;

let directoryButton = document.getElementById('directory-button');
let directoryInput = document.getElementById('directory-input');
let directoryLabel = document.getElementById('directory-label');
let closeButton = document.getElementById('close-button');
let saveButton = document.getElementById('save-button');
let portInput = document.getElementById('port-input');
let indexInput = document.getElementById('index-input');
let downloadInput = document.getElementById('download-input');
let startInput = document.getElementById('start-input');

directoryButton.addEventListener('click', (e) => {
  e.preventDefault();
  dialog.showOpenDialog(remote.getCurrentWindow(), {
    properties: ['openDirectory']
  }, function(directories) {
    if (directories.length === 1) {
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
    autoIndex: indexInput.checked,
    download: downloadInput.checked,
    isActive: startInput.checked
  }

  ipcRenderer.send('add-server', options);
});

ipcRenderer.on('server-added', () => {
  remote.getCurrentWindow().close();
});

ipcRenderer.on('server-not-added', (event, arg) => {
  dialog.showMessageBox(remote.getCurrentWindow(), {
    title: 'An Error Message',
    message: arg,
    type: 'warning',
    buttons: ['Ok']
  });
});
