import * as store from "./store.js";
import { planPage, weeklyPromises } from "./copy.js";
import { requireLogin, renderHeader } from "./nav.js";
import { todayStr, formatDateVi, getWeekRange, addDays } from "./dates.js";
import { fetchSheetPlanEntries, getPlanSheetUrl } from "./sheet-plan.js";

let activeFilter = 0;
let planEntries = [];
let planSource = "local";
let planError = "";

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

  loadPlanEntries();
}

async function loadPlanEntries() {
  const listEl = document.getElementById("plan-list");
  listEl.innerHTML = `<p class="dim" style="font-style:italic">Đang tải giáo án...</p>`;

  planError = "";
  planSource = getPlanSheetUrl() ? "sheet" : "local";

  try {
    const sheet = await fetchSheetPlanEntries();
    if (sheet.source === "sheet") {
      planEntries = sheet.entries.filter((p) => p.runner_id === currentId);
    } else {
      planEntries = store.getAllPlanEntries(currentId);
    }
  } catch (error) {
    planError = error.message || "Không đọc được Google Sheet.";
    planSource = "fallback";
    planEntries = store.getAllPlanEntries(currentId);
  }

  renderList();
}

function renderList() {
  const today = todayStr();
  let entries = [...planEntries];

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
    listEl.innerHTML = `${sourceNote()}<p class="dim" style="font-style:italic">Chưa có bài nào trong khoảng này.</p>`;
    return;
  }

  listEl.innerHTML = sourceNote() + entries
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

function sourceNote() {
  if (planError) {
    return `<p class="plan-source-note error">Không đọc được Google Sheet, đang hiển thị dữ liệu lưu trong trình duyệt. ${esc(planError)}</p>`;
  }
  if (planSource === "sheet") {
    return `<p class="plan-source-note">Đang đọc giáo án từ Google Sheet.</p>`;
  }
  return "";
}
