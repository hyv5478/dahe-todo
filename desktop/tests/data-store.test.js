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
assert.deepStrictEqual(store.load(), [{ id: "legacy", title: "legacy task" }]);

fs.writeFileSync(path.join(dataDir, "tasks.json"), "[]", "utf8");
assert.deepStrictEqual(store.load(), [{ id: "legacy", title: "legacy task" }]);

store.save([{ id: "new", title: "new task", comments: [{ id: "c1", text: "done" }] }]);
assert.strictEqual(store.load()[0].title, "new task");

const exportFile = path.join(tempRoot, "export.json");
store.exportTo(exportFile);
assert.ok(fs.existsSync(exportFile));

const importFile = path.join(tempRoot, "import.json");
fs.writeFileSync(importFile, JSON.stringify([{ id: "imported", title: "imported task" }]), "utf8");
assert.strictEqual(store.importFrom(importFile)[0].id, "imported");

fs.rmSync(tempRoot, { recursive: true, force: true });
console.log("OK: data store migration, save, export, import.");
