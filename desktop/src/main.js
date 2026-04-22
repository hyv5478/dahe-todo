const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const { createDataStore } = require("./data-store");

let mainWindow;
let store;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 1080,
    minHeight: 720,
    title: "大何的待办事项",
    backgroundColor: "#f3f1ea",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));
}

app.whenReady().then(() => {
  const documents = app.getPath("documents");
  store = createDataStore({
    dataDir: path.join(documents, "DaheTodo"),
    legacyFiles: [
      path.resolve(__dirname, "..", "..", "data", "tasks.json"),
      path.resolve(process.cwd(), "data", "tasks.json"),
      path.join(documents, "New project", "data", "tasks.json"),
    ],
  });
  store.ensure();
  registerIpc();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

function registerIpc() {
  ipcMain.handle("app:info", () => ({
    version: "v0.3.0-desktop-alpha",
    dataFile: store.dataFile,
    dataDir: store.dataDir,
  }));

  ipcMain.handle("tasks:load", () => store.load());
  ipcMain.handle("tasks:save", (_event, tasks) => store.save(tasks));

  ipcMain.handle("data:open-folder", async () => {
    await shell.openPath(store.dataDir);
    return store.dataDir;
  });

  ipcMain.handle("data:export", async () => {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: "导出待办备份",
      defaultPath: `dahe-todo-backup-${new Date().toISOString().slice(0, 10)}.json`,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (result.canceled || !result.filePath) return null;
    return store.exportTo(result.filePath);
  });

  ipcMain.handle("data:import", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "导入待办备份",
      properties: ["openFile"],
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (result.canceled || !result.filePaths[0]) return null;
    return store.importFrom(result.filePaths[0]);
  });
}
