
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Your Supabase Project URL
const SUPABASE_URL = 'https://gstslforgzsmwuuyynro.supabase.co';

// Your Supabase Publishable Key
const SUPABASE_KEY = 'sb_publishable_tYlydfDey-YaG6z-eF30zw_RYPifPkdD';

// Connect to Supabase
export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
