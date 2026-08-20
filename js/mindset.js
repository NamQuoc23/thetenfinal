import { requireLogin, renderHeader } from "./nav.js";
import { seedDemoDataIfEmpty } from "./store.js";

const PLAYLIST_KEY = "dinh10k_mindset_videos";

seedDemoDataIfEmpty();
const currentId = requireLogin();
if (currentId) {
  renderHeader("mindset.html");
  init();
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]
  ));
}

function getVideos() {
  try {
    return JSON.parse(localStorage.getItem(PLAYLIST_KEY)) || [];
  } catch {
    return [];
  }
}

function saveVideos(videos) {
  localStorage.setItem(PLAYLIST_KEY, JSON.stringify(videos));
}

function parseYouTubeId(input) {
  try {
    const url = new URL(input.trim());
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.split("/").filter(Boolean)[0] || null;
    }
    if (url.hostname.includes("youtube.com")) {
      if (url.pathname.startsWith("/shorts/")) {
        return url.pathname.split("/").filter(Boolean)[1] || null;
      }
      if (url.pathname.startsWith("/embed/")) {
        return url.pathname.split("/").filter(Boolean)[1] || null;
      }
      return url.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

function showMessage(text, kind = "success") {
  const message = document.getElementById("video-message");
  message.className = `form-message ${kind}`;
  message.textContent = text;
  message.style.display = "block";
  window.setTimeout(() => {
    message.style.display = "none";
  }, 2600);
}

function videoEmbed(video) {
  return `
    <iframe
      src="https://www.youtube.com/embed/${encodeURIComponent(video.youtubeId)}"
      title="${escapeHtml(video.title)}"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen>
    </iframe>
  `;
}

function render() {
  const videos = getVideos();
  const featured = document.getElementById("featured-video");
  const grid = document.getElementById("video-grid");

  if (!videos.length) {
    featured.innerHTML = `
      <div class="mindset-empty">
        <p class="eyebrow">CHƯA CÓ VIDEO</p>
        <h2>Dán video đầu tiên để bắt đầu playlist.</h2>
        <p>Mỗi người có thể dùng trang này như một cái giá nhỏ để đặt những câu chuyện làm mình muốn đứng dậy.</p>
      </div>
    `;
    grid.innerHTML = "";
    return;
  }

  const first = videos[0];
  featured.innerHTML = `
    <div class="featured-frame">${videoEmbed(first)}</div>
    <div class="featured-copy">
      <p class="eyebrow">ĐANG PHÁT</p>
      <h2>${escapeHtml(first.title)}</h2>
      <p>Chọn một video bất kỳ bên dưới để mở trong playlist.</p>
    </div>
  `;

  grid.innerHTML = videos.map((video, index) => `
    <article class="video-card">
      <button class="video-thumb" type="button" data-feature="${index}">
        ${videoEmbed(video)}
      </button>
      <div class="video-card-body">
        <h3>${escapeHtml(video.title)}</h3>
        <div class="video-card-actions">
          <button type="button" data-feature="${index}">Phát ở trên</button>
          <button type="button" data-delete="${index}">Xóa</button>
        </div>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll("[data-feature]").forEach((button) => {
    button.addEventListener("click", () => {
      const selected = Number(button.dataset.feature);
      const nextVideos = getVideos();
      const [picked] = nextVideos.splice(selected, 1);
      nextVideos.unshift(picked);
      saveVideos(nextVideos);
      render();
      document.getElementById("featured-video").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  grid.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      const selected = Number(button.dataset.delete);
      const nextVideos = getVideos().filter((_, index) => index !== selected);
      saveVideos(nextVideos);
      render();
    });
  });
}

function init() {
  const form = document.getElementById("video-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const titleInput = document.getElementById("video-title");
    const urlInput = document.getElementById("video-url");
    const youtubeId = parseYouTubeId(urlInput.value);

    if (!youtubeId) {
      showMessage("Link này chưa đọc được. Hãy dùng link YouTube dạng watch, shorts hoặc youtu.be.", "error");
      return;
    }

    const videos = getVideos();
    videos.unshift({
      id: `${Date.now()}`,
      title: titleInput.value.trim() || "Video truyền động lực",
      youtubeId,
    });
    saveVideos(videos);
    titleInput.value = "";
    urlInput.value = "";
    showMessage("Đã thêm video vào The Champion Mindset.");
    render();
  });

  render();
}
