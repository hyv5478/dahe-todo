const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require("electron");
const path = require("path");
const { createDataStore } = require("./data-store");
const { createConfigStore } = require("./config-store");

let mainWindow;
let store;
let configStore;
let appConfig;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 1080,
    minHeight: 720,
    title: appConfig.appName,
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
  configStore = createConfigStore({
    configDir: path.join(app.getPath("userData"), "config"),
    defaultDataDir: path.join(documents, "DaheTodo"),
  });
  appConfig = configStore.read();
  store = createDataStore({
    dataDir: appConfig.dataDir,
    legacyFiles: [
      path.resolve(__dirname, "..", "..", "data", "tasks.json"),
      path.resolve(process.cwd(), "data", "tasks.json"),
      path.join(documents, "New project", "data", "tasks.json"),
    ],
  });
  store.ensure();
  registerIpc();
  applyAppMenu();
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
    version: "v0.3.2-priority-quadrants",
    appName: appConfig.appName,
    dataFile: store.info().dataFile,
    dataDir: store.info().dataDir,
    configFile: configStore.configFile,
  }));

  ipcMain.handle("tasks:load", () => store.load());
  ipcMain.handle("tasks:save", (_event, tasks) => store.save(tasks));

  ipcMain.handle("data:open-folder", async () => {
    await shell.openPath(store.info().dataDir);
    return store.info().dataDir;
  });

  ipcMain.handle("settings:choose-data-dir", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "选择数据保存位置",
      properties: ["openDirectory", "createDirectory"],
      defaultPath: store.info().dataDir,
    });
    if (result.canceled || !result.filePaths[0]) return null;
    return result.filePaths[0];
  });

  ipcMain.handle("settings:save", (_event, nextConfig, tasks) => {
    const normalized = configStore.write({
      appName: nextConfig.appName,
      dataDir: nextConfig.dataDir,
    });
    appConfig = normalized;
    store.setDataDir(normalized.dataDir, tasks);
    if (mainWindow) mainWindow.setTitle(appConfig.appName);
    return {
      version: "v0.3.0-desktop-alpha",
      appName: appConfig.appName,
      dataFile: store.info().dataFile,
      dataDir: store.info().dataDir,
      configFile: configStore.configFile,
    };
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

function applyAppMenu() {
  const template = [
    {
      label: "文件",
      submenu: [
        { label: "打开数据文件夹", click: () => mainWindow && shell.openPath(store.info().dataDir) },
        { type: "separator" },
        { label: "退出", role: "quit" },
      ],
    },
    {
      label: "编辑",
      submenu: [
        { label: "撤销", role: "undo" },
        { label: "重做", role: "redo" },
        { type: "separator" },
        { label: "剪切", role: "cut" },
        { label: "复制", role: "copy" },
        { label: "粘贴", role: "paste" },
        { label: "全选", role: "selectAll" },
      ],
    },
    {
      label: "视图",
      submenu: [
        { label: "重新加载", role: "reload" },
        { label: "放大", role: "zoomIn" },
        { label: "缩小", role: "zoomOut" },
        { label: "重置缩放", role: "resetZoom" },
        { type: "separator" },
        { label: "全屏", role: "togglefullscreen" },
      ],
    },
    {
      label: "窗口",
      submenu: [
        { label: "最小化", role: "minimize" },
        { label: "关闭窗口", role: "close" },
      ],
    },
    {
      label: "帮助",
      submenu: [
        { label: "关于", click: () => dialog.showMessageBox(mainWindow, {
          type: "info",
          title: `关于 ${appConfig.appName}`,
          message: appConfig.appName,
          detail: `版本：v0.3.2-priority-quadrants\n数据文件：${store.info().dataFile}`,
        }) },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
