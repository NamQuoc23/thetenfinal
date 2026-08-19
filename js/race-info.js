import * as store from "./store.js";
import { raceInfoPage, raceDaySection, officialAssets } from "./copy.js";
import { requireLogin, renderHeader } from "./nav.js";

const CHECKLIST_KEY = "dinh10k_checklist_v1";
const CHECKLIST_ITEMS = [
  "Xác nhận đã nhận BIB và tag định vị",
  "Chuẩn bị túi gửi đồ, dán nhãn rõ ràng",
  "Có mặt tại khu vực tập trung trước 06:00",
  "Mang theo giấy tờ tùy thân và xác nhận đăng ký",
  "Kiểm tra thời tiết Núi Dinh sáng 27.12",
  "Sạc đầy đồng hồ GPS và điện thoại",
  "Chuẩn bị gel/nước theo kế hoạch tiếp nước cá nhân",
  "Nắm rõ vị trí cut-off và giới hạn hoàn thành 5 giờ",
];

store.seedDemoDataIfEmpty();
const currentId = requireLogin();
if (currentId) {
  renderHeader("race-info.html");
  init();
}

function init() {
  document.getElementById("page-title").textContent = raceInfoPage.title;
  document.getElementById("page-lead").textContent = raceInfoPage.lead;

  document.getElementById("schedule-rows").innerHTML = raceDaySection.schedule
    .map((s) => `<div class="schedule-row" style="color:var(--ink)"><span class="time" style="color:var(--race-red)">${s.time}</span><span>${s.label}</span></div>`)
    .join("");

  document.getElementById("specs").innerHTML = raceDaySection.specs.map((s) => `<span>${s}</span>`).join("");

  const saved = JSON.parse(localStorage.getItem(CHECKLIST_KEY) || "{}");
  const listEl = document.getElementById("checklist");
  listEl.innerHTML = CHECKLIST_ITEMS.map(
    (item, i) => `
    <label class="checklist-item ${saved[i] ? "done" : ""}" data-i="${i}">
      <input type="checkbox" ${saved[i] ? "checked" : ""} />
      <span>${item}</span>
    </label>`
  ).join("");
  listEl.querySelectorAll(".checklist-item").forEach((row) => {
    row.querySelector("input").addEventListener("change", (e) => {
      const i = row.dataset.i;
      saved[i] = e.target.checked;
      localStorage.setItem(CHECKLIST_KEY, JSON.stringify(saved));
      row.classList.toggle("done", e.target.checked);
    });
  });

  const imgSpecs = document.getElementById("img-specs");
  imgSpecs.src = officialAssets.distanceSpecs.url;
  imgSpecs.alt = officialAssets.distanceSpecs.alt;
  document.getElementById("cap-specs").textContent = `Ảnh tư liệu · ${officialAssets.distanceSpecs.credit}`;

  const imgExpo = document.getElementById("img-expo");
  imgExpo.src = officialAssets.expo.url;
  imgExpo.alt = officialAssets.expo.alt;
  document.getElementById("cap-expo").textContent = `Ảnh tư liệu · ${officialAssets.expo.credit}`;
}
