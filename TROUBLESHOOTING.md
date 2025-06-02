# Troubleshooting Guide

## Common Supabase Setup Issues

### Error: "Error updating user stats: {}"

This error typically occurs when there's an issue with your Supabase configuration. Here's how to fix it:

### 1. Check Environment Variables

First, verify your environment variables are set correctly:

```bash
# Check if .env.local exists
ls -la .env.local

# View the contents (make sure the values are filled in)
cat .env.local
```

Your `.env.local` should look like:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

**❌ Don't use the placeholder values!**

### 2. Get Your Actual Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Sign in and select your project
3. Go to **Settings** > **API**
4. Copy:
   - **Project URL** (starts with `https://`)
   - **Project API Key** > **anon** **public** (long string starting with `eyJ...`)

### 3. Update Your .env.local File

Replace the placeholder values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Set Up Database Schema

If you haven't done this yet:

1. Go to your Supabase dashboard
2. Open **SQL Editor**
3. Copy the entire SQL schema from `supabase-setup.md`
4. Paste and run it

### 5. Enable Anonymous Sign-ins

1. In your Supabase dashboard, go to **Authentication** > **Settings**
2. Scroll down to **User Management**
3. Enable **Enable anonymous sign-ins**
4. Click **Save**

### 6. Restart Your Development Server

After making changes:
```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### 7. Check Browser Console

Open your browser's Developer Tools (F12) and check the Console tab for detailed error messages.

## Debugging Steps

### Test 1: Check Connection

The app will now test the Supabase connection on startup. Look in the browser console for:

- ✅ "Supabase connection test successful"
- ❌ "Supabase connection test failed"

### Test 2: Check Authentication

Look for these messages:
- ✅ "Anonymous sign-in successful: [user-id]"
- ❌ "Failed to sign in anonymously"

### Test 3: Check Database Access

Look for:
- ✅ "User stats updated successfully"
- ❌ "Supabase upsert error (updateUserStats)"

## Common Errors and Solutions

### "Missing Supabase environment variables"
- **Solution**: Set up your `.env.local` file with correct values

### "Anonymous sign-ins are not enabled"
- **Solution**: Enable anonymous sign-ins in Supabase dashboard

### "relation 'exercises' does not exist"
- **Solution**: Run the SQL schema in your Supabase SQL Editor

### "JWT expired" or "Invalid JWT"
- **Solution**: Check your anon key is correct and hasn't been regenerated

### "Permission denied for table"
- **Solution**: Make sure Row Level Security policies are set up (included in schema)

## Manual Testing

You can manually test your Supabase setup:

1. Go to your Supabase dashboard
2. Open **Table Editor**
3. Try creating a record in the `exercises` table
4. If this works, the issue is likely with authentication

## Still Having Issues?

1. **Check Supabase Status**: [status.supabase.com](https://status.supabase.com)
2. **Verify Project Region**: Make sure you're in the correct project
3. **Regenerate Keys**: In Settings > API, you can regenerate keys if needed
4. **Check Logs**: In Supabase dashboard > Logs for detailed error info

## Getting Help

If you're still stuck:

1. Check the browser console for detailed error messages
2. Look at the Network tab to see if API calls are failing
3. Verify your Supabase project is active and not paused
4. Create a GitHub issue with:
   - The exact error message
   - Your browser console logs
   - Whether you completed all setup steps

The migration is designed to fail gracefully, so your app should still work even if Supabase isn't connected properly. 