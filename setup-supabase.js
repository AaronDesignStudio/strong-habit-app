#!/usr/bin/env node

/**
 * Supabase Setup Script for Strong Habit App
 * Run this script to set up your Supabase configuration
 */

const fs = require('fs');
const path = require('path');

const ENV_EXAMPLE = `# Supabase Configuration
# Replace these with your actual Supabase project details from https://supabase.com/dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here`;

const ENV_LOCAL_PATH = path.join(process.cwd(), '.env.local');

console.log('🚀 Strong Habit App - Supabase Setup');
console.log('=====================================\n');

// Check if .env.local already exists
if (fs.existsSync(ENV_LOCAL_PATH)) {
  console.log('✅ .env.local file already exists');
  console.log('📝 Please update it with your Supabase credentials if needed\n');
} else {
  console.log('📄 Creating .env.local file...');
  try {
    fs.writeFileSync(ENV_LOCAL_PATH, ENV_EXAMPLE);
    console.log('✅ .env.local file created successfully!\n');
  } catch (error) {
    console.error('❌ Error creating .env.local file:', error.message);
    process.exit(1);
  }
}

console.log('📋 Next Steps:');
console.log('==============');
console.log('1. Go to https://supabase.com and create a new project');
console.log('2. Copy your project URL and anon key from Settings > API');
console.log('3. Update .env.local with your actual Supabase credentials');
console.log('4. Run the SQL schema from supabase-setup.md in your Supabase SQL Editor');
console.log('5. Enable anonymous sign-ins in Authentication > Settings');
console.log('6. Start your app: npm run dev\n');

console.log('📚 For detailed instructions, see: supabase-setup.md');
console.log('🔧 Need help? Check the documentation or create an issue on GitHub\n');

console.log('Happy habit tracking! 💪'); 