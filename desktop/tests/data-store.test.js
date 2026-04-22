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
assert.ok(fs.existsSync(path.join(dataDir, "tasks.json")));
assert.ok(fs.existsSync(path.join(dataDir, "focus-sessions.json")));

fs.writeFileSync(path.join(dataDir, "tasks.json"), "[]", "utf8");
assert.deepStrictEqual(store.loadTasks(), [{ id: "legacy", title: "legacy task" }]);

store.saveTasks([{ id: "new", title: "new task", comments: [{ id: "c1", text: "done" }] }]);
store.saveFocusSessions([{ id: "focus-1", taskId: "new", status: "completed" }]);
assert.strictEqual(store.loadTasks()[0].title, "new task");
assert.strictEqual(store.loadFocusSessions()[0].id, "focus-1");

const exportFile = path.join(tempRoot, "export.json");
store.exportTo(exportFile);
const exported = JSON.parse(fs.readFileSync(exportFile, "utf8"));
assert.strictEqual(exported.schemaVersion, 2);
assert.strictEqual(exported.tasks[0].id, "new");
assert.strictEqual(exported.focusSessions[0].id, "focus-1");

const importFile = path.join(tempRoot, "import.json");
fs.writeFileSync(importFile, JSON.stringify({
  tasks: [{ id: "imported", title: "imported task" }],
  focusSessions: [{ id: "focus-2", taskId: "imported", status: "completed" }],
}), "utf8");
const imported = store.importFrom(importFile);
assert.strictEqual(imported.tasks[0].id, "imported");
assert.strictEqual(imported.focusSessions[0].id, "focus-2");

fs.rmSync(tempRoot, { recursive: true, force: true });
console.log("OK: data store migration, focus sessions, export, import.");
