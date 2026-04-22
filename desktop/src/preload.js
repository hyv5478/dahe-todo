const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("daheTodo", {
  appInfo: () => ipcRenderer.invoke("app:info"),
  loadTasks: () => ipcRenderer.invoke("tasks:load"),
  saveTasks: (tasks) => ipcRenderer.invoke("tasks:save", tasks),
  loadFocusSessions: () => ipcRenderer.invoke("focus:load"),
  saveFocusSessions: (sessions) => ipcRenderer.invoke("focus:save", sessions),
  notifyFocusEnded: (payload) => ipcRenderer.invoke("notify:focus-ended", payload),
  openDataFolder: () => ipcRenderer.invoke("data:open-folder"),
  exportData: () => ipcRenderer.invoke("data:export"),
  importData: () => ipcRenderer.invoke("data:import"),
  chooseDataDir: () => ipcRenderer.invoke("settings:choose-data-dir"),
  saveSettings: (config, tasks, focusSessions) => ipcRenderer.invoke("settings:save", config, tasks, focusSessions),
});
