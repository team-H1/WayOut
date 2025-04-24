import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://speuawmockuinmycgrcv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhocWdybWxhcXpwZHN1cHJrZWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzQ5NTMsImV4cCI6MjA1OTg1MDk1M30.C1pcQS4oqGAgleyTQ3gTPLMFt9xnRrhtU8J8DXzkvQY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
