import React from 'react';
import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PortalRoster } from '@/components/portal/sections/PortalRoster';

const state = vi.hoisted(() => ({ employeeId: 'employee-own-id', queries: [] as { table: string; filters: [string, unknown][] }[] }));
vi.mock('@/hooks/usePortalEmployee', () => ({ usePortalEmployee: () => state.employeeId }));
vi.mock('@/contexts/LanguageContext', () => ({ useLanguage: () => ({ language: 'en' }) }));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: (table: string) => {
    const entry = { table, filters: [] as [string, unknown][] };
    state.queries.push(entry);
    const query = {
      select: () => query,
      eq: (key: string, value: unknown) => { entry.filters.push([key, value]); return query; },
      gte: () => query, lte: () => query, neq: () => query,
      then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(resolve),
    };
    return query;
  } },
}));

describe('Employee Roster privacy', () => {
  beforeEach(() => { state.employeeId = 'employee-own-id'; state.queries = []; });
  afterEach(cleanup);

  it('loads attendance, leave and missions only for the signed-in employee', async () => {
    render(<PortalRoster />);
    await waitFor(() => expect(state.queries).toHaveLength(3));
    expect(state.queries.map(q => q.table)).toEqual(['attendance_records', 'leave_requests', 'missions']);
    for (const query of state.queries) {
      expect(query.filters).toContainEqual(['employee_id', 'employee-own-id']);
    }
  });

  it('does not fetch any employee records without a signed-in employee identity', () => {
    state.employeeId = '';
    render(<PortalRoster />);
    expect(state.queries).toHaveLength(0);
  });
});