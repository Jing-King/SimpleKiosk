const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Send methods
  updateUrl: (url) => ipcRenderer.send('update-url', url),
  getUrl: () => ipcRenderer.send('get-url'),
  getJsonUrl: () => ipcRenderer.send('get-json-url'),
  uploadIcon: (iconPath) => ipcRenderer.send('upload-icon', iconPath),
  getIcon: () => ipcRenderer.send('get-icon'),
  setAutostart: () => ipcRenderer.send('set-autostart'),
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  closeApp: () => ipcRenderer.send('close-app'),
  
  // Receive methods
  onToggleSettings: (callback) => ipcRenderer.on('toggle-settings', callback),
  onUrlValue: (callback) => ipcRenderer.on('url-value', (event, value) => callback(value)),
  onJsonUrlValue: (callback) => ipcRenderer.on('json-url-value', (event, value) => callback(value)),
  onIconValue: (callback) => ipcRenderer.on('icon-value', (event, value) => callback(value)),
  onAutostartStatus: (callback) => ipcRenderer.on('autostart-status', (event, value) => callback(value))
});