-- Deshabilitar RLS para sistema local interno
-- Este sistema no usa Supabase Auth, por lo que las políticas RLS causan problemas
-- La seguridad se maneja en la capa de aplicación mediante sesiones y roles

-- Deshabilitar RLS en todas las tablas
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

DROP POLICY IF EXISTS "Authenticated users can view patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can insert patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can update patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can delete patients" ON public.patients;

DROP POLICY IF EXISTS "Authenticated users can view treatments" ON public.treatments;
DROP POLICY IF EXISTS "Admins can manage treatments" ON public.treatments;

DROP POLICY IF EXISTS "Authenticated users can view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can delete appointments" ON public.appointments;

DROP POLICY IF EXISTS "Authenticated users can view medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Doctors can insert medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Doctors can update medical records" ON public.medical_records;
