-- Create attachments table
CREATE TABLE public.attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT valid_file_size CHECK (file_size > 0)
);

-- Enable RLS
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for attachments
CREATE POLICY "Users can view task attachments"
    ON public.attachments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.tasks
            WHERE tasks.id = attachments.task_id
            AND (
                tasks.user_id = auth.uid()
                OR auth.uid() IN (
                    SELECT id FROM auth.users WHERE role = 'admin'
                )
            )
        )
    );

CREATE POLICY "Users can upload attachments to their tasks"
    ON public.attachments
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tasks
            WHERE tasks.id = task_id
            AND (
                tasks.user_id = auth.uid()
                OR auth.uid() IN (
                    SELECT id FROM auth.users WHERE role = 'admin'
                )
            )
        )
    );

CREATE POLICY "Users can delete their attachments"
    ON public.attachments
    FOR DELETE
    USING (
        uploaded_by = auth.uid()
        OR auth.uid() IN (
            SELECT id FROM auth.users WHERE role = 'admin'
        )
    );

-- Create updated_at trigger for attachments
CREATE TRIGGER update_attachments_updated_at
    BEFORE UPDATE ON public.attachments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 