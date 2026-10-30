# Roster order: employee code last, for every station

## What changes
Today only Sharm uses the special order, and every other station is sorted by employee code alone. After this change, all stations, and every place the roster appears, will use the same order:

1. People who get the roster allowance first, then everyone else.
2. Inside each of those two groups: employees, then representatives (مندوب), then workers (عامل), then drivers (سائق).
3. Employee code is used last, only to order people who are tied on everything above.

This covers the main system screen, the station manager and station HR portals, and the vehicle accounts (Sharm and Cairo), including the Excel export and print.

## Technical details
- `src/components/attendance/RosterGrid.tsx`: remove the `isSharm` condition. Always fetch the roster-allowance IDs through `roster_allowance_employee_ids`, in batches, and always sort with the shared comparator.
- `src/lib/roster.ts`: rename `compareSharmRoster` to `compareRoster`. Its logic stays the same, with employee code as the final tie-breaker.
- Update `src/test/roster.test.ts` with a case for a non-Sharm station where a higher employee code that has the allowance comes before a lower code that does not.
- Check the allowance lookup works for station manager and station HR accounts. That function returns IDs only, never amounts.
