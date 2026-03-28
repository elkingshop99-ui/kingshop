-- Debug script to check booking conflicts
-- Run this to see all bookings for today

-- Check all booking records for today
SELECT 
    b.id,
    b.customer_name,
    b.customer_phone,
    br.name as barber_name,
    s.name_ar as service_name,
    b.booking_date,
    b.booking_time,
    b.status,
    b.created_at
FROM bookings b
LEFT JOIN barbers br ON b.barber_id = br.id
LEFT JOIN services s ON b.service_id = s.id
WHERE b.booking_date = CURRENT_DATE
ORDER BY b.booking_time, br.name;

-- Check if there are duplicate bookings
SELECT 
    barber_id,
    booking_date,
    booking_time,
    COUNT(*) as count,
    STRING_AGG(customer_name, ', ') as customers,
    STRING_AGG(status, ', ') as statuses
FROM bookings
WHERE booking_date = CURRENT_DATE
    AND status IN ('pending', 'confirmed')
GROUP BY barber_id, booking_date, booking_time
HAVING COUNT(*) > 1
ORDER BY booking_time;

-- Check specific barber bookings for today
-- Replace 'barber-id-here' with actual barber ID
/*
SELECT 
    booking_time,
    customer_name,
    customer_phone,
    status
FROM bookings
WHERE barber_id = 'barber-id-here'
    AND booking_date = CURRENT_DATE
    AND status IN ('pending', 'confirmed')
ORDER BY booking_time;
*/
