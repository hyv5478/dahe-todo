const fs = require("fs");
const path = require("path");
const assert = require("assert");

const appJs = fs.readFileSync(path.join(__dirname, "..", "src", "renderer", "app.js"), "utf8");
const indexHtml = fs.readFileSync(path.join(__dirname, "..", "src", "renderer", "index.html"), "utf8");

assert.ok(appJs.includes("focus-running"));
assert.ok(appJs.includes("break-ready"));
assert.ok(appJs.includes("break-running"));
assert.ok(appJs.includes("interrupted"));
assert.ok(appJs.includes("new Date(session.focusEndsAt).getTime() <= now"));
assert.ok(appJs.includes("taskTitleSnapshot"));
assert.ok(indexHtml.includes("focusBar"));
assert.ok(indexHtml.includes("专注番茄"));
assert.ok(indexHtml.includes("被人打断"));

console.log("OK: focus timer state machine and UI hooks are present.");
