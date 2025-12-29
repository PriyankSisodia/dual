# IMMEDIATE FIX: "Email not confirmed" Error

## Quick Fix - Run This SQL (30 seconds)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy and paste this SQL:

```sql
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;
```

3. Click **Run**
4. **Done!** All existing users are now confirmed.

---

## Alternative: Disable Email Confirmation (Permanent Fix)

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Click **Email** provider
3. **Turn OFF** "Confirm email"
4. Click **Save**

This prevents the issue for all future signups.

---

## What I Just Fixed

✅ Updated signin API to auto-confirm users if service role key is set
✅ Created SQL script to confirm all existing users
✅ Code now handles unconfirmed users better

**Run the SQL script above to fix existing users immediately!**

