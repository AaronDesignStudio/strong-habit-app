import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a default/dummy client for build time when environment variables are missing
let supabase

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using fallback configuration.')
  
  // Create a dummy client for build time
  supabase = createClient(
    'https://placeholder.supabase.co', 
    'placeholder_key',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: 'public',
    },
    realtime: {
      channels: {},
      endpoint: `${supabaseUrl}/realtime/v1`,
    },
  })
}

export { supabase } 