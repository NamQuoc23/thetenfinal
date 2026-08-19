let overlay;

function ensureOverlay() {
  if (overlay) return overlay;
  overlay = document.createElement("div");
  overlay.className = "lightbox-overlay";
  overlay.innerHTML = `
    <div class="lightbox-box">
      <img src="" alt="" />
      <p class="lightbox-credit"></p>
      <button type="button" class="lightbox-close" aria-label="Đóng">×</button>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  overlay.querySelector(".lightbox-close").addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
  return overlay;
}

function close() {
  overlay?.classList.remove("open");
}

export function openLightbox({ src, alt, credit }) {
  const el = ensureOverlay();
  el.querySelector("img").src = src;
  el.querySelector("img").alt = alt || "";
  el.querySelector(".lightbox-credit").textContent = credit ? `Ảnh tư liệu · ${credit}` : "";
  el.classList.add("open");
}
