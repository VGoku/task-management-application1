import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getTaskById, updateTask, deleteTask } from '../lib/tasks'
import TaskAttachments from '../components/TaskAttachments'
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function TaskDetails() {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    due_date: ''
  })

  useEffect(() => {
    loadTask()
  }, [taskId])

  const loadTask = async () => {
    try {
      const { data, error } = await getTaskById(taskId)
      if (error) throw error
      
      setTask(data)
      setFormData({
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        due_date: data.due_date
      })
    } catch (error) {
      toast.error('Failed to load task')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { error } = await updateTask(taskId, formData)
      if (error) throw error

      setTask({ ...task, ...formData })
      setEditing(false)
      toast.success('Task updated successfully')
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this task?')
    if (!confirmed) return

    try {
      const { error } = await deleteTask(taskId)
      if (error) throw error

      toast.success('Task deleted successfully')
      navigate('/')
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse p-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    )
  }

  const canEdit = isAdmin() || user.id === task.user_id

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
            {canEdit && (
              <div className="flex space-x-3">
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="prose max-w-none">
            <p>{task.description || 'No description provided.'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">Due: {new Date(task.due_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">Created: {new Date(task.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex space-x-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'}`}
            >
              {task.status}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${task.priority === 'High' ? 'bg-red-100 text-red-800' :
                task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'}`}
            >
              {task.priority} Priority
            </span>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <TaskAttachments taskId={taskId} />
          </div>
        </div>
      )}
    </div>
  )
} 