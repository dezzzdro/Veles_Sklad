import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'auto'

interface ThemeState {
  theme: Theme
  systemTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  initializeTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      systemTheme: 'light',

      setTheme: (theme: Theme) => {
        set({ theme })

        if (theme === 'auto') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
          document.documentElement.classList.toggle('dark', systemTheme === 'dark')
          set({ systemTheme })
        } else {
          document.documentElement.classList.toggle('dark', theme === 'dark')
        }
      },

      initializeTheme: () => {
        const { theme } = get()

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e: MediaQueryListEvent) => {
          const { theme } = get()
          if (theme === 'auto') {
            const systemTheme = e.matches ? 'dark' : 'light'
            document.documentElement.classList.toggle('dark', systemTheme === 'dark')
            set({ systemTheme })
          }
        }

        mediaQuery.addEventListener('change', handleChange)

        // Apply initial theme
        if (theme === 'auto') {
          const systemTheme = mediaQuery.matches ? 'dark' : 'light'
          document.documentElement.classList.toggle('dark', systemTheme === 'dark')
          set({ systemTheme })
        } else {
          document.documentElement.classList.toggle('dark', theme === 'dark')
        }
      },
    }),
    {
      name: 'veles-sklad-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
)