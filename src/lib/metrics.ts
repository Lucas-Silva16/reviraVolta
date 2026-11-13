import { variantFor, type Variant } from './crypto';
export type ResearchRow = { token_hash: string; curso: string; quantidade_litros: number; created_at: Date };
export const dayKey = (date: Date) => date.toISOString().slice(0, 10);
export function weekKey(date: Date) {
  const copy = new Date(date); copy.setUTCHours(0, 0, 0, 0);
  copy.setUTCDate(copy.getUTCDate() - ((copy.getUTCDay() + 6) % 7));
  return dayKey(copy);
}
function summarize(rows: ResearchRow[], end: Date) {
  const people = new Map<string, { days: Set<string>; first: number }>();
  let liters = 0;
  for (const row of rows) {
    const p = people.get(row.token_hash) || { days: new Set<string>(), first: +row.created_at };
    p.days.add(dayKey(row.created_at)); p.first = Math.min(p.first, +row.created_at); people.set(row.token_hash, p);
    liters += row.quantidade_litros;
  }
  const participants = people.size;
  const returning = [...people.values()].filter(p => p.days.size >= 2).length;
  const exposure = [...people.values()].map(p => Math.max(0, (+end - p.first) / 86400000));
  return {
    participants, refills: rows.length, liters: Math.round(liters * 100) / 100,
    meanRefills: participants ? rows.length / participants : 0,
    meanLiters: participants ? liters / participants : 0,
    returning, returnRate: participants ? returning / participants : 0,
    meanObservedDays: participants ? exposure.reduce((a, b) => a + b, 0) / participants : 0,
  };
}
export function calculateMetrics(rows: ResearchRow[], start: Date, end: Date, now = new Date()) {
  const asOf = new Date(Math.min(+now, +end));
  const selected = rows.filter(r => r.created_at >= start && r.created_at < end && r.created_at <= now);
  const totals = summarize(selected, asOf);
  const groups = Object.fromEntries((['A', 'B'] as Variant[]).map(v => [v, summarize(selected.filter(r => variantFor(r.token_hash) === v), asOf)])) as Record<Variant, ReturnType<typeof summarize>>;
  const periods = (key: (d: Date) => string) => {
    const map = new Map<string, ResearchRow[]>();
    for (const row of selected) { const k = key(row.created_at); map.set(k, [...(map.get(k) || []), row]); }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([period, records]) => ({ period, ...summarize(records, asOf) }));
  };
  const daily = periods(dayKey), weekly = periods(weekKey);
  const observedSpanDays = selected.length ? (+new Date(Math.max(...selected.map(r => +r.created_at))) - +new Date(Math.min(...selected.map(r => +r.created_at)))) / 86400000 : 0;
  const leagueMap = new Map<string, ResearchRow[]>();
  for (const row of selected) { const key = `${weekKey(row.created_at)}|${row.curso}`; leagueMap.set(key, [...(leagueMap.get(key) || []), row]); }
  const league = [...leagueMap.entries()].map(([key, records]) => { const [week, course] = key.split('|'); return { week, course, ...summarize(records, asOf) }; }).sort((a, b) => b.week.localeCompare(a.week) || b.liters - a.liters);
  return { totals, groups, daily, weekly, league, start: start.toISOString(), end: end.toISOString(), asOf: asOf.toISOString(), observedSpanDays, activeDays: daily.length, deltaMeanRefills: groups.B.meanRefills - groups.A.meanRefills };
}
function csvCell(value: string) {
  // Evitar fórmulas ao abrir a exportação numa folha de cálculo.
  const safe = /^[=+\-@\t\r\n]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}
export function recordsCsv(rows: ResearchRow[]) {
  return '\uFEFFtoken_hash,curso,quantidade_litros,created_at,versao\r\n' + rows.map(r => [r.token_hash, r.curso, r.quantidade_litros.toFixed(2), r.created_at.toISOString(), variantFor(r.token_hash)].map(csvCell).join(',')).join('\r\n');
}
