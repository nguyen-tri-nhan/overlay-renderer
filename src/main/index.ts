import { app, BrowserWindow, globalShortcut, ipcMain, dialog, screen } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { GLOBAL_HOTKEY } from '@shared/config'

const isDev = process.env.NODE_ENV === 'development'

let mainWindow: BrowserWindow | null = null
let isEditMode = true

function createWindow(): void {
  const primaryDisplay = screen.getPrimaryDisplay()
  const bounds = primaryDisplay.bounds
  const workArea = primaryDisplay.workArea

  const width = bounds.width > 0 ? bounds.width : workArea.width
  const height = bounds.height > 0 ? bounds.height : workArea.height
  const x = bounds.x
  const y = bounds.y

  console.log('[circle-display] display bounds:', bounds)
  console.log('[circle-display] window size:', { width, height, x, y })

  mainWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    transparent: true,
    backgroundColor: '#00000000',
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.setIgnoreMouseEvents(false)
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  mainWindow.setAlwaysOnTop(true, 'screen-saver')

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function enterEditMode(): void {
  if (!mainWindow) return
  isEditMode = true
  mainWindow.setIgnoreMouseEvents(false)
  mainWindow.webContents.send('mode-changed', 'edit')
}

function enterDisplayMode(): void {
  if (!mainWindow) return
  isEditMode = false
  mainWindow.setIgnoreMouseEvents(true, { forward: true })
  mainWindow.webContents.send('mode-changed', 'display')
}

function toggleMode(): void {
  if (isEditMode) {
    enterDisplayMode()
  } else {
    enterEditMode()
  }
}

app.whenReady().then(() => {
  createWindow()

  globalShortcut.register(GLOBAL_HOTKEY, () => {
    toggleMode()
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('save-file', async (_event, jsonData: string) => {
  const { filePath } = await dialog.showSaveDialog({
    title: 'Lưu hình',
    defaultPath: 'shapes.json',
    filters: [{ name: 'JSON', extensions: ['json'] }]
  })
  if (!filePath) return { success: false }
  writeFileSync(filePath, jsonData, 'utf-8')
  return { success: true, filePath }
})

ipcMain.handle('open-file', async () => {
  const { filePaths } = await dialog.showOpenDialog({
    title: 'Mở file',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile']
  })
  if (!filePaths || filePaths.length === 0) return { success: false }
  const content = readFileSync(filePaths[0], 'utf-8')
  return { success: true, data: content }
})

ipcMain.on('request-mode', (event) => {
  event.reply('mode-changed', isEditMode ? 'edit' : 'display')
})

ipcMain.on('quit-app', () => {
  app.quit()
})
