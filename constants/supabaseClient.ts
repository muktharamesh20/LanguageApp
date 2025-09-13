import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../databasetypes';
export const supabase: SupabaseClient<Database>  = createClient<Database>(
    process.env.EXPO_PUBLIC_SUPABASE_URL ?? (() => { throw new Error('EXPO_PUBLIC_SUPABASE_URL is not defined'); })(),
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? (() => { throw new Error('EXPO_PUBLIC_SUPABASE_ANON_KEY is not defined'); })(), {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  });