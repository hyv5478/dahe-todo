# Versions

## v0.1-current-baseline

Snapshot before the second visual redesign pass.

- Local file persistence through `data/tasks.json`
- Active / history / report views
- Global search
- History grouping by week or month
- Multi-comment completed-task notes
- Two-column workbench UI that the user rejected as too plain

## v0.2-polished-desk

Second visual redesign pass.

- Visible version chip in the header
- Single-page desktop task desk instead of a heavy sidebar layout
- Compact capture area above the main workspace
- Search, tabs, history filters, task lists, and report area remain in one scanning flow
- Softer neutral palette with restrained green accent and fewer heavy shadows

## v0.3.0-desktop-alpha

New desktop application built with Electron.

- Keeps the browser version untouched
- Opens as a standalone Windows desktop window
- Can be packaged into a Windows installer
- Uses a three-pane desktop layout: navigation, task list, task detail/comments
- Saves data to `Documents/DaheTodo/tasks.json`
- Migrates existing browser-version tasks from `data/tasks.json` when desktop data is empty

## v0.3.1-desktop-settings

Desktop configuration pass.

- Replaced Electron default English menu with Chinese menu labels
- Added app settings dialog
- App title/project name is configurable
- Data storage folder is configurable
- Settings persist in Electron user data config

## v0.3.2-priority-quadrants

Desktop priority classification pass.

- Replaced old high/normal/low priority with four Eisenhower-style categories
- Added active-task priority filter tabs: all plus four priority categories
- Migrates old priorities automatically: high, normal, low
