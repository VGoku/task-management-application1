// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom'

// Mock the Supabase client
jest.mock('./lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn()
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn()
    }))
  }
})) 