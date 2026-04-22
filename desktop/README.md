# 大何的待办事项桌面端

版本：`v0.3.2-priority-quadrants`

## 开发启动

```powershell
npm.cmd start
```

## 检查

```powershell
npm.cmd run check
```

## 打包

```powershell
npm.cmd run dist
```

安装包输出：

```text
desktop/release/大何的待办事项 Setup 0.3.2.exe
```

免安装可执行文件：

```text
desktop/release/win-unpacked/大何的待办事项.exe
```

## 数据文件

桌面端数据默认保存到：

```text
%USERPROFILE%\Documents\DaheTodo\tasks.json
```

如果这个文件为空，桌面端启动时会尝试从浏览器版的 `data/tasks.json` 迁移已有事项。

## 设置

点击右上角“设置”可以修改：

- 项目名称
- 数据保存位置

保存位置变化时，当前事项会写入新目录下的 `tasks.json`。
