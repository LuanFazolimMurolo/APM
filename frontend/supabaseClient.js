// supabaseClient.js

const SUPABASE_URL = "https://nbrutpjzlkslhuicjwvs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5icnV0cGp6bGtzbGh1aWNqd3ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NzQyOTIsImV4cCI6MjA4NjA1MDI5Mn0.pIZ643ZsS6KbANe7owt15V-pn4h6hJbb9iNaPCW9liI";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

export default supabase;
