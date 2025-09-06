import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useThemeStore } from '@/stores/themeStore'

const navigation = [
  { name: 'Панель управления', href: '/', icon: 'fas fa-tachometer-alt' },
  { name: 'Склад', href: '/sklad', icon: 'fas fa-warehouse' },
  { name: 'Сборка', href: '/sborka', icon: 'fas fa-cogs' },
  { name: 'Приход', href: '/prihod', icon: 'fas fa-truck' },
  { name: 'Выданное', href: '/vydannoe', icon: 'fas fa-box-open' },
]

const systemNavigation = [
  { name: 'Контрагенты', href: '/kontragenty', icon: 'fas fa-users' },
  { name: 'Настройки', href: '/nastroyki', icon: 'fas fa-cog' },
  { name: 'Уведомления', href: '/uvedomleniya', icon: 'fas fa-bell' },
  { name: 'UI Demo', href: '/ui-demo', icon: 'fas fa-palette' },
  { name: 'Отладка', href: '/otladka', icon: 'fas fa-tools' },
]

function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { theme, setTheme } = useThemeStore()

  const currentTime = new Date().toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>

        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-blue-600 dark:bg-blue-700">
            <div className="flex items-center space-x-2">
              <i className="fas fa-box text-white text-xl"></i>
              <span className="text-white font-bold text-lg">Велес Склад</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-8">
            {/* Main navigation */}
            <div>
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Управление
              </h3>
              <div className="mt-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      location.pathname === item.href
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <i className={`${item.icon} mr-3 text-gray-400 group-hover:text-gray-500`}></i>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* System navigation */}
            <div>
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Система
              </h3>
              <div className="mt-2 space-y-1">
                {systemNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      location.pathname === item.href
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <i className={`${item.icon} mr-3 text-gray-400 group-hover:text-gray-500`}></i>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-gray-600 dark:text-gray-300"></i>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Администратор</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Склад</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                className="lg:hidden mr-3 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setSidebarOpen(true)}
              >
                <i className="fas fa-bars"></i>
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Велес Склад
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Time display */}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <i className="fas fa-clock mr-2"></i>
                {currentTime}
              </div>

              {/* Theme toggle */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-2 rounded-md transition-colors ${
                    theme === 'light' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <i className="fas fa-sun"></i>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-2 rounded-md transition-colors ${
                    theme === 'dark' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <i className="fas fa-moon"></i>
                </button>
                <button
                  onClick={() => setTheme('auto')}
                  className={`p-2 rounded-md transition-colors ${
                    theme === 'auto' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <i className="fas fa-adjust"></i>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default MainLayout