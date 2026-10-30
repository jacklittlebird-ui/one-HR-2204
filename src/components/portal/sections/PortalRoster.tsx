import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePortalEmployee } from '@/hooks/usePortalEmployee';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { rosterPeriod, currentRosterMonth, rosterCode, rosterTotals, expandRange, type DayFlags } from '@/lib/roster';
import { cn } from '@/lib/utils';

const cairoToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(new Date());
const codeClass: Record<string, string> = {
  W: 'bg-primary/15 text-primary', H: 'bg-warning/15 text-warning', M: 'bg-accent text-accent-foreground', X: 'bg-destructive/15 text-destructive',
};

/** Employee's own roster only — every query is filtered by the signed-in employee's id. */
export const PortalRoster = () => {
  const empId = usePortalEmployee();
  const { language } = useLanguage();
  const ar = language === 'ar';
  const today = cairoToday();
  const [month, setMonth] = useState(currentRosterMonth(today));
  const [flags, setFlags] = useState<Record<string, DayFlags>>({});
  const [loading, setLoading] = useState(false);
  const period = useMemo(() => rosterPeriod(month), [month]);

  useEffect(() => {
    if (!empId) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const map: Record<string, DayFlags> = {};
      const set = (d: string, k: keyof DayFlags) => { (map[d] ||= {})[k] = true; };
      const [att, lv, ms] = await Promise.all([
        supabase.from('attendance_records').select('date').eq('employee_id', empId).gte('date', period.start).lte('date', period.end),
        supabase.from('leave_requests').select('start_date,end_date,status').eq('employee_id', empId).lte('start_date', period.end).gte('end_date', period.start).neq('status', 'rejected'),
        supabase.from('missions').select('date,start_date,end_date,status').eq('employee_id', empId).neq('status', 'rejected'),
      ]);
      (att.data || []).forEach((r: any) => r.date && set(r.date, 'attended'));
      (lv.data || []).forEach((r: any) => expandRange(r.start_date, r.end_date, period.start, period.end).forEach(d => set(d, 'leave')));
      (ms.data || []).forEach((r: any) => {
        const from = r.start_date || r.date; if (!from) return;
        expandRange(from, r.end_date || r.date, period.start, period.end).forEach(d => set(d, 'mission'));
      });
      if (!cancelled) { setFlags(map); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [empId, period]);

  const codes = period.days.map(d => rosterCode(flags[d], d, today));
  const totals = rosterTotals(codes);
  const fmt = (d: string) => d.split('-').reverse().join('/');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{ar ? 'الروستر الخاص بي' : 'My Roster'}</h1>
        <Input type="month" value={month} onChange={e => e.target.value && setMonth(e.target.value)} className="w-44" />
      </div>
      <p className="text-sm text-muted-foreground">{fmt(period.start)} — {fmt(period.end)}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['W', 'H', 'M', 'X'] as const).map(k => (
          <Card key={k}><CardContent className="p-4 text-center">
            <p className={cn('text-xl font-bold rounded-md', codeClass[k])}>{k}</p>
            <p className="text-2xl font-bold mt-1">{totals[k]}</p>
            <p className="text-xs text-muted-foreground">{ar ? { W: 'حضور', H: 'إجازة', M: 'مأمورية', X: 'لا شيء' }[k] : { W: 'Worked', H: 'Leave', M: 'Mission', X: 'None' }[k]}</p>
          </CardContent></Card>
        ))}
      </div>
      <Card><CardContent className="p-4">
        {loading ? <p className="text-center text-muted-foreground p-6">{ar ? 'جارٍ التحميل...' : 'Loading...'}</p> : (
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {period.days.map((d, i) => (
              <div key={d} className="border rounded-md p-2 text-center">
                <p className="text-xs text-muted-foreground">{fmt(d).slice(0, 5)}</p>
                <p className={cn('mt-1 font-bold rounded', codes[i] && codeClass[codes[i]])}>{codes[i] || '—'}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent></Card>
    </div>
  );
};
