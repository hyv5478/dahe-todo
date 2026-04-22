const fs = require("fs");
const path = require("path");

function createDataStore(options) {
  let dataDir = options.dataDir;
  let tasksFile = path.join(dataDir, "tasks.json");
  let focusFile = path.join(dataDir, "focus-sessions.json");
  const legacyFiles = [options.legacyFile, ...(options.legacyFiles || [])].filter(Boolean);

  function ensure() {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    ensureTasksFile();
    ensureFocusFile();
  }

  function ensureTasksFile() {
    if (fs.existsSync(tasksFile)) {
      migrateLegacyWhenEmpty();
      return;
    }
    const legacyTasks = readFirstJsonArray(legacyFiles);
    fs.writeFileSync(tasksFile, JSON.stringify(legacyTasks || [], null, 2), "utf8");
  }

  function ensureFocusFile() {
    if (!fs.existsSync(focusFile)) {
      fs.writeFileSync(focusFile, "[]", "utf8");
    }
  }

  function migrateLegacyWhenEmpty() {
    const current = readJsonArray(tasksFile);
    if (!current || current.length > 0) return;
    const legacyTasks = readFirstJsonArray(legacyFiles);
    if (!legacyTasks || legacyTasks.length === 0) return;
    fs.writeFileSync(tasksFile, JSON.stringify(legacyTasks, null, 2), "utf8");
  }

  function loadTasks() {
    ensure();
    return readJsonArray(tasksFile) || [];
  }

  function saveTasks(tasks) {
    ensure();
    if (!Array.isArray(tasks)) throw new Error("tasks must be an array");
    fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2), "utf8");
    return { dataFile: tasksFile, count: tasks.length };
  }

  function loadFocusSessions() {
    ensure();
    return readJsonArray(focusFile) || [];
  }

  function saveFocusSessions(sessions) {
    ensure();
    if (!Array.isArray(sessions)) throw new Error("focus sessions must be an array");
    fs.writeFileSync(focusFile, JSON.stringify(sessions, null, 2), "utf8");
    return { dataFile: focusFile, count: sessions.length };
  }

  function exportTo(filePath) {
    ensure();
    const payload = {
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      tasks: loadTasks(),
      focusSessions: loadFocusSessions(),
    };
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");
    return filePath;
  }

  function importFrom(filePath) {
    const parsed = readJson(filePath);
    if (!parsed) throw new Error("import file must be valid JSON");
    const tasks = Array.isArray(parsed) ? parsed : parsed.tasks;
    const focusSessions = Array.isArray(parsed.focusSessions) ? parsed.focusSessions : [];
    if (!Array.isArray(tasks)) throw new Error("import file must include a task array");
    saveTasks(tasks);
    saveFocusSessions(focusSessions);
    return { tasks, focusSessions };
  }

  function setDataDir(nextDataDir, tasksToCarry, focusSessionsToCarry) {
    const tasks = Array.isArray(tasksToCarry) ? tasksToCarry : loadTasks();
    const focusSessions = Array.isArray(focusSessionsToCarry) ? focusSessionsToCarry : loadFocusSessions();
    dataDir = nextDataDir;
    tasksFile = path.join(dataDir, "tasks.json");
    focusFile = path.join(dataDir, "focus-sessions.json");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2), "utf8");
    fs.writeFileSync(focusFile, JSON.stringify(focusSessions, null, 2), "utf8");
    return { dataDir, tasksFile, focusFile, taskCount: tasks.length, focusCount: focusSessions.length };
  }

  function info() {
    return { dataDir, dataFile: tasksFile, tasksFile, focusFile };
  }

  return {
    ensure,
    load: loadTasks,
    save: saveTasks,
    loadTasks,
    saveTasks,
    loadFocusSessions,
    saveFocusSessions,
    importFrom,
    exportTo,
    setDataDir,
    info,
  };
}

function readJson(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function readJsonArray(filePath) {
  const data = readJson(filePath);
  return Array.isArray(data) ? data : null;
}

function readFirstJsonArray(filePaths) {
  for (const filePath of filePaths) {
    const data = readJsonArray(filePath);
    if (data && data.length > 0) return data;
  }
  return null;
}

module.exports = { createDataStore };
