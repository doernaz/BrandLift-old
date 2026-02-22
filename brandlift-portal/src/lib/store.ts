
import { create } from 'zustand'

type AppMode = 'test' | 'prod'

interface AppState {
    mode: AppMode
    toggleMode: () => void
    setMode: (mode: AppMode) => void
}

export const useAppStore = create<AppState>((set) => ({
    mode: 'test',
    toggleMode: () => set((state) => ({ mode: state.mode === 'test' ? 'prod' : 'test' })),
    setMode: (mode) => set({ mode }),
}))
