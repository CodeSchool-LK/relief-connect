import { create } from 'zustand'

interface User {
  email: string
  name: string
  avatar?: string
  initials: string
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  login: (userData: User) => void
  logout: () => void
}

// Mock user for testing authenticated state
const mockUser: User = {
  email: 'john.doe@example.com',
  name: 'John Doe',
  avatar: undefined,
  initials: 'JD',
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: mockUser,
  isAuthenticated: true,
  login: (userData: User) => {
    set({ user: userData, isAuthenticated: true })
  },
  logout: () => {
    set({ user: null, isAuthenticated: false })
  },
}))

