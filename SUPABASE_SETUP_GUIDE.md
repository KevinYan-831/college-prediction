# Supabase Setup Guide for College Predictor

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "New Project"
3. Fill in:
   - **Project Name**: `college-predictor` (or your choice)
   - **Database Password**: (generate a strong password - SAVE THIS!)
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
4. Click "Create new project"
5. Wait 2-3 minutes for database provisioning

---

## Step 2: Get API Credentials

1. In your Supabase project dashboard, go to **Settings** (gear icon) → **API**
2. Copy these values:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (keep this secret!)
```

3. Add to your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note:** `VITE_` prefix makes variables accessible in client-side React code.

---

## Step 3: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **+ New Query**
3. Copy and paste this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create unlock_codes table
CREATE TABLE unlock_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Create user_unlocked_predictions table
CREATE TABLE user_unlocked_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unlock_code_id UUID REFERENCES unlock_codes(id) ON DELETE SET NULL
);

-- Create index for faster lookups
CREATE INDEX idx_unlock_codes_code ON unlock_codes(code);
CREATE INDEX idx_unlock_codes_user_id ON unlock_codes(user_id);
CREATE INDEX idx_user_unlocked_predictions_user_id ON user_unlocked_predictions(user_id);
CREATE INDEX idx_user_unlocked_predictions_session_id ON user_unlocked_predictions(session_id);

-- Function to generate random unlock code
CREATE OR REPLACE FUNCTION generate_unlock_code()
RETURNS TEXT AS $$
DECLARE
  characters TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Exclude confusing chars
  code TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    code := code || substr(characters, floor(random() * length(characters) + 1)::int, 1);
    IF i = 4 THEN
      code := code || '-'; -- Add hyphen in middle: XXXX-XXXX
    END IF;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to create unlock code for specific user
CREATE OR REPLACE FUNCTION create_unlock_code_for_user(
  p_user_email TEXT,
  p_notes TEXT DEFAULT NULL,
  p_expires_days INTEGER DEFAULT NULL
)
RETURNS TABLE(code TEXT, user_email TEXT, created_at TIMESTAMP WITH TIME ZONE) AS $$
DECLARE
  v_user_id UUID;
  v_code TEXT;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Find user by email
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_user_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', p_user_email;
  END IF;

  -- Generate unique code
  LOOP
    v_code := generate_unlock_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM unlock_codes WHERE unlock_codes.code = v_code);
  END LOOP;

  -- Calculate expiration if specified
  IF p_expires_days IS NOT NULL THEN
    v_expires_at := NOW() + (p_expires_days || ' days')::INTERVAL;
  END IF;

  -- Insert code
  INSERT INTO unlock_codes (code, user_id, notes, expires_at)
  VALUES (v_code, v_user_id, p_notes, v_expires_at);

  -- Return result
  RETURN QUERY
  SELECT v_code, p_user_email, NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security (RLS)
ALTER TABLE unlock_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_unlocked_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for unlock_codes
-- Users can only see their own unlock codes
CREATE POLICY "Users can view their own unlock codes"
  ON unlock_codes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own codes (mark as used)
CREATE POLICY "Users can update their own unlock codes"
  ON unlock_codes FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_unlocked_predictions
-- Users can view their own unlocked predictions
CREATE POLICY "Users can view their own unlocked predictions"
  ON user_unlocked_predictions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own unlocked predictions
CREATE POLICY "Users can insert their own unlocked predictions"
  ON user_unlocked_predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

4. Click **Run** or press `Ctrl+Enter`
5. Verify tables created: Go to **Table Editor** and see `unlock_codes` and `user_unlocked_predictions`

---

## Step 4: Configure Email Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (should be enabled by default)
3. Configure email settings:
   - Go to **Authentication** → **Email Templates**
   - Customize "Confirm signup" and "Magic Link" templates if needed
4. Optional: Configure custom SMTP in **Settings** → **Authentication** → **SMTP Settings**

---

## Step 5: Generate Admin Access for Unlock Codes

Since you want to generate codes without building an admin dashboard, you'll use the SQL Editor:

### To Generate an Unlock Code for a User:

1. Go to **SQL Editor**
2. Run this query (replace with actual user email):

```sql
-- Generate unlock code for specific user
SELECT * FROM create_unlock_code_for_user(
  'user@example.com',           -- User's email
  'Generated for premium access', -- Optional notes
  NULL                            -- Expiration days (NULL = never expires)
);
```

3. The result will show the generated code like: `ABCD-EFGH`
4. Copy this code and send to the user

### To View All Unlock Codes:

```sql
-- View all unlock codes with user info
SELECT
  uc.code,
  uc.is_used,
  uc.created_at,
  uc.used_at,
  uc.expires_at,
  uc.notes,
  u.email as user_email
FROM unlock_codes uc
LEFT JOIN auth.users u ON uc.user_id = u.id
ORDER BY uc.created_at DESC;
```

### To Check if a User Has Unlocked a Prediction:

```sql
-- Check unlocked predictions for a user
SELECT
  uup.*,
  u.email as user_email,
  uc.code as unlock_code_used
FROM user_unlocked_predictions uup
LEFT JOIN auth.users u ON uup.user_id = u.id
LEFT JOIN unlock_codes uc ON uup.unlock_code_id = uc.id
WHERE u.email = 'user@example.com'
ORDER BY uup.unlocked_at DESC;
```

---

## Step 6: Update Environment Variables

Create or update `.env` file in project root:

```env
# Existing Database
DATABASE_URL=postgresql://...

# Existing APIs
GUGUDATA_APPKEY=...
DEEPSEEK_API_KEY=...

# Supabase (NEW)
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

PORT=5000
```

---

## Step 7: Test Authentication (After Implementation)

1. Run the app: `npm run dev`
2. You should see the landing page
3. Click "Sign Up" and create a test account
4. Check Supabase dashboard → **Authentication** → **Users** to see the new user
5. Generate an unlock code for that user using SQL
6. Test the unlock flow

---

## Common SQL Commands for Managing Codes

### Generate Multiple Codes for Same User:
```sql
SELECT * FROM create_unlock_code_for_user('user@example.com', 'Code batch 1');
SELECT * FROM create_unlock_code_for_user('user@example.com', 'Code batch 2');
```

### Generate Code with Expiration (30 days):
```sql
SELECT * FROM create_unlock_code_for_user(
  'user@example.com',
  'Expires in 30 days',
  30
);
```

### Manually Create Code (if you prefer specific format):
```sql
INSERT INTO unlock_codes (code, user_id, notes)
SELECT 'CUSTOM-CODE', id, 'Manual code'
FROM auth.users WHERE email = 'user@example.com';
```

### Delete Expired Codes:
```sql
DELETE FROM unlock_codes
WHERE expires_at IS NOT NULL
AND expires_at < NOW();
```

### Revoke/Delete a Code:
```sql
DELETE FROM unlock_codes WHERE code = 'ABCD-EFGH';
```

---

## Security Notes

1. **Never expose `SUPABASE_SERVICE_ROLE_KEY`** in client-side code - only use in backend
2. **Never commit `.env`** to git (already in .gitignore)
3. **Row Level Security (RLS)** is enabled - users can only see/use their own codes
4. **Email verification** is recommended in production (enable in Supabase Auth settings)

---

## Next Steps

After completing this setup:
1. Implement authentication UI components
2. Create landing page
3. Add unlock code validation
4. Test end-to-end flow

---

## Troubleshooting

### Can't connect to Supabase?
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
- Restart dev server after changing `.env`

### User can't sign up?
- Check email confirmation is disabled OR check spam folder
- Verify Email provider is enabled in Supabase

### Code generation fails?
- Ensure user exists in `auth.users` table
- Check SQL function exists: `SELECT generate_unlock_code();`

---

Ready to implement! Let's build the authentication system.
