const fs = require("fs");
const path = require("path");
const assert = require("assert");

const appJs = fs.readFileSync(path.join(__dirname, "..", "src", "renderer", "app.js"), "utf8");

assert.ok(appJs.includes("important-urgent"));
assert.ok(appJs.includes("important-not-urgent"));
assert.ok(appJs.includes("not-important-urgent"));
assert.ok(appJs.includes("not-important-not-urgent"));
assert.ok(appJs.includes("high: \"important-urgent\""));
assert.ok(appJs.includes("normal: \"important-not-urgent\""));
assert.ok(appJs.includes("low: \"not-important-not-urgent\""));

console.log("OK: priority quadrants and legacy mapping are present.");
