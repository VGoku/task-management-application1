import { supabase } from './supabase'

export const getCategories = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be authenticated to fetch categories')

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  return { data, error }
}

export const createCategory = async ({ name, color }) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be authenticated to create categories')

  const { data, error } = await supabase
    .from('categories')
    .insert([{ name, color, user_id: user.id }])
    .select()
    .single()

  return { data, error }
}

export const updateCategory = async (id, { name, color }) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be authenticated to update categories')

  const { data, error } = await supabase
    .from('categories')
    .update({ name, color })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  return { data, error }
}

export const deleteCategory = async (id) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be authenticated to delete categories')

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  return { error }
} 