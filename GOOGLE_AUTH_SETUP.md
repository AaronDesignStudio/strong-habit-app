# 🔐 Google Authentication Setup Guide

This guide will help you set up Google authentication for your StrongHabit app using Supabase.

## 📝 Step 1: Google Cloud Console Setup

### 1.1 Create/Select Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

### 1.2 Enable Required APIs
1. Go to **APIs & Services** > **Library**
2. Search and enable:
   - **Google+ API** (for user profile information)
   - **People API** (optional, for additional profile data)

### 1.3 Configure OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace)
3. Fill required fields:
   - **App name**: StrongHabit
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Add scopes (optional): `email`, `profile`, `openid`
5. Save and continue

### 1.4 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client ID**
3. Choose **Web application**
4. Set name: "StrongHabit Web Client"
5. Add **Authorized JavaScript origins**:
   ```
   http://localhost:3002
   https://your-domain.com
   ```
6. Add **Authorized redirect URIs**:
   ```
   https://your-supabase-project.supabase.co/auth/v1/callback
   ```
7. Click **Create**
8. **Copy the Client ID and Client Secret** - you'll need these!

## 🔧 Step 2: Supabase Configuration

### 2.1 Enable Google Provider
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** > **Providers**
4. Find **Google** and click to configure
5. Toggle **Enable Google provider** to ON

### 2.2 Add Google Credentials
1. Paste your **Client ID** from Google Cloud Console
2. Paste your **Client Secret** from Google Cloud Console
3. Click **Save**

### 2.3 Copy Redirect URL
1. In the Google provider settings, copy the **Redirect URL**
2. It should look like: `https://xxxxx.supabase.co/auth/v1/callback`
3. Go back to Google Cloud Console and make sure this URL is in your **Authorized redirect URIs**

## 🔑 Step 3: Environment Variables

Add your Google Client ID to your `.env.local` file:

```env
# Add this line to your existing .env.local file:
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

**Note**: You only need the Client ID in your frontend. The Client Secret stays secure in Supabase.

## ✅ Step 4: Test the Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to** `http://localhost:3002`

3. **Click "Continue with Google"**

4. **You should see**:
   - Redirect to Google login
   - Google consent screen
   - Redirect back to your app at `/dashboard`
   - Your Google profile picture and name in the top-right

## 🎯 Features Enabled

After setup, users can:

- ✅ **Sign in with Google** - One-click authentication
- ✅ **See their profile** - Name, email, and avatar in dashboard
- ✅ **Data sync** - Exercises and progress sync across devices
- ✅ **Sign out** - Clean logout with redirect to welcome page
- ✅ **Fallback to anonymous** - Local users can still use the app

## 🔧 Troubleshooting

### Common Issues:

1. **"Invalid OAuth client"**
   - Check your Authorized JavaScript origins include your domain
   - Verify your Client ID matches exactly

2. **"Redirect URI mismatch"**
   - Ensure the redirect URI in Google Cloud Console matches Supabase exactly
   - Check for trailing slashes or typos

3. **Google login button doesn't work**
   - Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set correctly
   - Check browser console for errors
   - Ensure Google+ API is enabled

4. **Users can't sign out**
   - Check that the `signOut` function is imported correctly
   - Verify Supabase auth is working properly

### Debug Steps:

1. **Check browser console** for error messages
2. **Verify environment variables** are loaded:
   ```javascript
   console.log('Google Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)
   ```
3. **Test Supabase connection** using the test button (triple-click header)
4. **Check Supabase logs** in your dashboard under Authentication > Logs

## 🚀 Production Deployment

When deploying to production:

1. **Add your production domain** to Google Cloud Console:
   - Authorized JavaScript origins: `https://yourdomain.com`
   - Authorized redirect URIs: (Supabase URL stays the same)

2. **Set environment variables** in your hosting platform:
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. **Test thoroughly** in production environment

## 📱 Benefits for Users

- **Cross-device sync**: Access exercises from any device
- **No password management**: Google handles authentication
- **Trusted login**: Users trust Google's security
- **Quick setup**: One-click sign-in process
- **Profile integration**: See name and avatar in app

Your Google authentication is now fully set up! Users can enjoy a seamless login experience with data synchronization across all their devices. 