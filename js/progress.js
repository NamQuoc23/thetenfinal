import * as store from "./store.js";
import { progressPage } from "./copy.js";
import { requireLogin, renderHeader } from "./nav.js";
import { todayStr, formatDateVi, getWeekRange, addDays, parseDateStr } from "./dates.js";

function shortDateVi(s) {
  const d = parseDateStr(s);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

store.seedDemoDataIfEmpty();
const currentId = requireLogin();
if (currentId) {
  renderHeader("progress.html");
  init();
}

function esc(s) {
  if (s === null || s === undefined) return "";
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function init() {
  document.getElementById("page-title").textContent = progressPage.title;
  document.getElementById("page-lead").textContent = progressPage.lead;

  const runners = store.getRunners();
  const runnerMap = Object.fromEntries(runners.map((r) => [r.id, r]));

  renderChart(runnerMap);
  renderStats(runnerMap);
  renderTestHistory(runnerMap);
}

function weekKmFor(runnerId, weekStart, weekEnd) {
  const logs = store.getWorkoutLogsInRange(runnerId, weekStart, weekEnd);
  return logs
    .filter((l) => l.status === "completed" || l.status === "adjusted")
    .reduce((sum, l) => sum + (Number(l.distance_km) || 0), 0);
}

function renderChart(runnerMap) {
  const today = todayStr();
  const weeks = [];
  let cursor = getWeekRange(today).start;
  for (let i = 0; i < 8; i++) {
    weeks.unshift(cursor);
    cursor = addDays(cursor, -7);
  }
  const ids = ["nam_quoc", "hong_phuc"];
  const values = weeks.map((weekStart) => {
    const weekEnd = addDays(weekStart, 6);
    return ids.map((id) => weekKmFor(id, weekStart, weekEnd));
  });
  const max = Math.max(1, ...values.flat());

  const chart = document.getElementById("km-chart");
  chart.innerHTML = weeks
    .map((weekStart, i) => {
      const [left, right] = values[i];
      return `
      <div class="bar-col">
        <div style="display:flex;align-items:flex-end;gap:4px;height:150px;width:100%;justify-content:center">
          <div class="bar" style="height:${Math.max(2, (left / max) * 150)}px"></div>
          <div class="bar right" style="height:${Math.max(2, (right / max) * 150)}px"></div>
        </div>
        <span class="lbl">${shortDateVi(weekStart)}</span>
      </div>`;
    })
    .join("");

  document.getElementById("chart-legend").innerHTML = `
    <span><span class="legend-dot" style="background:var(--forest)"></span>${esc(runnerMap.nam_quoc.short_name)}</span>
    <span><span class="legend-dot" style="background:var(--race-red)"></span>${esc(runnerMap.hong_phuc.short_name)}</span>
  `;
}

function renderStats(runnerMap) {
  const ids = ["nam_quoc", "hong_phuc"];
  const el = document.getElementById("progress-stats");
  el.innerHTML = ids
    .map((id) => {
      const s = store.getStats(id);
      return `
      <div class="runner-card">
        <h3>${esc(runnerMap[id].full_name.toUpperCase())}</h3>
        <dl class="stat-grid">
          <div><dt>TỔNG SỐ BUỔI</dt><dd>${s.sessions}</dd></div>
          <div><dt>TỔNG QUÃNG ĐƯỜNG</dt><dd>${s.totalKm.toFixed(1)} km</dd></div>
          <div><dt>TỶ LỆ BÁM GIÁO ÁN</dt><dd>${s.adherenceRate}%</dd></div>
          <div><dt>BÀI TEST GẦN NHẤT</dt><dd style="font-size:1rem">${s.lastTest ? formatDateVi(s.lastTest.date) : "Chưa có"}</dd></div>
        </dl>
      </div>`;
    })
    .join("");
}

function renderTestHistory(runnerMap) {
  const ids = ["nam_quoc", "hong_phuc"];
  const rows = ids.flatMap((id) =>
    store
      .getAllWorkoutLogs(id)
      .filter((l) => l.is_test)
      .map((l) => ({ ...l, runnerName: runnerMap[id].short_name }))
  );
  rows.sort((a, b) => b.date.localeCompare(a.date));

  const el = document.getElementById("test-history");
  if (rows.length === 0) {
    el.innerHTML = `<p class="dim" style="font-style:italic">Chưa có bài test nào được ghi nhận.</p>`;
    return;
  }
  el.innerHTML = rows
    .map(
      (r) =>
        `<div class="test-history-row"><span>${esc(r.runnerName)} · ${formatDateVi(r.date)}</span><span>${esc(r.actual_summary || r.avg_pace || "—")}</span></div>`
    )
    .join("");
}
