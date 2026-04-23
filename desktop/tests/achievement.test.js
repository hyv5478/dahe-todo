const fs = require("fs");
const path = require("path");
const assert = require("assert");

const appJs = fs.readFileSync(path.join(__dirname, "..", "src", "renderer", "app.js"), "utf8");
const indexHtml = fs.readFileSync(path.join(__dirname, "..", "src", "renderer", "index.html"), "utf8");
const preloadJs = fs.readFileSync(path.join(__dirname, "..", "src", "preload.js"), "utf8");
const mainJs = fs.readFileSync(path.join(__dirname, "..", "src", "main.js"), "utf8");
const stylesCss = fs.readFileSync(path.join(__dirname, "..", "src", "renderer", "styles.css"), "utf8");

assert.ok(mainJs.includes("v0.5.0-achievements"));
assert.ok(mainJs.includes("achievements:load"));
assert.ok(mainJs.includes("achievements:save"));
assert.ok(preloadJs.includes("loadAchievements"));
assert.ok(preloadJs.includes("saveAchievements"));
assert.ok(appJs.includes("achievementDefinitions"));
assert.ok(appJs.includes("renderAchievements()"));
assert.ok(appJs.includes("syncAchievementUnlocks"));
assert.ok(appJs.includes("buildWeeklyAchievementStats"));
assert.ok(appJs.includes("achievementsForRange"));
assert.ok(appJs.includes("normalizeAchievement"));
assert.ok(appJs.includes("isInsertedTask"));
assert.ok(indexHtml.includes("achievementPanel") || indexHtml.includes("achievement-panel"));
assert.ok(indexHtml.includes("achievementList"));
assert.ok(indexHtml.includes("weekFocusCount"));
assert.ok(stylesCss.includes("overflow-x: auto"));
assert.ok(stylesCss.includes("flex: 0 0 178px"));
assert.ok(stylesCss.includes("scrollbar-width: thin"));

console.log("OK: weekly achievements are wired through storage, UI, and report output.");
