-- Populate working_hours table with default shop hours (9 AM - 6 PM)
-- This works for any existing barbers in the system

BEGIN;

-- Get the first shop ID (assuming single shop setup or use shop_id if needed)
-- This example uses hardcoded hours for all barbers

-- For each barber, add working hours for all 7 days (Sunday=0 to Saturday=6)
-- Hours: 09:00 - 18:00 (9 AM to 6 PM) every day

-- First, delete any existing working hours to avoid duplicates
DELETE FROM working_hours;

-- Insert working hours for all active barbers
INSERT INTO working_hours (barber_id, day_of_week, start_time, end_time, is_working)
SELECT 
    b.id,
    day.day_num,
    '09:00'::time,
    '18:00'::time,
    CASE 
        WHEN day.day_num IN (4) THEN FALSE  -- Friday (day 4) is off
        ELSE TRUE
    END AS is_working
FROM barbers b
CROSS JOIN (
    SELECT 0 as day_num UNION ALL
    SELECT 1 UNION ALL
    SELECT 2 UNION ALL
    SELECT 3 UNION ALL
    SELECT 4 UNION ALL
    SELECT 5 UNION ALL
    SELECT 6
) day
WHERE b.is_active = TRUE;

-- Verify the data
SELECT 
    b.name,
    CASE w.day_of_week
        WHEN 0 THEN 'الأحد (Sunday)'
        WHEN 1 THEN 'الاثنين (Monday)'
        WHEN 2 THEN 'الثلاثاء (Tuesday)'
        WHEN 3 THEN 'الأربعاء (Wednesday)'
        WHEN 4 THEN 'الخميس (Thursday)'
        WHEN 5 THEN 'الجمعة (Friday)'
        WHEN 6 THEN 'السبت (Saturday)'
    END as day,
    w.start_time,
    w.end_time,
    CASE WHEN w.is_working THEN '✅ يعمل' ELSE '❌ إجازة' END as status
FROM working_hours w
JOIN barbers b ON w.barber_id = b.id
ORDER BY b.name, w.day_of_week;

COMMIT;
