-- Create function to create users with hashed passwords
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.create_user(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_role user_role,
  p_phone TEXT DEFAULT NULL,
  p_specialization TEXT DEFAULT NULL,
  p_license_number TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  email TEXT,
  full_name TEXT,
  role user_role,
  phone TEXT,
  specialization TEXT,
  license_number TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Insert new user with hashed password
  INSERT INTO public.users (
    email,
    password_hash,
    full_name,
    role,
    phone,
    specialization,
    license_number,
    is_active
  ) VALUES (
    p_email,
    crypt(p_password, gen_salt('bf')),
    p_full_name,
    p_role,
    p_phone,
    p_specialization,
    p_license_number,
    true
  )
  RETURNING users.id INTO new_user_id;

  -- Return the created user
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.phone,
    u.specialization,
    u.license_number,
    u.is_active,
    u.created_at
  FROM public.users u
  WHERE u.id = new_user_id;
END;
$$;
