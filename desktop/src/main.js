const { app, BrowserWindow, ipcMain, dialog, shell, Menu, Notification } = require("electron");
const path = require("path");
const { createDataStore } = require("./data-store");
const { createConfigStore } = require("./config-store");

const APP_VERSION = "v0.4.0-focus-timer";

let mainWindow;
let store;
let configStore;
let appConfig;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 1120,
    minHeight: 740,
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

  mainWindow.once("ready-to-show", () => mainWindow.show());
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

function appInfo() {
  return {
    version: APP_VERSION,
    appName: appConfig.appName,
    dataFile: store.info().dataFile,
    dataDir: store.info().dataDir,
    focusFile: store.info().focusFile,
    configFile: configStore.configFile,
    focusMinutes: appConfig.focusMinutes,
    breakMinutes: appConfig.breakMinutes,
    notifyOnFocusEnd: appConfig.notifyOnFocusEnd,
  };
}

function registerIpc() {
  ipcMain.handle("app:info", () => appInfo());
  ipcMain.handle("tasks:load", () => store.loadTasks());
  ipcMain.handle("tasks:save", (_event, tasks) => store.saveTasks(tasks));
  ipcMain.handle("focus:load", () => store.loadFocusSessions());
  ipcMain.handle("focus:save", (_event, sessions) => store.saveFocusSessions(sessions));

  ipcMain.handle("notify:focus-ended", (_event, payload) => {
    if (!appConfig.notifyOnFocusEnd || !Notification.isSupported()) return false;
    new Notification({
      title: payload && payload.title ? payload.title : "番茄钟结束",
      body: payload && payload.body ? payload.body : "本轮专注完成，可以休息一下。",
      silent: false,
    }).show();
    return true;
  });

  ipcMain.handle("data:open-folder", async () => {
    await shell.openPath(store.info().dataDir);
    return store.info().dataDir;
  });

  ipcMain.handle("settings:choose-data-dir", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "选择数据存储文件夹",
      properties: ["openDirectory", "createDirectory"],
      defaultPath: store.info().dataDir,
    });
    if (result.canceled || !result.filePaths[0]) return null;
    return result.filePaths[0];
  });

  ipcMain.handle("settings:save", (_event, nextConfig, tasks, focusSessions) => {
    const normalized = configStore.write({
      appName: nextConfig.appName,
      dataDir: nextConfig.dataDir,
      focusMinutes: nextConfig.focusMinutes,
      breakMinutes: nextConfig.breakMinutes,
      notifyOnFocusEnd: nextConfig.notifyOnFocusEnd,
    });
    appConfig = normalized;
    store.setDataDir(normalized.dataDir, tasks, focusSessions);
    if (mainWindow) mainWindow.setTitle(appConfig.appName);
    return appInfo();
  });

  ipcMain.handle("data:export", async () => {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: "导出待办和专注记录",
      defaultPath: `dahe-todo-backup-${new Date().toISOString().slice(0, 10)}.json`,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (result.canceled || !result.filePath) return null;
    return store.exportTo(result.filePath);
  });

  ipcMain.handle("data:import", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "导入待办和专注记录",
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
        { label: "重新载入", role: "reload" },
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
        {
          label: "关于",
          click: () => dialog.showMessageBox(mainWindow, {
            type: "info",
            title: `关于 ${appConfig.appName}`,
            message: appConfig.appName,
            detail: `版本：${APP_VERSION}\n数据文件：${store.info().dataFile}\n专注记录：${store.info().focusFile}`,
          }),
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
