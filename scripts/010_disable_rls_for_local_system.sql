-- Disable RLS on all tables since this is a local system
-- Application-level authorization will handle security

ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records DISABLE ROW LEVEL SECURITY;

-- Drop profiles table policies if they exist (we're using users table instead)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Note: In a local hospital system, RLS is often not needed since:
-- 1. Users are authenticated at the application level
-- 2. The database is not publicly accessible
-- 3. All access is controlled through the application
-- 4. The application enforces role-based access control
