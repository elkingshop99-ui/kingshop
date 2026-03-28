-- Quick test: Check if there are bookings for today
SELECT 
    b.booking_date,
    b.booking_time,
    br.name as barber_name,
    b.customer_name,
    b.status
FROM bookings b
LEFT JOIN barbers br ON b.barber_id = br.id
WHERE b.booking_date = CURRENT_DATE
ORDER BY b.booking_time;

-- Replace YOUR_BARBER_ID with an actual barber ID to test
-- SELECT 
--     booking_time,
--     customer_name,
--     status
-- FROM bookings
-- WHERE barber_id = 'YOUR_BARBER_ID'
--     AND booking_date = CURRENT_DATE
--     AND status IN ('pending', 'confirmed')
-- ORDER BY booking_time;
