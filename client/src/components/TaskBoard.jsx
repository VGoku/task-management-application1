import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { getTasks, reorderTask } from '../lib/tasks'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const COLUMNS = [
  { id: 'todo', title: 'To Do', status: 'To Do' },
  { id: 'inprogress', title: 'In Progress', status: 'In Progress' },
  { id: 'completed', title: 'Completed', status: 'Completed' }
]

const TaskCard = ({ task, index }) => {
  const priorityColors = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-red-100 text-red-800'
  }

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-4 mb-2 bg-white rounded-lg shadow ${
            snapshot.isDragging ? 'shadow-lg' : ''
          }`}
        >
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                priorityColors[task.priority]
              }`}
            >
              {task.priority}
            </span>
          </div>
          {task.description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="mt-2 flex justify-between items-center">
            <div className="flex space-x-2">
              {task.tags?.map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: tag.color + '20', color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
            <time className="text-xs text-gray-500">
              {new Date(task.due_date).toLocaleDateString()}
            </time>
          </div>
        </div>
      )}
    </Draggable>
  )
}

const Column = ({ column, tasks }) => {
  return (
    <div className="w-80 bg-gray-50 rounded-lg p-4">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        {column.title}
        <span className="ml-2 text-sm text-gray-500">
          ({tasks.length})
        </span>
      </h2>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[200px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-gray-100' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

export default function TaskBoard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      loadTasks()
    }
  }, [user])

  const loadTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Loading tasks for user:', user?.id)
      
      const { data, error } = await getTasks()
      if (error) throw error

      console.log('Tasks loaded:', data)
      setTasks(data || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
      setError(error.message)
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result

    // Dropped outside a valid droppable
    if (!destination) return

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    try {
      // Get the new status based on the destination column
      const newStatus = COLUMNS.find(col => col.id === destination.droppableId)?.status

      // Optimistically update the UI
      const newTasks = Array.from(tasks)
      const [movedTask] = newTasks.splice(source.index, 1)
      movedTask.status = newStatus
      newTasks.splice(destination.index, 0, movedTask)
      setTasks(newTasks)

      // Update the backend
      const { error } = await reorderTask(
        draggableId,
        destination.index,
        newStatus
      )

      if (error) throw error
    } catch (error) {
      console.error('Error reordering task:', error)
      toast.error('Failed to reorder task')
      // Reload tasks to reset to server state
      loadTasks()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-500">
          Loading tasks...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={loadTasks}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  const getColumnTasks = (status) => {
    return tasks.filter(task => task.status === status)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(column => (
          <Column
            key={column.id}
            column={column}
            tasks={getColumnTasks(column.status)}
          />
        ))}
      </div>
    </DragDropContext>
  )
} 