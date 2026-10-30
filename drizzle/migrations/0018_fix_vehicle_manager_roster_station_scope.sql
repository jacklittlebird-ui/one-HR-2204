-- Fix: get_user_station_id only covers station_manager/department_manager.
-- Vehicle managers must use get_user_station_id_svm for their station scope.

DROP POLICY IF EXISTS svm_read_employees ON public.employees;
CREATE POLICY svm_read_employees ON public.employees FOR SELECT TO authenticated
USING (
  (SELECT public.has_role(auth.uid(), 'station_vehicle_manager'::app_role))
  AND station_id = (SELECT public.get_user_station_id_svm(auth.uid()))
);

DROP POLICY IF EXISTS svm_attendance_select ON public.attendance_records;
CREATE POLICY svm_attendance_select ON public.attendance_records FOR SELECT TO authenticated
USING (
  (SELECT public.has_role(auth.uid(), 'station_vehicle_manager'::app_role))
  AND employee_id IN (SELECT e.id FROM public.employees e WHERE e.station_id = (SELECT public.get_user_station_id_svm(auth.uid())))
);

DROP POLICY IF EXISTS svm_leave_requests_select ON public.leave_requests;
CREATE POLICY svm_leave_requests_select ON public.leave_requests FOR SELECT TO authenticated
USING (
  (SELECT public.has_role(auth.uid(), 'station_vehicle_manager'::app_role))
  AND employee_id IN (SELECT e.id FROM public.employees e WHERE e.station_id = (SELECT public.get_user_station_id_svm(auth.uid())))
);

DROP POLICY IF EXISTS svm_missions_select ON public.missions;
CREATE POLICY svm_missions_select ON public.missions FOR SELECT TO authenticated
USING (
  (SELECT public.has_role(auth.uid(), 'station_vehicle_manager'::app_role))
  AND employee_id IN (SELECT e.id FROM public.employees e WHERE e.station_id = (SELECT public.get_user_station_id_svm(auth.uid())))
);