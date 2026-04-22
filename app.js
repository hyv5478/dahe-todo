const STORAGE_KEY = "local-todo-v1";
const API_URL = "/api/tasks";
const state = {
  tasks: [],
  view: "active",
  previousView: "active",
  search: "",
  fileStorage: location.protocol === "http:" || location.protocol === "https:",
};

const el = {
  todayLabel: document.querySelector("#todayLabel"),
  taskForm: document.querySelector("#taskForm"),
  taskTitle: document.querySelector("#taskTitle"),
  taskNote: document.querySelector("#taskNote"),
  taskTag: document.querySelector("#taskTag"),
  taskPriority: document.querySelector("#taskPriority"),
  tagOptions: document.querySelector("#tagOptions"),
  activeCount: document.querySelector("#activeCount"),
  doneCount: document.querySelector("#doneCount"),
  searchInput: document.querySelector("#searchInput"),
  activeView: document.querySelector("#activeView"),
  searchView: document.querySelector("#searchView"),
  historyView: document.querySelector("#historyView"),
  reportView: document.querySelector("#reportView"),
  activeList: document.querySelector("#activeList"),
  searchList: document.querySelector("#searchList"),
  historyList: document.querySelector("#historyList"),
  emptyActive: document.querySelector("#emptyActive"),
  emptySearch: document.querySelector("#emptySearch"),
  emptyHistory: document.querySelector("#emptyHistory"),
  searchSummary: document.querySelector("#searchSummary"),
  clearSearch: document.querySelector("#clearSearch"),
  taskTemplate: document.querySelector("#taskTemplate"),
  historyFrom: document.querySelector("#historyFrom"),
  historyTo: document.querySelector("#historyTo"),
  historyGroup: document.querySelector("#historyGroup"),
  reportFrom: document.querySelector("#reportFrom"),
  reportTo: document.querySelector("#reportTo"),
  reportOutput: document.querySelector("#reportOutput"),
  copyReport: document.querySelector("#copyReport"),
  downloadReport: document.querySelector("#downloadReport"),
  exportData: document.querySelector("#exportData"),
  importData: document.querySelector("#importData"),
  wipeDone: document.querySelector("#wipeDone"),
  clearFilters: document.querySelector("#clearFilters"),
};

const priorityText = {
  high: "紧急",
  normal: "普通",
  low: "稍后",
};

init();

async function init() {
  const now = new Date();
  el.todayLabel.textContent = formatDateTime(now, true);
  setDefaultDateRanges(now);
  bindEvents();
  state.tasks = await loadTasks();
  render();
}

function bindEvents() {
  el.taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addTask();
  });

  document.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      state.previousView = state.view;
      state.search = "";
      el.searchInput.value = "";
      render();
    });
  });

  el.searchInput.addEventListener("input", () => {
    state.search = el.searchInput.value.trim().toLowerCase();
    if (state.search) {
      if (state.view !== "search") state.previousView = state.view;
      state.view = "search";
    } else if (state.view === "search") {
      state.view = state.previousView || "active";
    }
    render();
  });

  [el.historyFrom, el.historyTo, el.historyGroup, el.reportFrom, el.reportTo].forEach((input) => {
    input.addEventListener("change", render);
  });

  el.clearFilters.addEventListener("click", () => {
    el.historyFrom.value = "";
    el.historyTo.value = "";
    el.historyGroup.value = "none";
    renderLists();
  });

  el.clearSearch.addEventListener("click", () => {
    state.search = "";
    el.searchInput.value = "";
    state.view = state.previousView || "active";
    render();
  });

  el.copyReport.addEventListener("click", copyReport);
  el.downloadReport.addEventListener("click", downloadReport);
  el.exportData.addEventListener("click", exportData);
  el.importData.addEventListener("change", importData);
  el.wipeDone.addEventListener("click", wipeDone);
}

function addTask() {
  const title = el.taskTitle.value.trim();
  if (!title) return;

  const task = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    title,
    note: el.taskNote.value.trim(),
    tag: el.taskTag.value.trim(),
    priority: el.taskPriority.value,
    createdAt: new Date().toISOString(),
    completedAt: null,
    comments: [],
  };

  state.tasks.unshift(task);
  saveTasks();
  el.taskForm.reset();
  el.taskPriority.value = "normal";
  el.taskTitle.focus();
  state.view = "active";
  render();
}

function completeTask(taskId) {
  const task = findTask(taskId);
  if (!task) return;
  task.completedAt = new Date().toISOString();
  saveTasks();
  state.view = "history";
  render();
}

function reopenTask(taskId) {
  const task = findTask(taskId);
  if (!task) return;
  task.completedAt = null;
  saveTasks();
  state.view = "active";
  render();
}

function deleteTask(taskId) {
  const task = findTask(taskId);
  if (!task) return;
  const ok = window.confirm(`删除“${task.title}”？`);
  if (!ok) return;
  state.tasks = state.tasks.filter((item) => item.id !== taskId);
  saveTasks();
  render();
}

function addComment(taskId, value) {
  const task = findTask(taskId);
  if (!task) return;
  const text = value.trim();
  if (!text) return;
  task.comments.push({
    id: makeId(),
    text,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  });
  saveTasks();
  render();
}

function updateComment(taskId, commentId, value) {
  const task = findTask(taskId);
  if (!task) return;
  const comment = task.comments.find((item) => item.id === commentId);
  if (!comment) return;
  comment.text = value.trim();
  comment.updatedAt = new Date().toISOString();
  saveTasks();
  renderReport();
}

function render() {
  renderTabs();
  renderCounts();
  renderTags();
  renderLists();
  renderReport();
}

function renderTabs() {
  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.view && state.view !== "search");
  });
  el.searchView.classList.toggle("hidden", state.view !== "search");
  el.activeView.classList.toggle("hidden", state.view !== "active");
  el.historyView.classList.toggle("hidden", state.view !== "history");
  el.reportView.classList.toggle("hidden", state.view !== "report");
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

function renderLists() {
  const activeTasks = state.tasks
    .filter((task) => !task.completedAt)
    .sort(activeSort);
  const historyTasks = state.tasks
    .filter((task) => task.completedAt)
    .filter((task) => withinRange(task.completedAt, el.historyFrom.value, el.historyTo.value))
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  const searchTasks = state.tasks
    .filter(matchesSearch)
    .sort((a, b) => new Date(getTaskSortDate(b)) - new Date(getTaskSortDate(a)));

  renderTaskList(el.activeList, activeTasks, false);
  renderHistoryList(historyTasks);
  el.searchList.replaceChildren(...searchTasks.map((task) => renderTask(task, Boolean(task.completedAt))));
  el.emptyActive.hidden = activeTasks.length > 0;
  el.emptyHistory.hidden = historyTasks.length > 0;
  el.emptySearch.hidden = searchTasks.length > 0;
  el.searchSummary.textContent = state.search ? `搜索“${el.searchInput.value.trim()}”：${searchTasks.length} 条` : "搜索结果";
}

function renderTaskList(container, tasks, isHistory) {
  container.replaceChildren(...tasks.map((task) => renderTask(task, isHistory)));
}

function renderHistoryList(tasks) {
  if (el.historyGroup.value === "none") {
    renderTaskList(el.historyList, tasks, true);
    return;
  }

  el.historyList.replaceChildren(...groupTasksByPeriod(tasks, el.historyGroup.value).map((group) => {
    const section = document.createElement("section");
    section.className = "period-group";

    const header = document.createElement("div");
    header.className = "period-header";
    header.innerHTML = `<strong>${group.label}</strong><span>${group.tasks.length} 条</span>`;

    const list = document.createElement("div");
    list.className = "task-list";
    renderTaskList(list, group.tasks, true);

    section.append(header, list);
    return section;
  }));
}

function renderTask(task, isHistory) {
  const node = el.taskTemplate.content.firstElementChild.cloneNode(true);
  node.classList.toggle("done", Boolean(task.completedAt));

  const checkButton = node.querySelector(".check-button");
  checkButton.title = isHistory ? "重新打开" : "完成";
  checkButton.addEventListener("click", () => isHistory ? reopenTask(task.id) : completeTask(task.id));

  node.querySelector("h2").textContent = task.title;
  node.querySelector(".note").textContent = task.note;

  const priority = node.querySelector(".priority");
  priority.textContent = priorityText[task.priority] || priorityText.normal;
  priority.classList.toggle("high", task.priority === "high");
  priority.classList.toggle("low", task.priority === "low");

  const meta = node.querySelector(".meta");
  meta.replaceChildren(...buildMeta(task).map((text) => {
    const span = document.createElement("span");
    span.textContent = text;
    return span;
  }));

  node.querySelector(".delete-button").addEventListener("click", () => deleteTask(task.id));

  const commentWrap = node.querySelector(".done-comment");
  const newCommentInput = node.querySelector(".new-comment-input");
  const addCommentButton = node.querySelector(".add-comment-button");
  const commentStatus = node.querySelector(".comment-status");
  const commentList = node.querySelector(".comment-list");
  addCommentButton.addEventListener("click", () => {
    addComment(task.id, newCommentInput.value);
    newCommentInput.value = "";
  });
  newCommentInput.addEventListener("input", () => {
    commentStatus.textContent = newCommentInput.value.trim() ? "准备追加一条新评论" : "可多次追加，旧评论也能改";
  });
  renderComments(commentList, task);
  commentWrap.hidden = !isHistory;

  return node;
}

function renderComments(container, task) {
  const comments = [...task.comments].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  if (!comments.length) {
    const empty = document.createElement("p");
    empty.className = "comment-empty";
    empty.textContent = "还没有评论。";
    container.replaceChildren(empty);
    return;
  }

  container.replaceChildren(...comments.map((comment) => {
    const item = document.createElement("div");
    item.className = "comment-item";

    const meta = document.createElement("div");
    meta.className = "comment-meta";
    meta.textContent = `评论 ${formatDateTime(comment.createdAt)}${comment.updatedAt ? `，修改 ${formatDateTime(comment.updatedAt)}` : ""}`;

    const textarea = document.createElement("textarea");
    textarea.rows = 2;
    textarea.value = comment.text;

    const actions = document.createElement("div");
    actions.className = "comment-actions";

    const status = document.createElement("span");
    status.className = "comment-status";
    status.textContent = "已保存";

    const button = document.createElement("button");
    button.className = "save-comment-button";
    button.type = "button";
    button.textContent = "保存修改";
    button.disabled = true;

    textarea.addEventListener("input", () => {
      status.textContent = "未保存";
      button.disabled = false;
    });

    button.addEventListener("click", () => {
      updateComment(task.id, comment.id, textarea.value);
      status.textContent = "已保存";
      button.disabled = true;
      meta.textContent = `评论 ${formatDateTime(comment.createdAt)}，修改 ${formatDateTime(comment.updatedAt)}`;
    });

    actions.append(status, button);
    item.append(meta, textarea, actions);
    return item;
  }));
}

function buildMeta(task) {
  const items = [`创建 ${formatDateTime(task.createdAt)}`];
  if (task.completedAt) items.push(`办理 ${formatDateTime(task.completedAt)}`);
  if (task.tag) items.push(task.tag);
  return items;
}

function renderReport() {
  const doneTasks = state.tasks
    .filter((task) => task.completedAt)
    .filter((task) => withinRange(task.completedAt, el.reportFrom.value, el.reportTo.value))
    .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));

  const from = el.reportFrom.value || "开始";
  const to = el.reportTo.value || "今天";
  const lines = [`# 周报素材（${from} 至 ${to}）`, ""];

  if (!doneTasks.length) {
    lines.push("本时间段暂无已完成事项。");
  } else {
    groupByDate(doneTasks).forEach(([date, tasks]) => {
      lines.push(`## ${date}`);
      tasks.forEach((task) => {
        const tag = task.tag ? `【${task.tag}】` : "";
        lines.push(`- ${tag}${task.title}`);
        task.comments.forEach((comment) => {
          lines.push(`  - ${formatDateTime(comment.createdAt)}：${comment.text}`);
        });
      });
      lines.push("");
    });
  }

  el.reportOutput.value = lines.join("\n").trim();
}

async function copyReport() {
  el.reportOutput.select();
  try {
    await navigator.clipboard.writeText(el.reportOutput.value);
    flashButton(el.copyReport, "已复制");
  } catch {
    document.execCommand("copy");
    flashButton(el.copyReport, "已选中");
  }
}

function downloadReport() {
  const blob = new Blob([el.reportOutput.value], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `weekly-report-${new Date().toISOString().slice(0, 10)}.md`;
  link.click();
  URL.revokeObjectURL(url);
}

function exportData() {
  const blob = new Blob([JSON.stringify(state.tasks, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `todo-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data)) throw new Error("backup must be an array");
      state.tasks = data.map(normalizeTask).filter(Boolean);
      saveTasks();
      render();
    } catch {
      window.alert("备份文件格式不对。");
    } finally {
      el.importData.value = "";
    }
  };
  reader.readAsText(file, "utf-8");
}

function wipeDone() {
  const count = state.tasks.filter((task) => task.completedAt).length;
  if (!count) return;
  const ok = window.confirm(`清理 ${count} 条已完成事项？建议先导出备份。`);
  if (!ok) return;
  state.tasks = state.tasks.filter((task) => !task.completedAt);
  saveTasks();
  render();
}

function setDefaultDateRanges(now) {
  const start = new Date(now);
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - day + 1);
  const startText = toDateInputValue(start);
  const endText = toDateInputValue(now);
  el.reportFrom.value = startText;
  el.reportTo.value = endText;
}

function matchesSearch(task) {
  if (!state.search) return true;
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

function getTaskSortDate(task) {
  const commentDates = task.comments.map((comment) => comment.updatedAt || comment.createdAt);
  return commentDates[commentDates.length - 1] || task.completedAt || task.createdAt;
}

function groupTasksByPeriod(tasks, mode) {
  const groups = new Map();
  tasks.forEach((task) => {
    const date = new Date(task.completedAt || task.createdAt);
    const key = mode === "month" ? monthKey(date) : weekKey(date);
    if (!groups.has(key.id)) groups.set(key.id, { label: key.label, tasks: [] });
    groups.get(key.id).tasks.push(task);
  });
  return [...groups.values()];
}

function monthKey(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return {
    id: `${year}-${String(month).padStart(2, "0")}`,
    label: `${year}年${month}月`,
  };
}

function weekKey(date) {
  const start = new Date(date);
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - day + 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    id: toDateInputValue(start),
    label: `${toDateInputValue(start)} 至 ${toDateInputValue(end)}`,
  };
}

function activeSort(a, b) {
  const priorityWeight = { high: 0, normal: 1, low: 2 };
  const weight = (priorityWeight[a.priority] ?? 1) - (priorityWeight[b.priority] ?? 1);
  if (weight !== 0) return weight;
  return new Date(b.createdAt) - new Date(a.createdAt);
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

async function loadTasks() {
  if (state.fileStorage) {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Cannot load tasks file");
      const data = await response.json();
      const tasks = Array.isArray(data) ? data.map(normalizeTask).filter(Boolean) : [];
      await migrateBrowserTasksIfNeeded(tasks);
      return state.tasks.length ? state.tasks : tasks;
    } catch {
      window.alert("本地数据文件读取失败，临时退回浏览器存储。请确认 start-todo.bat 正常启动。");
    }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data.map(normalizeTask).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  if (state.fileStorage) {
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state.tasks),
    }).catch(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
      window.alert("本地文件保存失败，已临时保存到浏览器。请检查本地服务窗口是否还开着。");
    });
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

async function migrateBrowserTasksIfNeeded(fileTasks) {
  if (fileTasks.length) return;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const browserTasks = JSON.parse(raw).map(normalizeTask).filter(Boolean);
    if (!browserTasks.length) return;
    state.tasks = browserTasks;
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(browserTasks),
    });
  } catch {
    // Browser storage migration is best-effort only.
  }
}

function normalizeTask(task) {
  if (!task || !task.title) return null;
  const comments = Array.isArray(task.comments) ? task.comments.map(normalizeComment).filter(Boolean) : [];
  if (task.doneComment && !comments.length) {
    comments.push({
      id: makeId(),
      text: String(task.doneComment),
      createdAt: task.completedAt || task.createdAt || new Date().toISOString(),
      updatedAt: null,
    });
  }
  return {
    id: task.id || String(Date.now() + Math.random()),
    title: String(task.title),
    note: task.note ? String(task.note) : "",
    tag: task.tag ? String(task.tag) : "",
    priority: ["high", "normal", "low"].includes(task.priority) ? task.priority : "normal",
    createdAt: task.createdAt || new Date().toISOString(),
    completedAt: task.completedAt || null,
    comments,
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

function findTask(taskId) {
  return state.tasks.find((task) => task.id === taskId);
}

function formatDateTime(value, withWeekday = false) {
  const date = value instanceof Date ? value : new Date(value);
  const options = withWeekday
    ? { year: "numeric", month: "2-digit", day: "2-digit", weekday: "long" }
    : { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" };
  return new Intl.DateTimeFormat("zh-CN", options).format(date);
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

function flashButton(button, text) {
  const original = button.textContent;
  button.textContent = text;
  setTimeout(() => {
    button.textContent = original;
  }, 1400);
}
