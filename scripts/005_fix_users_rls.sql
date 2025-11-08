-- Drop existing RLS policies on users table
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage users" ON public.users;

-- Create new RLS policies for users table
CREATE POLICY "Authenticated users can view users"
  ON public.users FOR SELECT
  USING (true); -- Simple policy, no recursion

CREATE POLICY "Admins can insert users"
  ON public.users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = current_user_id() AND u.role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can update users"
  ON public.users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = current_user_id() AND u.role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can delete users"
  ON public.users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = current_user_id() AND u.role = 'ADMIN'
    )
  );

-- Fix appointments RLS to avoid recursion
DROP POLICY IF EXISTS "Authenticated users can view appointments" ON public.appointments;

CREATE POLICY "Authenticated users can view appointments"
  ON public.appointments FOR SELECT
  USING (true);
