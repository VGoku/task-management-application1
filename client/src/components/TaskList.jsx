import { Link } from 'react-router-dom'
import {
  ChevronUpIcon,
  ChevronDownIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { deleteTask, updateTask } from '../lib/tasks'
import toast from 'react-hot-toast'

const priorityColors = {
  Low: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-red-100 text-red-800',
}

const statusColors = {
  'To Do': 'bg-gray-100 text-gray-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  'Completed': 'bg-purple-100 text-purple-800',
}

export default function TaskList({ tasks, loading, onSort, sortConfig, onTasksChange }) {
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { error } = await updateTask(taskId, { status: newStatus })
      if (error) throw error
      toast.success('Task status updated')
      onTasksChange()
    } catch (error) {
      toast.error('Failed to update task status')
      console.error('Error updating task status:', error)
    }
  }

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return

    try {
      const { error } = await deleteTask(taskId)
      if (error) throw error
      toast.success('Task deleted')
      onTasksChange()
    } catch (error) {
      toast.error('Failed to delete task')
      console.error('Error deleting task:', error)
    }
  }

  const getSortIcon = (column) => {
    if (sortConfig.column !== column) return null
    return sortConfig.ascending ? (
      <ChevronUpIcon className="h-5 w-5" />
    ) : (
      <ChevronDownIcon className="h-5 w-5" />
    )
  }

  if (loading) {
    return <div className="text-center py-4">Loading tasks...</div>
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No tasks found. Create one to get started!
      </div>
    )
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
            >
              <button
                className="group inline-flex"
                onClick={() => onSort('title')}
              >
                Title
                {getSortIcon('title')}
              </button>
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              <button
                className="group inline-flex"
                onClick={() => onSort('status')}
              >
                Status
                {getSortIcon('status')}
              </button>
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              <button
                className="group inline-flex"
                onClick={() => onSort('priority')}
              >
                Priority
                {getSortIcon('priority')}
              </button>
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              <button
                className="group inline-flex"
                onClick={() => onSort('due_date')}
              >
                Due Date
                {getSortIcon('due_date')}
              </button>
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                <Link
                  to={`/tasks/${task.id}`}
                  className="hover:text-blue-600"
                >
                  {task.title}
                </Link>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusColors[task.status]
                  }`}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    priorityColors[task.priority]
                  }`}
                >
                  {task.priority}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {new Date(task.due_date).toLocaleDateString()}
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <div className="flex justify-end gap-2">
                  <Link
                    to={`/tasks/${task.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <PencilIcon className="h-5 w-5" />
                    <span className="sr-only">Edit task</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                    <span className="sr-only">Delete task</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 