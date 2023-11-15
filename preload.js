const os = require('os');
const path = require('path');
const { contextBridge, ipcRenderer } = require('electron');
const Toastify = require("toastify-js");

contextBridge.exposeInMainWorld('os', {
  homedir: () => os.homedir(),
  // we can also expose variables, not just functions
});

contextBridge.exposeInMainWorld('path', {
    join: (...args) => path.join(...args),
})

contextBridge.exposeInMainWorld('Toastify', {
    toast: (options) => Toastify(options).showToast(),
})

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args)=>func(...args)),
})
