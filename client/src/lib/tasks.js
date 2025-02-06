import { supabase } from './supabase'

export const createTask = async (taskData) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be authenticated to create tasks')

  const { tags, ...taskDataWithoutTags } = taskData
  
  // First create the task
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .insert([{ ...taskDataWithoutTags, user_id: user.id }])
    .select(`
      *,
      category:categories(id, name, color)
    `)
    .single()

  if (taskError) return { error: taskError }

  // Then add tags if provided
  if (tags && tags.length > 0) {
    const { error: tagError } = await supabase
      .from('task_tags')
      .insert(
        tags.map(tagId => ({
          task_id: task.id,
          tag_id: tagId
        }))
      )

    if (tagError) return { error: tagError }
  }

  return { data: task, error: null }
}

export const updateTask = async (taskId, updates) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be authenticated to update tasks')

  const { tags, ...updatesWithoutTags } = updates

  // First update the task
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .update(updatesWithoutTags)
    .eq('id', taskId)
    .eq('user_id', user.id)
    .select(`
      *,
      category:categories(id, name, color)
    `)
    .single()

  if (taskError) return { error: taskError }

  // Then update tags if provided
  if (tags !== undefined) {
    // Remove existing tags
    await supabase
      .from('task_tags')
      .delete()
      .eq('task_id', taskId)

    // Add new tags
    if (tags.length > 0) {
      const { error: tagError } = await supabase
        .from('task_tags')
        .insert(
          tags.map(tagId => ({
            task_id: taskId,
            tag_id: tagId
          }))
        )

      if (tagError) return { error: tagError }
    }
  }

  return { data: task, error: null }
}

export const deleteTask = async (taskId) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be authenticated to delete tasks')

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', user.id)
  return { error }
}

export const getTasks = async (filters = {}) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be authenticated to fetch tasks')

  let query = supabase
    .from('tasks')
    .select(`
      id,
      created_at,
      updated_at,
      title,
      description,
      status,
      priority,
      due_date,
      user_id,
      category_id,
      category:categories!category_id (
        id,
        name,
        color
      )
    `)
    .eq('user_id', user.id)
    
  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters.priority) {
    query = query.eq('priority', filters.priority)
  }

  if (filters.category) {
    query = query.eq('category_id', filters.category)
  }
  
  // Apply sorting
  if (filters.sortBy) {
    const { column, ascending } = filters.sortBy
    query = query.order(column, { ascending })
  } else {
    // Default sorting by created_at desc
    query = query.order('created_at', { ascending: false })
  }

  const { data: tasks, error: tasksError } = await query
  if (tasksError) return { error: tasksError }

  // Fetch tags for all tasks in a single query
  if (tasks && tasks.length > 0) {
    const { data: tagData, error: tagError } = await supabase
      .from('task_tags')
      .select(`
        task_id,
        tag:tags!tag_id (
          id,
          name,
          color
        )
      `)
      .in('task_id', tasks.map(t => t.id))

    if (tagError) return { error: tagError }

    // Group tags by task_id
    const tagsByTask = tagData.reduce((acc, { task_id, tag }) => {
      if (!acc[task_id]) acc[task_id] = []
      if (tag) acc[task_id].push(tag)
      return acc
    }, {})

    // Add tags to each task
    const tasksWithTags = tasks.map(task => ({
      ...task,
      tags: tagsByTask[task.id] || []
    }))

    return { data: tasksWithTags, error: null }
  }

  return { data: tasks, error: null }
}

export const getTaskById = async (taskId) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be authenticated to fetch tasks')

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select(`
      *,
      category:categories(id, name, color)
    `)
    .eq('id', taskId)
    .eq('user_id', user.id)
    .single()

  if (taskError) return { error: taskError }

  // Fetch tags for the task
  const { data: tagData, error: tagError } = await supabase
    .from('task_tags')
    .select(`
      tag:tags(id, name, color)
    `)
    .eq('task_id', taskId)

  if (tagError) return { error: tagError }

  return {
    data: {
      ...task,
      tags: tagData.map(t => t.tag).filter(Boolean)
    },
    error: null
  }
} 