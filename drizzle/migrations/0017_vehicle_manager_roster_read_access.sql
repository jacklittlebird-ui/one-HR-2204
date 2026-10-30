-- Station vehicle managers: read-only access to their own station's roster data
-- (employees, attendance, leave requests, missions) so the Roster tab works in the vehicle portal.

CREATE POLICY svm_read_employees ON public.employees FOR SELECT TO authenticated
USING (
  (SELECT public.has_role(auth.uid(), 'station_vehicle_manager'::app_role))
  AND station_id = (SELECT public.get_user_station_id(auth.uid()))
);

CREATE POLICY svm_attendance_select ON public.attendance_records FOR SELECT TO authenticated
USING (
  (SELECT public.has_role(auth.uid(), 'station_vehicle_manager'::app_role))
  AND employee_id IN (SELECT e.id FROM public.employees e WHERE e.station_id = (SELECT public.get_user_station_id(auth.uid())))
);

CREATE POLICY svm_leave_requests_select ON public.leave_requests FOR SELECT TO authenticated
USING (
  (SELECT public.has_role(auth.uid(), 'station_vehicle_manager'::app_role))
  AND employee_id IN (SELECT e.id FROM public.employees e WHERE e.station_id = (SELECT public.get_user_station_id(auth.uid())))
);

CREATE POLICY svm_missions_select ON public.missions FOR SELECT TO authenticated
USING (
  (SELECT public.has_role(auth.uid(), 'station_vehicle_manager'::app_role))
  AND employee_id IN (SELECT e.id FROM public.employees e WHERE e.station_id = (SELECT public.get_user_station_id(auth.uid())))
);