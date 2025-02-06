-- Add position column to tasks table
ALTER TABLE public.tasks
ADD COLUMN position FLOAT DEFAULT 0;

-- Create index for faster ordering queries
CREATE INDEX idx_tasks_position ON public.tasks(position);

-- Function to update task positions
CREATE OR REPLACE FUNCTION update_task_positions()
RETURNS TRIGGER AS $$
BEGIN
    -- If no position specified, put it at the end
    IF NEW.position IS NULL OR NEW.position = 0 THEN
        SELECT COALESCE(MAX(position), 0) + 1000
        INTO NEW.position
        FROM public.tasks
        WHERE user_id = NEW.user_id
        AND status = NEW.status;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically set position on new tasks
DROP TRIGGER IF EXISTS set_task_position ON public.tasks;
CREATE TRIGGER set_task_position
    BEFORE INSERT ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_task_positions(); 