import { supabase } from './supabase'

export const createTask = async (taskData) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be authenticated to create tasks')

  const { data, error } = await supabase
    .from('tasks')
    .insert([{ ...taskData, user_id: user.id }])
    .select()
    .single()
  return { data, error }
}

export const updateTask = async (taskId, updates) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be authenticated to update tasks')

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .eq('user_id', user.id)
    .select()
    .single()
  return { data, error }
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
    .select('*')
    .eq('user_id', user.id)
    
  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters.priority) {
    query = query.eq('priority', filters.priority)
  }
  
  // Apply sorting
  if (filters.sortBy) {
    const { column, ascending } = filters.sortBy
    query = query.order(column, { ascending })
  }

  const { data, error } = await query
  return { data, error }
}

export const getTaskById = async (taskId) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be authenticated to fetch tasks')

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .eq('user_id', user.id)
    .single()
  return { data, error }
} 