# 💈 Elking Barber Shop - Online Booking System

A modern, simple online booking system for a single barber shop. Customers can book appointments online, and staff can manage bookings from a dashboard.

## ✨ Features

- 🎯 **Customer Booking Page** - Beautiful interface for selecting barber, service, date, and time
- 📊 **Staff Dashboard** - Manage all bookings, confirm or cancel appointments
- 🌐 **Bilingual UI** - Arabic (RTL) and English support
- 📱 **Responsive Design** - Works on mobile, tablet, and desktop
- 🔐 **Simple Staff Login** - Secure access to dashboard
- 🎨 **Modern Design** - Clean, professional UI with gold accents

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Supabase account (free at https://supabase.com)

### 1. Clone the Repository
```bash
git clone https://github.com/elkingshop99-ui/kingshop.git
cd kingshop
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project
2. Go to **SQL Editor** and run the schema from `schema.sql`
3. Copy your Project URL and Anon Key

### 3. Configure Environment

Create `.env.local` in the project root:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
kingshop/
├── src/
│   ├── pages/
│   │   ├── BookingPage.tsx      # Customer booking interface
│   │   ├── DashboardPage.tsx    # Staff dashboard
│   │   └── LoginPage.tsx        # Staff login
│   ├── components/
│   │   └── Header.tsx           # Navigation header
│   ├── db/
│   │   └── supabase.ts          # Supabase client & types
│   ├── locales/
│   │   ├── ar.json              # Arabic translations
│   │   └── en.json              # English translations
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── schema.sql                   # Database schema
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## 🛠️ Customization

### Add More Barbers
In Supabase SQL Editor:
```sql
INSERT INTO barbers (name, phone, email, experience_years) 
VALUES ('أحمد', '0501234567', 'ahmad@email.com', 5);
```

### Add More Services
```sql
INSERT INTO services (name_ar, name_en, price, duration_minutes, category)
VALUES ('حلاق عام', 'Regular Haircut', 25.00, 30, 'haircut');
```

### Update Shop Settings
```sql
UPDATE shop_settings 
SET value = 'New Value' 
WHERE key = 'shop_name';
```

## 🔑 Staff Login

- Email: any@email.com
- Password: any password (6+ chars)
- Then click "Dashboard"

## 📱 Pages

### Customer Side
- **` /`** - Booking page (select barber, service, date, time)
- Book appointment with name, phone, and optional email

### Staff Side
- **`/login`** - Staff login
- **`/dashboard`** - View today's or all bookings, confirm/cancel

## 🌍 Languages

- **Arabic** - Full RTL support with Cairo font
- **English** - LTR with Outfit font

Switch languages using the "EN/AR" button in header.

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables
4. Deploy

```bash
vercel --prod
```

### Deploy to Netlify

```bash
npm run build
# Drag and drop dist/ folder to Netlify
```

## 📞 Support

For issues or feature requests, please open an issue on GitHub.

## 📄 License

Proprietary - Elking Barber Shop

---

**Built with React, TypeScript, Supabase, and Tailwind CSS** ✨
