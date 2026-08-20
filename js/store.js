// Lớp dữ liệu phía trình duyệt (localStorage) — thay cho database server.
// Toàn bộ dữ liệu chỉ tồn tại trên thiết bị đang mở trang.

import { todayStr, getWeekRange, weekNumberSince } from "./dates.js";

const DATA_KEY = "dinh10k_data_v1";
const SESSION_KEY = "dinh10k_runner";

function defaultData() {
  return {
    runners: [
      { id: "nam_quoc", full_name: "Trần Võ Nam Quốc", short_name: "Nam Quốc" },
      { id: "hong_phuc", full_name: "Đào Trọng Hồng Phúc", short_name: "Hồng Phúc" },
    ],
    settings: {
      race_datetime: "2026-12-27T07:00:00+07:00",
      race_name: "Dinh Harvest Final 2026",
      race_distance_km: "10",
      race_elevation_m: "410",
      race_location: "Hồ Bên Suối, Núi Dinh",
      race_cutoff_hours: "5",
      event_start_date: "2026-08-19",
      plan_sheet_url: "",
      nam_quoc_plan_sheet_url: "",
      hong_phuc_plan_sheet_url: "",
    },
    planEntries: [], // { id, runner_id, date, week_number, type: 'workout'|'rest', workout_name, planned_distance_km, planned_duration_min, intensity, notes }
    workoutLogs: [], // { id, plan_entry_id, runner_id, date, status: 'completed'|'adjusted'|'recovery', planned_summary, actual_summary, distance_km, duration_min, avg_pace, avg_hr, rpe, pain_level, pain_location, notes, activity_link, photo_path, is_test }
    journalEntries: [], // { id, runner_id, date, note, photo_path }
    milestones: [
      { id: 1, order_index: 0, title: "Bắt đầu", target_date: null, completed_at: new Date().toISOString() },
      { id: 2, order_index: 1, title: "Trở lại nhịp chạy", target_date: null, completed_at: null },
      { id: 3, order_index: 2, title: "Giữ được một tuần trọn vẹn", target_date: null, completed_at: null },
      { id: 4, order_index: 3, title: "Hoàn thành 5K liên tục", target_date: null, completed_at: null },
      { id: 5, order_index: 4, title: "Buổi trail đầu tiên", target_date: null, completed_at: null },
      { id: 6, order_index: 5, title: "Bài test 5K", target_date: null, completed_at: null },
      { id: 7, order_index: 6, title: "Tuần tải cao nhất", target_date: null, completed_at: null },
      { id: 8, order_index: 7, title: "Giảm tải", target_date: null, completed_at: null },
      { id: 9, order_index: 8, title: "Race Week", target_date: null, completed_at: null },
      { id: 10, order_index: 9, title: "07:00 · 27.12.2026", target_date: null, completed_at: null },
    ],
    raceResults: [], // { runner_id, status: 'finished'|'dnf'|'dns', finish_time, rank_text, feeling_note }
    nextIds: { plan: 1, log: 1, journal: 1, milestone: 11 },
  };
}

let cache = null;

function load() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (raw) {
      cache = JSON.parse(raw);
      return cache;
    }
  } catch {
    // fall through to defaults
  }
  cache = defaultData();
  save();
  return cache;
}

function save() {
  localStorage.setItem(DATA_KEY, JSON.stringify(cache));
}

// ---------- Session ----------
export function getCurrentRunnerId() {
  const v = localStorage.getItem(SESSION_KEY);
  return v === "nam_quoc" || v === "hong_phuc" ? v : null;
}

export function setCurrentRunnerId(id) {
  localStorage.setItem(SESSION_KEY, id);
}

export function clearCurrentRunnerId() {
  localStorage.removeItem(SESSION_KEY);
}

export function otherRunnerId(id) {
  return id === "nam_quoc" ? "hong_phuc" : "nam_quoc";
}

// ---------- Runners ----------
export function getRunners() {
  return load().runners;
}
export function getRunner(id) {
  return load().runners.find((r) => r.id === id);
}

// ---------- Settings ----------
export function getSettings() {
  return load().settings;
}
export function updateSettings(patch) {
  const d = load();
  Object.assign(d.settings, patch);
  save();
}

// ---------- Plan entries ----------
export function getPlanEntry(runnerId, date) {
  return load().planEntries.find((p) => p.runner_id === runnerId && p.date === date);
}
export function getWeekPlan(runnerId, start, end) {
  return load()
    .planEntries.filter((p) => p.runner_id === runnerId && p.date >= start && p.date <= end)
    .sort((a, b) => a.date.localeCompare(b.date));
}
export function getAllPlanEntries(runnerId) {
  return load()
    .planEntries.filter((p) => p.runner_id === runnerId)
    .sort((a, b) => a.date.localeCompare(b.date));
}
export function upsertPlanEntry(entry) {
  const d = load();
  const idx = d.planEntries.findIndex(
    (p) => p.runner_id === entry.runner_id && p.date === entry.date
  );
  if (idx >= 0) {
    d.planEntries[idx] = { ...d.planEntries[idx], ...entry };
  } else {
    d.planEntries.push({ id: d.nextIds.plan++, ...entry });
  }
  save();
}
export function deletePlanEntry(id) {
  const d = load();
  d.planEntries = d.planEntries.filter((p) => p.id !== id);
  save();
}

// ---------- Workout logs ----------
export function getWorkoutLog(runnerId, date) {
  return load().workoutLogs.find((l) => l.runner_id === runnerId && l.date === date);
}
export function getWorkoutLogsInRange(runnerId, start, end) {
  return load()
    .workoutLogs.filter((l) => l.runner_id === runnerId && l.date >= start && l.date <= end)
    .sort((a, b) => a.date.localeCompare(b.date));
}
export function getAllWorkoutLogs(runnerId) {
  return load()
    .workoutLogs.filter((l) => l.runner_id === runnerId)
    .sort((a, b) => b.date.localeCompare(a.date));
}
export function upsertWorkoutLog(log) {
  const d = load();
  const idx = d.workoutLogs.findIndex(
    (l) => l.runner_id === log.runner_id && l.date === log.date
  );
  if (idx >= 0) {
    d.workoutLogs[idx] = { ...d.workoutLogs[idx], ...log };
    save();
    return d.workoutLogs[idx].id;
  }
  const id = d.nextIds.log++;
  d.workoutLogs.push({ id, ...log });
  save();
  return id;
}
export function deleteWorkoutLog(id) {
  const d = load();
  d.workoutLogs = d.workoutLogs.filter((l) => l.id !== id);
  save();
}

// ---------- Journal ----------
export function getJournalEntries(runnerId, limit = 50) {
  const d = load();
  let entries = d.journalEntries;
  if (runnerId) entries = entries.filter((j) => j.runner_id === runnerId);
  return [...entries].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).slice(0, limit);
}
export function insertJournalEntry(entry) {
  const d = load();
  const id = d.nextIds.journal++;
  d.journalEntries.push({ id, ...entry });
  save();
  return id;
}
export function deleteJournalEntry(id) {
  const d = load();
  d.journalEntries = d.journalEntries.filter((j) => j.id !== id);
  save();
}

// ---------- Milestones ----------
export function getMilestones() {
  return [...load().milestones].sort((a, b) => a.order_index - b.order_index);
}
export function updateMilestone(id, patch) {
  const d = load();
  const m = d.milestones.find((x) => x.id === id);
  if (m) Object.assign(m, patch);
  save();
}

// ---------- Race results ----------
export function getRaceResults() {
  return load().raceResults;
}
export function getRaceResult(runnerId) {
  return load().raceResults.find((r) => r.runner_id === runnerId);
}
export function upsertRaceResult(result) {
  const d = load();
  const idx = d.raceResults.findIndex((r) => r.runner_id === result.runner_id);
  if (idx >= 0) d.raceResults[idx] = { ...d.raceResults[idx], ...result };
  else d.raceResults.push(result);
  save();
}
export function bothFinished() {
  const results = getRaceResults();
  const ids = ["nam_quoc", "hong_phuc"];
  return ids.every((id) => results.find((r) => r.runner_id === id)?.status === "finished");
}
export function anyDnfOrDns() {
  return getRaceResults().some((r) => r.status === "dnf" || r.status === "dns");
}

// ---------- Derived stats ----------
export function getStats(runnerId) {
  const d = load();
  const logs = d.workoutLogs.filter(
    (l) => l.runner_id === runnerId && (l.status === "completed" || l.status === "adjusted")
  );
  const sessions = logs.length;
  const totalKm = logs.reduce((sum, l) => sum + (Number(l.distance_km) || 0), 0);
  const today = todayStr();
  const plannedCount = d.planEntries.filter(
    (p) => p.runner_id === runnerId && p.type === "workout" && p.date <= today
  ).length;
  const adherenceRate = plannedCount > 0 ? Math.round((sessions / plannedCount) * 100) : 0;
  const tests = d.workoutLogs
    .filter((l) => l.runner_id === runnerId && l.is_test)
    .sort((a, b) => b.date.localeCompare(a.date));
  return { sessions, totalKm, adherenceRate, lastTest: tests[0] };
}

export function getMostConsistentWeek(runnerId) {
  const d = load();
  const today = todayStr();
  const plans = d.planEntries.filter(
    (p) => p.runner_id === runnerId && p.type === "workout" && p.date <= today
  );
  if (plans.length === 0) return null;
  const weekTotals = new Map();
  for (const p of plans) {
    const { start } = getWeekRange(p.date);
    weekTotals.set(start, (weekTotals.get(start) || 0) + 1);
  }
  const doneLogs = d.workoutLogs.filter(
    (l) =>
      l.runner_id === runnerId &&
      (l.status === "completed" || l.status === "adjusted") &&
      l.date <= today
  );
  const weekDone = new Map();
  for (const l of doneLogs) {
    const { start } = getWeekRange(l.date);
    weekDone.set(start, (weekDone.get(start) || 0) + 1);
  }
  let best = null;
  for (const [weekStart, total] of weekTotals) {
    const done = weekDone.get(weekStart) || 0;
    const rate = total > 0 ? done / total : 0;
    if (!best || rate > best.rate || (rate === best.rate && weekStart > best.weekStart)) {
      best = { weekStart, rate };
    }
  }
  return best;
}

export function getJourneyTotals() {
  const d = load();
  const logs = d.workoutLogs.filter((l) => l.status === "completed" || l.status === "adjusted");
  const totalSessions = logs.length;
  const totalKm = logs.reduce((sum, l) => sum + (Number(l.distance_km) || 0), 0);
  const totalAdjusted = d.workoutLogs.filter((l) => l.status === "adjusted").length;
  const totalPhotos = d.journalEntries.filter((j) => j.photo_path).length;
  const totalWeeks = weekNumberSince(d.settings.event_start_date, todayStr());
  return { totalWeeks, totalSessions, totalKm, totalAdjusted, totalPhotos };
}

// ---------- Day status (dùng cho bảng "Những lời hẹn của tuần này") ----------
export function deriveDayStatus(plan, log, date, today) {
  if (date > today) return "upcoming";
  if (log) {
    if (log.status === "adjusted") return "adjusted";
    if (log.status === "recovery") return "recovery";
    return "completed";
  }
  if (plan?.type === "rest") return "recovery";
  if (date === today) return "unlogged";
  if (plan) return "missed";
  return "unlogged";
}

// ---------- Day state (dùng cho khối "Việc của hôm nay") ----------
export function deriveDayState(plan, log) {
  if (log?.status === "recovery") return "reduced";
  if (log && (log.status === "completed" || log.status === "adjusted")) return "done";
  if (!log && plan?.type === "rest") return "rest";
  return "todo";
}

// ---------- Dev helper: seed demo data so the prototype is not empty ----------
export function seedDemoDataIfEmpty() {
  const d = load();
  if (d.planEntries.length > 0) return;
  const today = todayStr();
  const start = getWeekRange(today).start;
  const runnerIds = ["nam_quoc", "hong_phuc"];
  const plans = [
    { offset: 0, type: "workout", name: "Easy run", km: 6, min: 40, intensity: "Easy" },
    { offset: 1, type: "rest", name: null, km: null, min: null, intensity: null },
    { offset: 2, type: "workout", name: "Tempo run", km: 8, min: 45, intensity: "Tempo" },
    { offset: 3, type: "workout", name: "Easy run", km: 5, min: 32, intensity: "Easy" },
    { offset: 4, type: "rest", name: null, km: null, min: null, intensity: null },
    { offset: 5, type: "workout", name: "Long run", km: 14, min: 90, intensity: "Easy–Steady" },
    { offset: 6, type: "workout", name: "Recovery jog", km: 4, min: 25, intensity: "Recovery" },
  ];
  for (const rid of runnerIds) {
    plans.forEach((p, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + p.offset);
      const dateStr = date.toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
      upsertPlanEntry({
        runner_id: rid,
        date: dateStr,
        week_number: weekNumberSince(d.settings.event_start_date, dateStr),
        type: p.type,
        workout_name: p.name,
        planned_distance_km: p.km,
        planned_duration_min: p.min,
        intensity: p.intensity,
        notes: null,
      });
    });
  }
}
