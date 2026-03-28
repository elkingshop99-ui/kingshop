-- ============================================================================
-- Elking Barber Shop - Data Verification & Cleanup Queries
-- Safe SQL commands for Supabase
-- ============================================================================

-- 1️⃣ FIRST: Check for any bookings with missing barber or service data
SELECT 
  COUNT(*) as total_bookings,
  COUNT(CASE WHEN barber_id IS NULL THEN 1 END) as missing_barber,
  COUNT(CASE WHEN service_id IS NULL THEN 1 END) as missing_service
FROM bookings;

-- 2️⃣ See the problematic bookings (if any exist)
SELECT 
  id, 
  customer_name, 
  customer_phone, 
  booking_date,
  booking_time,
  barber_id, 
  service_id, 
  status,
  created_at
FROM bookings 
WHERE barber_id IS NULL OR service_id IS NULL
ORDER BY created_at DESC;

-- 3️⃣ OPTION A: Delete all incomplete bookings
-- ⚠️ CAUTION: This will delete bookings without barber or service
-- DELETE FROM bookings 
-- WHERE barber_id IS NULL OR service_id IS NULL;

-- 4️⃣ OPTION B: Fix bookings by assigning first available barber and service
-- First, get the first active barber and service:
-- SELECT id FROM barbers WHERE is_active = true LIMIT 1;
-- SELECT id FROM services WHERE is_active = true LIMIT 1;

-- Then run this to update all incomplete bookings:
-- UPDATE bookings 
-- SET barber_id = (SELECT id FROM barbers WHERE is_active = true LIMIT 1),
--     service_id = (SELECT id FROM services WHERE is_active = true LIMIT 1)
-- WHERE barber_id IS NULL OR service_id IS NULL;

-- 5️⃣ View all bookings with joined barber and service names
SELECT 
  b.id,
  b.customer_name,
  b.customer_phone,
  TO_CHAR(b.booking_date, 'YYYY-MM-DD') as booking_date,
  b.booking_time,
  b.status,
  COALESCE(ba.name, '❌ Missing') as barber_name,
  COALESCE(s.name_ar, '❌ Missing') as service_name,
  s.price,
  s.duration_minutes,
  b.created_at
FROM bookings b
LEFT JOIN barbers ba ON b.barber_id = ba.id
LEFT JOIN services s ON b.service_id = s.id
ORDER BY b.booking_date DESC, b.booking_time DESC;

-- 6️⃣ Summary statistics
SELECT 
  COUNT(DISTINCT b.id) as total_bookings,
  COUNT(DISTINCT CASE WHEN b.status = 'pending' THEN b.id END) as pending,
  COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as completed,
  COUNT(DISTINCT CASE WHEN b.status = 'cancelled' THEN b.id END) as cancelled,
  COUNT(DISTINCT ba.id) as total_barbers,
  COUNT(DISTINCT s.id) as total_services
FROM bookings b
LEFT JOIN barbers ba ON b.barber_id = ba.id
LEFT JOIN services s ON b.service_id = s.id;

-- 7️⃣ Verify all barbers and services exist
SELECT 'Barbers' as table_name, COUNT(*) as active_count 
FROM barbers WHERE is_active = true
UNION ALL
SELECT 'Services' as table_name, COUNT(*) as active_count 
FROM services WHERE is_active = true;
