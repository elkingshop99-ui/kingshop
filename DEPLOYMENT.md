# Elking Barber Shop - Deployment Instructions

## 🚀 Deployment Options

### Option 1: Vercel (Recommended - Free & Fast)

#### Step 1: Push to GitHub
```bash
cd kingshop
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/elkingshop99-ui/kingshop.git
git push -u origin main
```

#### Step 2: Connect to Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click "Deploy"

#### Step 3: Your app is live! 🎉

### Option 2: Netlify

#### Step 1: Build locally
```bash
npm run build
```

#### Step 2: Deploy
1. Go to https://app.netlify.com
2. Drag and drop the `dist/` folder
3. Configure environment variables in Netlify settings

### Option 3: Self-Hosted (Docker)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

Build and run:
```bash
docker build -t kingshop .
docker run -p 3000:3000 kingshop
```

## 🔗 Environment Variables

Set these on your hosting platform:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

## ✅ Pre-Deployment Checklist

- [ ] Database schema uploaded to Supabase
- [ ] Sample barbers and services added
- [ ] Staff login credentials set up
- [ ] Environment variables configured
- [ ] All links tested locally with `npm run dev`
- [ ] Build succeeds: `npm run build`

## 🎯 Post-Deployment

1. Test booking flow end-to-end
2. Verify staff dashboard works
3. Check responsive design on mobile
4. Test language switching (AR/EN)
5. Verify email notifications (if configured)

---

**Your booking system is now live!** 🚀
