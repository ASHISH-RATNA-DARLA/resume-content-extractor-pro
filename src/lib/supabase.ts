import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://qlwyyizfvcersgxbckei.supabase.co'; // Your Supabase project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsd3l5aXpmdmNlcnNneGJja2VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg5NTI0NzcsImV4cCI6MjAzNDUyODQ3N30.Yd_6-TbcB62Qcw-0RqPQnA-_MWgzH1QQnBnWqZDYnqE';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);