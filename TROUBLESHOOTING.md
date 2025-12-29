# Troubleshooting: UI Not Clickable

## Quick Checks

### 1. Check Browser Console
Open your browser's Developer Tools (F12) and check the Console tab for errors.

**Common errors:**
- `Missing Supabase environment variables` → Check `.env.local` file
- `Failed to fetch` → API routes not working
- `Unauthorized` → Need to sign in first

### 2. Verify Environment Variables

Make sure `.env.local` exists and has correct values:
```bash
cat .env.local
```

Should show:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
```

### 3. Check if Database Has Data

The UI might be empty because there's no data yet. To test:

1. **Sign up first:**
   - Click "Sign In" button
   - Use email/password prompts (basic auth for now)
   - Or create account via Supabase Dashboard → Authentication

2. **Create your first dual:**
   - Click "What's your take? Start a Dual"
   - Fill in topic and left side
   - Submit

3. **Check database:**
   - Go to Supabase Dashboard → Database → Tables
   - Check if `duals` table has any rows

### 4. Test API Routes Directly

Open browser console and run:
```javascript
fetch('/api/duals?sort=trending&limit=5')
  .then(r => r.json())
  .then(console.log)
```

If this fails, there's an API issue.

### 5. Common Issues & Fixes

**Issue: "Cannot read property of undefined"**
- Database might be empty
- Create a test dual first

**Issue: Buttons don't respond**
- Check browser console for JavaScript errors
- Make sure `npm run dev` is running
- Hard refresh (Cmd+Shift+R)

**Issue: "Unauthorized" errors**
- Sign in first before voting/commenting
- Check if user profile exists in `profiles` table

**Issue: Empty page**
- Database is likely empty
- Create your first dual using the "Start a Dual" button
- Or add test data via SQL Editor

## Quick Test: Create Your First Dual

1. Make sure you're signed in (or the app will prompt you)
2. Click "What's your take? Start a Dual" button
3. Enter:
   - Topic: "Test Debate"
   - Left Side: "This is a test argument"
4. Click "Create Dual"
5. Refresh the page - you should see your dual!

## Still Not Working?

1. **Check terminal output** - Look for errors when running `npm run dev`
2. **Check browser Network tab** - See if API calls are failing
3. **Verify Supabase connection:**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT COUNT(*) FROM duals;
   SELECT COUNT(*) FROM profiles;
   ```

## Next Steps After Fixing

Once the UI is working:
1. Create a few test duals
2. Try voting on them
3. Add comments
4. Test the challenge feature

