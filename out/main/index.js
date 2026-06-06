"use strict";
const Module = require("module");
const origResolve = Module._resolveFilename.bind(Module);
Module._resolveFilename = (request, ...args) => {
  if (request === "electron") return request;
  return origResolve(request, ...args);
};
const { app, BrowserWindow, globalShortcut, ipcMain, dialog, screen } = require("electron");
const { join } = require("path");
const { readFileSync, writeFileSync } = require("fs");
const isDev = process.env.NODE_ENV === "development";
let mainWindow = null;
let isEditMode = false;
function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height, x, y } = primaryDisplay.bounds;
  mainWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.setIgnoreMouseEvents(true, { forward: true });
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setAlwaysOnTop(true, "screen-saver");
  if (isDev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}
function enterEditMode() {
  if (!mainWindow) return;
  isEditMode = true;
  mainWindow.setIgnoreMouseEvents(false);
  mainWindow.webContents.send("mode-changed", "edit");
}
function enterDisplayMode() {
  if (!mainWindow) return;
  isEditMode = false;
  mainWindow.setIgnoreMouseEvents(true, { forward: true });
  mainWindow.webContents.send("mode-changed", "display");
}
function toggleMode() {
  if (isEditMode) {
    enterDisplayMode();
  } else {
    enterEditMode();
  }
}
app.whenReady().then(() => {
  createWindow();
  globalShortcut.register("CommandOrControl+Alt+Shift+1", () => {
    toggleMode();
  });
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
ipcMain.handle("save-file", async (_event, jsonData) => {
  const { filePath } = await dialog.showSaveDialog({
    title: "Lưu hình",
    defaultPath: "shapes.json",
    filters: [{ name: "JSON", extensions: ["json"] }]
  });
  if (!filePath) return { success: false };
  writeFileSync(filePath, jsonData, "utf-8");
  return { success: true, filePath };
});
ipcMain.handle("open-file", async () => {
  const { filePaths } = await dialog.showOpenDialog({
    title: "Mở file",
    filters: [{ name: "JSON", extensions: ["json"] }],
    properties: ["openFile"]
  });
  if (!filePaths || filePaths.length === 0) return { success: false };
  const content = readFileSync(filePaths[0], "utf-8");
  return { success: true, data: content };
});
ipcMain.on("request-mode", (event) => {
  event.reply("mode-changed", isEditMode ? "edit" : "display");
});
