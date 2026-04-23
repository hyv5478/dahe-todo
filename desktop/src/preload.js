const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("daheTodo", {
  appInfo: () => ipcRenderer.invoke("app:info"),
  loadTasks: () => ipcRenderer.invoke("tasks:load"),
  saveTasks: (tasks) => ipcRenderer.invoke("tasks:save", tasks),
  loadFocusSessions: () => ipcRenderer.invoke("focus:load"),
  saveFocusSessions: (sessions) => ipcRenderer.invoke("focus:save", sessions),
  loadAchievements: () => ipcRenderer.invoke("achievements:load"),
  saveAchievements: (achievements) => ipcRenderer.invoke("achievements:save", achievements),
  notifyFocusEnded: (payload) => ipcRenderer.invoke("notify:focus-ended", payload),
  openDataFolder: () => ipcRenderer.invoke("data:open-folder"),
  exportData: () => ipcRenderer.invoke("data:export"),
  importData: () => ipcRenderer.invoke("data:import"),
  chooseDataDir: () => ipcRenderer.invoke("settings:choose-data-dir"),
  saveSettings: (config, tasks, focusSessions, achievements) => ipcRenderer.invoke("settings:save", config, tasks, focusSessions, achievements),
});
