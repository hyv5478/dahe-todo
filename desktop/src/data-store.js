const fs = require("fs");
const path = require("path");

function createDataStore(options) {
  let dataDir = options.dataDir;
  let tasksFile = path.join(dataDir, "tasks.json");
  let focusFile = path.join(dataDir, "focus-sessions.json");
  let achievementsFile = path.join(dataDir, "achievements.json");
  const legacyFiles = [options.legacyFile, ...(options.legacyFiles || [])].filter(Boolean);

  function ensure() {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    ensureTasksFile();
    ensureFocusFile();
    ensureAchievementsFile();
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

  function ensureAchievementsFile() {
    if (!fs.existsSync(achievementsFile)) {
      fs.writeFileSync(achievementsFile, "[]", "utf8");
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

  function loadAchievements() {
    ensure();
    return readJsonArray(achievementsFile) || [];
  }

  function saveAchievements(achievements) {
    ensure();
    if (!Array.isArray(achievements)) throw new Error("achievements must be an array");
    fs.writeFileSync(achievementsFile, JSON.stringify(achievements, null, 2), "utf8");
    return { dataFile: achievementsFile, count: achievements.length };
  }

  function exportTo(filePath) {
    ensure();
    const payload = {
      schemaVersion: 3,
      exportedAt: new Date().toISOString(),
      tasks: loadTasks(),
      focusSessions: loadFocusSessions(),
      achievements: loadAchievements(),
    };
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");
    return filePath;
  }

  function importFrom(filePath) {
    const parsed = readJson(filePath);
    if (!parsed) throw new Error("import file must be valid JSON");
    const tasks = Array.isArray(parsed) ? parsed : parsed.tasks;
    const focusSessions = Array.isArray(parsed.focusSessions) ? parsed.focusSessions : [];
    const achievements = Array.isArray(parsed.achievements) ? parsed.achievements : [];
    if (!Array.isArray(tasks)) throw new Error("import file must include a task array");
    saveTasks(tasks);
    saveFocusSessions(focusSessions);
    saveAchievements(achievements);
    return { tasks, focusSessions, achievements };
  }

  function setDataDir(nextDataDir, tasksToCarry, focusSessionsToCarry, achievementsToCarry) {
    const tasks = Array.isArray(tasksToCarry) ? tasksToCarry : loadTasks();
    const focusSessions = Array.isArray(focusSessionsToCarry) ? focusSessionsToCarry : loadFocusSessions();
    const achievements = Array.isArray(achievementsToCarry) ? achievementsToCarry : loadAchievements();
    dataDir = nextDataDir;
    tasksFile = path.join(dataDir, "tasks.json");
    focusFile = path.join(dataDir, "focus-sessions.json");
    achievementsFile = path.join(dataDir, "achievements.json");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2), "utf8");
    fs.writeFileSync(focusFile, JSON.stringify(focusSessions, null, 2), "utf8");
    fs.writeFileSync(achievementsFile, JSON.stringify(achievements, null, 2), "utf8");
    return { dataDir, tasksFile, focusFile, achievementsFile, taskCount: tasks.length, focusCount: focusSessions.length, achievementCount: achievements.length };
  }

  function info() {
    return { dataDir, dataFile: tasksFile, tasksFile, focusFile, achievementsFile };
  }

  return {
    ensure,
    load: loadTasks,
    save: saveTasks,
    loadTasks,
    saveTasks,
    loadFocusSessions,
    saveFocusSessions,
    loadAchievements,
    saveAchievements,
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
