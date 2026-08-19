import * as store from "./store.js";
import { journalPage, journalSection } from "./copy.js";
import { requireLogin, renderHeader } from "./nav.js";
import { todayStr, formatDateVi } from "./dates.js";

store.seedDemoDataIfEmpty();
const currentId = requireLogin();
if (currentId) {
  renderHeader("journal.html");
  init();
}

function esc(s) {
  if (s === null || s === undefined) return "";
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function init() {
  document.getElementById("page-title").textContent = journalPage.title;
  document.getElementById("page-lead").textContent = journalPage.lead;
  document.getElementById("upload-hint-text").textContent = journalSection.uploadHint;
  document.getElementById("prompt-hints").textContent = journalSection.promptHints.join("  ·  ");
  document.getElementById("btn-add").textContent = journalSection.addCta;
  document.getElementById("f-date").value = todayStr();

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

  document.getElementById("journal-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const date = document.getElementById("f-date").value || todayStr();
    const note = document.getElementById("f-note").value || null;
    store.insertJournalEntry({ runner_id: currentId, date, note, photo_path: photoDataUrl });
    photoDataUrl = null;
    document.getElementById("upload-preview").style.display = "none";
    document.getElementById("f-note").value = "";
    fileInput.value = "";
    renderList();
  });

  renderList();
}

function renderList() {
  const runners = Object.fromEntries(store.getRunners().map((r) => [r.id, r]));
  const entries = store.getJournalEntries(undefined, 200);
  const listEl = document.getElementById("journal-list");

  if (entries.length === 0) {
    listEl.innerHTML = `<p class="dim" style="font-style:italic">${journalSection.empty}</p>`;
    return;
  }

  listEl.innerHTML = entries
    .map(
      (e) => `
      <div class="journal-card" style="margin-bottom:16px;color:var(--ink);background:var(--cream-soft)">
        ${e.photo_path ? `<img src="${e.photo_path}" alt="" style="height:220px" />` : ""}
        <div class="pad">
          <p class="meta" style="color:var(--earth)">${esc(runners[e.runner_id]?.short_name)} · ${formatDateVi(e.date)}</p>
          ${e.note ? `<p class="note" style="color:var(--ink)">${esc(e.note)}</p>` : ""}
          <button type="button" class="btn-small danger" data-id="${e.id}" style="margin-top:10px">Xóa</button>
        </div>
      </div>`
    )
    .join("");

  listEl.querySelectorAll("button[data-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      store.deleteJournalEntry(Number(btn.dataset.id));
      renderList();
    });
  });
}
