/**
 * عميل Supabase لتطبيق الموبايل — يتصل بنفس قاعدة بيانات الموقع.
 * يستخدم AsyncStorage لحفظ الجلسة، فيبقى العميل مسجّلاً للدخول.
 */
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

import type { Database } from './database.types';

const extra = (Constants.expoConfig?.extra ?? {}) as {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

const SUPABASE_URL = extra.supabaseUrl!;
const SUPABASE_ANON_KEY = extra.supabaseAnonKey!;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
