// Tiện ích ngày giờ dùng chung — múi giờ Việt Nam.

const TZ = "Asia/Ho_Chi_Minh";

export function nowInTz() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
}

export function toDateStr(d) {
  return d.toLocaleDateString("sv-SE", { timeZone: TZ });
}

export function todayStr() {
  return toDateStr(new Date());
}

export function parseDateStr(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateVi(s) {
  if (!s) return "—";
  const d = parseDateStr(s);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export function getWeekRange(dateStr) {
  const d = parseDateStr(dateStr);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: toDateStr(monday), end: toDateStr(sunday) };
}

export function addDays(dateStr, n) {
  const d = parseDateStr(dateStr);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

export function daysUntil(targetIso, fromDate = nowInTz()) {
  const target = new Date(targetIso);
  const msPerDay = 24 * 60 * 60 * 1000;
  const fromMidnight = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((targetMidnight.getTime() - fromMidnight.getTime()) / msPerDay);
}

export function weekNumberSince(startIso, dateStr) {
  const start = new Date(startIso);
  const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const { start: weekStart } = getWeekRange(dateStr);
  const wsDate = parseDateStr(weekStart);
  const diffDays = Math.floor((wsDate.getTime() - startMidnight.getTime()) / (24 * 60 * 60 * 1000));
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}
