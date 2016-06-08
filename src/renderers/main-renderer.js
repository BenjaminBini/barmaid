const ipc = require('electron').ipcRenderer;

const selectFolderButton = document.getElementById('folder-button');
const folderInput = document.getElementById('folder');

selectFolderButton.addEventListener('click', e => ipc.send('open-directory-dialog'));

ipc.on('directories-selected', function(e, directories) {
  folder.value = directories[0];
});
