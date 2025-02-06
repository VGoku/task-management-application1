import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon } from '@heroicons/react/24/outline'
import { getTasks } from '../lib/tasks'
import TaskModal from '../components/TaskModal'
import TaskList from '../components/TaskList'
import toast from 'react-hot-toast'

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High']
const STATUS_OPTIONS = ['To Do', 'In Progress', 'Completed']

export default function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    sortBy: { column: 'created_at', ascending: false }
  })

  useEffect(() => {
    loadTasks()
  }, [filters])

  const loadTasks = async () => {
    try {
      const { data, error } = await getTasks(filters)
      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      toast.error('Failed to load tasks')
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSort = (column) => {
    setFilters(prev => ({
      ...prev,
      sortBy: {
        column,
        ascending: prev.sortBy.column === column ? !prev.sortBy.ascending : true
      }
    }))
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all your tasks including their title, status, and priority.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">All Priorities</option>
          {PRIORITY_OPTIONS.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      </div>

      {/* Task List */}
      <div className="mt-8 flex flex-col">
        <TaskList
          tasks={tasks}
          loading={loading}
          onSort={handleSort}
          sortConfig={filters.sortBy}
          onTasksChange={loadTasks}
        />
      </div>

      {/* Create/Edit Task Modal */}
      <TaskModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskSaved={loadTasks}
      />
    </div>
  )
} 