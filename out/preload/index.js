"use strict";
const electron = require("electron");
const api = {
  onModeChanged: (callback) => {
    const handler = (_event, mode) => callback(mode);
    electron.ipcRenderer.on("mode-changed", handler);
    electron.ipcRenderer.send("request-mode");
    return () => electron.ipcRenderer.removeListener("mode-changed", handler);
  },
  saveFile: (jsonData) => electron.ipcRenderer.invoke("save-file", jsonData),
  openFile: () => electron.ipcRenderer.invoke("open-file")
};
electron.contextBridge.exposeInMainWorld("api", api);
