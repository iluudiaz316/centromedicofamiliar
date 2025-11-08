-- Eliminar función anterior con los parámetros correctos
DROP FUNCTION IF EXISTS public.validate_user_login(TEXT, TEXT);

-- Crear función para validar login que devuelve TABLE con tipos correctos
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
    u.role::TEXT, -- Convertir ENUM user_role a TEXT
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

-- Verificar que la función funciona correctamente
SELECT * FROM public.validate_user_login('iluudiaz316@gmail.com', 'Lafd2000.');
