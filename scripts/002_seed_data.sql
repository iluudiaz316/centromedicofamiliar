-- Seed initial treatments
INSERT INTO public.treatments (name, description, price, duration_minutes) VALUES
('Consulta General', 'Consulta médica general con revisión completa', 150.00, 30),
('Laboratorio Básico', 'Análisis de sangre completo, glucosa, colesterol', 275.00, 15),
('Ultrasonido', 'Ultrasonido diagnóstico de abdomen o pelvis', 450.00, 30),
('Consulta Especializada', 'Consulta con médico especialista', 250.00, 45),
('Examen Físico Completo', 'Examen físico exhaustivo con pruebas básicas', 200.00, 60),
('Vacunación', 'Aplicación de vacunas y seguimiento', 100.00, 15),
('Control Prenatal', 'Consulta de seguimiento de embarazo', 180.00, 30),
('Electrocardiograma', 'ECG de reposo y análisis', 150.00, 20),
('Rayos X', 'Radiografía simple', 300.00, 20),
('Terapia Física', 'Sesión de terapia física rehabilitación', 120.00, 45)
ON CONFLICT DO NOTHING;

-- Seed sample patients
INSERT INTO public.patients (
  dpi, first_name, last_name, date_of_birth, gender, phone, email, address, blood_type
) VALUES
('2845678901234', 'María Fernanda', 'García López', '1985-03-14', 'F', '5512-3456', 'maria.garcia@example.com', 'Zona 10, Ciudad de Guatemala', 'O+'),
('1923456789012', 'José Antonio', 'Ramírez Pérez', '1990-07-21', 'M', '4473-7890', 'jose.ramirez@example.com', 'Zona 15, Guatemala', 'A+')
ON CONFLICT DO NOTHING;
