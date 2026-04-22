# 大何的待办事项

一个 Windows 10 本地可用的轻量待办工具。

## 打开方式

双击 `start-todo.bat`。它会启动一个只监听本机的本地服务，并自动打开浏览器。

如果窗口提示 `Node.js was not found`，说明这台电脑没有安装 Node.js，先安装 Node.js 后再打开。

## 数据

事项会落地保存到 `data/tasks.json`，不会上传到网络。这个文件可以直接备份、复制、迁移。

如果你以前用过浏览器本地存储里的旧数据，第一次通过 `start-todo.bat` 打开时会自动迁移到 `data/tasks.json`。

## 适合的流程

1. 有事插进来就先添加。
2. 办完点圆形勾选，事项会进入历史。
3. 在历史里追加评论，旧评论也可以修改。
4. 搜索框是全局搜索，会查待办、历史、分组、补充说明和所有评论。
5. 历史页可以按周或按月归档查看，200 条以后也方便翻。
6. 到周报页复制或下载 Markdown 文本。

## 自测

需要验证时，右键 PowerShell 运行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\test-local.ps1
```

看到 `OK: server starts, page responds, API writes, data/tasks.json contains saved comments.` 就表示启动、页面访问、接口写入、本地文件落盘都通过。测试会自动恢复原来的 `data/tasks.json`。
