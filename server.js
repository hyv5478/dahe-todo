const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const root = __dirname;
const dataDir = path.join(root, "data");
const dataFile = path.join(dataDir, "tasks.json");
const port = 4317;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

ensureDataFile();

const server = http.createServer((req, res) => {
  if (req.url === "/api/tasks" && req.method === "GET") {
    sendFile(res, dataFile, "application/json; charset=utf-8");
    return;
  }

  if (req.url === "/api/tasks" && req.method === "POST") {
    readBody(req, (body) => {
      try {
        const data = JSON.parse(body);
        if (!Array.isArray(data)) throw new Error("tasks must be an array");
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), "utf8");
        sendJson(res, { ok: true });
      } catch {
        sendJson(res, { ok: false }, 400);
      }
    });
    return;
  }

  const requestPath = req.url === "/" ? "/index.html" : decodeURIComponent(req.url.split("?")[0]);
  const filePath = path.normalize(path.join(root, requestPath));
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  sendFile(res, filePath, types[path.extname(filePath)] || "application/octet-stream");
});

server.listen(port, "127.0.0.1", () => {
  const url = `http://127.0.0.1:${port}/`;
  console.log(`本地待办已启动：${url}`);
  console.log(`数据文件：${dataFile}`);
  openBrowser(url);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.log(`端口 ${port} 已经在使用中，可能本地待办已经打开。`);
    openBrowser(`http://127.0.0.1:${port}/`);
    return;
  }
  console.error(error);
  process.exit(1);
});

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "[]\n", "utf8");
}

function sendFile(res, filePath, type) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  res.writeHead(200, { "Content-Type": type });
  fs.createReadStream(filePath).pipe(res);
}

function sendJson(res, data, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function readBody(req, callback) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 5 * 1024 * 1024) req.destroy();
  });
  req.on("end", () => callback(body));
}

function openBrowser(url) {
  if (process.env.TODO_NO_BROWSER === "1") return;
  execFile("cmd", ["/c", "start", "", url], { windowsHide: true }, (error) => {
    if (error) console.log(`请手动打开：${url}`);
  });
}
