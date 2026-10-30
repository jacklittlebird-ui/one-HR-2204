import { describe, it, expect } from 'vitest';
import { rosterPeriod, rosterCode, rosterTotals, currentRosterMonth, expandRange } from '@/lib/roster';

describe('roster period', () => {
  it('runs from the 26th of last month to the 25th of this month', () => {
    const p = rosterPeriod('2026-10');
    expect(p.start).toBe('2026-09-26');
    expect(p.end).toBe('2026-10-25');
    expect(p.days).toHaveLength(30);
  });
  it('crosses the year boundary for January', () => {
    const p = rosterPeriod('2027-01');
    expect(p.start).toBe('2026-12-26');
    expect(p.end).toBe('2027-01-25');
  });
  it('after day 25 the current roster month is next month', () => {
    expect(currentRosterMonth('2026-10-30')).toBe('2026-11');
    expect(currentRosterMonth('2026-12-27')).toBe('2027-01');
    expect(currentRosterMonth('2026-10-25')).toBe('2026-10');
  });
});

describe('roster codes', () => {
  const today = '2026-10-20';
  it('attendance beats mission and leave', () => {
    expect(rosterCode({ mission: true, leave: true, attended: true }, '2026-10-01', today)).toBe('W');
  });
  it('mission beats leave', () => {
    expect(rosterCode({ leave: true, mission: true }, '2026-10-01', today)).toBe('M');
  });
  it('attendance gives W, nothing gives X, future gives empty', () => {
    expect(rosterCode({ attended: true }, '2026-10-01', today)).toBe('W');
    expect(rosterCode(undefined, '2026-10-01', today)).toBe('X');
    expect(rosterCode(undefined, '2026-10-21', today)).toBe('');
  });
  it('counts each code', () => {
    expect(rosterTotals(['W', 'W', 'H', 'M', 'X', ''])).toEqual({ W: 2, H: 1, M: 1, X: 1 });
  });
  it('clips leave ranges to the period', () => {
    expect(expandRange('2026-09-24', '2026-09-27', '2026-09-26', '2026-10-25')).toEqual(['2026-09-26', '2026-09-27']);
  });
});
