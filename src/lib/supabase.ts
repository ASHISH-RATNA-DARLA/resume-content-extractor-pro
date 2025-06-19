import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://mlqmtqzwronhxiuzelcs.supabase.co'; // Your Supabase project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1scW10cXp3cm9uaHhpdXplbGNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMTQyMTQsImV4cCI6MjA2NTg5MDIxNH0.LH8e8KJA2iqpzSsJ_zAlCCUT1pGSa99gZskmw8EQ3V8';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);