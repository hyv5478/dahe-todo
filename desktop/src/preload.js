const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("daheTodo", {
  appInfo: () => ipcRenderer.invoke("app:info"),
  loadTasks: () => ipcRenderer.invoke("tasks:load"),
  saveTasks: (tasks) => ipcRenderer.invoke("tasks:save", tasks),
  openDataFolder: () => ipcRenderer.invoke("data:open-folder"),
  exportData: () => ipcRenderer.invoke("data:export"),
  importData: () => ipcRenderer.invoke("data:import"),
});
