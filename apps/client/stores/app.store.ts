import { create } from 'zustand'

interface AppStore {}

export const useAppStore = create<AppStore>((set) => ({
  // Add common app store logic here
}))
