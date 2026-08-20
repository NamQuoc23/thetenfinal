import { getSettings } from "./store.js";
import { weekNumberSince } from "./dates.js";
import { config } from "./config.js";

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function csvUrl(url) {
  const value = String(url || "").trim();
  if (!value) return "";
  if (value.includes("output=csv") || value.includes("format=csv")) return value;

  const match = value.match(/\/spreadsheets\/d\/([^/]+)/);
  if (!match) return value;

  const gidMatch = value.match(/[?&]gid=([^&]+)/);
  const gid = gidMatch ? gidMatch[1] : "0";
  return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv&gid=${gid}`;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  return rows;
}

function pick(row, aliases) {
  for (const alias of aliases) {
    const value = row[alias];
    if (value !== undefined && String(value).trim() !== "") return String(value).trim();
  }
  return "";
}

function parseDate(value) {
  const raw = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const yearFirst = raw.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (yearFirst) {
    const [, year, month, day] = yearFirst;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const slash = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (slash) {
    const [, day, month, year] = slash;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const date = new Date(raw);
  if (!Number.isNaN(date.getTime())) return date.toLocaleDateString("sv-SE");
  return "";
}

function parseNumber(value) {
  const normalized = String(value || "").replace(",", ".").match(/-?\d+(\.\d+)?/);
  return normalized ? Number(normalized[0]) : null;
}

function canonicalSessionType(value) {
  const raw = normalize(value);
  if (raw.includes("rest") || raw.includes("nghi") || raw.includes("off")) return "rest";
  if (raw.includes("strength") || raw.includes("gym") || raw.includes("suc_manh")) return "strength";
  if (raw.includes("plyo") || raw.includes("plyometric") || raw.includes("nhay")) return "plyometric";
  if (raw.includes("run") || raw.includes("chay")) return "run";
  return "run";
}

function toPlanEntries(rows, runnerId) {
  if (rows.length < 2) return [];
  const headers = rows[0].map(normalize);
  const settings = getSettings();

  return rows.slice(1).map((values, index) => {
    const row = Object.fromEntries(headers.map((header, i) => [header, values[i] || ""]));
    const date = parseDate(pick(row, ["date", "ngay", "ngay_tap"]));
    if (!date) return null;

    const sessionType = canonicalSessionType(pick(row, ["session_type", "type", "loai", "loai_bai"]));
    const workoutName = pick(row, ["workout_name", "workout", "bai", "ten_bai", "noi_dung", "noi_dung_bai"]);
    return {
      id: `sheet-${date}-${runnerId}-${index}`,
      runner_id: runnerId,
      date,
      week_number: parseNumber(pick(row, ["week", "tuan"])) || weekNumberSince(settings.event_start_date, date),
      day_label: pick(row, ["day", "thu"]),
      type: sessionType === "rest" ? "rest" : "workout",
      session_type: sessionType,
      session_code: pick(row, ["session_code", "code", "ma_bai"]) || null,
      workout_name: sessionType === "rest" ? null : (workoutName || "Bài tập"),
      planned_distance_km: null,
      planned_duration_min: parseNumber(pick(row, ["planned_duration_min", "duration", "min", "phut", "thoi_luong"])),
      intensity: pick(row, ["intensity", "cuong_do", "zone", "pace"]) || null,
      rpe: parseNumber(pick(row, ["rpe", "do_kho"])),
      details: pick(row, ["details", "detail", "noi_dung", "bai_tap", "drills"]),
      notes: pick(row, ["notes", "note", "ghi_chu", "luu_y"]) || null,
    };
  }).filter(Boolean);
}

export function getPlanSheetUrl(runnerId) {
  const settings = getSettings();
  return settings[`${runnerId}_plan_sheet_url`] ||
    settings.plan_sheet_url ||
    config.planSheetUrls?.[runnerId] ||
    config.planSheetUrl ||
    "";
}

export async function fetchSheetPlanEntries(runnerId) {
  const url = csvUrl(getPlanSheetUrl(runnerId));
  if (!url) return { source: "local", entries: [] };

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Không đọc được Google Sheet (${response.status}).`);
  }

  const text = await response.text();
  const entries = toPlanEntries(parseCsv(text), runnerId);
  return { source: "sheet", entries };
}
