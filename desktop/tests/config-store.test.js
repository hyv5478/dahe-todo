const fs = require("fs");
const os = require("os");
const path = require("path");
const assert = require("assert");
const { createConfigStore } = require("../src/config-store");

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "dahe-config-test-"));
const defaultDataDir = path.join(tempRoot, "data");
const store = createConfigStore({ configDir: tempRoot, defaultDataDir });

assert.strictEqual(store.read().appName, "大何的待办事项");
assert.strictEqual(store.read().dataDir, defaultDataDir);
assert.strictEqual(store.read().focusMinutes, 25);
assert.strictEqual(store.read().breakMinutes, 5);
assert.strictEqual(store.read().notifyOnFocusEnd, true);

store.write({
  appName: "我的待办",
  dataDir: path.join(tempRoot, "custom"),
  focusMinutes: 40,
  breakMinutes: 8,
  notifyOnFocusEnd: false,
});
const saved = store.read();
assert.strictEqual(saved.appName, "我的待办");
assert.strictEqual(saved.dataDir, path.join(tempRoot, "custom"));
assert.strictEqual(saved.focusMinutes, 40);
assert.strictEqual(saved.breakMinutes, 8);
assert.strictEqual(saved.notifyOnFocusEnd, false);

store.write({ focusMinutes: 999, breakMinutes: -1 });
const clamped = store.read();
assert.strictEqual(clamped.focusMinutes, 180);
assert.strictEqual(clamped.breakMinutes, 1);

fs.rmSync(tempRoot, { recursive: true, force: true });
console.log("OK: config store defaults, focus settings, save.");
