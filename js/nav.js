import { getCurrentRunnerId, getRunner, clearCurrentRunnerId } from "./store.js";

export function requireLogin() {
  const id = getCurrentRunnerId();
  if (!id) {
    const next = encodeURIComponent(location.pathname.split("/").pop() || "index.html");
    location.href = `login.html?next=${next}`;
    return null;
  }
  return id;
}

export function renderHeader(activePage) {
  const mount = document.getElementById("site-header");
  if (!mount) return;
  const id = getCurrentRunnerId();
  const runner = id ? getRunner(id) : null;

  const links = [
    ["plan.html", "Giáo án"],
    ["progress.html", "Tiến độ"],
    ["journal.html", "Nhật ký"],
    ["mindset.html", "Mindset"],
    ["race-info.html", "Thông tin giải"],
    ["admin.html", "Quản trị"],
  ];

  const linkHtml = (extraClass) =>
    links
      .map(
        ([href, label]) =>
          `<a href="${href}" class="${extraClass || ""}"${
            activePage === href ? ' aria-current="page"' : ""
          }>${label}</a>`
      )
      .join("");

  mount.innerHTML = `
    <div class="wrap">
      <a href="index.html" class="brand">THE FINAL TEN</a>
      <nav>${linkHtml()}</nav>
      <div class="header-actions">
        <a href="log.html" class="btn-log-small">Ghi kết quả</a>
        ${runner ? `<button type="button" class="whoami" id="logout-btn">${runner.short_name}</button>` : ""}
      </div>
    </div>
    <div class="nav-mobile">${linkHtml()}</div>
  `;

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearCurrentRunnerId();
      location.href = "login.html";
    });
  }
}
