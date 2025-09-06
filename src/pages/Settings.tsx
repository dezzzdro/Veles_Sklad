import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { supabaseService } from '@/services/supabase'
import { Settings as SettingsType } from '@/types'
import { useThemeStore } from '@/stores/themeStore'

function Settings() {
  const queryClient = useQueryClient()
  const { theme, setTheme } = useThemeStore()

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const result = await supabaseService.getSettings()
      if (result.error) throw new Error(result.error)
      return result.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const updateSettingsMutation = useMutation({
    mutationFn: (updates: Partial<SettingsType>) => supabaseService.updateSettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Настройки сохранены')
    },
    onError: (error: Error) => {
      toast.error('Ошибка сохранения: ' + error.message)
    }
  })

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme)
    updateSettingsMutation.mutate({ тема: newTheme })
  }

  const handleNotificationsToggle = () => {
    if (!settings) return
    updateSettingsMutation.mutate({
      уведомления_включены: !settings.уведомления_включены
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Настройки</h1>
          <p className="text-gray-600 dark:text-gray-400">Управление внешним видом приложения</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['settings'] })}
            className="btn btn-secondary"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Обновить
          </button>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          <i className="fas fa-palette mr-2"></i>
          Цветовая схема
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleThemeChange('light')}
            className={`p-4 border-2 rounded-lg transition-colors ${
              theme === 'light'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <i className="fas fa-sun text-2xl text-yellow-500"></i>
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-gray-100">Светлая</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Яркая тема</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleThemeChange('dark')}
            className={`p-4 border-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <i className="fas fa-moon text-2xl text-blue-500"></i>
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-gray-100">Темная</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Ночная тема</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleThemeChange('auto')}
            className={`p-4 border-2 rounded-lg transition-colors ${
              theme === 'auto'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <i className="fas fa-adjust text-2xl text-purple-500"></i>
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-gray-100">Автоматическая</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">По системным настройкам</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          <i className="fas fa-bell mr-2"></i>
          Уведомления
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">Включить уведомления</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Получать уведомления о важных событиях
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings?.уведомления_включены || false}
              onChange={handleNotificationsToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* System Information */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          <i className="fas fa-info-circle mr-2"></i>
          Информация о системе
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Версия приложения</div>
            <div className="text-gray-900 dark:text-gray-100">2.0.0</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Последнее обновление</div>
            <div className="text-gray-900 dark:text-gray-100">
              {new Date().toLocaleDateString('ru-RU')}
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="card p-6 border-red-200 dark:border-red-800">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900">
              <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Ошибка загрузки настроек</h3>
              <p className="text-red-600 dark:text-red-400">{(error as Error).message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings