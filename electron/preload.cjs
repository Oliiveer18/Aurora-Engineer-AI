const { contextBridge, ipcRenderer } = require('electron');

// Expose safe, isolated APIs to renderer
contextBridge.exposeInMainWorld('auroraElectron', {
  isElectron: true,
  getAppVersion: () => ipcRenderer.invoke('aurora:get-app-version'),
  getPlatformInfo: () => ipcRenderer.invoke('aurora:get-platform-info'),
  openProjectDialog: () => ipcRenderer.invoke('aurora:open-project-dialog'),
});
