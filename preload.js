const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Email
  sendEmail: (args) => ipcRenderer.invoke('send-email', args),

  // Connectivity
  checkConnectivity: () => ipcRenderer.invoke('check-connectivity'),

  // Printing
  printContent: (htmlContent) => ipcRenderer.invoke('print-content', { htmlContent }),

  // File operations
  saveFile: (defaultName, content, filter) =>
    ipcRenderer.invoke('save-file', { defaultName, content, filter }),

  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),

  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // Platform info
  platform: process.platform
});
