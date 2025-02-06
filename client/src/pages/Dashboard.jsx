import { useState } from 'react'
import { PlusIcon, ViewColumnsIcon, Bars4Icon } from '@heroicons/react/24/outline'
import TaskModal from '../components/TaskModal'
import TaskList from '../components/TaskList'
import TaskBoard from '../components/TaskBoard'

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High']
const STATUS_OPTIONS = ['To Do', 'In Progress', 'Completed']

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState('board') // 'board' or 'list'
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    sortBy: { column: 'created_at', ascending: false }
  })

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
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
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`inline-flex items-center p-2 rounded-md ${
                viewMode === 'board'
                  ? 'text-blue-600 bg-blue-100'
                  : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              <ViewColumnsIcon className="h-5 w-5" />
              <span className="sr-only">Board view</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center p-2 rounded-md ${
                viewMode === 'list'
                  ? 'text-blue-600 bg-blue-100'
                  : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              <Bars4Icon className="h-5 w-5" />
              <span className="sr-only">List view</span>
            </button>
          </div>
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
      {viewMode === 'list' && (
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
      )}

      {/* Task Views */}
      <div className="mt-8">
        {viewMode === 'board' ? (
          <TaskBoard />
        ) : (
          <TaskList
            filters={filters}
            onTasksChange={() => {}}
          />
        )}
      </div>

      {/* Create/Edit Task Modal */}
      <TaskModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskSaved={() => setIsModalOpen(false)}
      />
    </div>
  )
} 