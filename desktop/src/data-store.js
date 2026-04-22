const fs = require("fs");
const path = require("path");

function createDataStore(options) {
  let dataDir = options.dataDir;
  let dataFile = path.join(dataDir, "tasks.json");
  const legacyFiles = [options.legacyFile, ...(options.legacyFiles || [])].filter(Boolean);

  function ensure() {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (fs.existsSync(dataFile)) {
      migrateLegacyWhenEmpty();
      return;
    }

    const legacyTasks = readFirstJsonArray(legacyFiles);
    const initial = legacyTasks || [];
    fs.writeFileSync(dataFile, JSON.stringify(initial, null, 2), "utf8");
  }

  function migrateLegacyWhenEmpty() {
    const current = readJsonArray(dataFile);
    if (!current || current.length > 0) return;
    const legacyTasks = readFirstJsonArray(legacyFiles);
    if (!legacyTasks || legacyTasks.length === 0) return;
    fs.writeFileSync(dataFile, JSON.stringify(legacyTasks, null, 2), "utf8");
  }

  function load() {
    ensure();
    return readJsonArray(dataFile) || [];
  }

  function save(tasks) {
    ensure();
    if (!Array.isArray(tasks)) throw new Error("tasks must be an array");
    fs.writeFileSync(dataFile, JSON.stringify(tasks, null, 2), "utf8");
    return { dataFile, count: tasks.length };
  }

  function importFrom(filePath) {
    const tasks = readJsonArray(filePath);
    if (!tasks) throw new Error("import file must be a JSON array");
    save(tasks);
    return tasks;
  }

  function exportTo(filePath) {
    ensure();
    fs.copyFileSync(dataFile, filePath);
    return filePath;
  }

  function setDataDir(nextDataDir, tasksToCarry) {
    const tasks = Array.isArray(tasksToCarry) ? tasksToCarry : load();
    dataDir = nextDataDir;
    dataFile = path.join(dataDir, "tasks.json");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(dataFile, JSON.stringify(tasks, null, 2), "utf8");
    return { dataDir, dataFile, count: tasks.length };
  }

  function info() {
    return { dataDir, dataFile };
  }

  return { ensure, load, save, importFrom, exportTo, setDataDir, info };
}

function readJsonArray(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

function readFirstJsonArray(filePaths) {
  for (const filePath of filePaths) {
    const data = readJsonArray(filePath);
    if (data && data.length > 0) return data;
  }
  return null;
}

module.exports = { createDataStore };
