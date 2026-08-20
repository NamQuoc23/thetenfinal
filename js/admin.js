import * as store from "./store.js";
import { adminPage } from "./copy.js";
import { requireLogin, renderHeader } from "./nav.js";
import { formatDateVi, weekNumberSince, todayStr } from "./dates.js";

store.seedDemoDataIfEmpty();
const currentId = requireLogin();
if (currentId) {
  renderHeader("admin.html");
  init();
}

function esc(s) {
  if (s === null || s === undefined) return "";
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function init() {
  document.getElementById("page-title").textContent = adminPage.title;
  document.getElementById("page-lead").textContent = adminPage.lead;

  initSettings();
  initSheetSource();
  initPlanForm();
  initMilestones();
  initResults();
}

function initSettings() {
  const s = store.getSettings();
  document.getElementById("s-datetime").value = s.race_datetime.slice(0, 16);
  document.getElementById("s-name").value = s.race_name;
  document.getElementById("s-location").value = s.race_location;
  document.getElementById("s-distance").value = s.race_distance_km;
  document.getElementById("s-elevation").value = s.race_elevation_m;
  document.getElementById("s-cutoff").value = s.race_cutoff_hours;
  document.getElementById("s-start").value = s.event_start_date;

  document.getElementById("settings-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const dtVal = document.getElementById("s-datetime").value;
    store.updateSettings({
      race_datetime: dtVal ? `${dtVal}:00+07:00` : s.race_datetime,
      race_name: document.getElementById("s-name").value,
      race_location: document.getElementById("s-location").value,
      race_distance_km: document.getElementById("s-distance").value,
      race_elevation_m: document.getElementById("s-elevation").value,
      race_cutoff_hours: document.getElementById("s-cutoff").value,
      event_start_date: document.getElementById("s-start").value,
    });
    alert("Đã lưu thông tin giải.");
  });
}

function initSheetSource() {
  const input = document.getElementById("s-plan-sheet-url");
  if (!input) return;

  input.value = store.getSettings().plan_sheet_url || "";
  document.getElementById("sheet-source-form").addEventListener("submit", (e) => {
    e.preventDefault();
    store.updateSettings({
      plan_sheet_url: input.value.trim(),
    });
    alert("Đã lưu nguồn giáo án Google Sheet.");
  });
}

function initPlanForm() {
  const runnerSelect = document.getElementById("p-runner");
  runnerSelect.innerHTML = store.getRunners().map((r) => `<option value="${r.id}">${esc(r.full_name)}</option>`).join("");
  document.getElementById("p-date").value = todayStr();

  document.getElementById("plan-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const settings = store.getSettings();
    const date = document.getElementById("p-date").value;
    store.upsertPlanEntry({
      runner_id: runnerSelect.value,
      date,
      week_number: weekNumberSince(settings.event_start_date, date),
      type: document.getElementById("p-type").value,
      workout_name: document.getElementById("p-name").value || null,
      planned_distance_km: document.getElementById("p-km").value ? Number(document.getElementById("p-km").value) : null,
      planned_duration_min: document.getElementById("p-min").value ? Number(document.getElementById("p-min").value) : null,
      intensity: document.getElementById("p-intensity").value || null,
      notes: null,
    });
    document.getElementById("p-name").value = "";
    document.getElementById("p-km").value = "";
    document.getElementById("p-min").value = "";
    document.getElementById("p-intensity").value = "";
    renderPlanAdminList();
  });

  renderPlanAdminList();
}

function renderPlanAdminList() {
  const runners = Object.fromEntries(store.getRunners().map((r) => [r.id, r]));
  const all = [...store.getAllPlanEntries("nam_quoc"), ...store.getAllPlanEntries("hong_phuc")].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  const el = document.getElementById("plan-admin-list");
  if (all.length === 0) {
    el.innerHTML = `<p class="dim">Chưa có bài nào.</p>`;
    return;
  }
  el.innerHTML = all
    .slice(0, 40)
    .map(
      (p) => `
      <div class="admin-row" style="justify-content:space-between;background:var(--cream);padding:8px 12px;border-radius:8px">
        <span style="font-size:13px">${formatDateVi(p.date)} · ${esc(runners[p.runner_id]?.short_name)} · ${p.type === "rest" ? "Nghỉ" : esc(p.workout_name || "Bài tập")}</span>
        <button type="button" class="btn-small danger" data-id="${p.id}">Xóa</button>
      </div>`
    )
    .join("");
  el.querySelectorAll("button[data-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      store.deletePlanEntry(Number(btn.dataset.id));
      renderPlanAdminList();
    });
  });
}

function initMilestones() {
  renderMilestones();
}

function renderMilestones() {
  const milestones = store.getMilestones();
  const el = document.getElementById("milestones-list");
  el.innerHTML = milestones
    .map(
      (m) => `
      <div class="admin-row">
        <input type="text" class="grow" data-id="${m.id}" data-field="title" value="${esc(m.title)}" />
        <label style="font-size:13px;display:flex;align-items:center;gap:6px">
          <input type="checkbox" data-id="${m.id}" data-field="done" ${m.completed_at ? "checked" : ""} /> Đã đạt
        </label>
      </div>`
    )
    .join("");

  el.querySelectorAll('input[data-field="title"]').forEach((input) => {
    input.addEventListener("change", () => {
      store.updateMilestone(Number(input.dataset.id), { title: input.value });
    });
  });
  el.querySelectorAll('input[data-field="done"]').forEach((input) => {
    input.addEventListener("change", () => {
      store.updateMilestone(Number(input.dataset.id), {
        completed_at: input.checked ? new Date().toISOString() : null,
      });
    });
  });
}

function initResults() {
  const runners = store.getRunners();
  const el = document.getElementById("results-form");
  el.innerHTML = runners
    .map((r) => {
      const res = store.getRaceResult(r.id) || {};
      return `
      <div style="margin-bottom:20px">
        <p style="font-weight:700;margin-bottom:8px">${esc(r.full_name)}</p>
        <div class="admin-row">
          <select data-runner="${r.id}" data-field="status">
            <option value="">Chưa có</option>
            <option value="finished" ${res.status === "finished" ? "selected" : ""}>Đã hoàn thành</option>
            <option value="dnf" ${res.status === "dnf" ? "selected" : ""}>DNF</option>
            <option value="dns" ${res.status === "dns" ? "selected" : ""}>DNS</option>
          </select>
          <input type="text" data-runner="${r.id}" data-field="finish_time" placeholder="Thời gian, vd. 58:20" value="${esc(res.finish_time || "")}" style="width:140px" />
          <input type="text" data-runner="${r.id}" data-field="rank_text" placeholder="Thứ hạng" value="${esc(res.rank_text || "")}" style="width:120px" />
        </div>
        <input type="text" data-runner="${r.id}" data-field="feeling_note" placeholder="Cảm nhận" value="${esc(res.feeling_note || "")}" style="width:100%;margin-top:8px;padding:8px 10px;border-radius:8px;border:1px solid rgba(107,74,50,0.3)" />
      </div>`;
    })
    .join("") + `<button type="button" class="btn-small save" id="btn-save-results">Lưu kết quả</button>`;

  document.getElementById("btn-save-results").addEventListener("click", () => {
    for (const r of runners) {
      const status = el.querySelector(`[data-runner="${r.id}"][data-field="status"]`).value || null;
      const finish_time = el.querySelector(`[data-runner="${r.id}"][data-field="finish_time"]`).value || null;
      const rank_text = el.querySelector(`[data-runner="${r.id}"][data-field="rank_text"]`).value || null;
      const feeling_note = el.querySelector(`[data-runner="${r.id}"][data-field="feeling_note"]`).value || null;
      store.upsertRaceResult({ runner_id: r.id, status, finish_time, rank_text, feeling_note });
    }
    alert("Đã lưu kết quả ngày thi.");
  });
}
