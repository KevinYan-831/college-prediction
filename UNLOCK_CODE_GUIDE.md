# Universal Unlock Code System - Admin Guide

## Overview

The unlock code system uses **universal codes** that any authenticated user can use to unlock university predictions. Codes are not tied to specific users - they're shared codes that you (admin) generate and distribute.

---

## How It Works

1. **Admin generates a universal unlock code** via Supabase SQL
2. **Admin shares the code** with users (via email, message, etc.)
3. **Any user can use the code** to unlock their prediction results
4. **Codes are reusable** - multiple users can use the same code
5. **Optional expiration** - you can set codes to expire after a certain date

---

## Database Schema (Already Set Up)

Your Supabase database has these tables:

### `unlock_codes`
- `id` - UUID
- `code` - Text (unique, e.g., "ABCD-EFGH")
- `user_id` - UUID (nullable, not used for universal codes)
- `is_used` - Boolean (not used for universal codes)
- `used_at` - Timestamp (not used for universal codes)
- `created_at` - Timestamp
- `expires_at` - Timestamp (optional)
- `notes` - Text (for your reference)

### `user_unlocked_predictions`
- `id` - UUID
- `user_id` - UUID (which user unlocked)
- `session_id` - Text (which prediction they unlocked)
- `unlocked_at` - Timestamp
- `unlock_code_id` - UUID (reference to which code was used)

---

## Generate Universal Unlock Codes

### Quick Generate (Simple Code)

Go to **Supabase Dashboard** → **SQL Editor** and run:

```sql
-- Generate a simple universal code
INSERT INTO unlock_codes (code, notes)
VALUES ('PREMIUM-2024', 'Universal code for 2024 users')
RETURNING code, created_at;
```

**Result:** Code `PREMIUM-2024` is created

---

### Generate Random Code

```sql
-- Function to generate random 8-character code (format: XXXX-XXXX)
DO $$
DECLARE
  v_code TEXT;
  v_characters TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_done BOOLEAN := FALSE;
BEGIN
  WHILE NOT v_done LOOP
    -- Generate random code
    v_code := '';
    FOR i IN 1..8 LOOP
      v_code := v_code || substr(v_characters, floor(random() * length(v_characters) + 1)::int, 1);
      IF i = 4 THEN
        v_code := v_code || '-';
      END IF;
    END LOOP;

    -- Try to insert
    BEGIN
      INSERT INTO unlock_codes (code, notes)
      VALUES (v_code, 'Auto-generated universal code');

      RAISE NOTICE 'Generated code: %', v_code;
      v_done := TRUE;
    EXCEPTION WHEN unique_violation THEN
      -- Code already exists, try again
      NULL;
    END;
  END LOOP;
END $$;
```

**Result:** Random code like `A3X9-K2M7` is generated and displayed

---

### Generate Code with Expiration

```sql
-- Code that expires in 30 days
INSERT INTO unlock_codes (code, expires_at, notes)
VALUES (
  'TRIAL-2024',
  NOW() + INTERVAL '30 days',
  'Expires in 30 days'
)
RETURNING code, expires_at;
```

---

### Generate Code with Expiration (Specific Date)

```sql
-- Code that expires on December 31, 2024
INSERT INTO unlock_codes (code, expires_at, notes)
VALUES (
  'WINTER-2024',
  '2024-12-31 23:59:59',
  'Valid until end of 2024'
)
RETURNING code, expires_at;
```

---

## View All Unlock Codes

```sql
-- View all codes and their status
SELECT
  code,
  created_at,
  expires_at,
  CASE
    WHEN expires_at IS NOT NULL AND expires_at < NOW() THEN 'Expired'
    ELSE 'Active'
  END as status,
  notes,
  (SELECT COUNT(*) FROM user_unlocked_predictions WHERE unlock_code_id = unlock_codes.id) as times_used
FROM unlock_codes
ORDER BY created_at DESC;
```

---

## Check Code Usage

```sql
-- See who used a specific code
SELECT
  uc.code,
  u.email as user_email,
  uup.session_id,
  uup.unlocked_at
FROM user_unlocked_predictions uup
JOIN unlock_codes uc ON uup.unlock_code_id = uc.id
JOIN auth.users u ON uup.user_id = u.id
WHERE uc.code = 'PREMIUM-2024'
ORDER BY uup.unlocked_at DESC;
```

---

## Delete/Revoke a Code

```sql
-- Delete a specific code
DELETE FROM unlock_codes WHERE code = 'OLD-CODE';

-- Note: This won't affect users who already unlocked with this code
-- (their unlocks are preserved in user_unlocked_predictions)
```

---

## Extend Code Expiration

```sql
-- Extend expiration by 30 days
UPDATE unlock_codes
SET expires_at = expires_at + INTERVAL '30 days'
WHERE code = 'PREMIUM-2024';

-- Remove expiration (make it never expire)
UPDATE unlock_codes
SET expires_at = NULL
WHERE code = 'PREMIUM-2024';
```

---

## Batch Generate Multiple Codes

```sql
-- Generate 5 random codes at once
DO $$
DECLARE
  v_code TEXT;
  v_characters TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_count INTEGER := 0;
BEGIN
  WHILE v_count < 5 LOOP
    -- Generate random code
    v_code := '';
    FOR i IN 1..8 LOOP
      v_code := v_code || substr(v_characters, floor(random() * length(v_characters) + 1)::int, 1);
      IF i = 4 THEN
        v_code := v_code || '-';
      END IF;
    END LOOP;

    -- Try to insert
    BEGIN
      INSERT INTO unlock_codes (code, notes)
      VALUES (v_code, 'Batch generated code');

      RAISE NOTICE 'Code %: %', v_count + 1, v_code;
      v_count := v_count + 1;
    EXCEPTION WHEN unique_violation THEN
      -- Code already exists, try again
      NULL;
    END;
  END LOOP;
END $$;
```

---

## Recommended Codes to Create

### For Production:

```sql
-- Premium access code (no expiration)
INSERT INTO unlock_codes (code, notes)
VALUES ('PREMIUM-ACCESS', 'Main premium code')
RETURNING code;

-- Trial code (30 days)
INSERT INTO unlock_codes (code, expires_at, notes)
VALUES (
  'TRIAL-30DAYS',
  NOW() + INTERVAL '30 days',
  'Trial access - 30 days'
)
RETURNING code, expires_at;

-- Early bird discount code
INSERT INTO unlock_codes (code, expires_at, notes)
VALUES (
  'EARLYBIRD2024',
  '2024-12-31 23:59:59',
  'Early bird special - expires end of 2024'
)
RETURNING code, expires_at;
```

---

## Distribution Strategy

**How to share codes with users:**

1. **Email** - Send code directly to users
2. **Website** - Display on a payment confirmation page
3. **Social Media** - Share limited-time codes
4. **Partners** - Give specific codes to partners to track referrals
5. **Support** - Provide codes via customer support

**Tracking Tips:**
- Use different codes for different channels (e.g., `TWITTER-2024`, `EMAIL-PROMO`)
- Use the notes field to remember what each code is for
- Check usage regularly to see which codes are popular

---

## Security Notes

1. ✅ **Codes are case-insensitive** - Users can enter lowercase, system converts to uppercase
2. ✅ **Users must be logged in** - Authentication required to use codes
3. ✅ **Codes can be shared** - It's okay if multiple users use the same code
4. ✅ **Track usage** - You can see who used which code
5. ⚠️ **Don't make codes too obvious** - Avoid simple codes like "12345" or "CODE"

---

## Quick Reference

| Task | SQL Command |
|------|-------------|
| Create simple code | `INSERT INTO unlock_codes (code) VALUES ('YOUR-CODE');` |
| Create code with expiration | `INSERT INTO unlock_codes (code, expires_at) VALUES ('CODE', NOW() + INTERVAL '30 days');` |
| View all codes | `SELECT code, expires_at, notes FROM unlock_codes;` |
| Delete code | `DELETE FROM unlock_codes WHERE code = 'OLD-CODE';` |
| See code usage | Check usage query above |

---

## Support

If you need to:
- Create different types of codes
- Add custom validation
- Integrate with payment systems
- Track analytics

Update the SQL schema and frontend logic accordingly.
