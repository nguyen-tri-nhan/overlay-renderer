import { contextBridge, ipcRenderer } from 'electron'

const api = {
  onModeChanged: (callback: (mode: 'edit' | 'display') => void) => {
    const handler = (_event: Electron.IpcRendererEvent, mode: 'edit' | 'display') => callback(mode)
    ipcRenderer.on('mode-changed', handler)
    ipcRenderer.send('request-mode')
    return () => ipcRenderer.removeListener('mode-changed', handler)
  },
  saveFile: (jsonData: string) => ipcRenderer.invoke('save-file', jsonData),
  openFile: () => ipcRenderer.invoke('open-file')
}

contextBridge.exposeInMainWorld('api', api)
