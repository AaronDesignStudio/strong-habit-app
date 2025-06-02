# 🔧 Google Cloud Console Update for Production

## 🚨 Fix Required: Add Production URL to Google Cloud Console

You're seeing localhost redirects because your Google Cloud Console doesn't have your production URL configured.

## 📝 Step-by-Step Fix:

### 1. Go to Google Cloud Console
- Navigate to [Google Cloud Console](https://console.cloud.google.com/)
- Select your project

### 2. Go to Credentials
- Click **APIs & Services** → **Credentials**
- Click on your **OAuth 2.0 Client ID** (should be named "StrongHabit" or similar)

### 3. Update Authorized JavaScript Origins
Add your production URL to the **Authorized JavaScript origins** section:

**Current (what you should see):**
```
http://localhost:3002
```

**Add this URL:**
```
https://strong-habit-app.netlify.app
```

**Final result should be:**
```
http://localhost:3002
https://strong-habit-app.netlify.app
```

### 4. Verify Authorized Redirect URIs
Make sure this section contains your Supabase callback URL:
```
https://pgzyskfyyvihbukrsynr.supabase.co/auth/v1/callback
```

### 5. Save Changes
- Click **Save**
- Wait 5-15 minutes for changes to propagate

## 🔍 What This Fixes:

- ✅ **Production Google login** will work correctly
- ✅ **No more localhost redirects** on production
- ✅ **Proper redirect** to your Netlify app
- ✅ **Development still works** on localhost

## 🚀 After Making Changes:

1. **Wait 5-15 minutes** for Google to propagate changes
2. **Test Google login** on your production site
3. **Should redirect properly** to `/dashboard` on your Netlify domain

## 🔧 Code Changes Made:

- ✅ **Fixed redirect URL logic** to use correct production URL
- ✅ **Added environment-aware configuration**
- ✅ **Centralized URL management** in config file
- ✅ **Better logging** to debug redirect URLs

## 🎯 Expected Flow:

**Production:**
1. User clicks "Continue with Google"
2. Redirects to Google OAuth
3. User authenticates
4. Google redirects to: `https://strong-habit-app.netlify.app/dashboard`
5. User lands on dashboard with authentication complete

**Development:**
1. User clicks "Continue with Google"
2. Redirects to Google OAuth  
3. User authenticates
4. Google redirects to: `http://localhost:3002/dashboard`
5. User lands on dashboard with authentication complete

Your Google authentication should work perfectly after updating the Google Cloud Console settings! 🎉 