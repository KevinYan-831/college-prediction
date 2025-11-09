# Environment Setup Instructions

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Click on your project
3. Go to **Settings** (gear icon) → **API**
4. Copy the following values:

### Values to Copy:

- **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
- **anon public** key (starts with `eyJhbG...`)
- **service_role** key (starts with `eyJhbG...`) - **Keep this secret!**

## Step 2: Add to .env File

Open your `.env` file and add these lines:

```env
# PostgreSQL Database (if you have it, otherwise skip)
# DATABASE_URL=postgresql://...

# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional API Keys
GUGUDATA_APPKEY=your_key_or_skip
DEEPSEEK_API_KEY=your_key_or_skip

# Server Config
PORT=5000
```

## Step 3: Create Database Tables

After adding the credentials:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **+ New Query**
3. Copy the entire SQL script from `SUPABASE_SETUP_GUIDE.md` (Step 3)
4. Click **Run** or press `Ctrl+Enter`
5. Verify tables created in **Table Editor**

## Step 4: Test Connection

Run this command:
```bash
node test-supabase.js
```

If successful, you'll see:
```
✅ Successfully connected to Supabase!
✅ Database tables exist
✅ Authentication is configured correctly
🎉 All tests passed!
```

## Step 5: Start Development

```bash
npm run dev
```

---

## Quick Checklist

- [ ] Added `VITE_SUPABASE_URL` to .env
- [ ] Added `VITE_SUPABASE_ANON_KEY` to .env
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` to .env
- [ ] Ran SQL setup script in Supabase
- [ ] Tested connection with `node test-supabase.js`
- [ ] Started dev server with `npm run dev`

---

## Need Help?

If you get stuck:
1. Check that all 3 Supabase variables are in `.env`
2. Verify the SQL tables were created (check Table Editor)
3. Make sure there are no typos in the keys
4. Restart dev server after changing `.env`
