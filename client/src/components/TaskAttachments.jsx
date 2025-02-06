import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { uploadAttachment, getTaskAttachments, deleteAttachment, getAttachmentUrl } from '../lib/attachments'
import { DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function TaskAttachments({ taskId }) {
  const { user } = useAuth()
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadAttachments()
  }, [taskId])

  const loadAttachments = async () => {
    const { data, error } = await getTaskAttachments(taskId)
    if (error) {
      toast.error('Failed to load attachments')
    } else {
      setAttachments(data)
    }
    setLoading(false)
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const { data, error } = await uploadAttachment(taskId, file)
      if (error) throw error
      
      setAttachments(prev => [data, ...prev])
      toast.success('File uploaded successfully')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setUploading(false)
      event.target.value = '' // Reset file input
    }
  }

  const handleDelete = async (attachmentId) => {
    const confirmed = window.confirm('Are you sure you want to delete this attachment?')
    if (!confirmed) return

    try {
      const { error } = await deleteAttachment(attachmentId)
      if (error) throw error

      setAttachments(prev => prev.filter(a => a.id !== attachmentId))
      toast.success('Attachment deleted successfully')
    } catch (error) {
      toast.error('Failed to delete attachment')
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (loading) {
    return <div className="animate-pulse">Loading attachments...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Attachments</h3>
        <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          {uploading ? 'Uploading...' : 'Add File'}
        </label>
      </div>

      {attachments.length === 0 ? (
        <p className="text-gray-500 text-sm">No attachments yet</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {attachments.map((attachment) => (
            <li key={attachment.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DocumentIcon className="h-6 w-6 text-gray-400" />
                <div>
                  <a
                    href={getAttachmentUrl(attachment.file_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    {attachment.file_name}
                  </a>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(attachment.file_size)}
                  </p>
                </div>
              </div>
              
              {(user.id === attachment.uploaded_by || user.role === 'admin') && (
                <button
                  onClick={() => handleDelete(attachment.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
} 