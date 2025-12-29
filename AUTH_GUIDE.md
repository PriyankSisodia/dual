# Authentication Guide

## Overview

DUAL now requires users to sign up and log in before accessing the main feed. The authentication system uses Supabase Auth.

## Pages Created

### 1. `/login` - Login Page
- Email and password login
- Link to signup page
- Redirects to home after successful login

### 2. `/signup` - Signup Page
- Full name, username, email, and password
- Username is optional (uses email if not provided)
- Password must be at least 6 characters
- Automatically creates a user profile
- Redirects to home after successful signup

### 3. `/` - Home Page (Protected)
- Requires authentication
- Redirects to `/login` if not authenticated
- Shows loading spinner while checking auth

## Authentication Flow

1. **New User:**
   - Visit `/` → Redirected to `/login`
   - Click "Sign up" → Fill form → Account created → Redirected to `/`

2. **Existing User:**
   - Visit `/` → Redirected to `/login` if not logged in
   - Enter credentials → Redirected to `/`

3. **Logged In User:**
   - Visit `/` → See main feed
   - Click "Sign Out" in header → Logged out → Redirected to `/login`

## API Routes

- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signout` - Sign out user

## Features

- **Protected Routes:** Main feed requires authentication
- **Auto-redirect:** Unauthenticated users are redirected to login
- **Session Management:** Uses Supabase Auth cookies
- **Profile Creation:** Automatically creates profile on signup
- **Logout:** Sign out button in header

## Testing

1. **Test Signup:**
   ```
   - Go to /signup
   - Fill in the form
   - Submit
   - Should redirect to home
   ```

2. **Test Login:**
   ```
   - Go to /login
   - Enter credentials
   - Submit
   - Should redirect to home
   ```

3. **Test Logout:**
   ```
   - While logged in, click "Sign Out"
   - Should redirect to /login
   ```

4. **Test Protection:**
   ```
   - Log out
   - Try to visit /
   - Should redirect to /login
   ```

## Notes

- Email confirmation is optional (can be enabled in Supabase Dashboard)
- Password reset can be added later
- Social login (Google, GitHub, etc.) can be added via Supabase Auth

