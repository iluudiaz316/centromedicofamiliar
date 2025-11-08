-- Script para diagnosticar y reparar el sistema de login
-- Este script verifica la función RPC, la tabla users y crea el usuario admin si no existe

-- PASO 1: Verificar si la tabla users existe y tiene datos
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICANDO TABLA USERS ===';
END $$;

SELECT 
    'Usuarios en la tabla:' as info,
    COUNT(*) as total
FROM public.users;

-- Mostrar todos los usuarios (sin contraseñas)
SELECT 
    id,
    email,
    full_name,
    role,
    is_active,
    created_at
FROM public.users
ORDER BY created_at DESC;

-- PASO 2: Verificar si la función validate_user_login existe
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICANDO FUNCIÓN RPC ===';
    
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'validate_user_login'
    ) THEN
        RAISE NOTICE 'La función validate_user_login existe';
    ELSE
        RAISE NOTICE 'La función validate_user_login NO existe - la crearemos';
    END IF;
END $$;

-- PASO 3: Eliminar la función si existe (para recrearla)
DROP FUNCTION IF EXISTS public.validate_user_login(text, text);

-- PASO 4: Crear la función validate_user_login correctamente
CREATE OR REPLACE FUNCTION public.validate_user_login(
    user_email text,
    user_password text
)
RETURNS TABLE (
    id uuid,
    email text,
    full_name text,
    role text,
    phone text,
    specialization text,
    license_number text,
    is_active boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RAISE NOTICE 'validate_user_login called with email: %', user_email;
    
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.full_name,
        u.role::text,
        u.phone,
        u.specialization,
        u.license_number,
        u.is_active
    FROM public.users u
    WHERE u.email = user_email
      AND u.password_hash = crypt(user_password, u.password_hash)
      AND u.is_active = true;
      
    RAISE NOTICE 'validate_user_login returning % rows', (SELECT COUNT(*) FROM public.users WHERE email = user_email);
END;
$$;

-- PASO 5: Asegurar que la extensión pgcrypto está instalada
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- PASO 6: Verificar si el usuario admin existe
DO $$
DECLARE
    admin_exists boolean;
    admin_email text := 'iluudiaz316@gmail.com';
    admin_password text := 'admin123';
BEGIN
    RAISE NOTICE '=== VERIFICANDO USUARIO ADMIN ===';
    
    SELECT EXISTS(
        SELECT 1 FROM public.users WHERE email = admin_email
    ) INTO admin_exists;
    
    IF admin_exists THEN
        RAISE NOTICE 'El usuario admin % ya existe', admin_email;
        
        -- Actualizar la contraseña del admin existente
        UPDATE public.users
        SET 
            password_hash = crypt(admin_password, gen_salt('bf', 10)),
            updated_at = NOW()
        WHERE email = admin_email;
        
        RAISE NOTICE 'Contraseña del admin actualizada correctamente';
    ELSE
        RAISE NOTICE 'El usuario admin NO existe - lo crearemos';
        
        -- Crear el usuario admin
        INSERT INTO public.users (
            id,
            email,
            full_name,
            role,
            password_hash,
            phone,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            admin_email,
            'Administrador Principal',
            'ADMIN',
            crypt(admin_password, gen_salt('bf', 10)),
            '5500-0000',
            true,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Usuario admin creado exitosamente';
    END IF;
END $$;

-- PASO 7: Probar la función validate_user_login
DO $$
DECLARE
    test_result record;
BEGIN
    RAISE NOTICE '=== PROBANDO FUNCIÓN DE LOGIN ===';
    
    -- Probar con las credenciales del admin
    FOR test_result IN 
        SELECT * FROM public.validate_user_login('iluudiaz316@gmail.com', 'admin123')
    LOOP
        RAISE NOTICE 'Test exitoso - Usuario encontrado: % (Role: %)', test_result.full_name, test_result.role;
    END LOOP;
    
    IF NOT FOUND THEN
        RAISE NOTICE 'Test fallido - La función no devolvió resultados';
    END IF;
END $$;

-- PASO 8: Mostrar resumen final
SELECT 
    'Estado final de usuarios:' as resumen,
    COUNT(*) as total_usuarios,
    COUNT(*) FILTER (WHERE role = 'ADMIN') as administradores,
    COUNT(*) FILTER (WHERE role = 'DOCTOR') as doctores,
    COUNT(*) FILTER (WHERE role = 'RECEPTIONIST') as recepcionistas,
    COUNT(*) FILTER (WHERE is_active = true) as usuarios_activos
FROM public.users;

-- Mensaje final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== SCRIPT COMPLETADO ===';
    RAISE NOTICE 'Credenciales de prueba:';
    RAISE NOTICE 'Email: iluudiaz316@gmail.com';
    RAISE NOTICE 'Password: admin123';
    RAISE NOTICE '';
    RAISE NOTICE 'Por favor, ejecuta este script en tu base de datos Supabase';
    RAISE NOTICE 'y luego intenta hacer login nuevamente.';
END $$;
