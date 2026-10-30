import { describe, it, expect } from 'vitest';
import { compareRoster } from '@/lib/roster';
describe('Sharm roster order', () => {
  it('allowance first, then employee/rep/worker/driver', () => {
    const list = [
      { employeeId: 'a1', jobTitleAr: 'سائق' },
      { employeeId: 'a2', jobTitleAr: 'عامل نظافة' },
      { employeeId: 'a3', jobTitleAr: 'مندوب' },
      { employeeId: 'a4', jobTitleAr: 'مشرف أمن' },
      { employeeId: 'a5', jobTitleAr: 'سائق', hasRosterAllowance: true },
    ].sort(compareRoster).map(e => e.employeeId);
    expect(list).toEqual(['a5', 'a4', 'a3', 'a2', 'a1']);
  });
});
