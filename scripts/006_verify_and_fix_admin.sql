-- Verificar si el usuario admin existe
DO $$
DECLARE
  admin_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.users WHERE email = 'admin@clinic.test') INTO admin_exists;
  
  IF admin_exists THEN
    RAISE NOTICE 'Usuario admin ya existe';
  ELSE
    RAISE NOTICE 'Usuario admin NO existe, creando...';
    
    -- Crear usuario administrador
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
  END IF;
END $$;

-- Verificar que la función de validación existe y funciona
DO $$
DECLARE
  test_result JSON;
BEGIN
  -- Probar la función de login
  SELECT public.validate_user_login('admin@clinic.test', 'Admin123') INTO test_result;
  
  RAISE NOTICE 'Test login result: %', test_result;
END $$;

-- Asegurar que RLS está configurado correctamente en la tabla users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Asegurar que la función puede acceder a los datos sin restricciones RLS
ALTER FUNCTION public.validate_user_login(TEXT, TEXT) SECURITY DEFINER;
