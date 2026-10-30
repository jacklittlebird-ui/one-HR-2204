CREATE OR REPLACE FUNCTION public.roster_allowance_employee_ids(p_ids uuid[])
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT DISTINCT sr.employee_id FROM public.salary_records sr
  WHERE sr.employee_id = ANY(p_ids) AND COALESCE(sr.roster_allowance,0) > 0
    AND auth.uid() IS NOT NULL;
$$;
REVOKE ALL ON FUNCTION public.roster_allowance_employee_ids(uuid[]) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.roster_allowance_employee_ids(uuid[]) TO authenticated;