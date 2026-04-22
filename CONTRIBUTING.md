# 贡献指南

欢迎提交 issue 和 pull request。

## 开发桌面端

```powershell
cd desktop
npm.cmd install --cache .npm-cache
npm.cmd run check
npm.cmd start
```

## 打包桌面端

```powershell
cd desktop
npm.cmd run dist
```

## 提交前检查

- 不提交个人数据文件 `data/tasks.json`
- 不提交 `desktop/release/`
- 不提交 `desktop/node_modules/`
- 运行 `npm.cmd run check`
