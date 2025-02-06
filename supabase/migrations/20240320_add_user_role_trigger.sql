-- Step 1: Create a function to set the default role to 'user' for new signups
CREATE OR REPLACE FUNCTION public.set_default_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Set the role to 'user' for any new user by default
  UPDATE auth.users
  SET role = 'user'
  WHERE email = NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create a trigger to call the function after a new user signs up
DROP TRIGGER IF EXISTS set_user_role_on_signup ON auth.users;
CREATE TRIGGER set_user_role_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.set_default_user_role();

-- Step 3: Create helper functions for role management
CREATE OR REPLACE FUNCTION public.promote_to_admin(user_email TEXT)
RETURNS void AS $$
BEGIN
  UPDATE auth.users 
  SET role = 'admin'
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.demote_to_user(user_email TEXT)
RETURNS void AS $$
BEGIN
  UPDATE auth.users 
  SET role = 'user'
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create a view to easily check user roles
CREATE OR REPLACE VIEW public.user_roles AS
SELECT email, role, created_at
FROM auth.users
ORDER BY created_at DESC; 