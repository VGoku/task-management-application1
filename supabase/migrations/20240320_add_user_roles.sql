-- First, clean up any existing objects
DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.set_user_role(text, text);
DROP POLICY IF EXISTS "Admins can view all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins can update all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins can delete all tasks" ON public.tasks;
DROP TYPE IF EXISTS public.user_role;

-- Create the enum type
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

-- Add role column to auth.users if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'auth' 
        AND table_name = 'users' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE auth.users ADD COLUMN role text NOT NULL DEFAULT 'user';
    END IF;
END $$;

-- Create RLS policies for admin access
CREATE POLICY "Admins can view all tasks"
    ON public.tasks
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM auth.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
        OR auth.uid() = user_id
    );

CREATE POLICY "Admins can update all tasks"
    ON public.tasks
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 
            FROM auth.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
        OR auth.uid() = user_id
    );

CREATE POLICY "Admins can delete all tasks"
    ON public.tasks
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 
            FROM auth.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
        OR auth.uid() = user_id
    );

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM auth.users
        WHERE id = user_id
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 