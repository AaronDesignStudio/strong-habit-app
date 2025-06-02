# 🔧 Google Cloud Console Update for Production

## 🚨 Fix Required: Update Redirect URLs in Google Cloud Console

You're seeing malformed URLs because we need to update the redirect configuration.

## 📝 Step-by-Step Fix:

### 1. Go to Google Cloud Console
- Navigate to [Google Cloud Console](https://console.cloud.google.com/)
- Select your project

### 2. Go to Credentials
- Click **APIs & Services** → **Credentials**
- Click on your **OAuth 2.0 Client ID** (the one we can see in your screenshot)

### 3. Update Authorized JavaScript Origins
Add your production URL to the **Authorized JavaScript origins** section:

**Should include:**
```
http://localhost:3002
https://strong-habit-app.netlify.app
```

### 4. **IMPORTANT: Update Authorized Redirect URIs**
**Replace the current Supabase URL with these two URLs:**

**Remove:**
```
https://pgzyskfyyvihbukrsynr.supabase.co/auth/v1/callback
```

**Add these instead:**
```
https://strong-habit-app.netlify.app/auth/callback
http://localhost:3002/auth/callback
```

### 5. Save Changes
- Click **Save**
- Wait 5-15 minutes for changes to propagate

## 🔍 What This Fixes:

- ✅ **Eliminates malformed URLs** with Supabase prefix
- ✅ **Direct redirect** to your app's callback handler
- ✅ **Proper OAuth flow** without URL corruption
- ✅ **Cleaner redirect handling**

## 🚀 After Making Changes:

1. **Wait 5-15 minutes** for Google to propagate changes
2. **Test Google login** on your production site
3. **Should redirect to** `/auth/callback` then to `/dashboard`
4. **No more malformed URLs** with Supabase prefixes

## 🎯 Expected Flow After Fix:

**Production:**
1. User clicks "Continue with Google"
2. Redirects to Google authentication
3. User authenticates with Google
4. Google redirects to: `https://strong-habit-app.netlify.app/auth/callback`
5. Our callback handler processes the authentication
6. User gets redirected to: `https://strong-habit-app.netlify.app/dashboard`
7. ✅ **Clean URLs throughout the process!**

## 📋 Summary of URLs to Set:

**Authorized JavaScript Origins:**
- `http://localhost:3002`
- `https://strong-habit-app.netlify.app`

**Authorized Redirect URIs:**
- `https://strong-habit-app.netlify.app/auth/callback`
- `http://localhost:3002/auth/callback`

This should completely fix the malformed URL issue! 🎉 