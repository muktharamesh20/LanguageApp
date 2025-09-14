import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../databasetypes';
export const supabase: SupabaseClient<Database>  = createClient<Database>(
    //process.env.EXPO_PUBLIC_SUPABASE_URL ?? (() => { throw new Error('EXPO_PUBLIC_SUPABASE_URL is not defined'); })(),
    //process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? (() => { throw new Error('EXPO_PUBLIC_SUPABASE_ANON_KEY is not defined'); })(), {
    'https://hrgmwszyxjpltdgvvyaa.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZ213c3p5eGpwbHRkZ3Z2eWFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzc5OTY3NSwiZXhwIjoyMDczMzc1Njc1fQ.SJ9XzsYH1cltE9ReA-ALkDE3Gr7f9SFMDg3V9YXTSR0', {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  });