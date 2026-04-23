# Dahe Todo

[简体中文](README.md) · **English**

A local-first Windows todo app for quick capture, inserted tasks, Pomodoro focus, completion comments, weekly achievements, and report material collection.

[Website](https://hyv5478.github.io/dahe-todo/) · [GitHub Releases](https://github.com/hyv5478/dahe-todo/releases/latest)

![Desktop preview](docs/assets/desktop-preview-en.svg)

## Current Version

- Desktop version: `v0.5.0-achievements`
- Windows installer: `大何的待办事项 Setup 0.5.0.exe`
- Storage model: local JSON files by default

## Capability Areas

### Capture

- Quickly capture sudden tasks before they disappear.
- Store title, note, group, and priority.
- Use four priority quadrants: important urgent, important not urgent, not important urgent, and not important not urgent.

### Execute

- Filter active todos by priority.
- Start a task-bound Pomodoro and track completed sessions, interruptions, and focus minutes.
- Convert certain interruptions into a new important urgent todo.

### Record

- Add multiple completion comments after a task is done.
- Keep creation time, completion time, group, priority, focus history, and interruption history.

### Review

- Review history by week or month.
- Generate report material with completed tasks, comments, focus time, interruption count, and achievements.
- v0.5.0 adds weekly achievements to make progress visible.

## Local Data

Default desktop data directory:

```text
%USERPROFILE%\Documents\DaheTodo
```

Core data files:

```text
tasks.json
focus-sessions.json
achievements.json
```

The repository includes privacy checks and a pre-push hook to prevent local task data, focus sessions, achievements, installers, caches, and tool folders from being committed.

## Desktop Development

```powershell
cd desktop
npm.cmd install --cache .npm-cache
npm.cmd run check
npm.cmd run dist
```

Installer output:

```text
desktop/release/大何的待办事项 Setup 0.5.0.exe
```

## Website

GitHub Pages uses:

```text
docs/
```

Chinese page: `docs/index.html`

English page: `docs/en.html`

## Privacy

The project does not require an account, connect to a knowledge base, or upload todo content by default. See [PRIVACY.md](PRIVACY.md).

## License

MIT
