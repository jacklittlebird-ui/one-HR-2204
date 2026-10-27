export interface AttachmentEntry {
  employee_id: string;
  month: string; // "MM"
  year: string;  // "YYYY"
  net_salary: number | null;
  station_id: string | null;
}

export const periodKey = (year: string, month: string) => `${year}-${month.padStart(2, '0')}`;

export function previousPeriod(year: string, month: string) {
  let y = Number(year), m = Number(month) - 1;
  if (m === 0) { m = 12; y -= 1; }
  return { year: String(y), month: String(m).padStart(2, '0') };
}

/**
 * Classify paid employees for a month vs the previous month.
 * - newHires: paid this month, never paid in any earlier month
 * - stopped: paid last month, not paid this month
 */
export function classifyAttachment(entries: AttachmentEntry[], year: string, month: string) {
  const cur = periodKey(year, month);
  const p = previousPeriod(year, month);
  const prev = periodKey(p.year, p.month);
  const current = new Map<string, AttachmentEntry>();
  const previous = new Map<string, AttachmentEntry>();
  const paidBefore = new Set<string>();
  for (const e of entries) {
    const k = periodKey(e.year, e.month);
    if (k === cur) current.set(e.employee_id, e);
    else if (k < cur) paidBefore.add(e.employee_id);
    if (k === prev) previous.set(e.employee_id, e);
  }
  const newHires = [...current.values()].filter(e => !paidBefore.has(e.employee_id));
  const stopped = [...previous.values()].filter(e => !current.has(e.employee_id));
  return { currentCount: current.size, previousCount: previous.size, newHires, stopped };
}
