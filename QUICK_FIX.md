# Quick Fix: UI Not Clickable

## Most Likely Issues:

### 1. Database is Empty
**Symptom:** Page loads but shows "No duals found"

**Fix:** Create your first dual:
- Click "What's your take? Start a Dual" button
- Fill in the form
- Submit

### 2. Not Signed In
**Symptom:** Buttons show alerts saying "Please sign in"

**Fix:** 
- Click "Sign In" button in header
- Enter email/password (or sign up first)
- Or go to Supabase Dashboard → Authentication → Add user manually

### 3. Environment Variables Missing
**Symptom:** Error message at top of page about Supabase variables

**Fix:**
```bash
# Check if file exists
ls -la .env.local

# If missing, create it:
cp env.example .env.local

# Then edit it with your Supabase credentials
```

### 4. JavaScript Errors
**Symptom:** Nothing happens when clicking

**Fix:**
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Share the error message

## Quick Test:

1. **Open browser console** (F12)
2. **Run this:**
   ```javascript
   fetch('/api/duals?sort=trending&limit=5')
     .then(r => r.json())
     .then(d => console.log('API Response:', d))
   ```

3. **Check the response:**
   - If you see `{ data: [], error: null }` → Database is empty (normal!)
   - If you see an error → There's a connection issue

## Immediate Action:

**If the page is completely blank or buttons don't work:**

1. Check browser console (F12) for errors
2. Make sure `npm run dev` is running
3. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
4. Check if `.env.local` has your Supabase credentials

**If you see "No duals found":**
- This is normal! Your database is empty
- Click "Create First Dual" button
- Fill the form and submit
- Your dual will appear!

