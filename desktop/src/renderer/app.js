const state = {
  tasks: [],
  focusSessions: [],
  view: "active",
  selectedId: null,
  search: "",
  priorityFilter: "all",
  info: null,
  activeFocusId: null,
  timerId: null,
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
  todayFocusCount: document.querySelector("#todayFocusCount"),
  viewTabs: document.querySelectorAll(".view-tab"),
  searchInput: document.querySelector("#searchInput"),
  priorityFilters: document.querySelector("#priorityFilters"),
  priorityFilterButtons: document.querySelectorAll(".priority-filter"),
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
  focusBar: document.querySelector("#focusBar"),
  focusBarMode: document.querySelector("#focusBarMode"),
  focusBarTask: document.querySelector("#focusBarTask"),
  focusBarTime: document.querySelector("#focusBarTime"),
  focusBarAbort: document.querySelector("#focusBarAbort"),
  focusPanelSummary: document.querySelector("#focusPanelSummary"),
  focusRing: document.querySelector("#focusRing"),
  focusTime: document.querySelector("#focusTime"),
  startFocus: document.querySelector("#startFocus"),
  startBreak: document.querySelector("#startBreak"),
  skipBreak: document.querySelector("#skipBreak"),
  abortFocus: document.querySelector("#abortFocus"),
  focusStats: document.querySelector("#focusStats"),
  focusHistory: document.querySelector("#focusHistory"),
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
  settingFocusMinutes: document.querySelector("#settingFocusMinutes"),
  settingBreakMinutes: document.querySelector("#settingBreakMinutes"),
  settingNotify: document.querySelector("#settingNotify"),
  interruptDialog: document.querySelector("#interruptDialog"),
  closeInterrupt: document.querySelector("#closeInterrupt"),
  interruptOptions: document.querySelectorAll(".interrupt-option"),
  interruptOtherBox: document.querySelector("#interruptOtherBox"),
  interruptOtherDetail: document.querySelector("#interruptOtherDetail"),
  confirmOtherInterrupt: document.querySelector("#confirmOtherInterrupt"),
  cancelOtherInterrupt: document.querySelector("#cancelOtherInterrupt"),
};

const priorityOptions = [
  "important-urgent",
  "important-not-urgent",
  "not-important-urgent",
  "not-important-not-urgent",
];

const priorityText = {
  "important-urgent": "重要紧急",
  "important-not-urgent": "重要不紧急",
  "not-important-urgent": "不重要紧急",
  "not-important-not-urgent": "不重要不紧急",
};

const legacyPriorityMap = {
  high: "important-urgent",
  normal: "important-not-urgent",
  low: "not-important-not-urgent",
};

const focusDoneStatuses = new Set(["break-ready", "completed", "break-skipped", "task-completed"]);
const focusOpenStatuses = new Set(["focus-running", "break-ready", "break-running"]);
const focusTrackedStatuses = new Set(["break-ready", "completed", "break-skipped", "task-completed", "interrupted"]);

init();

async function init() {
  state.info = await window.daheTodo.appInfo();
  state.tasks = (await window.daheTodo.loadTasks()).map(normalizeTask).filter(Boolean);
  state.focusSessions = (await window.daheTodo.loadFocusSessions()).map(normalizeFocusSession).filter(Boolean);
  state.activeFocusId = findOpenFocusSession()?.id || null;
  setDefaultReportRange();
  bindEvents();
  startTimerLoop();
  render();
}

function bindEvents() {
  el.taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addTask();
  });

  el.viewTabs.forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      if (state.view === "report") state.selectedId = null;
      if (state.view !== "active") state.priorityFilter = "all";
      render();
    });
  });

  el.priorityFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.priorityFilter = button.dataset.priorityFilter;
      state.view = "active";
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
  el.startFocus.addEventListener("click", startFocusForSelectedTask);
  el.startBreak.addEventListener("click", startBreak);
  el.skipBreak.addEventListener("click", skipBreak);
  el.abortFocus.addEventListener("click", openInterruptDialog);
  el.focusBarAbort.addEventListener("click", openInterruptDialog);
  el.closeInterrupt.addEventListener("click", closeInterruptDialog);
  el.interruptOptions.forEach((button) =>
    button.addEventListener("click", () => handleInterruptReason(button.dataset.interruptKind || button.dataset.reason)),
  );
  el.confirmOtherInterrupt.addEventListener("click", confirmOtherInterrupt);
  el.cancelOtherInterrupt.addEventListener("click", hideOtherInterruptBox);
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

async function saveTasks() {
  await window.daheTodo.saveTasks(state.tasks);
}

async function saveFocusSessions() {
  await window.daheTodo.saveFocusSessions(state.focusSessions);
}

function addTask() {
  const title = el.taskTitle.value.trim();
  if (!title) return;
  const task = createTask({
    title,
    note: el.taskNote.value.trim(),
    tag: el.taskTag.value.trim(),
    priority: el.taskPriority.value,
  });
  insertTask(task);
  el.taskForm.reset();
  el.taskPriority.value = "important-urgent";
  el.taskTitle.focus();
  saveTasks();
  render();
}

function createTask({ title, note = "", tag = "", priority = "important-urgent" }) {
  return {
    id: makeId("task"),
    title: String(title).trim(),
    note: String(note || "").trim(),
    tag: String(tag || "").trim(),
    priority: normalizePriority(priority),
    createdAt: new Date().toISOString(),
    completedAt: null,
    comments: [],
  };
}

function insertTask(task) {
  state.tasks.unshift(task);
  state.selectedId = task.id;
  state.view = "active";
}

function toggleSelectedDone() {
  const task = selectedTask();
  if (!task) return;
  if (!task.completedAt) {
    settleFocusForCompletedTask(task);
  }
  task.completedAt = task.completedAt ? null : new Date().toISOString();
  if (task.completedAt) state.view = "history";
  saveTasks();
  render();
}

function settleFocusForCompletedTask(task) {
  const session = activeFocusSession();
  if (!session || session.taskId !== task.id) return;
  const now = new Date().toISOString();
  if (session.status === "focus-running") {
    session.status = "task-completed";
    session.focusEndedAt = now;
    session.breakEndedAt = now;
    state.activeFocusId = null;
    window.daheTodo.notifyFocusEnded({
      title: "任务已完成",
      body: `「${session.taskTitleSnapshot}」已完成，本轮番茄已自动收尾。`,
    });
  } else if (session.status === "break-ready") {
    session.status = "break-skipped";
    session.breakEndedAt = now;
    state.activeFocusId = null;
  } else if (session.status === "break-running") {
    session.status = "completed";
    session.breakEndedAt = now;
    state.activeFocusId = null;
  }
  saveFocusSessions();
}

function deleteSelectedTask() {
  const task = selectedTask();
  if (!task) return;
  const active = activeFocusSession();
  if (active && active.taskId === task.id && focusOpenStatuses.has(active.status)) {
    alert("当前任务正在专注中，先完成或放弃本轮番茄。");
    return;
  }
  if (!confirm(`确定删除「${task.title}」吗？专注历史会保留任务快照。`)) return;
  state.tasks = state.tasks.filter((item) => item.id !== task.id);
  state.selectedId = null;
  saveTasks();
  render();
}

function startFocusForSelectedTask() {
  const task = selectedTask();
  if (!task || task.completedAt) return;
  if (activeFocusSession()) {
    alert("同一时间只能守住一个番茄钟。");
    return;
  }
  const now = new Date();
  const session = {
    id: makeId("focus"),
    taskId: task.id,
    taskTitleSnapshot: task.title,
    taskPrioritySnapshot: task.priority,
    taskTagSnapshot: task.tag,
    localDate: toDateInputValue(now),
    plannedFocusMinutes: state.info.focusMinutes,
    plannedBreakMinutes: state.info.breakMinutes,
    startedAt: now.toISOString(),
    focusEndsAt: new Date(now.getTime() + state.info.focusMinutes * 60 * 1000).toISOString(),
    focusEndedAt: null,
    breakStartedAt: null,
    breakEndsAt: null,
    breakEndedAt: null,
    status: "focus-running",
    interruptReason: null,
  };
  state.focusSessions.unshift(session);
  state.activeFocusId = session.id;
  saveFocusSessions();
  render();
}

function completeFocus(session) {
  session.status = "break-ready";
  session.focusEndedAt = session.focusEndedAt || new Date().toISOString();
  window.daheTodo.notifyFocusEnded({
    title: "番茄钟完成",
    body: `「${session.taskTitleSnapshot}」完成一轮专注，可以休息一下。`,
  });
  saveFocusSessions();
}

function startBreak() {
  const session = activeFocusSession();
  if (!session || session.status !== "break-ready") return;
  const now = new Date();
  session.status = "break-running";
  session.breakStartedAt = now.toISOString();
  session.breakEndsAt = new Date(now.getTime() + session.plannedBreakMinutes * 60 * 1000).toISOString();
  saveFocusSessions();
  render();
}

function completeBreak(session) {
  session.status = "completed";
  session.breakEndedAt = session.breakEndedAt || new Date().toISOString();
  state.activeFocusId = null;
  window.daheTodo.notifyFocusEnded({
    title: "休息结束",
    body: "休息时间到了，可以开始下一轮。",
  });
  saveFocusSessions();
}

function skipBreak() {
  const session = activeFocusSession();
  if (!session || session.status !== "break-ready") return;
  session.status = "break-skipped";
  session.breakEndedAt = new Date().toISOString();
  state.activeFocusId = null;
  saveFocusSessions();
  render();
}

function openInterruptDialog() {
  if (!activeFocusSession()) return;
  hideOtherInterruptBox();
  el.interruptDialog.showModal();
}

function closeInterruptDialog() {
  hideOtherInterruptBox();
  if (el.interruptDialog.open) el.interruptDialog.close();
}

function hideOtherInterruptBox() {
  el.interruptOtherBox.classList.add("hidden");
  el.interruptOtherDetail.value = "";
}

function showOtherInterruptBox() {
  el.interruptOtherBox.classList.remove("hidden");
  el.interruptOtherDetail.focus();
}

function handleInterruptReason(reason) {
  if (reason === "other") {
    showOtherInterruptBox();
    return;
  }
  abortActiveFocus(reason);
}

function confirmOtherInterrupt() {
  const detail = el.interruptOtherDetail.value.trim();
  if (!detail) {
    el.interruptOtherDetail.focus();
    return;
  }
  abortActiveFocus(`其他：${detail}`);
  const task = createTask({
    title: detail,
    note: "番茄钟中断时自动生成，请尽快处理。",
    tag: "插入事项",
    priority: "important-urgent",
  });
  insertTask(task);
  saveTasks();
  render();
}

function abortActiveFocus(reason) {
  const session = activeFocusSession();
  if (!session) return;
  const now = new Date().toISOString();
  session.status = "interrupted";
  session.focusEndedAt = session.focusEndedAt || now;
  session.breakEndedAt = session.breakEndedAt || null;
  session.interruptReason = reason || "其他";
  state.activeFocusId = null;
  closeInterruptDialog();
  saveFocusSessions();
  render();
}

function startTimerLoop() {
  if (state.timerId) clearInterval(state.timerId);
  state.timerId = setInterval(() => {
    advanceTimerIfNeeded();
    renderFocus();
  }, 1000);
}

function advanceTimerIfNeeded() {
  const session = activeFocusSession();
  if (!session) return;
  const now = Date.now();
  if (session.status === "focus-running" && new Date(session.focusEndsAt).getTime() <= now) {
    completeFocus(session);
    render();
  }
  if (session.status === "break-running" && new Date(session.breakEndsAt).getTime() <= now) {
    completeBreak(session);
    render();
  }
}

function addSelectedComment() {
  const task = selectedTask();
  if (!task) return;
  const text = el.newComment.value.trim();
  if (!text) return;
  task.comments.push({
    id: makeId("comment"),
    text,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  });
  el.newComment.value = "";
  saveTasks();
  render();
}

async function importData() {
  const imported = await window.daheTodo.importData();
  if (!imported) return;
  const tasks = Array.isArray(imported) ? imported : imported.tasks;
  const focusSessions = Array.isArray(imported.focusSessions) ? imported.focusSessions : [];
  state.tasks = tasks.map(normalizeTask).filter(Boolean);
  state.focusSessions = focusSessions.map(normalizeFocusSession).filter(Boolean);
  state.activeFocusId = findOpenFocusSession()?.id || null;
  state.selectedId = null;
  render();
}

function render() {
  el.versionLabel.textContent = `桌面端 · ${state.info.version}`;
  el.appNameTitle.textContent = state.info.appName;
  document.title = state.info.appName;
  el.dataPath.textContent = `${state.info.dataFile} · 专注记录 ${state.info.focusFile}`;
  renderCounts();
  renderTags();
  renderTabs();
  renderList();
  renderDetail();
  renderReport();
  renderFocus();
}

function openSettings() {
  el.settingAppName.value = state.info.appName;
  el.settingDataDir.value = state.info.dataDir;
  el.settingFocusMinutes.value = state.info.focusMinutes;
  el.settingBreakMinutes.value = state.info.breakMinutes;
  el.settingNotify.checked = state.info.notifyOnFocusEnd;
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
    alert("应用名称和数据目录都不能为空。");
    return;
  }
  state.info = await window.daheTodo.saveSettings({
    appName,
    dataDir,
    focusMinutes: Number(el.settingFocusMinutes.value),
    breakMinutes: Number(el.settingBreakMinutes.value),
    notifyOnFocusEnd: el.settingNotify.checked,
  }, state.tasks, state.focusSessions);
  closeSettings();
  render();
}

function renderCounts() {
  el.activeCount.textContent = state.tasks.filter((task) => !task.completedAt).length;
  el.doneCount.textContent = state.tasks.filter((task) => task.completedAt).length;
  el.todayFocusCount.textContent = completedFocusCountForRange(todayStart(), todayEnd());
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
  el.priorityFilters.classList.toggle("hidden", state.view !== "active" || Boolean(state.search));
  el.priorityFilterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.priorityFilter === state.priorityFilter);
  });
}

function visibleTasks() {
  let tasks = state.tasks;
  if (state.search) {
    tasks = tasks.filter(matchesSearch);
  } else if (state.view === "active") {
    tasks = tasks.filter((task) => !task.completedAt);
    if (state.priorityFilter !== "all") tasks = tasks.filter((task) => task.priority === state.priorityFilter);
  } else if (state.view === "history") {
    tasks = tasks.filter((task) => task.completedAt).filter((task) => withinRange(task.completedAt, el.historyFrom.value, el.historyTo.value));
  } else if (state.view === "report") {
    tasks = state.tasks.filter((task) => task.completedAt);
  }
  return tasks.sort((a, b) => new Date(getSortDate(b)) - new Date(getSortDate(a)));
}

function renderList() {
  const tasks = visibleTasks();
  const titleMap = { active: "待办", history: "历史", report: "周报素材" };
  el.listTitle.textContent = state.search ? "搜索结果" : titleMap[state.view] || "事项";
  const filterText = state.view === "active" && !state.search && state.priorityFilter !== "all" ? ` · ${priorityText[state.priorityFilter]}` : "";
  el.listSummary.textContent = state.search ? `找到 ${tasks.length} 条` : `${tasks.length} 条${filterText}`;
  el.taskList.replaceChildren();
  el.emptyList.hidden = tasks.length > 0;

  if (!tasks.length) {
    el.emptyList.textContent = state.search ? "没有找到相关事项。" : "暂无事项。";
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
  const focusCount = completedSessionsForTask(task.id).length;
  const timeText = task.completedAt ? `办理 ${formatDateTime(task.completedAt)}` : `创建 ${formatDateTime(task.createdAt)}`;
  meta.textContent = `${timeText} · ${task.tag || "未分组"} · ${focusCount} 个番茄`;
  content.append(title, note, meta);

  const badge = document.createElement("span");
  badge.className = `priority ${task.priority}`;
  badge.textContent = priorityText[task.priority] || "重要不紧急";
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
  el.detailNote.textContent = task.note || "暂无补充。";
  el.toggleDone.textContent = task.completedAt ? "重新打开" : "完成";
  el.commentSection.classList.toggle("hidden", !task.completedAt);

  const items = [
    ["创建", formatDateTime(task.createdAt)],
    ["办理", task.completedAt ? formatDateTime(task.completedAt) : "未完成"],
    ["分组", task.tag || "未分组"],
    ["优先级", priorityText[task.priority] || "重要不紧急"],
    ["番茄", `${completedSessionsForTask(task.id).length} 个`],
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

function renderFocus() {
  const task = selectedTask();
  const active = activeFocusSession();
  const selectedHasActive = task && active && active.taskId === task.id;
  const todayCount = completedFocusCountForRange(todayStart(), todayEnd());

  el.focusBar.classList.toggle("hidden", !active);
  if (active) {
    el.focusBarMode.textContent = focusModeText(active);
    el.focusBarTask.textContent = active.taskTitleSnapshot;
    el.focusBarTime.textContent = remainingText(active);
    el.focusBarAbort.classList.toggle("hidden", active.status === "break-ready");
  }

  if (!task) return;
  const taskSessions = sessionsForTask(task.id);
  const taskCount = completedSessionsForTask(task.id).length;
  const interruptedCount = taskSessions.filter((session) => session.status === "interrupted").length;
  const totalMinutes = totalFocusMinutesForTask(task.id);
  el.focusStats.textContent = `本任务 ${taskCount} 个完整番茄 · 中断 ${interruptedCount} 次 · 累计 ${formatMinuteText(totalMinutes)} · 今日 ${todayCount} 个番茄`;
  renderFocusHistory(task);
  el.startFocus.classList.toggle("hidden", Boolean(active) || Boolean(task.completedAt));
  el.startBreak.classList.toggle("hidden", !selectedHasActive || active.status !== "break-ready");
  el.skipBreak.classList.toggle("hidden", !selectedHasActive || active.status !== "break-ready");
  el.abortFocus.classList.toggle("hidden", !selectedHasActive || active.status === "break-ready");

  const displaySession = selectedHasActive ? active : null;
  if (!displaySession) {
    if (task.completedAt) {
      el.focusPanelSummary.textContent = `已完成：累计 ${formatMinuteText(totalMinutes)}，中途打断 ${interruptedCount} 次。`;
      el.focusTime.textContent = formatCompactMinuteText(totalMinutes);
      el.focusRing.style.setProperty("--progress", totalMinutes > 0 ? "360deg" : "0deg");
    } else {
      el.focusPanelSummary.textContent = `专注 ${state.info.focusMinutes} 分钟，休息 ${state.info.breakMinutes} 分钟。`;
      el.focusTime.textContent = `${String(state.info.focusMinutes).padStart(2, "0")}:00`;
      el.focusRing.style.setProperty("--progress", "0deg");
    }
    el.focusRing.dataset.mode = "idle";
    return;
  }

  el.focusPanelSummary.textContent = focusPanelText(displaySession);
  el.focusTime.textContent = remainingText(displaySession);
  el.focusRing.style.setProperty("--progress", `${progressDegrees(displaySession)}deg`);
  el.focusRing.dataset.mode = displaySession.status.startsWith("break") ? "break" : "focus";
}

function renderComments(task) {
  if (!task.comments.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "还没有完成备注。";
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
      saveTasks();
      render();
    });
    card.append(meta, textarea, button);
    return card;
  }));
}

function buildFocusHistoryRows(sessions) {
  const rows = [];
  const interruptGroups = new Map();
  sessions.forEach((session) => {
    const minutes = focusSessionMinutes(session);
    if (session.status !== "interrupted") {
      rows.push({
        status: session.status,
        label: focusStatusText(session),
        latestAt: session.startedAt,
        minutes,
        reason: session.interruptReason || "",
        count: 1,
      });
      return;
    }

    const reason = session.interruptReason || "其他";
    const key = `interrupted:${reason}`;
    const startedAt = session.startedAt || session.focusEndedAt;
    if (!interruptGroups.has(key)) {
      const group = {
        status: "interrupted",
        label: focusStatusText(session),
        latestAt: startedAt,
        minutes: 0,
        reason,
        count: 0,
      };
      interruptGroups.set(key, group);
      rows.push(group);
    }

    const group = interruptGroups.get(key);
    group.count += 1;
    group.minutes += minutes;
    if (new Date(startedAt).getTime() > new Date(group.latestAt).getTime()) {
      group.latestAt = startedAt;
    }
  });

  return rows.sort((a, b) => new Date(b.latestAt) - new Date(a.latestAt));
}

function renderFocusHistory(task) {
  const sessions = sessionsForTask(task.id)
    .filter((session) => session.focusEndedAt || focusOpenStatuses.has(session.status))
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
  if (!sessions.length) {
    el.focusHistory.replaceChildren();
    return;
  }

  const title = document.createElement("h4");
  title.textContent = "专注记录";
  const list = document.createElement("div");
  list.className = "focus-history-list";
  buildFocusHistoryRows(sessions)
    .slice(0, 8)
    .forEach((row) => {
      const item = document.createElement("div");
      item.className = `focus-history-item ${row.status}`;
      const status = document.createElement("strong");
      status.textContent = row.status === "interrupted" && row.count > 1 ? `${row.label} x${row.count}` : row.label;
      const meta = document.createElement("span");
      const reason = row.reason ? ` · ${row.reason}` : "";
      meta.textContent = `${formatDateTime(row.latestAt)} · ${formatMinuteText(row.minutes)}${reason}`;
      item.append(status, meta);
      list.append(item);
    });

  el.focusHistory.replaceChildren(title, list);
}

function renderReport() {
  const tasks = state.tasks
    .filter((task) => task.completedAt)
    .filter((task) => withinRange(task.completedAt, el.reportFrom.value, el.reportTo.value))
    .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
  const sessions = trackedSessionsForRange(el.reportFrom.value, el.reportTo.value);
  const completedCount = sessions.filter((session) => focusDoneStatuses.has(session.status)).length;
  const interruptedCount = sessions.filter((session) => session.status === "interrupted").length;
  const minutes = sessions.reduce((sum, session) => sum + focusSessionMinutes(session), 0);
  const lines = [`# 周报素材（${el.reportFrom.value || "开始"} 到 ${el.reportTo.value || "今天"}）`, ""];
  lines.push(`本期完成 ${tasks.length} 项任务，完整番茄 ${completedCount} 个，中断 ${interruptedCount} 次，累计约 ${formatHours(minutes)} 小时专注。`, "");
  if (!tasks.length) {
    lines.push("本期还没有已完成事项。");
  } else {
    groupByDate(tasks).forEach(([date, dayTasks]) => {
      lines.push(`## ${date}`);
      dayTasks.forEach((task) => {
        const taskSessions = trackedSessionsForTask(task.id).filter((session) => withinRange(session.focusEndedAt || session.startedAt, el.reportFrom.value, el.reportTo.value));
        const focusCount = taskSessions.filter((session) => focusDoneStatuses.has(session.status)).length;
        const taskMinutes = taskSessions.reduce((sum, session) => sum + focusSessionMinutes(session), 0);
        lines.push(`- ${task.tag ? `【${task.tag}】` : ""}${task.title}${taskSessions.length ? `（${focusCount} 个番茄，${formatMinuteText(taskMinutes)}）` : ""}`);
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

function activeFocusSession() {
  return state.focusSessions.find((session) => session.id === state.activeFocusId && focusOpenStatuses.has(session.status)) || null;
}

function findOpenFocusSession() {
  return state.focusSessions.find((session) => focusOpenStatuses.has(session.status)) || null;
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

function completedSessionsForTask(taskId) {
  return state.focusSessions.filter((session) => session.taskId === taskId && focusDoneStatuses.has(session.status));
}

function sessionsForTask(taskId) {
  return state.focusSessions.filter((session) => session.taskId === taskId);
}

function completedSessionsForRange(from, to) {
  return state.focusSessions.filter((session) => focusDoneStatuses.has(session.status)).filter((session) => withinRange(session.focusEndedAt || session.startedAt, from, to));
}

function trackedSessionsForTask(taskId) {
  return state.focusSessions.filter((session) => session.taskId === taskId && focusTrackedStatuses.has(session.status));
}

function trackedSessionsForRange(from, to) {
  return state.focusSessions.filter((session) => focusTrackedStatuses.has(session.status)).filter((session) => withinRange(session.focusEndedAt || session.startedAt, from, to));
}

function completedFocusCountForRange(from, to) {
  return completedSessionsForRange(from, to).length;
}

function totalFocusMinutesForTask(taskId) {
  return sessionsForTask(taskId).reduce((sum, session) => sum + focusSessionMinutes(session), 0);
}

function focusSessionMinutes(session) {
  const start = new Date(session.startedAt).getTime();
  const endValue = session.focusEndedAt || (focusOpenStatuses.has(session.status) ? new Date().toISOString() : session.startedAt);
  const end = new Date(endValue).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return Math.ceil((end - start) / 60000);
}

function focusStatusText(session) {
  if (session.status === "interrupted") return "中断";
  if (session.status === "task-completed") return "任务完成";
  if (session.status === "break-ready") return "专注完成";
  if (session.status === "completed") return "完成休息";
  if (session.status === "break-skipped") return "跳过休息";
  if (session.status === "focus-running") return "专注中";
  if (session.status === "break-running") return "休息中";
  return "记录";
}

function focusModeText(session) {
  if (session.status === "focus-running") return "专注中";
  if (session.status === "break-ready") return "专注完成";
  if (session.status === "break-running") return "休息中";
  return "番茄钟";
}

function focusPanelText(session) {
  if (session.status === "focus-running") return "正在守住当前任务。";
  if (session.status === "break-ready") return "完成 1 个番茄，可以开始休息。";
  if (session.status === "break-running") return "休息中，给脑子缓一口气。";
  return "开始一轮专注，把当前任务守住。";
}

function remainingText(session) {
  if (session.status === "break-ready") return "完成";
  const end = session.status === "break-running" ? session.breakEndsAt : session.focusEndsAt;
  const ms = Math.max(0, new Date(end).getTime() - Date.now());
  return formatDuration(Math.ceil(ms / 1000));
}

function progressDegrees(session) {
  if (session.status === "break-ready") return 360;
  const start = new Date(session.status === "break-running" ? session.breakStartedAt : session.startedAt).getTime();
  const end = new Date(session.status === "break-running" ? session.breakEndsAt : session.focusEndsAt).getTime();
  const total = Math.max(1, end - start);
  const elapsed = Math.min(total, Math.max(0, Date.now() - start));
  return Math.round((elapsed / total) * 360);
}

function normalizeTask(task) {
  if (!task || !task.title) return null;
  return {
    id: task.id || makeId("task"),
    title: String(task.title),
    note: task.note ? String(task.note) : "",
    tag: task.tag ? String(task.tag) : "",
    priority: normalizePriority(task.priority),
    createdAt: task.createdAt || new Date().toISOString(),
    completedAt: task.completedAt || null,
    comments: Array.isArray(task.comments) ? task.comments.map(normalizeComment).filter(Boolean) : [],
  };
}

function normalizePriority(priority) {
  if (priorityOptions.includes(priority)) return priority;
  if (legacyPriorityMap[priority]) return legacyPriorityMap[priority];
  return "important-not-urgent";
}

function normalizeComment(comment) {
  if (!comment || !comment.text) return null;
  return {
    id: comment.id || makeId("comment"),
    text: String(comment.text),
    createdAt: comment.createdAt || new Date().toISOString(),
    updatedAt: comment.updatedAt || null,
  };
}

function normalizeFocusSession(session) {
  if (!session || !session.id || !session.taskId) return null;
  return {
    id: String(session.id),
    taskId: String(session.taskId),
    taskTitleSnapshot: session.taskTitleSnapshot ? String(session.taskTitleSnapshot) : "未命名任务",
    taskPrioritySnapshot: normalizePriority(session.taskPrioritySnapshot),
    taskTagSnapshot: session.taskTagSnapshot ? String(session.taskTagSnapshot) : "",
    localDate: session.localDate || toDateInputValue(new Date(session.startedAt || Date.now())),
    plannedFocusMinutes: Number(session.plannedFocusMinutes) || 25,
    plannedBreakMinutes: Number(session.plannedBreakMinutes) || 5,
    startedAt: session.startedAt || new Date().toISOString(),
    focusEndsAt: session.focusEndsAt || session.focusEndedAt || new Date().toISOString(),
    focusEndedAt: session.focusEndedAt || null,
    breakStartedAt: session.breakStartedAt || null,
    breakEndsAt: session.breakEndsAt || null,
    breakEndedAt: session.breakEndedAt || null,
    status: ["focus-running", "break-ready", "break-running", "completed", "break-skipped", "task-completed", "interrupted"].includes(session.status) ? session.status : "completed",
    interruptReason: session.interruptReason || null,
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

function weekKey(date) {
  const start = new Date(date);
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - day + 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { id: toDateInputValue(start), label: `${toDateInputValue(start)} 到 ${toDateInputValue(end)}` };
}

function monthKey(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return { id: `${year}-${String(month).padStart(2, "0")}`, label: `${year}年${month}月` };
}

function todayStart() {
  return toDateInputValue(new Date());
}

function todayEnd() {
  return toDateInputValue(new Date());
}

function getSortDate(task) {
  return task.completedAt || task.createdAt;
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatHours(minutes) {
  const hours = minutes / 60;
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
}

function formatMinuteText(minutes) {
  if (minutes < 60) return `${minutes} 分钟`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} 小时 ${rest} 分钟` : `${hours} 小时`;
}

function formatCompactMinuteText(minutes) {
  if (!minutes) return "0分";
  if (minutes < 60) return `${minutes}分`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}时${rest}分` : `${hours}时`;
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function makeId(prefix) {
  const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  return prefix ? `${prefix}_${id}` : id;
}
