export type RosterCode = 'W' | 'H' | 'M' | 'X' | '';

/** Roster period for month `YYYY-MM`: 26th of previous month → 25th of this month. */
export function rosterPeriod(month: string): { start: string; end: string; days: string[] } {
  const [y, m] = month.split('-').map(Number);
  const startDate = new Date(Date.UTC(y, m - 2, 26));
  const endDate = new Date(Date.UTC(y, m - 1, 25));
  const days: string[] = [];
  for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(d.toISOString().slice(0, 10));
  }
  return { start: days[0], end: days[days.length - 1], days };
}

/** Current roster month: after day 25 the period belongs to next month. */
export function currentRosterMonth(today: string): string {
  const [y, m, d] = today.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + (d > 25 ? 1 : 0), 1));
  return dt.toISOString().slice(0, 7);
}

export interface DayFlags { attended?: boolean; leave?: boolean; mission?: boolean }

/** Priority: W, then M, then H, otherwise X. Future days stay empty. */
export function rosterCode(flags: DayFlags | undefined, day: string, today: string): RosterCode {
  if (flags?.attended) return 'W';
  if (flags?.mission) return 'M';
  if (flags?.leave) return 'H';
  return day > today ? '' : 'X';
}

export function rosterTotals(codes: RosterCode[]) {
  const t = { W: 0, H: 0, M: 0, X: 0 };
  for (const c of codes) if (c) t[c]++;
  return t;
}

/** Expand an inclusive date range, clipped to [start, end]. */
export function expandRange(from: string, to: string | null | undefined, start: string, end: string): string[] {
  const a = from > start ? from : start;
  const bRaw = to || from;
  const b = bRaw < end ? bRaw : end;
  const out: string[] = [];
  if (a > b) return out;
  const d = new Date(a + 'T00:00:00Z');
  const last = new Date(b + 'T00:00:00Z');
  for (; d <= last; d.setUTCDate(d.getUTCDate() + 1)) out.push(d.toISOString().slice(0, 10));
  return out;
}
