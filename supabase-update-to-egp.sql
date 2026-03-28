-- ============================================================================
-- Update Currency to Egyptian Pounds (EGP)
-- Run this in Supabase SQL Editor to update existing data
-- ============================================================================

-- 1️⃣ Update all service prices to Egyptian Pounds
UPDATE services 
SET price = CASE 
  WHEN name_ar = 'حلاق عام' THEN 150.00
  WHEN name_ar = 'حلاق لحية' THEN 100.00
  WHEN name_ar = 'حلاق أطفال' THEN 120.00
  WHEN name_ar = 'حلاق + لحية' THEN 250.00
  ELSE price
END
WHERE is_active = true;

-- 2️⃣ Update shop settings to EGP and Egypt timezone
UPDATE shop_settings 
SET value = 'EGP' 
WHERE key = 'currency';

UPDATE shop_settings 
SET value = 'Africa/Cairo' 
WHERE key = 'timezone';

UPDATE shop_settings 
SET value = 'إلخ بارber شوب - من أفضل محلات الحلاقة في مصر' 
WHERE key = 'shop_name';

-- 3️⃣ Verify the updates
SELECT 
  name_ar,
  price,
  duration_minutes,
  category
FROM services 
WHERE is_active = true
ORDER BY category;

-- 4️⃣ Check shop settings
SELECT key, value 
FROM shop_settings 
WHERE key IN ('currency', 'timezone', 'shop_name')
ORDER BY key;

-- 5️⃣ View updated prices summary
SELECT 
  'Prices Updated to EGP' as status,
  COUNT(*) as total_services,
  ROUND(AVG(price), 2) as avg_price,
  MIN(price) as min_price,
  MAX(price) as max_price
FROM services 
WHERE is_active = true;
