import { supabase } from './supabase'

export const createTask = async (taskData) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert([taskData])
    .select()
    .single()
  return { data, error }
}

export const updateTask = async (taskId, updates) => {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single()
  return { data, error }
}

export const deleteTask = async (taskId) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
  return { error }
}

export const getTasks = async (filters = {}) => {
  let query = supabase
    .from('tasks')
    .select('*')
    
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
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single()
  return { data, error }
} 