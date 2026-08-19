import * as store from "./store.js";
import { planPage, weeklyPromises } from "./copy.js";
import { requireLogin, renderHeader } from "./nav.js";
import { todayStr, formatDateVi, getWeekRange, addDays } from "./dates.js";

let activeFilter = 0;

store.seedDemoDataIfEmpty();
const currentId = requireLogin();
if (currentId) {
  renderHeader("plan.html");
  init();
}

function esc(s) {
  if (s === null || s === undefined) return "";
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function init() {
  document.getElementById("page-title").textContent = planPage.title;
  document.getElementById("page-lead").textContent = planPage.lead;

  const filtersEl = document.getElementById("filters");
  filtersEl.innerHTML = planPage.filters
    .map((f, i) => `<button type="button" data-i="${i}" class="${i === 0 ? "active" : ""}">${f}</button>`)
    .join("");
  filtersEl.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeFilter = Number(btn.dataset.i);
      filtersEl.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderList();
    });
  });

  renderList();
}

function renderList() {
  const today = todayStr();
  let entries = store.getAllPlanEntries(currentId);

  if (activeFilter === 0) {
    const { start, end } = getWeekRange(today);
    entries = entries.filter((p) => p.date >= start && p.date <= end);
  } else if (activeFilter === 1) {
    const monthStart = today.slice(0, 7) + "-01";
    const monthEnd = addDays(monthStart, 31).slice(0, 7) + "-01";
    entries = entries.filter((p) => p.date >= monthStart && p.date < monthEnd);
  }

  const listEl = document.getElementById("plan-list");
  if (entries.length === 0) {
    listEl.innerHTML = `<p class="dim" style="font-style:italic">Chưa có bài nào trong khoảng này.</p>`;
    return;
  }

  listEl.innerHTML = entries
    .map((p) => {
      const log = store.getWorkoutLog(currentId, p.date);
      const status = store.deriveDayStatus(p, log, p.date, today);
      const detail =
        p.type === "rest"
          ? "Ngày nghỉ"
          : [p.workout_name, p.planned_distance_km ? `${p.planned_distance_km} km` : null, p.planned_duration_min ? `${p.planned_duration_min} phút` : null, p.intensity]
              .filter(Boolean)
              .join(" · ");
      return `
        <div class="plan-day">
          <span class="date-col">${formatDateVi(p.date)}</span>
          <div class="info">
            <p class="name">${esc(p.type === "rest" ? "Nghỉ" : p.workout_name || "Bài tập")}</p>
            <p class="detail">${esc(detail)}</p>
          </div>
          <span class="status-pill status-${status}">${weeklyPromises.statusLabels[status]}</span>
        </div>`;
    })
    .join("");
}
