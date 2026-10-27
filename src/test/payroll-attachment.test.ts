import { describe, it, expect } from 'vitest';
import { classifyAttachment, previousPeriod } from '@/lib/payrollAttachment';

const e = (id: string, year: string, month: string, net = 1000) => ({ employee_id: id, year, month, net_salary: net, station_id: null });

describe('payroll attachment', () => {
  const rows = [
    e('a', '2026', '09'), e('a', '2026', '10'),       // continuing
    e('b', '2026', '09'),                             // stopped
    e('c', '2026', '10', 7000),                       // new hire
    e('d', '2026', '07'), e('d', '2026', '10'),       // returning, not new
  ];
  it('counts both months', () => {
    const r = classifyAttachment(rows, '2026', '10');
    expect(r.previousCount).toBe(2);
    expect(r.currentCount).toBe(3);
  });
  it('new hires are only first-ever payments', () => {
    expect(classifyAttachment(rows, '2026', '10').newHires.map(x => x.employee_id)).toEqual(['c']);
  });
  it('stopped are paid last month but not this month', () => {
    expect(classifyAttachment(rows, '2026', '10').stopped.map(x => x.employee_id)).toEqual(['b']);
  });
  it('january compares with previous december', () => {
    expect(previousPeriod('2026', '01')).toEqual({ year: '2025', month: '12' });
  });
});
