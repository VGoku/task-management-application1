import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getTasks, createTask, updateTask, deleteTask, reorderTask } from '../../lib/tasks'

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await getTasks()
      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const addTask = createAsyncThunk(
  'tasks/addTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const { data, error } = await createTask(taskData)
      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const modifyTask = createAsyncThunk(
  'tasks/modifyTask',
  async ({ taskId, updates }, { rejectWithValue }) => {
    try {
      const { data, error } = await updateTask(taskId, updates)
      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const removeTask = createAsyncThunk(
  'tasks/removeTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const { error } = await deleteTask(taskId)
      if (error) throw error
      return taskId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const reorderTaskPosition = createAsyncThunk(
  'tasks/reorderTask',
  async ({ taskId, newPosition, newStatus }, { rejectWithValue }) => {
    try {
      const { error } = await reorderTask(taskId, newPosition, newStatus)
      if (error) throw error
      return { taskId, newPosition, newStatus }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  items: [],
  loading: false,
  error: null,
  filters: {
    status: '',
    priority: '',
    search: '',
    sortBy: { column: 'created_at', ascending: false }
  },
  statistics: {
    total: 0,
    completed: 0,
    overdue: 0,
    highPriority: 0
  }
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    updateStatistics: (state) => {
      const now = new Date()
      state.statistics = {
        total: state.items.length,
        completed: state.items.filter(task => task.status === 'Completed').length,
        overdue: state.items.filter(task => new Date(task.due_date) < now && task.status !== 'Completed').length,
        highPriority: state.items.filter(task => task.priority === 'High').length
      }
    },
    clearFilters: (state) => {
      state.filters = initialState.filters
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Add task
      .addCase(addTask.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      // Modify task
      .addCase(modifyTask.fulfilled, (state, action) => {
        const index = state.items.findIndex(task => task.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      // Remove task
      .addCase(removeTask.fulfilled, (state, action) => {
        state.items = state.items.filter(task => task.id !== action.payload)
      })
      // Reorder task
      .addCase(reorderTaskPosition.fulfilled, (state, action) => {
        const { taskId, newStatus } = action.payload
        const task = state.items.find(t => t.id === taskId)
        if (task) {
          task.status = newStatus
        }
      })
  }
})

// Selectors
export const selectAllTasks = (state) => state.tasks.items
export const selectTaskById = (state, taskId) => 
  state.tasks.items.find(task => task.id === taskId)
export const selectFilteredTasks = (state) => {
  const { status, priority, search, sortBy } = state.tasks.filters
  let filtered = [...state.tasks.items]

  if (status) {
    filtered = filtered.filter(task => task.status === status)
  }
  if (priority) {
    filtered = filtered.filter(task => task.priority === priority)
  }
  if (search) {
    const searchLower = search.toLowerCase()
    filtered = filtered.filter(task => 
      task.title.toLowerCase().includes(searchLower) ||
      task.description.toLowerCase().includes(searchLower)
    )
  }

  // Sorting
  filtered.sort((a, b) => {
    const aValue = a[sortBy.column]
    const bValue = b[sortBy.column]
    const modifier = sortBy.ascending ? 1 : -1

    if (typeof aValue === 'string') {
      return aValue.localeCompare(bValue) * modifier
    }
    return (aValue - bValue) * modifier
  })

  return filtered
}
export const selectTaskStatistics = (state) => state.tasks.statistics
export const selectTasksLoading = (state) => state.tasks.loading
export const selectTasksError = (state) => state.tasks.error

export const { setFilters, updateStatistics, clearFilters } = tasksSlice.actions
export default tasksSlice.reducer 