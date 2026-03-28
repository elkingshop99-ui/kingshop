-- ============================================================================
-- Elking Barber Shop - Booking System Schema
-- Single Shop, Simplified, Easy to Customize
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- 1. BARBERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS barbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  bio TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  specialties TEXT[] DEFAULT '{}', -- مثل: {"حلاق عام", "حلاق أطفال"}
  experience_years INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. SERVICES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL, -- مثل: 30
  category VARCHAR(100) DEFAULT 'haircut', -- haircut, kids, beard, etc
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. BARBER SERVICES (ربط من الحلاق مع الخدمات)
-- ============================================================================
CREATE TABLE IF NOT EXISTS barber_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  price_override DECIMAL(10, 2), -- لو الحلاق يأخذ سعر مختلف
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(barber_id, service_id)
);

-- ============================================================================
-- 4. WORKING HOURS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS working_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL, -- مثل: 09:00
  end_time TIME NOT NULL, -- مثل: 18:00
  is_working BOOLEAN DEFAULT true,
  break_start TIME, -- وقت الراحة
  break_end TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(barber_id, day_of_week)
);

-- ============================================================================
-- 5. BOOKINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. STAFF USERS (موظفي المحل)
-- ============================================================================
CREATE TABLE IF NOT EXISTS staff_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'staff', -- 'staff', 'manager', 'admin'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. SHOP SETTINGS (إعدادات المحل)
-- ============================================================================
CREATE TABLE IF NOT EXISTS shop_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_barber_date ON bookings(barber_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_barber_services ON barber_services(barber_id);
CREATE INDEX IF NOT EXISTS idx_working_hours ON working_hours(barber_id);

-- ============================================================================
-- INSERT SAMPLE DATA
-- ============================================================================

-- Sample Barbers
INSERT INTO barbers (name, phone, email, specialties, experience_years) VALUES
  ('أحمد علي', '0501234567', 'ahmad@elking.com', '{"حلاق عام", "حلاق لحية"}', 8),
  ('محمود سالم', '0502345678', 'mahmoud@elking.com', '{"حلاق عام", "حلاق أطفال"}', 5),
  ('علي محمد', '0503456789', 'ali@elking.com', '{"حلاق عام"}', 3)
ON CONFLICT DO NOTHING;

-- Sample Services
INSERT INTO services (name_ar, name_en, description_ar, description_en, price, duration_minutes, category) VALUES
  ('حلاق عام', 'Regular Haircut', 'قص شعر عادي احترافي', 'Professional regular haircut', 25.00, 30, 'haircut'),
  ('حلاق لحية', 'Beard Trim', 'تشذيب وتنسيق اللحية', 'Beard trimming and shaping', 15.00, 15, 'beard'),
  ('حلاق أطفال', 'Kids Haircut', 'قص شعر آمن للأطفال', 'Safe haircut for kids', 20.00, 25, 'kids'),
  ('حلاق + لحية', 'Haircut + Beard', 'قص شعر مع لحية', 'Hair and beard combo', 35.00, 45, 'combo')
ON CONFLICT DO NOTHING;

-- Sample Shop Settings
INSERT INTO shop_settings (key, value) VALUES
  ('shop_name', 'Elking Barber Shop'),
  ('shop_phone', '+966501234567'),
  ('shop_email', 'info@elkingshop.com'),
  ('shop_address', 'الرياض، المملكة العربية السعودية'),
  ('timezone', 'Asia/Riyadh'),
  ('currency', 'SAR'),
  ('booking_advance_days', '30'),
  ('min_advance_hours', '1'),
  ('break_time_minutes', '15')
ON CONFLICT DO NOTHING;

-- Sample Staff Users
INSERT INTO staff_users (email, password_hash, name, phone, role, is_active) VALUES
  ('admin@kingshop.com', 'YWRtaW4xMjM=', 'أحمد المدير', '0501234567', 'admin', true),
  ('barber@kingshop.com', 'YmFyYmVyMTIz', 'محمود الحلاق', '0502345678', 'staff', true),
  ('staff@kingshop.com', 'c3RhZmYxMjM=', 'علي الموظف', '0503456789', 'staff', true)
ON CONFLICT DO NOTHING;
