# Deploy to Vercel (Free Hosting)

## Quick Deploy (Recommended)

### Option 1: Deploy via Vercel Website (Easiest)

1. **Go to Vercel**: https://vercel.com
2. **Sign up/Login** with your GitHub account
3. **Click "Add New Project"**
4. **Import your repository**: Select `PriyankSisodia/dual`
5. **Configure Project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
6. **Add Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for server-side operations)
7. **Click "Deploy"**

That's it! Your site will be live in ~2 minutes at `https://dual-xxxxx.vercel.app`

---

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project directory)
cd /Users/priyank.sisodia/Mine/working/dual
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? dual (or press enter for default)
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy to production
vercel --prod
```

---

## Environment Variables Setup

You'll need to add these in Vercel Dashboard → Settings → Environment Variables:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Get from: Supabase Dashboard → Settings → API → Project URL
   - Example: `https://xxxxx.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Get from: Supabase Dashboard → Settings → API → anon/public key
   - This is safe to expose (it's public)

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Get from: Supabase Dashboard → Settings → API → service_role key
   - ⚠️ **Keep this secret!** Only add it in Vercel, never commit to GitHub

---

## After Deployment

1. **Get your live URL**: Vercel will give you a URL like `https://dual.vercel.app`
2. **Update Supabase Auth Redirect URLs**:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel URL to "Redirect URLs"
   - Example: `https://dual.vercel.app`, `https://dual.vercel.app/auth/callback`

3. **Test your site**: Visit your Vercel URL and test signup/login

---

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `dual.app`)
3. Follow DNS configuration instructions
4. Update Supabase redirect URLs with your custom domain

---

## Free Tier Limits

- **100GB bandwidth/month** (plenty for most apps)
- **Unlimited deployments**
- **Automatic HTTPS**
- **Global CDN**
- **Preview deployments for every PR**

---

## Troubleshooting

**Build fails?**
- Check Vercel build logs
- Ensure all environment variables are set
- Verify `package.json` has correct scripts

**Auth not working?**
- Check Supabase redirect URLs include your Vercel domain
- Verify environment variables are set correctly

**Database connection issues?**
- Ensure Supabase project is active
- Check RLS policies allow public access where needed
- Verify service role key is correct

