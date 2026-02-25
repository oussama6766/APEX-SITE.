import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Throw an error if the keys are missing in the environment variables
if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase URL and Anon Key are missing. Please check your .env.local file.");
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder-key'
);
