// Initialize Supabase Client
const SUPABASE_URL = 'https://fxkgbpykxnezxgftqnud.supabase.co'; // Found in your .env
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4a2dicHlreG5lenhnZnRxbnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjIzNjIsImV4cCI6MjA4MTA5ODM2Mn0.nRh4iCpNoWPyQX2xVbuigot7RSIm3hh49PE36ETRqso';

if (!window.supabase || !window.supabase.createClient) {
    console.error('⚠️ Supabase JS library not loaded from CDN!');
} else {
    // 1. Capture the createClient function from the library
    const { createClient } = window.supabase;

    // 2. Create the client instance
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 3. Expose the CLIENT as 'window.supabase', overwriting the library global
    //    This ensures 'supabase.auth.signUp' works in other scripts.
    window.supabase = client;

    console.log('Supabase client initialized');
}
