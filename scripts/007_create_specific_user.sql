-- Eliminar función anterior y recrearla correctamente
DROP FUNCTION IF EXISTS public.validate_user_login(TEXT, TEXT);

-- Habilitar extensión pgcrypto para bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Eliminar usuarios anteriores si existen
DELETE FROM public.users WHERE email IN ('admin@clinic.test', 'iluudiaz316@gmail.com');

-- Crear usuario administrador principal
INSERT INTO public.users (
  email,
  password_hash,
  full_name,
  role,
  phone,
  is_active
) VALUES (
  'iluudiaz316@gmail.com',
  crypt('Lafd2000.', gen_salt('bf')),
  'Administrador Principal',
  'ADMIN',
  '5500-0000',
  true
);

-- Crear función para validar login que devuelve TABLE
CREATE OR REPLACE FUNCTION public.validate_user_login(
  user_email TEXT,
  user_password TEXT
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  phone TEXT,
  specialization TEXT,
  license_number TEXT,
  is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.phone,
    u.specialization,
    u.license_number,
    u.is_active
  FROM public.users u
  WHERE u.email = user_email
    AND u.password_hash = crypt(user_password, u.password_hash)
    AND u.is_active = true;
END;
$$;

-- Verificar que el usuario fue creado
SELECT email, full_name, role, is_active FROM public.users WHERE email = 'iluudiaz316@gmail.com';
