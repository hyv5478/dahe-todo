const state = {
  tasks: [],
  focusSessions: [],
  achievements: [],
  view: "active",
  selectedId: null,
  backfillFollowUpId: null,
  focusPanelOpenId: null,
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
  followUpTodayCount: document.querySelector("#followUpTodayCount"),
  followUpWeekCount: document.querySelector("#followUpWeekCount"),
  followUpOverdueCount: document.querySelector("#followUpOverdueCount"),
  achievementScore: document.querySelector("#achievementScore"),
  weekFocusCount: document.querySelector("#weekFocusCount"),
  weekFocusHours: document.querySelector("#weekFocusHours"),
  weekTaskCount: document.querySelector("#weekTaskCount"),
  achievementList: document.querySelector("#achievementList"),
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
  openFocusPanel: document.querySelector("#openFocusPanel"),
  focusBar: document.querySelector("#focusBar"),
  focusBarMode: document.querySelector("#focusBarMode"),
  focusBarTask: document.querySelector("#focusBarTask"),
  focusBarTime: document.querySelector("#focusBarTime"),
  focusBarAbort: document.querySelector("#focusBarAbort"),
  focusPanel: document.querySelector("#focusPanel"),
  focusPanelSummary: document.querySelector("#focusPanelSummary"),
  focusRing: document.querySelector("#focusRing"),
  focusTime: document.querySelector("#focusTime"),
  startFocus: document.querySelector("#startFocus"),
  startBreak: document.querySelector("#startBreak"),
  skipBreak: document.querySelector("#skipBreak"),
  abortFocus: document.querySelector("#abortFocus"),
  focusStats: document.querySelector("#focusStats"),
  focusHistory: document.querySelector("#focusHistory"),
  followUpSection: document.querySelector("#followUpSection"),
  followUpSectionTitle: document.querySelector("#followUpSectionTitle"),
  followUpSectionHint: document.querySelector("#followUpSectionHint"),
  followUpThreadBadge: document.querySelector("#followUpThreadBadge"),
  followUpSummary: document.querySelector("#followUpSummary"),
  backfillFollowUp: document.querySelector("#backfillFollowUp"),
  cancelBackfillFollowUp: document.querySelector("#cancelBackfillFollowUp"),
  followUpComposer: document.querySelector("#followUpComposer"),
  followUpNoteLabel: document.querySelector("#followUpNoteLabel"),
  followUpNoteText: document.querySelector("#followUpNoteText"),
  followUpGrid: document.querySelector("#followUpGrid"),
  commentSection: document.querySelector("#commentSection"),
  commentSectionTitle: document.querySelector("#commentSectionTitle"),
  commentInput: document.querySelector("#commentInput"),
  newComment: document.querySelector("#newComment"),
  followUpTitle: document.querySelector("#followUpTitle"),
  followUpDate: document.querySelector("#followUpDate"),
  followUpMode: document.querySelector("#followUpMode"),
  completeWithFollowUp: document.querySelector("#completeWithFollowUp"),
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

const followUpModeText = {
  self: "我来跟进",
  waiting: "等待对方",
  review: "定期回看",
};

const focusDoneStatuses = new Set(["break-ready", "completed", "break-skipped", "task-completed"]);
const focusOpenStatuses = new Set(["focus-running", "break-ready", "break-running"]);
const focusTrackedStatuses = new Set(["break-ready", "completed", "break-skipped", "task-completed", "interrupted"]);

const achievementDefinitions = [
  {
    id: "week-start",
    title: "本周起步",
    summary: "完成 1 个完整番茄",
    report: "本周已经启动专注节奏，完成了第 1 个番茄。",
    isUnlocked: (stats) => stats.completedFocus >= 1,
  },
  {
    id: "steady-five",
    title: "稳住节奏",
    summary: "完成 5 个完整番茄",
    report: "本周完成 5 个以上完整番茄，工作节奏开始稳定。",
    isUnlocked: (stats) => stats.completedFocus >= 5,
  },
  {
    id: "deep-two-hours",
    title: "专注半日",
    summary: "累计专注 2 小时",
    report: "本周累计专注超过 2 小时，适合写进周报的投入证明。",
    isUnlocked: (stats) => stats.focusMinutes >= 120,
  },
  {
    id: "closed-loop",
    title: "闭环大师",
    summary: "完成任务并写完成备注",
    report: "本周有任务完成后补充了备注，周报素材更完整。",
    isUnlocked: (stats) => stats.tasksWithComments >= 1,
  },
  {
    id: "report-ready",
    title: "周报素材充足",
    summary: "本周完成备注达到 5 条",
    report: "本周沉淀了 5 条以上完成备注，周报整理压力下降。",
    isUnlocked: (stats) => stats.commentCount >= 5,
  },
  {
    id: "firefighter",
    title: "救火队长",
    summary: "完成 3 个重要紧急事项",
    report: "本周处理了多个重要紧急事项，临场问题有闭环。",
    isUnlocked: (stats) => stats.urgentDone >= 3,
  },
  {
    id: "interruption-handler",
    title: "插入事项处理者",
    summary: "完成番茄中断生成的事项",
    report: "本周把中断产生的插入事项也处理掉了，打断没有丢在脑子里。",
    isUnlocked: (stats) => stats.completedInserted >= 1,
  },
  {
    id: "comeback",
    title: "被打断也回来",
    summary: "有中断，也有完整番茄",
    report: "本周虽然出现中断，但仍然完成了番茄，节奏没有散掉。",
    isUnlocked: (stats) => stats.interruptedFocus >= 1 && stats.completedFocus >= 1,
  },
];

init();

async function init() {
  state.info = await window.daheTodo.appInfo();
  state.tasks = (await window.daheTodo.loadTasks()).map(normalizeTask).filter(Boolean);
  state.focusSessions = (await window.daheTodo.loadFocusSessions()).map(normalizeFocusSession).filter(Boolean);
  state.achievements = (await window.daheTodo.loadAchievements()).map(normalizeAchievement).filter(Boolean);
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
  el.openFocusPanel.addEventListener("click", toggleFocusPanel);
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
  el.completeWithFollowUp.addEventListener("click", completeSelectedWithFollowUp);
  el.backfillFollowUp.addEventListener("click", openBackfillFollowUp);
  el.cancelBackfillFollowUp.addEventListener("click", cancelBackfillFollowUp);
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

async function saveAchievements() {
  await window.daheTodo.saveAchievements(state.achievements);
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

function createTask({
  title,
  note = "",
  tag = "",
  priority = "important-urgent",
  threadId = makeId("thread"),
  sourceTaskId = null,
  visibleFrom = "",
  followUpMode = "",
}) {
  return {
    id: makeId("task"),
    title: String(title).trim(),
    note: String(note || "").trim(),
    tag: String(tag || "").trim(),
    priority: normalizePriority(priority),
    createdAt: new Date().toISOString(),
    completedAt: null,
    comments: [],
    threadId: String(threadId || makeId("thread")),
    sourceTaskId: sourceTaskId ? String(sourceTaskId) : null,
    visibleFrom: normalizeDateValue(visibleFrom),
    followUpMode: followUpMode && followUpModeText[followUpMode] ? followUpMode : "",
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

function toggleFocusPanel() {
  const task = selectedTask();
  if (!task) return;
  state.focusPanelOpenId = state.focusPanelOpenId === task.id ? null : task.id;
  renderFocus();
}

function completeSelectedWithFollowUp() {
  const task = selectedTask();
  if (!task) return;
  const isBackfill = Boolean(task.completedAt && state.backfillFollowUpId === task.id);
  if (!isBackfill && task.completedAt) return;

  const existingFollowUp = directFollowUpTask(task.id);
  if (existingFollowUp) {
    alert("这条事项已经创建过接续跟进了，直接去改那条跟进事项就行。");
    state.selectedId = isTaskVisibleNow(existingFollowUp) ? existingFollowUp.id : task.id;
    state.view = isTaskVisibleNow(existingFollowUp) ? "active" : "history";
    render();
    return;
  }

  const nextTitle = el.followUpTitle.value.trim();
  const followUpDate = normalizeDateValue(el.followUpDate.value);
  const followUpMode = el.followUpMode.value;
  const note = el.newComment.value.trim();
  if (!nextTitle) {
    el.followUpTitle.focus();
    return;
  }
  if (!followUpDate) {
    el.followUpDate.focus();
    return;
  }

  const completedAt = new Date().toISOString();
  if (!isBackfill) {
    settleFocusForCompletedTask(task);
    if (note) pushComment(task, note, completedAt);
    task.completedAt = completedAt;
  }

  const carryNote = buildFollowUpNote(task, note, followUpMode);
  const nextTask = createTask({
    title: nextTitle,
    note: carryNote,
    tag: task.tag,
    priority: task.priority,
    threadId: task.threadId || task.id,
    sourceTaskId: task.id,
    visibleFrom: followUpDate,
    followUpMode,
  });
  state.tasks.unshift(nextTask);
  state.selectedId = task.id;
  state.view = "history";
  state.backfillFollowUpId = null;
  clearFollowUpComposer();
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
  const text = el.commentInput.value.trim();
  if (!text) return;
  pushComment(task, text);
  el.commentInput.value = "";
  saveTasks();
  render();
}

async function importData() {
  const imported = await window.daheTodo.importData();
  if (!imported) return;
  const tasks = Array.isArray(imported) ? imported : imported.tasks;
  const focusSessions = Array.isArray(imported.focusSessions) ? imported.focusSessions : [];
  const achievements = Array.isArray(imported.achievements) ? imported.achievements : [];
  state.tasks = tasks.map(normalizeTask).filter(Boolean);
  state.focusSessions = focusSessions.map(normalizeFocusSession).filter(Boolean);
  state.achievements = achievements.map(normalizeAchievement).filter(Boolean);
  state.activeFocusId = findOpenFocusSession()?.id || null;
  state.selectedId = null;
  render();
}

function render() {
  el.versionLabel.textContent = `桌面端 · ${state.info.version}`;
  el.appNameTitle.textContent = state.info.appName;
  document.title = state.info.appName;
  if (el.dataPath) {
    el.dataPath.textContent = `${state.info.dataFile} · 专注记录 ${state.info.focusFile} · 成就 ${state.info.achievementsFile}`;
  }
  renderCounts();
  renderTags();
  renderTabs();
  renderAchievements();
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
  }, state.tasks, state.focusSessions, state.achievements);
  closeSettings();
  render();
}

function renderCounts() {
  const followUpStats = buildFollowUpStats();
  el.activeCount.textContent = state.tasks.filter((task) => !task.completedAt && isTaskVisibleNow(task)).length;
  el.doneCount.textContent = state.tasks.filter((task) => task.completedAt).length;
  el.todayFocusCount.textContent = completedFocusCountForRange(todayStart(), todayEnd());
  el.followUpTodayCount.textContent = followUpStats.today;
  el.followUpWeekCount.textContent = followUpStats.thisWeek;
  el.followUpOverdueCount.textContent = followUpStats.overdue;
}

function renderAchievements() {
  const week = weekRange(new Date());
  const stats = buildWeeklyAchievementStats(week.start, week.end);
  const unlocked = syncAchievementUnlocks(week.id, stats);
  el.achievementScore.textContent = `${unlocked.length}/${achievementDefinitions.length}`;
  el.weekFocusCount.textContent = stats.completedFocus;
  el.weekFocusHours.textContent = formatHours(stats.focusMinutes);
  el.weekTaskCount.textContent = stats.completedTasks;

  el.achievementList.replaceChildren(...achievementDefinitions.map((definition) => {
    const record = unlocked.find((item) => item.id === definition.id);
    const item = document.createElement("div");
    item.className = `achievement-item ${record ? "unlocked" : "locked"}`;
    item.title = record ? `${definition.report}\n解锁时间：${formatDateTime(record.unlockedAt)}` : definition.summary;

    const badge = document.createElement("span");
    badge.className = "achievement-badge";
    badge.textContent = record ? "✓" : "·";

    const body = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = definition.title;
    const summary = document.createElement("span");
    summary.textContent = record ? `已解锁 · ${definition.summary}` : definition.summary;
    body.append(title, summary);

    item.append(badge, body);
    return item;
  }));
}

function buildWeeklyAchievementStats(from, to) {
  const tasks = state.tasks.filter((task) => withinRange(task.completedAt, from, to));
  const sessions = trackedSessionsForRange(from, to);
  const completedSessions = sessions.filter((session) => focusDoneStatuses.has(session.status));
  const comments = state.tasks.flatMap((task) => task.comments || []).filter((comment) => withinRange(comment.createdAt, from, to));
  return {
    completedFocus: completedSessions.length,
    interruptedFocus: sessions.filter((session) => session.status === "interrupted").length,
    focusMinutes: sessions.reduce((sum, session) => sum + focusSessionMinutes(session), 0),
    completedTasks: tasks.length,
    urgentDone: tasks.filter((task) => task.priority === "important-urgent").length,
    commentCount: comments.length,
    tasksWithComments: tasks.filter((task) => task.comments && task.comments.length > 0).length,
    completedInserted: tasks.filter(isInsertedTask).length,
  };
}

function syncAchievementUnlocks(weekId, stats) {
  const unlocked = state.achievements.filter((item) => item.weekId === weekId);
  let changed = false;
  achievementDefinitions.forEach((definition) => {
    if (!definition.isUnlocked(stats)) return;
    if (unlocked.some((item) => item.id === definition.id)) return;
    const record = { id: definition.id, weekId, unlockedAt: new Date().toISOString() };
    state.achievements.push(record);
    unlocked.push(record);
    changed = true;
  });
  if (changed) saveAchievements();
  return unlocked;
}

function isInsertedTask(task) {
  return task.tag === "插入事项" || task.note.includes("番茄钟中断时自动生成");
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
    tasks = tasks.filter((task) => !task.completedAt && isTaskVisibleNow(task));
    if (state.priorityFilter !== "all") tasks = tasks.filter((task) => task.priority === state.priorityFilter);
  } else if (state.view === "history") {
    tasks = tasks.filter((task) => task.completedAt).filter((task) => withinRange(task.completedAt, el.historyFrom.value, el.historyTo.value));
  } else if (state.view === "report") {
    tasks = state.tasks.filter((task) => task.completedAt);
  }
  if (!state.search && state.view === "active") {
    return tasks.sort(compareActiveTasks);
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
  meta.textContent = [timeText, task.tag || "未分组", `${focusCount} 个番茄`, followUpMetaText(task)].filter(Boolean).join(" · ");
  content.append(title, note, meta);

  const badges = document.createElement("div");
  badges.className = "row-badges";

  const badge = document.createElement("span");
  badge.className = `priority ${task.priority}`;
  badge.textContent = priorityText[task.priority] || "重要不紧急";
  badges.append(badge);

  const followUpBadge = renderFollowUpBadge(task);
  if (followUpBadge) badges.append(followUpBadge);

  top.append(content, badges);
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
  if (el.commentSection.dataset.taskId !== task.id) {
    el.commentInput.value = "";
    el.commentSection.dataset.taskId = task.id;
  }

  el.detailStatus.textContent = task.completedAt ? "已完成" : "待办中";
  el.detailTitle.textContent = task.title;
  el.detailNote.textContent = task.note || "暂无补充。";
  el.toggleDone.textContent = task.completedAt ? "重新打开" : "直接完成";
  el.commentSection.classList.toggle("hidden", !task.completedAt);
  el.commentSectionTitle.textContent = task.completedAt ? "完成备注" : "过程备注";

  const items = [
    ["创建", formatDateTime(task.createdAt)],
    ["办理", task.completedAt ? formatDateTime(task.completedAt) : "未完成"],
    ["分组", task.tag || "未分组"],
    ["优先级", priorityText[task.priority] || "重要不紧急"],
    ["番茄", `${completedSessionsForTask(task.id).length} 个`],
  ];
  const sourceTask = sourceTaskFor(task);
  const nextTask = directFollowUpTask(task.id);
  if (task.visibleFrom) items.push(["出现", formatDate(task.visibleFrom)]);
  if (task.followUpMode) items.push(["方式", followUpModeText[task.followUpMode] || "我来跟进"]);
  if (sourceTask) items.push(["承接", sourceTask.title]);
  if (nextTask) items.push(["下次跟进", `${formatDate(nextTask.visibleFrom)} · ${nextTask.title}`]);
  el.detailMeta.replaceChildren(...items.flatMap(([key, value]) => {
    const dt = document.createElement("dt");
    dt.textContent = key;
    const dd = document.createElement("dd");
    dd.textContent = value;
    return [dt, dd];
  }));

  renderFollowUpSection(task);
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
  const shouldShowPanel = state.focusPanelOpenId === task.id || Boolean(selectedHasActive);
  el.focusPanel.classList.toggle("hidden", !shouldShowPanel);
  el.openFocusPanel.classList.toggle("active", shouldShowPanel);
  el.openFocusPanel.textContent = shouldShowPanel ? "收起番茄钟" : "番茄钟";
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

function renderFollowUpSection(task) {
  const nextTask = directFollowUpTask(task.id);
  const sourceTask = sourceTaskFor(task);
  const threadTasks = tasksInThread(task.threadId || task.id);
  const isBackfill = state.backfillFollowUpId === task.id;
  if (el.followUpComposer.dataset.taskId !== task.id) {
    clearFollowUpComposer();
    el.followUpComposer.dataset.taskId = task.id;
  }

  el.followUpSection.classList.remove("hidden");
  el.followUpThreadBadge.classList.toggle("hidden", threadTasks.length <= 1);
  if (threadTasks.length > 1) {
    el.followUpThreadBadge.textContent = `${threadTasks.length} 段推进`;
  }

  if (!task.completedAt) {
    el.followUpSectionTitle.textContent = "完成并跟进";
    el.followUpSectionHint.textContent = "适合这轮已经做完、后面还要继续盯的事项。";
    el.followUpNoteText.textContent = "本次完成情况";
    el.newComment.placeholder = "这次做到哪一步？结果、原因、后续影响";
    el.followUpComposer.classList.remove("hidden");
    el.followUpNoteLabel.classList.remove("hidden");
    el.followUpGrid.classList.remove("hidden");
    el.completeWithFollowUp.classList.remove("hidden");
    el.completeWithFollowUp.textContent = "保存完成情况并创建下次跟进";
    el.backfillFollowUp.classList.add("hidden");
    el.cancelBackfillFollowUp.classList.add("hidden");
    el.followUpSummary.classList.toggle("hidden", !nextTask);
    el.addComment.classList.add("hidden");
    if (!el.followUpDate.value) el.followUpDate.value = nextWeekSuggestion();
    if (!el.followUpTitle.value) el.followUpTitle.value = task.title;
    if (nextTask) {
      el.followUpSummary.textContent = `这条事项已经接续过：${formatDate(nextTask.visibleFrom)} · ${followUpModeText[nextTask.followUpMode] || "我来跟进"} · ${nextTask.title}`;
    } else {
      el.followUpSummary.textContent = "";
    }
    return;
  }

  el.followUpComposer.classList.toggle("hidden", !isBackfill);
  el.followUpNoteLabel.classList.add("hidden");
  el.followUpGrid.classList.toggle("hidden", !isBackfill);
  el.completeWithFollowUp.classList.toggle("hidden", !isBackfill);
  el.completeWithFollowUp.textContent = "创建下次跟进";
  el.addComment.classList.remove("hidden");
  el.backfillFollowUp.classList.toggle("hidden", Boolean(nextTask) || isBackfill);
  el.cancelBackfillFollowUp.classList.toggle("hidden", !isBackfill);
  if (nextTask) {
    el.followUpSectionTitle.textContent = "下次跟进";
    el.followUpSectionHint.textContent = "这条事项已经收口，系统会在约定日期把下一步再送回来。";
    el.followUpSummary.classList.remove("hidden");
    el.followUpSummary.textContent = `${formatDate(nextTask.visibleFrom)} · ${followUpModeText[nextTask.followUpMode] || "我来跟进"} · ${nextTask.title}`;
  } else if (sourceTask) {
    el.followUpSectionTitle.textContent = "承接记录";
    el.followUpSectionHint.textContent = "这条事项是从上一轮推进里接过来的。";
    el.followUpSummary.classList.remove("hidden");
    el.followUpSummary.textContent = `承接自「${sourceTask.title}」${task.visibleFrom ? ` · 原计划 ${formatDate(task.visibleFrom)}` : ""}`;
  } else if (isBackfill) {
    el.followUpSectionTitle.textContent = "补建下次跟进";
    el.followUpSectionHint.textContent = "这条已完成事项需要继续盯时，在这里补一条后续动作。";
    el.followUpSummary.classList.remove("hidden");
    el.followUpSummary.textContent = "只创建后续事项，不会往完成备注里再追加重复评论。";
    if (!el.followUpDate.value) el.followUpDate.value = nextWeekSuggestion();
    if (!el.followUpTitle.value) el.followUpTitle.value = task.title;
  } else {
    el.followUpSectionTitle.textContent = "跟进链路";
    el.followUpSectionHint.textContent = "这条事项已经完成，没有继续跟进。需要继续推进时，再单独补建一条后续。";
    el.followUpSummary.classList.add("hidden");
    el.followUpSummary.textContent = "";
  }

  if (!isBackfill) {
    el.followUpTitle.value = "";
    el.followUpDate.value = "";
    el.followUpMode.value = "self";
  }
}

function pushComment(task, text, createdAt = new Date().toISOString()) {
  task.comments.push({
    id: makeId("comment"),
    text,
    createdAt,
    updatedAt: null,
  });
}

function clearFollowUpComposer() {
  el.newComment.value = "";
  el.followUpTitle.value = "";
  el.followUpDate.value = "";
  el.followUpMode.value = "self";
}

function openBackfillFollowUp() {
  const task = selectedTask();
  if (!task || !task.completedAt || directFollowUpTask(task.id)) return;
  state.backfillFollowUpId = task.id;
  clearFollowUpComposer();
  render();
}

function cancelBackfillFollowUp() {
  state.backfillFollowUpId = null;
  clearFollowUpComposer();
  render();
}

function buildFollowUpNote(task, note, followUpMode) {
  const lines = [];
  lines.push(`接续自：${task.title}`);
  if (followUpModeText[followUpMode]) lines.push(`跟进方式：${followUpModeText[followUpMode]}`);
  if (note) lines.push(`上次收口：${note}`);
  return lines.join("\n");
}

function buildFollowUpStats(reference = todayStart()) {
  const week = weekRange(new Date(`${reference}T00:00:00`));
  const pendingFollowUps = state.tasks.filter((task) => !task.completedAt && task.visibleFrom);
  return {
    today: pendingFollowUps.filter((task) => task.visibleFrom === reference).length,
    thisWeek: pendingFollowUps.filter((task) => task.visibleFrom >= reference && task.visibleFrom <= week.end).length,
    overdue: pendingFollowUps.filter((task) => task.visibleFrom < reference).length,
  };
}

function directFollowUpTask(taskId) {
  return state.tasks
    .filter((task) => task.sourceTaskId === taskId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0] || null;
}

function sourceTaskFor(task) {
  if (!task.sourceTaskId) return null;
  return state.tasks.find((item) => item.id === task.sourceTaskId) || null;
}

function tasksInThread(threadId) {
  if (!threadId) return [];
  return state.tasks
    .filter((task) => (task.threadId || task.id) === threadId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

function renderFollowUpBadge(task) {
  const text = followUpBadgeText(task);
  if (!text) return null;
  const badge = document.createElement("span");
  badge.className = `summary-pill ${task.completedAt ? "success" : task.visibleFrom && task.visibleFrom < todayStart() ? "warn" : ""}`.trim();
  badge.textContent = text;
  return badge;
}

function followUpBadgeText(task) {
  const nextTask = directFollowUpTask(task.id);
  if (nextTask) return `已续办 ${formatDate(nextTask.visibleFrom)}`;
  if (!task.completedAt && task.visibleFrom) {
    if (task.visibleFrom < todayStart()) return `逾期 ${formatDate(task.visibleFrom)}`;
    return `待跟进 ${formatDate(task.visibleFrom)}`;
  }
  return "";
}

function followUpMetaText(task) {
  if (!task.completedAt && task.visibleFrom) {
    return `${task.visibleFrom < todayStart() ? "已逾期" : "跟进"} ${formatDate(task.visibleFrom)}`;
  }
  const nextTask = directFollowUpTask(task.id);
  if (nextTask) return `下次 ${formatDate(nextTask.visibleFrom)}`;
  return "";
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
  const unlockedAchievements = achievementsForRange(el.reportFrom.value, el.reportTo.value);
  const lines = [`# 周报素材（${el.reportFrom.value || "开始"} 到 ${el.reportTo.value || "今天"}）`, ""];
  lines.push(`本期完成 ${tasks.length} 项任务，完整番茄 ${completedCount} 个，中断 ${interruptedCount} 次，累计约 ${formatHours(minutes)} 小时专注。`, "");
  if (unlockedAchievements.length) {
    lines.push("## 本期成就");
    unlockedAchievements.forEach((record) => {
      const definition = achievementDefinitionById(record.id);
      if (definition) lines.push(`- ${definition.title}：${definition.report}`);
    });
    lines.push("");
  }
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
        const nextTask = directFollowUpTask(task.id);
        if (nextTask) {
          lines.push(`  - 下次跟进：${formatDate(nextTask.visibleFrom)} · ${followUpModeText[nextTask.followUpMode] || "我来跟进"} · ${nextTask.title}`);
        }
      });
      lines.push("");
    });
  }
  el.reportOutput.value = lines.join("\n").trim();
}

function achievementsForRange(from, to) {
  return state.achievements
    .filter((record) => withinRange(record.unlockedAt, from, to))
    .sort((a, b) => new Date(a.unlockedAt) - new Date(b.unlockedAt));
}

function achievementDefinitionById(id) {
  return achievementDefinitions.find((definition) => definition.id === id) || null;
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
  return [
    task.title,
    task.note,
    task.tag,
    task.visibleFrom,
    followUpModeText[task.followUpMode] || "",
    ...task.comments.map((comment) => comment.text),
  ]
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

function isTaskVisibleNow(task, reference = todayStart()) {
  return !task.visibleFrom || task.visibleFrom <= reference;
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
    threadId: task.threadId ? String(task.threadId) : String(task.id || makeId("thread")),
    sourceTaskId: task.sourceTaskId ? String(task.sourceTaskId) : null,
    visibleFrom: normalizeDateValue(task.visibleFrom),
    followUpMode: task.followUpMode && followUpModeText[task.followUpMode] ? task.followUpMode : "",
  };
}

function normalizeDateValue(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
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

function normalizeAchievement(achievement) {
  if (!achievement || !achievement.id || !achievement.weekId) return null;
  return {
    id: String(achievement.id),
    weekId: String(achievement.weekId),
    unlockedAt: achievement.unlockedAt || new Date().toISOString(),
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

function weekRange(date) {
  const key = weekKey(date);
  const start = key.id;
  const endDate = new Date(`${start}T00:00:00`);
  endDate.setDate(endDate.getDate() + 6);
  return { id: key.id, label: key.label, start, end: toDateInputValue(endDate) };
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
  return task.completedAt || (task.visibleFrom ? `${task.visibleFrom}T00:00:00` : task.createdAt);
}

function compareActiveTasks(a, b) {
  const today = todayStart();
  const rank = (task) => {
    if (task.visibleFrom && task.visibleFrom < today) return 0;
    if (task.visibleFrom === today) return 1;
    if (task.visibleFrom) return 2;
    return 3;
  };
  const rankDiff = rank(a) - rank(b);
  if (rankDiff !== 0) return rankDiff;
  if (a.visibleFrom || b.visibleFrom) {
    const left = a.visibleFrom || "9999-12-31";
    const right = b.visibleFrom || "9999-12-31";
    if (left !== right) return left.localeCompare(right);
  }
  return new Date(b.createdAt) - new Date(a.createdAt);
}

function nextWeekSuggestion() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return toDateInputValue(date);
}

function formatDate(value) {
  if (!value) return "未设";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
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

