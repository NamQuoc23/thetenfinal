import * as store from "./store.js";
import { logForm } from "./copy.js";
import { requireLogin, renderHeader } from "./nav.js";
import { todayStr, formatDateVi } from "./dates.js";

store.seedDemoDataIfEmpty();
const currentId = requireLogin();
if (currentId) {
  renderHeader("log.html");
  init();
}

function init() {
  document.getElementById("form-title").textContent = logForm.title;
  document.getElementById("form-lead").textContent = logForm.lead;
  document.getElementById("lbl-upload").textContent = logForm.fields.photo;
  document.getElementById("upload-hint-text").textContent = logForm.uploadHint;
  document.getElementById("ai-note").textContent = logForm.aiNote;
  document.getElementById("lbl-actual").textContent = logForm.fields.actual;
  document.getElementById("lbl-distance").textContent = logForm.fields.distance;
  document.getElementById("lbl-duration").textContent = logForm.fields.duration;
  document.getElementById("lbl-pace").textContent = logForm.fields.avgPace;
  document.getElementById("lbl-hr").textContent = logForm.fields.avgHr;
  document.getElementById("lbl-rpe").textContent = logForm.fields.rpe;
  document.getElementById("rpe-hint").textContent = logForm.rpeHint;
  document.getElementById("lbl-pain").textContent = logForm.fields.pain;
  document.getElementById("lbl-pain-location").textContent = logForm.fields.painLocation;
  document.getElementById("lbl-notes").textContent = logForm.fields.notes;
  document.getElementById("f-notes").placeholder = logForm.notesPlaceholder;
  document.getElementById("lbl-link").textContent = logForm.fields.activityLink;
  document.getElementById("btn-save").textContent = logForm.saveCta;
  document.getElementById("btn-delete").textContent = logForm.deleteCta;

  const dateInput = document.getElementById("f-date");
  const params = new URLSearchParams(location.search);
  const initialDate = params.get("date") || todayStr();
  dateInput.value = initialDate;

  let photoDataUrl = null;

  const uploadBox = document.getElementById("upload-box");
  const fileInput = document.getElementById("f-photo");
  uploadBox.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      photoDataUrl = reader.result;
      document.getElementById("upload-preview-img").src = photoDataUrl;
      document.getElementById("upload-preview").style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  function loadForDate(dateStr) {
    const plan = store.getPlanEntry(currentId, dateStr);
    const planHint = document.getElementById("plan-hint");
    if (plan) {
      const parts = [plan.workout_name, plan.planned_distance_km ? `${plan.planned_distance_km} km` : null, plan.planned_duration_min ? `${plan.planned_duration_min} phút` : null, plan.intensity].filter(Boolean);
      planHint.textContent = `${logForm.fields.plannedWorkout}: ${parts.join(" · ") || "—"}`;
    } else {
      planHint.textContent = "";
    }

    const existing = store.getWorkoutLog(currentId, dateStr);
    document.getElementById("f-status").value = existing?.status || "completed";
    document.getElementById("f-actual").value = existing?.actual_summary || "";
    document.getElementById("f-distance").value = existing?.distance_km ?? "";
    document.getElementById("f-duration").value = existing?.duration_min ?? "";
    document.getElementById("f-pace").value = existing?.avg_pace || "";
    document.getElementById("f-hr").value = existing?.avg_hr ?? "";
    document.getElementById("f-rpe").value = existing?.rpe ?? "";
    document.getElementById("f-pain").value = existing?.pain_level ?? "";
    document.getElementById("f-pain-location").value = existing?.pain_location || "";
    document.getElementById("f-notes").value = existing?.notes || "";
    document.getElementById("f-link").value = existing?.activity_link || "";
    document.getElementById("f-is-test").checked = Boolean(existing?.is_test);
    photoDataUrl = existing?.photo_path || null;
    if (photoDataUrl) {
      document.getElementById("upload-preview-img").src = photoDataUrl;
      document.getElementById("upload-preview").style.display = "block";
    } else {
      document.getElementById("upload-preview").style.display = "none";
    }
    document.getElementById("btn-delete").style.display = existing ? "inline-block" : "none";
    hideMessage();
  }

  const messageEl = document.getElementById("form-message");
  function showMessage(kind, text) {
    messageEl.className = `form-message ${kind}`;
    messageEl.textContent = text;
    messageEl.style.display = "block";
  }
  function hideMessage() {
    messageEl.style.display = "none";
  }

  dateInput.addEventListener("change", () => loadForDate(dateInput.value));
  loadForDate(initialDate);

  document.getElementById("log-form").addEventListener("submit", (e) => {
    e.preventDefault();
    try {
      const dateStr = dateInput.value;
      const plan = store.getPlanEntry(currentId, dateStr);
      store.upsertWorkoutLog({
        plan_entry_id: plan?.id ?? null,
        runner_id: currentId,
        date: dateStr,
        status: document.getElementById("f-status").value,
        planned_summary: plan?.workout_name ?? null,
        actual_summary: document.getElementById("f-actual").value || null,
        distance_km: document.getElementById("f-distance").value ? Number(document.getElementById("f-distance").value) : null,
        duration_min: document.getElementById("f-duration").value ? Number(document.getElementById("f-duration").value) : null,
        avg_pace: document.getElementById("f-pace").value || null,
        avg_hr: document.getElementById("f-hr").value ? Number(document.getElementById("f-hr").value) : null,
        rpe: document.getElementById("f-rpe").value ? Number(document.getElementById("f-rpe").value) : null,
        pain_level: document.getElementById("f-pain").value ? Number(document.getElementById("f-pain").value) : null,
        pain_location: document.getElementById("f-pain-location").value || null,
        notes: document.getElementById("f-notes").value || null,
        activity_link: document.getElementById("f-link").value || null,
        photo_path: photoDataUrl,
        is_test: document.getElementById("f-is-test").checked ? 1 : 0,
      });
      showMessage("success", `${logForm.successTitle} ${logForm.successBody}`);
      document.getElementById("btn-delete").style.display = "inline-block";
    } catch (err) {
      showMessage("error", logForm.errorMsg);
    }
  });

  document.getElementById("btn-delete").addEventListener("click", () => {
    if (!confirm(logForm.deleteConfirm)) return;
    const existing = store.getWorkoutLog(currentId, dateInput.value);
    if (existing) store.deleteWorkoutLog(existing.id);
    loadForDate(dateInput.value);
  });
}
