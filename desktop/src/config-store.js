const fs = require("fs");
const path = require("path");

const defaultConfig = {
  appName: "大何的待办事项",
  dataDir: "",
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
      const parsed = JSON.parse(fs.readFileSync(configFile, "utf8"));
      return normalize(parsed);
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
      appName: typeof config.appName === "string" && config.appName.trim() ? config.appName.trim() : defaultConfig.appName,
      dataDir: typeof config.dataDir === "string" && config.dataDir.trim() ? config.dataDir.trim() : defaultDataDir,
    };
  }

  return { configDir, configFile, ensure, read, write };
}

module.exports = { createConfigStore };
