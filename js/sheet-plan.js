import { getSettings } from "./store.js";
import { weekNumberSince } from "./dates.js";
import { config } from "./config.js";

const RUNNER_IDS = ["nam_quoc", "hong_phuc"];

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

function runnerIdsFrom(value) {
  const raw = normalize(value);
  if (!raw || raw === "both" || raw === "all" || raw === "ca_hai" || raw === "2_nguoi") {
    return RUNNER_IDS;
  }
  if (raw.includes("nam") || raw.includes("quoc")) return ["nam_quoc"];
  if (raw.includes("hong") || raw.includes("phuc")) return ["hong_phuc"];
  if (RUNNER_IDS.includes(raw)) return [raw];
  return RUNNER_IDS;
}

function toPlanEntries(rows) {
  if (rows.length < 2) return [];
  const headers = rows[0].map(normalize);
  const settings = getSettings();

  return rows.slice(1).flatMap((values, index) => {
    const row = Object.fromEntries(headers.map((header, i) => [header, values[i] || ""]));
    const date = parseDate(pick(row, ["date", "ngay", "ngay_tap"]));
    if (!date) return [];

    const typeRaw = normalize(pick(row, ["type", "loai", "loai_bai", "nghi_tap"]));
    const workoutName = pick(row, ["workout_name", "workout", "bai", "ten_bai", "noi_dung", "noi_dung_bai"]);
    const type = typeRaw.includes("rest") || typeRaw.includes("nghi") || typeRaw.includes("off")
      ? "rest"
      : "workout";
    const runnerIds = runnerIdsFrom(pick(row, ["runner_id", "runner", "person", "nguoi", "ten", "van_dong_vien"]));

    return runnerIds.map((runnerId) => ({
      id: `sheet-${date}-${runnerId}-${index}`,
      runner_id: runnerId,
      date,
      week_number: weekNumberSince(settings.event_start_date, date),
      type,
      workout_name: type === "rest" ? null : (workoutName || "Bài tập"),
      planned_distance_km: parseNumber(pick(row, ["planned_distance_km", "distance", "km", "quang_duong", "cu_ly"])),
      planned_duration_min: parseNumber(pick(row, ["planned_duration_min", "duration", "min", "phut", "thoi_luong"])),
      intensity: pick(row, ["intensity", "cuong_do", "zone", "pace"]) || null,
      notes: pick(row, ["notes", "note", "ghi_chu", "luu_y"]) || null,
    }));
  });
}

export function getPlanSheetUrl() {
  return getSettings().plan_sheet_url || config.planSheetUrl || "";
}

export async function fetchSheetPlanEntries() {
  const url = csvUrl(getPlanSheetUrl());
  if (!url) return { source: "local", entries: [] };

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Không đọc được Google Sheet (${response.status}).`);
  }

  const text = await response.text();
  const entries = toPlanEntries(parseCsv(text));
  return { source: "sheet", entries };
}
