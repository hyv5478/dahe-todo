const state = {
  tasks: [],
  view: "active",
  selectedId: null,
  search: "",
  info: null,
};

const el = {
  versionLabel: document.querySelector("#versionLabel"),
  appNameTitle: document.querySelector("#appNameTitle"),
  dataPath: document.querySelector("#dataPath"),
  taskForm: document.querySelector("#taskForm"),
  taskTitle: document.querySelector("#taskTitle"),
  taskNote: document.querySelector("#taskNote"),
  taskTag: document.querySelector("#taskTag"),
  taskPriority: document.querySelector("#taskPriority"),
  tagOptions: document.querySelector("#tagOptions"),
  activeCount: document.querySelector("#activeCount"),
  doneCount: document.querySelector("#doneCount"),
  viewTabs: document.querySelectorAll(".view-tab"),
  searchInput: document.querySelector("#searchInput"),
  historyFilters: document.querySelector("#historyFilters"),
  historyFrom: document.querySelector("#historyFrom"),
  historyTo: document.querySelector("#historyTo"),
  historyGroup: document.querySelector("#historyGroup"),
  resetFilters: document.querySelector("#resetFilters"),
  listTitle: document.querySelector("#listTitle"),
  listSummary: document.querySelector("#listSummary"),
  taskList: document.querySelector("#taskList"),
  emptyList: document.querySelector("#emptyList"),
  detailEmpty: document.querySelector("#detailEmpty"),
  taskDetail: document.querySelector("#taskDetail"),
  reportDetail: document.querySelector("#reportDetail"),
  detailStatus: document.querySelector("#detailStatus"),
  detailTitle: document.querySelector("#detailTitle"),
  detailNote: document.querySelector("#detailNote"),
  detailMeta: document.querySelector("#detailMeta"),
  toggleDone: document.querySelector("#toggleDone"),
  deleteTask: document.querySelector("#deleteTask"),
  commentSection: document.querySelector("#commentSection"),
  newComment: document.querySelector("#newComment"),
  addComment: document.querySelector("#addComment"),
  commentList: document.querySelector("#commentList"),
  reportFrom: document.querySelector("#reportFrom"),
  reportTo: document.querySelector("#reportTo"),
  reportOutput: document.querySelector("#reportOutput"),
  copyReport: document.querySelector("#copyReport"),
  openDataFolder: document.querySelector("#openDataFolder"),
  exportData: document.querySelector("#exportData"),
  importData: document.querySelector("#importData"),
  openSettings: document.querySelector("#openSettings"),
  settingsDialog: document.querySelector("#settingsDialog"),
  closeSettings: document.querySelector("#closeSettings"),
  cancelSettings: document.querySelector("#cancelSettings"),
  saveSettings: document.querySelector("#saveSettings"),
  chooseDataDir: document.querySelector("#chooseDataDir"),
  settingAppName: document.querySelector("#settingAppName"),
  settingDataDir: document.querySelector("#settingDataDir"),
};

const priorityText = { high: "紧急", normal: "普通", low: "稍后" };

init();

async function init() {
  state.info = await window.daheTodo.appInfo();
  state.tasks = (await window.daheTodo.loadTasks()).map(normalizeTask).filter(Boolean);
  setDefaultReportRange();
  bindEvents();
  render();
}

function bindEvents() {
  el.taskForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    addTask();
  });

  el.viewTabs.forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      if (state.view === "report") state.selectedId = null;
      render();
    });
  });

  el.searchInput.addEventListener("input", () => {
    state.search = el.searchInput.value.trim().toLowerCase();
    render();
  });

  [el.historyFrom, el.historyTo, el.historyGroup, el.reportFrom, el.reportTo].forEach((input) => {
    input.addEventListener("change", render);
  });

  el.resetFilters.addEventListener("click", () => {
    el.historyFrom.value = "";
    el.historyTo.value = "";
    el.historyGroup.value = "none";
    render();
  });

  el.toggleDone.addEventListener("click", toggleSelectedDone);
  el.deleteTask.addEventListener("click", deleteSelectedTask);
  el.addComment.addEventListener("click", addSelectedComment);
  el.copyReport.addEventListener("click", copyReport);
  el.openDataFolder.addEventListener("click", () => window.daheTodo.openDataFolder());
  el.exportData.addEventListener("click", () => window.daheTodo.exportData());
  el.importData.addEventListener("click", importData);
  el.openSettings.addEventListener("click", openSettings);
  el.closeSettings.addEventListener("click", closeSettings);
  el.cancelSettings.addEventListener("click", closeSettings);
  el.chooseDataDir.addEventListener("click", chooseDataDir);
  el.saveSettings.addEventListener("click", saveSettings);
}

async function save() {
  await window.daheTodo.saveTasks(state.tasks);
}

function addTask() {
  const title = el.taskTitle.value.trim();
  if (!title) return;
  const task = {
    id: makeId(),
    title,
    note: el.taskNote.value.trim(),
    tag: el.taskTag.value.trim(),
    priority: el.taskPriority.value,
    createdAt: new Date().toISOString(),
    completedAt: null,
    comments: [],
  };
  state.tasks.unshift(task);
  state.selectedId = task.id;
  state.view = "active";
  el.taskForm.reset();
  el.taskPriority.value = "normal";
  el.taskTitle.focus();
  save();
  render();
}

function toggleSelectedDone() {
  const task = selectedTask();
  if (!task) return;
  task.completedAt = task.completedAt ? null : new Date().toISOString();
  if (task.completedAt) state.view = "history";
  save();
  render();
}

function deleteSelectedTask() {
  const task = selectedTask();
  if (!task) return;
  if (!confirm(`删除“${task.title}”？`)) return;
  state.tasks = state.tasks.filter((item) => item.id !== task.id);
  state.selectedId = null;
  save();
  render();
}

function addSelectedComment() {
  const task = selectedTask();
  if (!task) return;
  const text = el.newComment.value.trim();
  if (!text) return;
  task.comments.push({
    id: makeId(),
    text,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  });
  el.newComment.value = "";
  save();
  render();
}

async function importData() {
  const imported = await window.daheTodo.importData();
  if (!imported) return;
  state.tasks = imported.map(normalizeTask).filter(Boolean);
  state.selectedId = null;
  render();
}

function render() {
  el.versionLabel.textContent = `桌面端 · ${state.info.version}`;
  el.appNameTitle.textContent = state.info.appName;
  document.title = state.info.appName;
  el.dataPath.textContent = state.info.dataFile;
  renderCounts();
  renderTags();
  renderTabs();
  renderList();
  renderDetail();
  renderReport();
}

function openSettings() {
  el.settingAppName.value = state.info.appName;
  el.settingDataDir.value = state.info.dataDir;
  el.settingsDialog.showModal();
}

function closeSettings() {
  el.settingsDialog.close();
}

async function chooseDataDir() {
  const dir = await window.daheTodo.chooseDataDir();
  if (!dir) return;
  el.settingDataDir.value = dir;
}

async function saveSettings() {
  const appName = el.settingAppName.value.trim();
  const dataDir = el.settingDataDir.value.trim();
  if (!appName || !dataDir) {
    alert("项目名称和数据保存位置都不能为空。");
    return;
  }
  state.info = await window.daheTodo.saveSettings({ appName, dataDir }, state.tasks);
  closeSettings();
  render();
}

function renderCounts() {
  el.activeCount.textContent = state.tasks.filter((task) => !task.completedAt).length;
  el.doneCount.textContent = state.tasks.filter((task) => task.completedAt).length;
}

function renderTags() {
  const tags = [...new Set(state.tasks.map((task) => task.tag).filter(Boolean))].sort();
  el.tagOptions.replaceChildren(...tags.map((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    return option;
  }));
}

function renderTabs() {
  el.viewTabs.forEach((button) => button.classList.toggle("active", button.dataset.view === state.view));
  el.historyFilters.classList.toggle("hidden", state.view !== "history");
}

function visibleTasks() {
  let tasks = state.tasks;
  if (state.search) {
    tasks = tasks.filter(matchesSearch);
  } else if (state.view === "active") {
    tasks = tasks.filter((task) => !task.completedAt);
  } else if (state.view === "history") {
    tasks = tasks
      .filter((task) => task.completedAt)
      .filter((task) => withinRange(task.completedAt, el.historyFrom.value, el.historyTo.value));
  } else if (state.view === "report") {
    tasks = state.tasks.filter((task) => task.completedAt);
  }

  return tasks.sort((a, b) => new Date(getSortDate(b)) - new Date(getSortDate(a)));
}

function renderList() {
  const tasks = visibleTasks();
  const listTitle = state.search ? "搜索结果" : ({ active: "待办", history: "历史", report: "周报素材" }[state.view] || "事项");
  el.listTitle.textContent = listTitle;
  el.listSummary.textContent = state.search ? `找到 ${tasks.length} 条` : `${tasks.length} 条`;
  el.taskList.replaceChildren();
  el.emptyList.hidden = tasks.length > 0;

  if (!tasks.length) {
    el.emptyList.textContent = state.search ? "没有找到匹配事项。" : "没有事项。";
    return;
  }

  if (state.view === "history" && !state.search && el.historyGroup.value !== "none") {
    groupTasks(tasks, el.historyGroup.value).forEach((group) => {
      const header = document.createElement("div");
      header.className = "period-header";
      header.textContent = `${group.label} · ${group.tasks.length} 条`;
      el.taskList.append(header, ...group.tasks.map(renderTaskRow));
    });
    return;
  }

  el.taskList.replaceChildren(...tasks.map(renderTaskRow));
}

function renderTaskRow(task) {
  const row = document.createElement("article");
  row.className = `task-row${task.id === state.selectedId ? " selected" : ""}`;
  row.tabIndex = 0;
  row.addEventListener("click", () => {
    state.selectedId = task.id;
    if (state.view === "report") state.view = task.completedAt ? "history" : "active";
    render();
  });
  row.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      state.selectedId = task.id;
      render();
    }
  });

  const top = document.createElement("div");
  top.className = "task-row-top";

  const content = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = task.title;
  const note = document.createElement("p");
  note.textContent = task.note || "无补充";
  const meta = document.createElement("div");
  meta.className = "row-meta";
  meta.textContent = task.completedAt
    ? `办理 ${formatDateTime(task.completedAt)} · ${task.tag || "未分组"}`
    : `创建 ${formatDateTime(task.createdAt)} · ${task.tag || "未分组"}`;
  content.append(title, note, meta);

  const badge = document.createElement("span");
  badge.className = `priority ${task.priority}`;
  badge.textContent = priorityText[task.priority] || priorityText.normal;

  top.append(content, badge);
  row.append(top);
  return row;
}

function renderDetail() {
  const task = selectedTask();
  const showReport = state.view === "report" && !state.search;
  el.reportDetail.classList.toggle("hidden", !showReport);
  el.taskDetail.classList.toggle("hidden", showReport || !task);
  el.detailEmpty.classList.toggle("hidden", showReport || Boolean(task));
  if (!task || showReport) return;

  el.detailStatus.textContent = task.completedAt ? "已完成" : "待办中";
  el.detailTitle.textContent = task.title;
  el.detailNote.textContent = task.note || "没有补充说明。";
  el.toggleDone.textContent = task.completedAt ? "重新打开" : "完成";
  el.commentSection.classList.toggle("hidden", !task.completedAt);

  const items = [
    ["创建", formatDateTime(task.createdAt)],
    ["办理", task.completedAt ? formatDateTime(task.completedAt) : "未完成"],
    ["分组", task.tag || "未分组"],
    ["优先级", priorityText[task.priority] || priorityText.normal],
  ];
  el.detailMeta.replaceChildren(...items.flatMap(([key, value]) => {
    const dt = document.createElement("dt");
    dt.textContent = key;
    const dd = document.createElement("dd");
    dd.textContent = value;
    return [dt, dd];
  }));

  renderComments(task);
}

function renderComments(task) {
  if (!task.comments.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "还没有完成评论。";
    el.commentList.replaceChildren(empty);
    return;
  }

  el.commentList.replaceChildren(...task.comments.map((comment) => {
    const card = document.createElement("div");
    card.className = "comment-card";

    const meta = document.createElement("div");
    meta.className = "comment-meta";
    meta.textContent = `评论 ${formatDateTime(comment.createdAt)}${comment.updatedAt ? ` · 修改 ${formatDateTime(comment.updatedAt)}` : ""}`;

    const textarea = document.createElement("textarea");
    textarea.value = comment.text;

    const button = document.createElement("button");
    button.className = "quiet-button";
    button.type = "button";
    button.textContent = "保存修改";
    button.addEventListener("click", () => {
      comment.text = textarea.value.trim();
      comment.updatedAt = new Date().toISOString();
      save();
      render();
    });

    card.append(meta, textarea, button);
    return card;
  }));
}

function renderReport() {
  const tasks = state.tasks
    .filter((task) => task.completedAt)
    .filter((task) => withinRange(task.completedAt, el.reportFrom.value, el.reportTo.value))
    .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
  const lines = [`# 周报素材（${el.reportFrom.value || "开始"} 至 ${el.reportTo.value || "今天"}）`, ""];
  if (!tasks.length) {
    lines.push("本时间段暂无已完成事项。");
  } else {
    groupByDate(tasks).forEach(([date, dayTasks]) => {
      lines.push(`## ${date}`);
      dayTasks.forEach((task) => {
        lines.push(`- ${task.tag ? `【${task.tag}】` : ""}${task.title}`);
        task.comments.forEach((comment) => lines.push(`  - ${formatDateTime(comment.createdAt)}：${comment.text}`));
      });
      lines.push("");
    });
  }
  el.reportOutput.value = lines.join("\n").trim();
}

async function copyReport() {
  await navigator.clipboard.writeText(el.reportOutput.value);
  const original = el.copyReport.textContent;
  el.copyReport.textContent = "已复制";
  setTimeout(() => {
    el.copyReport.textContent = original;
  }, 1200);
}

function selectedTask() {
  return state.tasks.find((task) => task.id === state.selectedId) || null;
}

function matchesSearch(task) {
  return [task.title, task.note, task.tag, ...task.comments.map((comment) => comment.text)]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(state.search));
}

function withinRange(iso, from, to) {
  if (!iso) return false;
  const date = new Date(iso);
  if (from && date < new Date(`${from}T00:00:00`)) return false;
  if (to && date > new Date(`${to}T23:59:59`)) return false;
  return true;
}

function groupTasks(tasks, mode) {
  const map = new Map();
  tasks.forEach((task) => {
    const date = new Date(task.completedAt || task.createdAt);
    const key = mode === "month" ? monthKey(date) : weekKey(date);
    if (!map.has(key.id)) map.set(key.id, { label: key.label, tasks: [] });
    map.get(key.id).tasks.push(task);
  });
  return [...map.values()];
}

function groupByDate(tasks) {
  const map = new Map();
  tasks.forEach((task) => {
    const key = toDateInputValue(new Date(task.completedAt));
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(task);
  });
  return [...map.entries()];
}

function weekKey(date) {
  const start = new Date(date);
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - day + 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { id: toDateInputValue(start), label: `${toDateInputValue(start)} 至 ${toDateInputValue(end)}` };
}

function monthKey(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return { id: `${year}-${String(month).padStart(2, "0")}`, label: `${year}年${month}月` };
}

function getSortDate(task) {
  return task.completedAt || task.createdAt;
}

function normalizeTask(task) {
  if (!task || !task.title) return null;
  return {
    id: task.id || makeId(),
    title: String(task.title),
    note: task.note ? String(task.note) : "",
    tag: task.tag ? String(task.tag) : "",
    priority: ["high", "normal", "low"].includes(task.priority) ? task.priority : "normal",
    createdAt: task.createdAt || new Date().toISOString(),
    completedAt: task.completedAt || null,
    comments: Array.isArray(task.comments) ? task.comments.map(normalizeComment).filter(Boolean) : [],
  };
}

function normalizeComment(comment) {
  if (!comment || !comment.text) return null;
  return {
    id: comment.id || makeId(),
    text: String(comment.text),
    createdAt: comment.createdAt || new Date().toISOString(),
    updatedAt: comment.updatedAt || null,
  };
}

function setDefaultReportRange() {
  const now = new Date();
  const start = new Date(now);
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - day + 1);
  el.reportFrom.value = toDateInputValue(start);
  el.reportTo.value = toDateInputValue(now);
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function makeId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}
