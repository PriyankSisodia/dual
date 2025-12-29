# Debug Authentication Issues

If you're still getting "Unauthorized" errors, try these steps:

## 1. Check Browser Console

Open browser DevTools (F12) → Console tab and look for:
- Cookie errors
- Network errors
- Authentication errors

## 2. Check Network Tab

1. Open DevTools → Network tab
2. Try creating a dual
3. Click on the `/api/duals` request
4. Check:
   - **Request Headers** → Look for `Cookie` header (should have `sb-` prefixed cookies)
   - **Response** → Check the error message

## 3. Verify Session

Open browser console and run:
```javascript
// Check if session exists
fetch('/api/auth/check', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log)
```

## 4. Manual Test

Try this in browser console:
```javascript
// Get current session
const supabase = await import('@supabase/supabase-js').then(m => 
  m.createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
)
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)
```

## 5. Clear Cookies and Re-login

1. Clear all cookies for localhost
2. Sign out
3. Sign in again
4. Try creating a dual

## 6. Check Server Logs

Look at your terminal where `npm run dev` is running for any error messages.

## Common Issues

- **Cookies not being sent**: Make sure `credentials: 'include'` is in all fetch calls
- **Session expired**: Try signing out and back in
- **Middleware not running**: Check if middleware.ts exists and is working
- **CORS issues**: Shouldn't happen on same origin, but check Network tab

