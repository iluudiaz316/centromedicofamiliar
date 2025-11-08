-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to change user password
CREATE OR REPLACE FUNCTION change_user_password(
  user_id UUID,
  new_password TEXT
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Update the user's password in auth.users
  UPDATE auth.users
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = NOW()
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuario no encontrado';
  END IF;
  
  result := json_build_object('success', true, 'message', 'Contraseña actualizada');
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
