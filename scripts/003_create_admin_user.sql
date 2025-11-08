-- Habilitar extensión pgcrypto para bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Eliminar usuario admin anterior si existe
DELETE FROM public.users WHERE email = 'admin@clinic.test';

-- Crear usuario administrador
-- Email: admin@clinic.test
-- Contraseña: Admin123
INSERT INTO public.users (
  email,
  password_hash,
  full_name,
  role,
  phone,
  is_active
) VALUES (
  'admin@clinic.test',
  crypt('Admin123', gen_salt('bf')),
  'Administrador Sistema',
  'ADMIN',
  '5500-0000',
  true
);

-- Función para validar login
CREATE OR REPLACE FUNCTION public.validate_user_login(
  user_email TEXT,
  user_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_user JSON;
BEGIN
  SELECT json_build_object(
    'id', u.id::TEXT,
    'email', u.email,
    'full_name', u.full_name,
    'role', u.role,
    'phone', u.phone,
    'specialization', u.specialization,
    'license_number', u.license_number,
    'is_active', u.is_active
  )
  INTO result_user
  FROM public.users u
  WHERE u.email = user_email
    AND u.password_hash = crypt(user_password, u.password_hash)
    AND u.is_active = true;
  
  RETURN result_user;
END;
$$;
