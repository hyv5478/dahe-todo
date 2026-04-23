const fs = require("fs");
const os = require("os");
const path = require("path");
const assert = require("assert");
const { createDataStore } = require("../src/data-store");

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "dahe-todo-test-"));
const legacyFile = path.join(tempRoot, "legacy.json");
const dataDir = path.join(tempRoot, "data");

fs.writeFileSync(legacyFile, JSON.stringify([{ id: "legacy", title: "legacy task" }]), "utf8");

const store = createDataStore({ dataDir, legacyFiles: [legacyFile] });
assert.deepStrictEqual(store.loadTasks(), [{ id: "legacy", title: "legacy task" }]);
assert.deepStrictEqual(store.loadFocusSessions(), []);
assert.deepStrictEqual(store.loadAchievements(), []);
assert.ok(fs.existsSync(path.join(dataDir, "tasks.json")));
assert.ok(fs.existsSync(path.join(dataDir, "focus-sessions.json")));
assert.ok(fs.existsSync(path.join(dataDir, "achievements.json")));

fs.writeFileSync(path.join(dataDir, "tasks.json"), "[]", "utf8");
assert.deepStrictEqual(store.loadTasks(), [{ id: "legacy", title: "legacy task" }]);

store.saveTasks([{ id: "new", title: "new task", comments: [{ id: "c1", text: "done" }] }]);
store.saveFocusSessions([{ id: "focus-1", taskId: "new", status: "completed" }]);
store.saveAchievements([{ id: "week-start", weekId: "2026-04-20", unlockedAt: "2026-04-20T09:00:00.000Z" }]);
assert.strictEqual(store.loadTasks()[0].title, "new task");
assert.strictEqual(store.loadFocusSessions()[0].id, "focus-1");
assert.strictEqual(store.loadAchievements()[0].id, "week-start");

const exportFile = path.join(tempRoot, "export.json");
store.exportTo(exportFile);
const exported = JSON.parse(fs.readFileSync(exportFile, "utf8"));
assert.strictEqual(exported.schemaVersion, 3);
assert.strictEqual(exported.tasks[0].id, "new");
assert.strictEqual(exported.focusSessions[0].id, "focus-1");
assert.strictEqual(exported.achievements[0].id, "week-start");

const importFile = path.join(tempRoot, "import.json");
fs.writeFileSync(importFile, JSON.stringify({
  tasks: [{ id: "imported", title: "imported task" }],
  focusSessions: [{ id: "focus-2", taskId: "imported", status: "completed" }],
  achievements: [{ id: "closed-loop", weekId: "2026-04-20", unlockedAt: "2026-04-21T09:00:00.000Z" }],
}), "utf8");
const imported = store.importFrom(importFile);
assert.strictEqual(imported.tasks[0].id, "imported");
assert.strictEqual(imported.focusSessions[0].id, "focus-2");
assert.strictEqual(imported.achievements[0].id, "closed-loop");

fs.rmSync(tempRoot, { recursive: true, force: true });
console.log("OK: data store migration, focus sessions, export, import.");
