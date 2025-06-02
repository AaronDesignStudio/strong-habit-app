# 🚀 Netlify Deployment Setup

This guide will help you set up environment variables in Netlify to fix the deployment issues.

## 🔑 Step 1: Set Environment Variables in Netlify

1. **Go to your Netlify dashboard**
2. **Select your StrongHabit project**
3. **Go to Site Settings** → **Environment Variables**
4. **Add the following variables:**

### Required Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://pgzyskfyyvihbukrsynr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnenlza2Z5eXZpaGJ1a3JzeW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4Njk2OTksImV4cCI6MjA2NDQ0NTY5OX0.wDWYieFyiR5qDllk0hVr2NSmIQxmg4hiGU8ntTQqy5k
```

### Optional (for Google Auth when ready):

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## 🛠 Step 2: Deploy Again

After setting the environment variables:

1. **Trigger a new deploy** in Netlify
2. **Or push a new commit** to trigger automatic deployment

## 🔧 Fixes Applied

The following fixes have been applied to handle deployment issues:

### ✅ Environment Variable Handling
- Supabase client now handles missing environment variables gracefully
- Database functions check for configuration before attempting operations
- Build process won't fail due to missing environment variables

### ✅ Next.js Metadata Configuration
- Moved `themeColor` and `viewport` from `metadata` to `viewport` export
- Fixed Next.js 15 metadata warnings

### ✅ Build-time Safety
- Added fallback configurations for build time
- Database functions return safe defaults when Supabase isn't configured
- No more build failures due to missing environment variables

## 🎯 Expected Results

After these fixes and setting environment variables:

- ✅ **Build will succeed** on Netlify
- ✅ **No more metadata warnings**
- ✅ **Environment variable errors resolved**
- ✅ **App works correctly** with proper configuration
- ✅ **Graceful fallbacks** when environment variables are missing

## 🔍 Troubleshooting

If deployment still fails:

1. **Check build logs** for specific error messages
2. **Verify environment variables** are set correctly in Netlify
3. **Clear build cache** and try again
4. **Check that all environment variable names** match exactly

### Quick Environment Variable Check:

In Netlify dashboard → Site Settings → Environment Variables, you should see:
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅

Both should have values that match your Supabase project settings.

## 🚀 Deploy Process

1. **Set environment variables** in Netlify (above)
2. **Push these fixes** to your repository
3. **Netlify will auto-deploy** and should succeed
4. **Test the deployed app** to ensure everything works

Your app should now deploy successfully! 🎉 