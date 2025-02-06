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
  try {
    console.log('Fetching tasks with filters:', filters)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User must be authenticated to fetch tasks')
    console.log('Current user:', user)

    let query = supabase
      .from('tasks')
      .select(`
        *,
        category:categories(
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
      // Default sorting by position and created_at
      query = query.order('position', { ascending: true })
        .order('created_at', { ascending: false })
    }

    console.log('Executing tasks query...')
    const { data: tasks, error: tasksError } = await query
    
    if (tasksError) {
      console.error('Error fetching tasks:', tasksError)
      return { error: tasksError }
    }

    console.log('Tasks fetched successfully:', tasks)

    // Fetch tags for all tasks in a single query
    if (tasks && tasks.length > 0) {
      console.log('Fetching tags for tasks...')
      const { data: tagData, error: tagError } = await supabase
        .from('task_tags')
        .select(`
          task_id,
          tag:tags(
            id,
            name,
            color
          )
        `)
        .in('task_id', tasks.map(t => t.id))

      if (tagError) {
        console.error('Error fetching tags:', tagError)
        return { error: tagError }
      }

      console.log('Tags fetched successfully:', tagData)

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

    return { data: tasks || [], error: null }
  } catch (error) {
    console.error('Unexpected error in getTasks:', error)
    return { data: null, error }
  }
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

export const reorderTask = async (taskId, newPosition, newStatus = null) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be authenticated to reorder tasks')

  // First get the task to be moved
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('status')
    .eq('id', taskId)
    .single()

  if (taskError) return { error: taskError }

  const status = newStatus || task.status

  // Get tasks in the target status column
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id, position')
    .eq('user_id', user.id)
    .eq('status', status)
    .order('position')

  if (tasksError) return { error: tasksError }

  // Calculate new positions
  const positions = tasks.map(t => t.position)
  let position = newPosition

  // If moving to end, position after last task
  if (newPosition >= positions.length) {
    position = (positions[positions.length - 1] || 0) + 1000
  }
  // If moving to start, position before first task
  else if (newPosition <= 0) {
    position = (positions[0] || 1000) / 2
  }
  // Otherwise, position between two tasks
  else {
    position = (positions[newPosition - 1] + positions[newPosition]) / 2
  }

  // Update the task's position and status
  const { error: updateError } = await supabase
    .from('tasks')
    .update({ 
      position,
      ...(newStatus ? { status: newStatus } : {})
    })
    .eq('id', taskId)

  return { error: updateError }
} 