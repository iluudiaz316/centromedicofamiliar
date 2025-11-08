-- Verificar que la tabla users existe y tiene datos
SELECT COUNT(*) as user_count FROM public.users;

-- Verificar que la función validate_user_login existe
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'validate_user_login';

-- Verificar si el usuario específico existe
SELECT id, email, full_name, role, is_active 
FROM public.users 
WHERE email = 'iluudiaz316@gmail.com';

-- Recrear la función validate_user_login para asegurarnos de que existe
DROP FUNCTION IF EXISTS public.validate_user_login(TEXT, TEXT);

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
    u.role::TEXT,
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

-- Si el usuario no existe, crearlo
DO $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.users WHERE email = 'iluudiaz316@gmail.com') INTO user_exists;
  
  IF NOT user_exists THEN
    INSERT INTO public.users (id, email, full_name, role, password_hash, is_active)
    VALUES (
      gen_random_uuid(),
      'iluudiaz316@gmail.com',
      'Administrador Principal',
      'ADMIN',
      crypt('Lafd2000.', gen_salt('bf')),
      true
    );
    RAISE NOTICE 'Usuario creado exitosamente';
  ELSE
    RAISE NOTICE 'Usuario ya existe';
  END IF;
END $$;

-- Probar la función con el usuario
SELECT * FROM public.validate_user_login('iluudiaz316@gmail.com', 'Lafd2000.');
