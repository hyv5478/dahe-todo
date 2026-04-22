const fs = require("fs");
const path = require("path");

const defaultConfig = {
  appName: "大何的待办事项",
  dataDir: "",
  focusMinutes: 25,
  breakMinutes: 5,
  notifyOnFocusEnd: true,
};

function createConfigStore(options) {
  const configDir = options.configDir;
  const configFile = path.join(configDir, "settings.json");
  const defaultDataDir = options.defaultDataDir;

  function ensure() {
    if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
    if (!fs.existsSync(configFile)) {
      write({ ...defaultConfig, dataDir: defaultDataDir });
    }
  }

  function read() {
    ensure();
    try {
      return normalize(JSON.parse(fs.readFileSync(configFile, "utf8")));
    } catch {
      return normalize(defaultConfig);
    }
  }

  function write(config) {
    const normalized = normalize(config);
    fs.writeFileSync(configFile, JSON.stringify(normalized, null, 2), "utf8");
    return normalized;
  }

  function normalize(config) {
    return {
      appName: textOr(config.appName, defaultConfig.appName),
      dataDir: textOr(config.dataDir, defaultDataDir),
      focusMinutes: clampNumber(config.focusMinutes, 5, 180, defaultConfig.focusMinutes),
      breakMinutes: clampNumber(config.breakMinutes, 1, 60, defaultConfig.breakMinutes),
      notifyOnFocusEnd: config.notifyOnFocusEnd !== false,
    };
  }

  return { configDir, configFile, ensure, read, write };
}

function textOr(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

module.exports = { createConfigStore };
