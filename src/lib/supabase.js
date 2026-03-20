import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isConfigured =
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('placeholder') &&
  supabaseUrl !== 'https://your-project.supabase.co'

if (!isConfigured) {
  console.info(
    '[CreativeOps] Running in demo mode (no Supabase credentials).\n' +
    'Copy .env.example → .env and fill in your project URL + anon key to connect to Supabase.'
  )
}

export const supabase = createClient(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseKey  || 'placeholder-key',
  {
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        // Forces PostgREST to reload its schema cache on each request.
        // Removes the need to restart the Supabase project after running migrations.
        'Accept-Profile': 'public',
        'Content-Profile': 'public',
      },
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
)

export const isSupabaseConfigured = isConfigured
