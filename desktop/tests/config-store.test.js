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

store.write({ appName: "我的事项", dataDir: path.join(tempRoot, "custom") });
const saved = store.read();
assert.strictEqual(saved.appName, "我的事项");
assert.strictEqual(saved.dataDir, path.join(tempRoot, "custom"));

fs.rmSync(tempRoot, { recursive: true, force: true });
console.log("OK: config store defaults and save.");
