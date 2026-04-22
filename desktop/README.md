# 大何的待办事项桌面端

当前版本：`v0.4.1-focus-completion`

## 启动

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
desktop/release/大何的待办事项 Setup 0.4.1.exe
```

免安装版本：

```text
desktop/release/win-unpacked/大何的待办事项.exe
```

## 本地数据

默认数据目录：

```text
%USERPROFILE%\Documents\DaheTodo
```

数据文件：

```text
tasks.json
focus-sessions.json
```

## 0.4 番茄钟

- 每个番茄钟绑定到一个未完成任务。
- 同一时间只能有一个活动番茄。
- 专注结束后可以开始休息或跳过休息。
- 放弃本轮时需要记录中断原因。
- 周报会统计本期番茄数和专注小时数。
- 设置里可以调整专注时长、休息时长和结束提醒。
