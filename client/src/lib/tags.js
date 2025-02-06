import { supabase } from './supabase'

export const getTags = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be authenticated to fetch tags')

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  return { data, error }
}

export const createTag = async ({ name, color }) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be authenticated to create tags')

  const { data, error } = await supabase
    .from('tags')
    .insert([{ name, color, user_id: user.id }])
    .select()
    .single()

  return { data, error }
}

export const updateTag = async (id, { name, color }) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be authenticated to update tags')

  const { data, error } = await supabase
    .from('tags')
    .update({ name, color })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  return { data, error }
}

export const deleteTag = async (id) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be authenticated to delete tags')

  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  return { error }
}

export const getTaskTags = async (taskId) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be authenticated to fetch task tags')

  const { data, error } = await supabase
    .from('task_tags')
    .select(`
      tag_id,
      tags (
        id,
        name,
        color
      )
    `)
    .eq('task_id', taskId)

  return { 
    data: data?.map(item => item.tags),
    error 
  }
}

export const updateTaskTags = async (taskId, tagIds) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be authenticated to update task tags')

  // First, delete all existing tags for this task
  await supabase
    .from('task_tags')
    .delete()
    .eq('task_id', taskId)

  // Then, insert the new tags
  if (tagIds.length > 0) {
    const { error } = await supabase
      .from('task_tags')
      .insert(
        tagIds.map(tagId => ({
          task_id: taskId,
          tag_id: tagId
        }))
      )

    return { error }
  }

  return { error: null }
} 