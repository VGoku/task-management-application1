import { render, screen, fireEvent } from '@testing-library/react'
import { DragDropContext } from 'react-beautiful-dnd'
import TaskBoard from '../TaskBoard'
import { getTasks, reorderTask } from '../../lib/tasks'

// Mock the tasks module
jest.mock('../../lib/tasks')

// Mock react-beautiful-dnd
jest.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ children }) => children,
  Droppable: ({ children }) => children({
    draggableProps: {
      style: {},
    },
    innerRef: jest.fn(),
  }),
  Draggable: ({ children }) => children({
    draggableProps: {
      style: {},
    },
    innerRef: jest.fn(),
  }),
}))

const mockTasks = [
  {
    id: '1',
    title: 'Test Task 1',
    description: 'Description 1',
    status: 'To Do',
    priority: 'High',
    due_date: '2024-03-20',
    tags: [{ id: '1', name: 'Tag1', color: '#ff0000' }]
  },
  {
    id: '2',
    title: 'Test Task 2',
    description: 'Description 2',
    status: 'In Progress',
    priority: 'Medium',
    due_date: '2024-03-21',
    tags: []
  }
]

describe('TaskBoard', () => {
  beforeEach(() => {
    getTasks.mockResolvedValue({ data: mockTasks, error: null })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state initially', () => {
    render(<TaskBoard />)
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument()
  })

  it('renders tasks in correct columns', async () => {
    render(<TaskBoard />)
    
    // Wait for tasks to load
    expect(await screen.findByText('Test Task 1')).toBeInTheDocument()
    expect(screen.getByText('Test Task 2')).toBeInTheDocument()
    
    // Check column headers
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('displays task details correctly', async () => {
    render(<TaskBoard />)
    
    // Wait for tasks to load
    await screen.findByText('Test Task 1')
    
    // Check task details
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Description 1')).toBeInTheDocument()
    expect(screen.getByText('Tag1')).toBeInTheDocument()
  })

  it('handles errors when loading tasks', async () => {
    getTasks.mockResolvedValue({ data: null, error: new Error('Failed to load') })
    
    render(<TaskBoard />)
    
    // Wait for error state
    expect(await screen.findByText('Loading tasks...')).toBeInTheDocument()
  })
}) 