import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export { supabaseUrl, supabaseAnonKey }

export const isSupabaseConfigured = (): boolean => {
  return !!supabaseUrl && !!supabaseAnonKey
}

// Só cria o client se as variáveis estiverem definidas.
// Senão, cria um "no-op" que retorna vazio em todas as queries.
const PLACEHOLDER: SupabaseClient = createClient('https://placeholder.supabase.co', 'placeholder', {
  auth: { persistSession: false, autoRefreshToken: false },
})

export const supabase: SupabaseClient = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      db: { schema: 'public' },
      realtime: { params: { eventsPerSecond: 10 } },
    })
  : PLACEHOLDER
