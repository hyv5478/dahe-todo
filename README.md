# 大何的待办事项

本地优先的 Windows 待办工具，适合大量琐碎事项、临时插入任务、完成评论和周报素材整理。

![桌面端预览](docs/assets/desktop-preview.svg)

项目地址：<https://github.com/hyv5478/dahe-todo>

## 特性

- 快速记录：事情一来先落地，不靠脑子硬记。
- 完成打钩：记录创建时间和办理时间。
- 多条评论：完成后可以追加多条评论，也能修改旧评论。
- 全局搜索：搜索标题、补充说明、分组和评论。
- 历史归档：按周或按月查看已完成事项。
- 周报素材：自动整理成 Markdown。
- 本地存储：桌面端数据保存到本机 JSON 文件，位置可配置。
- 可配置名称：项目名称可以在桌面端设置里修改，方便二次发布。

## 版本

- 桌面端：`v0.3.1-desktop-settings`
- 浏览器本地版：保留在仓库根目录

## 桌面端使用

开发启动：

```powershell
cd desktop
npm.cmd install --cache .npm-cache
npm.cmd start
```

检查：

```powershell
cd desktop
npm.cmd run check
```

打包 Windows 安装包：

```powershell
cd desktop
npm.cmd run dist
```

打包输出：

```text
desktop/release/大何的待办事项 Setup 0.3.1.exe
```

## 数据位置

桌面端默认保存到：

```text
%USERPROFILE%\Documents\DaheTodo\tasks.json
```

也可以在桌面端右上角“设置”里修改保存位置。

## 浏览器本地版

浏览器版保留给轻量使用和开发验证：

```powershell
start-todo.bat
```

浏览器版数据文件是 `data/tasks.json`，该文件不会提交到 GitHub。

## 宣传页面

GitHub Pages 可以使用：

```text
docs/
```

页面入口：

```text
docs/index.html
```

## 隐私

应用核心功能不需要联网，不会主动上传待办和评论。详见 [PRIVACY.md](PRIVACY.md)。

## License

MIT
