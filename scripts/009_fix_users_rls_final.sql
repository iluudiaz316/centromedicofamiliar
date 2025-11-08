-- Drop all existing policies on users table to start fresh
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

-- Disable RLS temporarily to avoid recursion issues
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Since this is a local system without Supabase Auth, we don't need RLS
-- The application layer will handle authorization based on the session
-- This eliminates the infinite recursion problem

-- Comment: For a production system with Supabase Auth, you would use auth.uid()
-- But for this local system, RLS is disabled and we rely on application-level security
