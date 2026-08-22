import { createClient } from '@supabase/supabase-js';
import { Database } from '../../../shared/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_anon_key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
