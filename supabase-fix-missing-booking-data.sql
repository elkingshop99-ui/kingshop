-- ============================================================================
-- Fix Missing Booking Data - Clean up incomplete bookings
-- ============================================================================

-- 1. Check for bookings with NULL barber_id or service_id
SELECT id, customer_name, customer_phone, barber_id, service_id, status, booking_date 
FROM bookings 
WHERE barber_id IS NULL 
   OR service_id IS NULL
ORDER BY created_at DESC;

-- 2. If you find incomplete bookings, you have two options:

-- OPTION A: Delete incomplete bookings (they won't show in queue)
DELETE FROM bookings 
WHERE barber_id IS NULL 
   OR service_id IS NULL;

-- OPTION B: Or restore them manually by getting first barber and first service
-- First, get the first barber and service IDs:
SELECT id, name FROM barbers WHERE is_active = true LIMIT 1;
SELECT id, name_ar FROM services WHERE is_active = true LIMIT 1;

-- Then use those IDs to update the incomplete bookings:
-- UPDATE bookings 
-- SET barber_id = 'BARBER_UUID_HERE', 
--     service_id = 'SERVICE_UUID_HERE'
-- WHERE barber_id IS NULL OR service_id IS NULL;

-- 3. ADD CONSTRAINT to prevent future incomplete bookings (optional, requires DB permission)
-- ALTER TABLE bookings ADD CONSTRAINT check_booking_ids 
-- CHECK (barber_id IS NOT NULL AND service_id IS NOT NULL);

-- 4. View all bookings with complete data
SELECT 
  b.id,
  b.customer_name,
  b.customer_phone,
  b.booking_date,
  b.booking_time,
  b.status,
  ba.name as barber_name,
  s.name_ar as service_name,
  s.price
FROM bookings b
LEFT JOIN barbers ba ON b.barber_id = ba.id
LEFT JOIN services s ON b.service_id = s.id
ORDER BY b.booking_date DESC, b.booking_time DESC;
