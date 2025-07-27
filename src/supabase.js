import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zgqfdmflagymxdwmsoms.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncWZkbWZsYWd5bXhkd21zb21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNDcyNTMsImV4cCI6MjA2ODkyMzI1M30.nXQ6qkfTDHcv-v_8Hhubr8NFY8eLRkfEn_C0QGqcsr4';

export const supabase = createClient(supabaseUrl, supabaseKey);
