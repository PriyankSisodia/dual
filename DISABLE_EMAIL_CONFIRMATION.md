# How to Disable Email Confirmation (For Development)

If you're seeing "Email not confirmed" errors, you can disable email confirmation in Supabase for easier development.

## Option 1: Disable Email Confirmation (Recommended for Development)

1. Go to your **Supabase Dashboard**
2. Select your project
3. Go to **Authentication** → **Providers** (in the left sidebar)
4. Click on **Email** provider
5. Scroll down to **"Confirm email"** section
6. **Toggle OFF** the "Confirm email" option
7. Click **Save**

Now users can sign in immediately after signup without email confirmation.

## Option 2: Keep Email Confirmation (Production Ready)

If you want to keep email confirmation enabled (recommended for production):

1. Users will receive a confirmation email after signup
2. They need to click the link in the email to confirm their account
3. Then they can sign in

### Email Configuration

To configure email templates:
1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation email template
3. Make sure your project has email sending configured

### Testing with Email Confirmation

If you keep email confirmation enabled:
- Check your email inbox (and spam folder) for the confirmation link
- Click the link to confirm your account
- Then try signing in again

## Current Behavior

The app now:
- ✅ Shows a "Check Your Email" message after signup if confirmation is required
- ✅ Automatically redirects to home if email confirmation is disabled
- ✅ Provides clear instructions to users

## Quick Fix for Development

**Easiest solution:** Disable email confirmation in Supabase Dashboard (Option 1 above). This allows immediate sign-in after signup, perfect for development and testing.

