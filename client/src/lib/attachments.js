import { supabase } from './supabase'

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export const validateFile = (file) => {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error('File type not supported')
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 5MB limit')
  }
}

export const uploadAttachment = async (taskId, file) => {
  try {
    validateFile(file)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User must be authenticated to upload files')

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${taskId}/${Date.now()}.${fileExt}`
    const { data: fileData, error: uploadError } = await supabase.storage
      .from('task-attachments')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    // Create attachment record
    const { data: attachment, error: dbError } = await supabase
      .from('attachments')
      .insert({
        task_id: taskId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_path: fileData.path,
        uploaded_by: user.id
      })
      .select()
      .single()

    if (dbError) throw dbError

    return { data: attachment, error: null }
  } catch (error) {
    console.error('Upload error:', error)
    return { data: null, error }
  }
}

export const getTaskAttachments = async (taskId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User must be authenticated to view attachments')

    const { data, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Fetch attachments error:', error)
    return { data: null, error }
  }
}

export const deleteAttachment = async (attachmentId) => {
  try {
    const { data: attachment, error: fetchError } = await supabase
      .from('attachments')
      .select('file_path')
      .eq('id', attachmentId)
      .single()

    if (fetchError) throw fetchError

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('task-attachments')
      .remove([attachment.file_path])

    if (storageError) throw storageError

    // Delete attachment record
    const { error: dbError } = await supabase
      .from('attachments')
      .delete()
      .eq('id', attachmentId)

    if (dbError) throw dbError

    return { error: null }
  } catch (error) {
    console.error('Delete attachment error:', error)
    return { error }
  }
}

export const getAttachmentUrl = async (filePath) => {
  try {
    const { data: { publicUrl }, error } = await supabase.storage
      .from('task-attachments')
      .getPublicUrl(filePath)

    if (error) throw error

    return { url: publicUrl, error: null }
  } catch (error) {
    console.error('Get attachment URL error:', error)
    return { url: null, error }
  }
} 