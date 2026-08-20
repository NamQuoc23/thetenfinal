import * as store from "./store.js";
import * as copy from "./copy.js";
import { requireLogin, renderHeader } from "./nav.js";
import { formatDateVi, getWeekRange, daysUntil, weekNumberSince, parseDateStr, toDateStr, todayStr } from "./dates.js";
import { openLightbox } from "./lightbox.js";
import { fetchSheetPlanEntries } from "./sheet-plan.js";

store.seedDemoDataIfEmpty();
const currentId = requireLogin();
if (currentId) {
  renderHeader("index.html");
  render();
}

function esc(s) {
  if (s === null || s === undefined) return "";
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function loadPlanEntriesForRunner(runnerId) {
  try {
    const sheet = await fetchSheetPlanEntries(runnerId);
    if (sheet.source === "sheet") return sheet.entries;
  } catch {
    // Sheet không đọc được — dùng dữ liệu lưu trong trình duyệt.
  }
  return store.getAllPlanEntries(runnerId);
}

function getPlanEntryForDate(planEntriesByRunner, runnerId, date) {
  return planEntriesByRunner[runnerId].find((p) => p.date === date);
}

async function render() {
  const settings = store.getSettings();
  const runners = store.getRunners();
  const runnerMap = Object.fromEntries(runners.map((r) => [r.id, r]));
  const otherId = store.otherRunnerId(currentId);
  const currentRunner = runnerMap[currentId];
  const otherRunner = runnerMap[otherId];
  const today = todayStr();
  const main = document.getElementById("main-content");

  if (store.bothFinished()) {
    main.innerHTML = renderFinished(runners, settings);
    return;
  }

  const [namQuocPlanEntries, hongPhucPlanEntries] = await Promise.all([
    loadPlanEntriesForRunner("nam_quoc"),
    loadPlanEntriesForRunner("hong_phuc"),
  ]);
  const planEntriesByRunner = { nam_quoc: namQuocPlanEntries, hong_phuc: hongPhucPlanEntries };

  const bucket = resolveTimeBucket(settings.race_datetime, store.bothFinished(), store.anyDnfOrDns());

  main.innerHTML =
    renderHero(settings) +
    renderTimeBanner(bucket) +
    renderPromise() +
    renderDualDashboard(runnerMap, settings, today) +
    renderTodayTask(currentRunner, otherRunner, today, planEntriesByRunner) +
    renderWeeklyPromises(runnerMap, settings, today, planEntriesByRunner) +
    renderRoad() +
    renderNumbers(runnerMap, settings, today) +
    renderJournalPreview(runnerMap) +
    renderRaceDay() +
    renderClosing();

  startCountdown(settings.race_datetime);
  wireLightboxButtons();
}

// ---------- Time bucket ----------
function resolveTimeBucket(raceDatetime, bothFinished, anyDnfOrDns) {
  const days = daysUntil(raceDatetime);
  if (days < 0) return anyDnfOrDns ? "dnfOrDns" : "afterBothFinished";
  if (bothFinished) return "afterBothFinished";
  if (days === 0) return "raceDay";
  if (days <= 7) return "d1to7";
  if (days <= 30) return "d8to30";
  if (days <= 60) return "d31to60";
  if (days <= 90) return "d61to90";
  return "over90";
}

// ---------- Hero ----------
function renderHero(settings) {
  const h = copy.hero;
  return `
  <section class="section-red contour-bg">
    <div class="wrap hero-inner hero-flex">
      <div class="hero-text">
        <p class="eyebrow">${h.eyebrow}</p>
        <h1 class="hero-title">${h.title}</h1>
        <p class="hero-subtitle">${h.subtitle}</p>
        <div class="hero-intro">${h.intro.map((l) => `<p>${l}</p>`).join("")}</div>
        <p class="countdown-label">${h.countdownLabel}</p>
        <div class="countdown" id="countdown"></div>
        <p class="countdown-meta">${h.countdownMeta}</p>
        <div class="hero-cta">
          <a href="#hom-nay" class="btn btn-primary">${h.primaryCta}</a>
          <a href="log.html" class="btn btn-outline">${h.secondaryCta}</a>
        </div>
      </div>
      <div class="hero-visual">
        <img src="${copy.officialAssets.keyVisual.url}" alt="${esc(copy.officialAssets.keyVisual.alt)}" />
      </div>
    </div>
  </section>`;
}

function startCountdown(targetIso) {
  const el = document.getElementById("countdown");
  if (!el) return;
  function tick() {
    const diff = Math.max(0, new Date(targetIso).getTime() - Date.now());
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const units = [
      [days, "NGÀY"],
      [hours, "GIỜ"],
      [minutes, "PHÚT"],
      [seconds, "GIÂY"],
    ];
    el.innerHTML = units
      .map(
        ([v, l], i) =>
          `<div class="unit"><span class="val">${String(v).padStart(2, "0")}</span><span class="lbl">${l}</span></div>${
            i < units.length - 1 ? '<span class="colon">:</span>' : ""
          }`
      )
      .join("");
  }
  tick();
  setInterval(tick, 1000);
}

// ---------- Time banner ----------
function renderTimeBanner(bucket) {
  const c = copy.timeBasedCopy[bucket];
  return `
  <section class="section-earth-dark">
    <div class="wrap time-banner">
      <p>${c.title}</p>
      <p class="body">${c.body}</p>
    </div>
  </section>`;
}

// ---------- Promise ----------
function renderPromise() {
  const p = copy.promiseSection;
  return `
  <section class="section-cream">
    <div class="wrap wrap--narrow" style="text-align:center">
      <h2 style="font-size:1.8rem;margin-bottom:40px">${p.title}</h2>
      <div class="promise-body">
        ${p.body.map((t) => `<p>${t}</p>`).join("")}
        <p class="promise-quote">${p.quote}</p>
      </div>
      <p class="promise-closing">${p.closing}</p>
    </div>
  </section>`;
}

// ---------- Dual dashboard ----------
function runnerCardData(id, settings, today) {
  const stats = store.getStats(id);
  const log = store.getWorkoutLog(id, today);
  return {
    sessions: stats.sessions,
    totalKm: stats.totalKm,
    week: weekNumberSince(settings.event_start_date, today),
    lastDate: log ? log.date : null,
  };
}

function renderDualDashboard(runnerMap, settings, today) {
  const d = copy.dualDashboard;
  const ids = ["nam_quoc", "hong_phuc"];
  const cards = ids.map((id) => {
    const data = runnerCardData(id, settings, today);
    const values = [
      String(data.sessions),
      `${data.totalKm.toFixed(1)} km`,
      `Tuần ${data.week}`,
      data.lastDate ? formatDateVi(data.lastDate) : "Chưa có",
    ];
    return `
      <div class="runner-card">
        <h3>${esc(runnerMap[id].full_name.toUpperCase())}</h3>
        <dl class="stat-grid">
          ${d.statLabels.map((label, i) => `<div><dt>${label}</dt><dd>${values[i]}</dd></div>`).join("")}
        </dl>
      </div>`;
  });
  return `
  <section class="section-cream">
    <div class="wrap" style="text-align:center">
      <h2 style="font-size:1.8rem">${d.title}</h2>
      <p class="dim" style="margin-top:10px">${d.lead}</p>
      <div class="dual-grid" style="text-align:left">
        ${cards[0]}
        <div class="divider-v"></div>
        ${cards[1]}
      </div>
      <p class="dim" style="margin-top:32px;font-style:italic">${d.footer}</p>
    </div>
  </section>`;
}

// ---------- Today task ----------
function renderTodayTask(currentRunner, otherRunner, today, planEntriesByRunner) {
  const t = copy.todayTask;
  const currentPlan = getPlanEntryForDate(planEntriesByRunner, currentRunner.id, today);
  const currentLog = store.getWorkoutLog(currentRunner.id, today);
  const otherPlan = getPlanEntryForDate(planEntriesByRunner, otherRunner.id, today);
  const otherLog = store.getWorkoutLog(otherRunner.id, today);
  const currentState = store.deriveDayState(currentPlan, currentLog);
  const otherState = store.deriveDayState(otherPlan, otherLog);

  let cardHtml = "";
  if (currentState === "rest") {
    cardHtml = `<p class="title">${t.restDay.title}</p><p class="body">${t.restDay.body}</p>`;
  } else if (currentState === "reduced") {
    cardHtml = `<p class="title">${t.reduced.title}</p><p class="body">${t.reduced.body}</p>`;
  } else if (currentState === "todo") {
    const metaParts = [];
    if (currentPlan?.planned_distance_km) metaParts.push(`${currentPlan.planned_distance_km} km`);
    if (currentPlan?.planned_duration_min) metaParts.push(`${currentPlan.planned_duration_min} phút`);
    if (currentPlan?.intensity) metaParts.push(currentPlan.intensity);
    cardHtml = `
      <p class="label">${t.workoutLabel}</p>
      <p class="title">${esc(currentPlan?.workout_name ?? "Chưa có bài trong giáo án")}</p>
      ${metaParts.length ? `<p class="meta">${metaParts.join(" · ")}</p>` : ""}
      <div class="actions">
        <a href="plan.html" class="btn btn-outline">${t.viewDetailCta}</a>
        <a href="log.html" class="btn btn-primary">${t.logCta}</a>
      </div>`;
  } else if (currentState === "done") {
    if (otherState === "done") {
      cardHtml = `<p class="title">${t.bothDone.title}</p><p class="body">${t.bothDone.body}</p>`;
    } else {
      const msg = t.onePersonDone(currentRunner.short_name, otherRunner.short_name);
      cardHtml = `<p class="title">${esc(msg.title)}</p><p class="body">${esc(msg.body)}</p>`;
    }
  }

  return `
  <section id="hom-nay" class="section-forest">
    <div class="wrap wrap--mid">
      <p style="font-size:12px;letter-spacing:0.2em;color:var(--cream-dim);margin-bottom:16px">HÔM NAY · ${formatDateVi(today)}</p>
      <h2 style="font-size:2rem;line-height:1.15">${t.title.map((l) => `<span style="display:block">${l}</span>`).join("")}</h2>
      <p class="dim" style="margin-top:14px">${t.intro}</p>
      <div class="today-card">${cardHtml}</div>
    </div>
  </section>`;
}

// ---------- Weekly promises ----------
function renderWeeklyPromises(runnerMap, settings, today, planEntriesByRunner) {
  const w = copy.weeklyPromises;
  const { start, end } = getWeekRange(today);
  const ids = ["nam_quoc", "hong_phuc"];

  function buildColumn(id) {
    const plans = planEntriesByRunner[id].filter((p) => p.date >= start && p.date <= end);
    const logs = store.getWorkoutLogsInRange(id, start, end);
    const planByDate = Object.fromEntries(plans.map((p) => [p.date, p]));
    const logByDate = Object.fromEntries(logs.map((l) => [l.date, l]));
    const statuses = [];
    let d = parseDateStr(start);
    for (let i = 0; i < 7; i++) {
      const dateStr = toDateStr(d);
      statuses.push(store.deriveDayStatus(planByDate[dateStr], logByDate[dateStr], dateStr, today));
      d.setDate(d.getDate() + 1);
    }
    return statuses;
  }

  const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const cols = ids.map((id) => {
    const statuses = buildColumn(id);
    const rows = dayLabels
      .map(
        (lbl, i) =>
          `<div class="week-row"><span class="day">${lbl}</span><span class="status-pill status-${statuses[i]}">${w.statusLabels[statuses[i]]}</span></div>`
      )
      .join("");
    return { html: `<div><p class="week-col-title">${esc(runnerMap[id].short_name.toUpperCase())}</p>${rows}</div>`, statuses };
  });

  const anyMissed = cols.some((c) => c.statuses.includes("missed"));
  const weekEnded = today > end;
  const weekNumber = weekNumberSince(settings.event_start_date, today);
  const daysRemainingInWeek = Math.max(0, daysUntil(`${end}T23:59:59+07:00`));

  let footerHtml;
  if (anyMissed) {
    footerHtml = w.weekMissed;
  } else if (weekEnded) {
    footerHtml = `<span style="display:block;font-weight:800;font-size:1.05rem">${w.weekComplete.title}</span><span style="display:block;margin-top:4px">${w.weekComplete.body}</span>`;
  } else {
    footerHtml = w.weekOpen;
  }

  return `
  <section class="section-cream-soft">
    <div class="wrap wrap--mid">
      <p style="font-size:12px;letter-spacing:0.2em;color:var(--earth);font-weight:700;margin-bottom:12px">TUẦN ${weekNumber} · CÒN ${daysRemainingInWeek} NGÀY</p>
      <h2 style="font-size:1.8rem">${w.title}</h2>
      <p class="dim" style="margin-top:10px;color:var(--earth)">${w.lead}</p>
      <div class="week-grid">${cols.map((c) => c.html).join("")}</div>
      <p class="week-footer">${footerHtml}</p>
    </div>
  </section>`;
}

// ---------- Road to Nui Dinh ----------
function renderRoad() {
  const r = copy.roadToNuiDinh;
  const milestones = store.getMilestones();
  const reachedCount = milestones.filter((m) => m.completed_at).length;

  const steps = milestones
    .map((m, i) => {
      const done = Boolean(m.completed_at);
      const dot = `<div class="road-dot-col"><div class="road-dot ${done ? "done" : ""}"></div><div class="road-step-title ${done ? "done" : ""}">${esc(m.title)}</div></div>`;
      const line = i < milestones.length - 1 ? `<div class="road-line ${done ? "done" : ""}"></div>` : "";
      return `<div class="road-step">${dot}${line}</div>`;
    })
    .join("");

  return `
  <section class="section-forest-dark">
    <div class="wrap wrap--mid">
      <p class="eyebrow">${r.axisName}</p>
      <h2 style="font-size:1.8rem">${r.title}</h2>
      <p class="dim" style="margin-top:10px;max-width:640px">${r.lead}</p>
      <div class="road-scroll"><div class="road-track">${steps}</div></div>
      ${
        reachedCount > 0
          ? `<div class="road-callout"><p class="title">${r.reachedMilestone.title}</p><p class="body">${r.reachedMilestone.body}</p></div>`
          : ""
      }
    </div>
  </section>`;
}

// ---------- Numbers ----------
function renderNumbers(runnerMap, settings, today) {
  const n = copy.numbers;
  const ids = ["nam_quoc", "hong_phuc"];
  const data = ids.map((id) => {
    const stats = store.getStats(id);
    const consistent = store.getMostConsistentWeek(id);
    return {
      id,
      sessions: stats.sessions,
      totalKm: stats.totalKm,
      adherenceRate: stats.adherenceRate,
      weekLabel: consistent ? `Tuần ${weekNumberSince(settings.event_start_date, consistent.weekStart)}` : "Chưa đủ dữ liệu",
      lastTest: stats.lastTest,
    };
  });
  const daysRemaining = Math.max(0, daysUntil(settings.race_datetime));

  const rows = [
    [n.metricLabels[0], data.map((d) => String(d.sessions))],
    [n.metricLabels[1], data.map((d) => `${d.totalKm.toFixed(1)} km`)],
    [n.metricLabels[2], data.map((d) => `${d.adherenceRate}%`)],
    [n.metricLabels[3], data.map((d) => d.weekLabel)],
  ];

  const bothHaveTest = data.every((d) => d.lastTest);

  return `
  <section class="section-cream">
    <div class="wrap wrap--mid">
      <h2 style="font-size:1.8rem">${n.title}</h2>
      <p class="dim" style="margin-top:10px;color:var(--earth)">${n.lead}</p>
      <div class="numbers-top">
        <div>
          <p class="numbers-days">${daysRemaining}</p>
          <p class="numbers-days-label">${n.metricLabels[5]}</p>
        </div>
        <p class="numbers-chart-lead">${n.chartLead}</p>
      </div>
      <table class="metrics">
        <thead><tr><th></th><th>${esc(runnerMap.nam_quoc.short_name.toUpperCase())}</th><th>${esc(runnerMap.hong_phuc.short_name.toUpperCase())}</th></tr></thead>
        <tbody>
          ${rows.map(([label, vals]) => `<tr><td>${label}</td><td>${vals[0]}</td><td>${vals[1]}</td></tr>`).join("")}
        </tbody>
      </table>
      <div class="test-compare">
        <p class="label">${n.testCompareLabel}</p>
        <div class="test-vs-row">
          <div class="side">
            <p class="name">${esc(runnerMap.nam_quoc.short_name)}</p>
            <p class="val">${data[0].lastTest ? esc(data[0].lastTest.actual_summary || data[0].lastTest.avg_pace || "—") : "Chưa có"}</p>
            ${data[0].lastTest ? `<p class="date">${formatDateVi(data[0].lastTest.date)}</p>` : ""}
          </div>
          ${bothHaveTest ? '<span class="vs">VS</span>' : ""}
          <div class="side">
            <p class="name">${esc(runnerMap.hong_phuc.short_name)}</p>
            <p class="val">${data[1].lastTest ? esc(data[1].lastTest.actual_summary || data[1].lastTest.avg_pace || "—") : "Chưa có"}</p>
            ${data[1].lastTest ? `<p class="date">${formatDateVi(data[1].lastTest.date)}</p>` : ""}
          </div>
        </div>
        <p class="test-line">${n.testLine}</p>
      </div>
    </div>
  </section>`;
}

// ---------- Journal preview ----------
function renderJournalPreview(runnerMap) {
  const j = copy.journalSection;
  const entries = store.getJournalEntries(undefined, 6);
  const cardsHtml = entries
    .slice(0, 3)
    .map(
      (e) => `
      <div class="journal-card">
        ${e.photo_path ? `<img src="${e.photo_path}" alt="" />` : ""}
        <div class="pad">
          <p class="meta">${esc(runnerMap[e.runner_id]?.short_name)} · ${formatDateVi(e.date)}</p>
          ${e.note ? `<p class="note">${esc(e.note)}</p>` : ""}
        </div>
      </div>`
    )
    .join("");

  return `
  <section class="section-earth-dark">
    <div class="wrap wrap--mid">
      <h2 style="font-size:1.8rem">${j.title}</h2>
      <div class="journal-lead">${j.lead.map((p) => `<p>${p}</p>`).join("")}</div>
      <div style="margin-top:28px"><a href="journal.html" class="btn btn-primary">${j.addCta}</a></div>
      ${
        entries.length === 0
          ? `<p class="journal-empty">${j.empty}</p>`
          : `<div class="journal-grid">${cardsHtml}</div>`
      }
      <div class="journal-archive">
        <p class="cap">${j.archiveCaption}</p>
        <p class="explain">${j.archiveExplain}</p>
        <a href="${copy.officialAssets.previousSeasonAlbum}" target="_blank" rel="noopener noreferrer">Xem ảnh tư liệu mùa trước ↗</a>
      </div>
    </div>
  </section>`;
}

// ---------- Race day ----------
function renderRaceDay() {
  const r = copy.raceDaySection;
  return `
  <section class="section-red contour-bg">
    <div class="wrap wrap--narrow">
      <p class="eyebrow">${r.eyebrow}</p>
      <h2 style="font-size:2rem">${r.title}</h2>
      <p class="dim" style="margin-top:10px">${r.lead}</p>
      <div style="margin-top:32px">
        ${r.schedule.map((s) => `<div class="schedule-row"><span class="time">${s.time}</span><span>${s.label}</span></div>`).join("")}
      </div>
      <div class="race-specs">${r.specs.map((s) => `<span>${s}</span>`).join("")}</div>
      <div class="hero-cta">
        <button type="button" class="btn btn-primary" id="btn-schedule-lightbox">${r.ctaSchedule}</button>
        <a href="race-info.html" class="btn btn-outline">${r.ctaChecklist}</a>
      </div>
      <p class="race-closing">${r.closing}</p>
    </div>
  </section>`;
}

function wireLightboxButtons() {
  const btn = document.getElementById("btn-schedule-lightbox");
  if (btn) {
    btn.addEventListener("click", () =>
      openLightbox({
        src: copy.officialAssets.schedule.url,
        alt: copy.officialAssets.schedule.alt,
        credit: copy.officialAssets.schedule.credit,
      })
    );
  }
}

// ---------- Closing ----------
function renderClosing() {
  const c = copy.closingSection;
  return `
  <section class="section-ink">
    <div class="wrap wrap--narrow" style="text-align:center">
      <h2 class="closing-title">${c.title}</h2>
      <p class="dim" style="margin-top:16px">${c.body}</p>
      <p class="closing-footer">${c.footer}</p>
    </div>
  </section>`;
}

// ---------- Finished home ----------
function renderFinished(runners, settings) {
  const fh = copy.finishedHero;
  const fr = copy.finishedResults;
  const fs = copy.finishedSummary;
  const results = Object.fromEntries(store.getRaceResults().map((r) => [r.runner_id, r]));
  const totals = store.getJourneyTotals();

  const resultCards = runners
    .map((r) => {
      const res = results[r.id];
      const values = [res?.finish_time, res?.rank_text, res?.feeling_note];
      return `
      <div class="runner-card">
        <h3>${esc(r.full_name.toUpperCase())}</h3>
        <dl class="stat-grid" style="grid-template-columns:1fr 1fr 1fr">
          ${fr.fieldLabels.map((label, i) => `<div><dt>${label}</dt><dd style="font-size:1rem">${esc(values[i] ?? "—")}</dd></div>`).join("")}
        </dl>
      </div>`;
    })
    .join("");

  const summaryLine = [
    `${totals.totalWeeks} tuần`,
    `${totals.totalSessions} buổi tập`,
    `${totals.totalKm.toFixed(1)} kilomet`,
    `${totals.totalAdjusted} lần phải thay đổi kế hoạch`,
    `${totals.totalPhotos} khoảnh khắc được giữ lại`,
  ]
    .map((s) => `<span>${s}</span>`)
    .join("");

  return `
  <section class="section-red contour-bg">
    <div class="wrap wrap--narrow" style="text-align:center;padding:80px 20px">
      <h1 style="font-size:clamp(1.8rem,4vw,3rem)">${fh.title}</h1>
      <p style="margin-top:14px;font-size:1.3rem;font-weight:700;color:var(--race-yellow)">${fh.subtitle}</p>
      <p class="dim" style="margin-top:20px">${fh.body}</p>
    </div>
  </section>
  <section class="section-cream">
    <div class="wrap wrap--mid">
      <h2 style="font-size:1.8rem;text-align:center;margin-bottom:40px">${fr.title}</h2>
      <div class="dual-grid">${resultCards}</div>
    </div>
  </section>
  <section class="section-forest">
    <div class="wrap wrap--narrow" style="text-align:center">
      <h2 style="font-size:1.5rem;margin-bottom:36px">${fs.title}</h2>
      <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:24px;font-weight:700">${summaryLine}</div>
      <div style="margin-top:48px;display:flex;flex-direction:column;gap:14px;text-align:left;max-width:520px;margin-left:auto;margin-right:auto">
        ${fs.questions.map((q) => `<p style="background:var(--forest-light);border-radius:12px;padding:16px 20px">${q}</p>`).join("")}
      </div>
    </div>
  </section>
  <section class="section-ink">
    <div class="wrap wrap--narrow" style="text-align:center;padding:70px 20px">
      <p style="font-size:1.4rem;font-weight:800">${fs.closing}</p>
    </div>
  </section>`;
}
