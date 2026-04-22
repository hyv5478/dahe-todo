# 大何的待办事项

**简体中文** · [English](README.en.md)

本地优先的 Windows 待办工具，适合大量琐碎事项、临时插入任务、完成评论和周报素材整理。

![桌面端预览](docs/assets/desktop-preview.svg)

官网预览：[https://hyv5478.github.io/dahe-todo/](https://hyv5478.github.io/dahe-todo/)

## 功能

- 快速记录突然插入的事项，降低打断当前工作的成本。
- 完成事项后可以追加多条评论，记录过程、结果、原因和影响。
- 可以给当前任务开启番茄钟，记录每日和每周的专注投入。
- 支持优先级四象限：重要紧急、重要不紧急、不重要紧急、不重要不紧急。
- 待办页支持按优先级筛选，历史页支持按时间回看。
- 周报页汇总完成事项和评论，方便复制整理成周报素材。
- 数据本地存储为 JSON 文件，默认不上传、不同步。
- 桌面端支持配置应用名称和数据存储位置。

## 当前版本

- 桌面端版本：`v0.4.0-focus-timer`
- Windows 安装包见 GitHub Releases。

## 桌面端开发

安装依赖：

```powershell
cd desktop
npm.cmd install --cache .npm-cache
```

启动桌面端：

```powershell
cd desktop
npm.cmd start
```

运行检查：

```powershell
cd desktop
npm.cmd run check
```

生成 Windows 安装包：

```powershell
cd desktop
npm.cmd run dist
```

安装包输出：

```text
desktop/release/大何的待办事项 Setup 0.4.0.exe
```

## 本地数据

桌面端默认数据目录：

```text
%USERPROFILE%\Documents\DaheTodo
```

其中 `tasks.json` 保存待办，`focus-sessions.json` 保存番茄钟专注记录。应用内可以更改数据目录。仓库已加入隐私检查和 pre-push 钩子，避免把本地任务数据、安装包、依赖缓存和工具目录提交到 GitHub。

## 网页版

旧的本地浏览器版仍保留，可通过下面命令启动：

```powershell
start-todo.bat
```

网页版数据默认写入 `data/tasks.json`，该文件已被 `.gitignore` 忽略。

## 官网

GitHub Pages 使用：

```text
docs/
```

中文页：

```text
docs/index.html
```

英文页：

```text
docs/en.html
```

## 隐私

本项目默认不需要账号、不连接知识库、不上传待办内容。更多说明见 [PRIVACY.md](PRIVACY.md)。

## License

MIT
