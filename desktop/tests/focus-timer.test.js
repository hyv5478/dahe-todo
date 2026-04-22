const fs = require("fs");
const path = require("path");
const assert = require("assert");

const appJs = fs.readFileSync(path.join(__dirname, "..", "src", "renderer", "app.js"), "utf8");
const indexHtml = fs.readFileSync(path.join(__dirname, "..", "src", "renderer", "index.html"), "utf8");

assert.ok(appJs.includes("focus-running"));
assert.ok(appJs.includes("break-ready"));
assert.ok(appJs.includes("break-running"));
assert.ok(appJs.includes("interrupted"));
assert.ok(appJs.includes("task-completed"));
assert.ok(appJs.includes("settleFocusForCompletedTask(task)"));
assert.ok(appJs.includes("new Date(session.focusEndsAt).getTime() <= now"));
assert.ok(appJs.includes("taskTitleSnapshot"));
assert.ok(indexHtml.includes("focusBar"));
assert.ok(indexHtml.includes("focusPanel"));
assert.ok(indexHtml.includes("data-reason"));

console.log("OK: focus timer state machine and completion flow are present.");
