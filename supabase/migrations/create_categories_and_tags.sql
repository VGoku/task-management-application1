-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS public.task_tags;
DROP TABLE IF EXISTS public.tags;
DROP TABLE IF EXISTS public.tasks;
DROP TABLE IF EXISTS public.categories;

-- Create categories table first
CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(name, user_id)
);

-- Create tasks table with category reference
CREATE TABLE public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'To Do' CHECK (status IN ('To Do', 'In Progress', 'Completed')),
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    due_date DATE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL
);

-- Create tags table
CREATE TABLE public.tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(name, user_id)
);

-- Create task_tags junction table
CREATE TABLE public.task_tags (
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Users can view their own categories"
    ON public.categories
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories"
    ON public.categories
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
    ON public.categories
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
    ON public.categories
    FOR DELETE
    USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view their own tasks"
    ON public.tasks
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
    ON public.tasks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
    ON public.tasks
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
    ON public.tasks
    FOR DELETE
    USING (auth.uid() = user_id);

-- Tags policies
CREATE POLICY "Users can view their own tags"
    ON public.tags
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tags"
    ON public.tags
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
    ON public.tags
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
    ON public.tags
    FOR DELETE
    USING (auth.uid() = user_id);

-- Task tags policies
CREATE POLICY "Users can view their own task tags"
    ON public.task_tags
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.tasks
            WHERE tasks.id = task_tags.task_id
            AND tasks.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own task tags"
    ON public.task_tags
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.tasks
            WHERE tasks.id = task_tags.task_id
            AND tasks.user_id = auth.uid()
        )
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 