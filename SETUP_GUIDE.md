# 📋 Elking Barber Shop - Setup Guide

## ✅ What We Built

**A simple, beautiful online booking system for your barber shop**

### 📄 Pages
1. **Customer Booking Page** (/) - Simple form to book appointment
   - Select barber
   - Choose service (with price)
   - Pick date & time
   - Enter name, phone, email
   - Optional notes

2. **Staff Dashboard** (/dashboard) - Manage all bookings
   - View today's bookings
   - View all bookings
   - Confirm bookings (green button)
   - Cancel bookings (red button)
   - Filter by date

3. **Staff Login** (/login) - Simple login for staff
   - Email: any email
   - Password: any 6+ characters
   - (You can integrate with real auth later)

### 🌐 Features
- ✅ Arabic (RTL) + English
- ✅ Mobile responsive
- ✅ Modern dark theme with gold accents
- ✅ Real-time booking management
- ✅ No POS, no analytics, no admin system - just booking!

---

## 🚀 Installation (Step by Step)

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up (free account)
3. Create new project (copy project name)
4. Wait for project to initialize (~2 minutes)
5. Go to **Settings > API**
6. Copy:
   - **Project URL** → Save as `VITE_SUPABASE_URL`
   - **Anon Public Key** → Save as `VITE_SUPABASE_ANON_KEY`

### Step 2: Setup Database Schema

1. In Supabase, go to **SQL Editor**
2. Create new query
3. Open `schema.sql` file from this project
4. Copy all content and paste in Supabase SQL editor
5. Click "Run"
6. Wait for completion ✓

**What was created:**
- ✅ barbers table (3 sample barbers)
- ✅ services table (4 sample services)
- ✅ bookings table
- ✅ working_hours table
- ✅ staff_users table
- ✅ shop_settings table

### Step 3: Clone & Setup Project

```bash
# Navigate to where you want the project
cd D:\

# Clone the repository
git clone https://github.com/elkingshop99-ui/kingshop.git
cd kingshop

# Install dependencies
npm install
```

### Step 4: Configure Environment

1. Create file: `.env.local` (in project root, same level as package.json)
2. Add your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Save the file

### Step 5: Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Step 6: Test It

#### Customer Side (/)
1. Click "Book Now" button
2. Fill the booking form
3. Submit
4. You should see success message

#### Staff Side (/dashboard)
1. Click "Dashboard" in header
2. Enter any email and password (6+ chars)
3. Click "دخول" (Login)
4. You'll see today's bookings
5. Click "تأكيد" (Confirm) or "إلغاء" (Cancel)

---

## 🎨 Customization

### Add Real Barbers

In Supabase SQL Editor, paste this:

```sql
-- Replace with your actual barber info
DELETE FROM barbers;

INSERT INTO barbers (name, phone, email, specialties, experience_years) VALUES
  ('محمود علي', '0501234567', 'mahmoud@elking.com', '{"حلاق عام"}', 10),
  ('أحمد حسن', '0502345678', 'ahmad@elking.com', '{"حلاق لحية"}', 8),
  ('علي محمد', '0503456789', 'ali@elking.com', '{"حلاق أطفال"}', 5);
```

### Update Services & Prices

```sql
-- Update existing services
UPDATE services SET price = 30.00 WHERE name_ar = 'حلاق عام';
UPDATE services SET price = 20.00 WHERE name_ar = 'حلاق لحية';

-- Add new service
INSERT INTO services (name_ar, name_en, price, duration_minutes, category)
VALUES ('حلاق + شامبو', 'Haircut + Shampoo', 40.00, 45, 'premium');
```

### Set Working Hours

```sql
-- Set barber 1 (Monday-Friday): 9 AM - 6 PM
DELETE FROM working_hours;

INSERT INTO working_hours (barber_id, day_of_week, start_time, end_time, is_working) VALUES
  -- Monday to Friday (1-5)
  ((SELECT id FROM barbers LIMIT 1), 1, '09:00', '18:00', true),
  ((SELECT id FROM barbers LIMIT 1), 2, '09:00', '18:00', true),
  ((SELECT id FROM barbers LIMIT 1), 3, '09:00', '18:00', true),
  ((SELECT id FROM barbers LIMIT 1), 4, '09:00', '18:00', true),
  ((SELECT id FROM barbers LIMIT 1), 5, '09:00', '18:00', true),
  -- Saturday: 10 AM - 4 PM
  ((SELECT id FROM barbers LIMIT 1), 6, '10:00', '16:00', true),
  -- Sunday: Closed
  ((SELECT id FROM barbers LIMIT 1), 0, '00:00', '00:00', false);
```

### Change Shop Name

```sql
UPDATE shop_settings SET value = 'اسم محلك الجديد' WHERE key = 'shop_name';
UPDATE shop_settings SET value = '+966501234567' WHERE key = 'shop_phone';
UPDATE shop_settings SET value = 'address@example.com' WHERE key = 'shop_email';
UPDATE shop_settings SET value = 'العنوان الكامل' WHERE key = 'shop_address';
```

---

## 📱 Build & Deploy

### Build for Production

```bash
npm run build
```

This creates `dist/` folder with optimized production build.

### Test Production Build Locally

```bash
npm run preview
```

### Deploy to Vercel

```bash
git add .
git commit -m "Deploy message"
git push origin main
```

Then:
1. Go to https://vercel.com
2. Import your GitHub repo
3. Add environment variables
4. Deploy!

---

## 🔑 Default Staff Login

**Email:** admin@elking.com  
**Password:** password123

(Change these in database later)

---

## 📊 Database Tables

### barbers
- id, name, phone, email, specialties (array), experience_years

### services  
- id, name_ar, name_en, price, duration_minutes, category

### bookings
- id, barber_id, service_id, customer_name, customer_phone, customer_email, booking_date, booking_time, status (pending/confirmed/completed/cancelled), notes

### working_hours
- id, barber_id, day_of_week (0=Sunday, 6=Saturday), start_time, end_time

### staff_users
- id, email, password_hash, name, role

### shop_settings
- key, value (for shop configuration)

---

## 🆘 Troubleshooting

### "Supabase credentials not found"
- Make sure `.env.local` file exists in project root
- Check you didn't make a typo in `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY`
- Restart dev server after changing .env.local

### Bookings not showing in dashboard
- Check if you're logged in correctly
- Make sure no bookings exist for today in database
- Try filtering to "جميع الحجوزات" (All Bookings)

### Error "No matching policies found"
- Make sure you ran the complete schema.sql file in Supabase
- Check that tables exist in Supabase SQL editor

### App not loading
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console for errors (F12)
- Make sure Supabase is running and accessible

---

## 📞 Support

If you have issues, check:
1. `.env.local` file has correct credentials
2. Schema was fully executed in Supabase
3. Browser console (F12) for error messages
4. Supabase dashboard for data issues

---

## 🎯 Next Steps (Optional)

1. **Add Email Notifications** - Send booking confirmations
2. **Add Real Staff Authentication** - Replace mock login
3. **Add Google Calendar Integration** - Sync bookings
4. **Add Payment System** - Collect payment on booking
5. **Add Review System** - Let customers rate services
6. **Add Analytics** - Track revenue and customers

---

**Your booking system is ready to use! Happy bookings! 🎉**
