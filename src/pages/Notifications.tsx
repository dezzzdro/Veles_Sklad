import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import DataTable from '@/components/DataTable'
import { supabaseService } from '@/services/supabase'
import { Notification, TableColumn } from '@/types'

const columns: TableColumn<Notification>[] = [
  { key: 'дата', label: 'Дата', sortable: true, width: '150px' },
  { key: 'тип_уведомления', label: 'Тип уведомления', sortable: true },
  { key: 'текст_уведомления', label: 'Текст уведомления', sortable: true },
]

function Notifications() {
  const queryClient = useQueryClient()
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const result = await supabaseService.getNotifications()
      if (result.error) throw new Error(result.error)
      return result.data || []
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => supabaseService.updateNotification(id, { прочитано: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Уведомление отмечено как прочитанное')
    },
    onError: (error: Error) => {
      toast.error('Ошибка обновления: ' + error.message)
    }
  })

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => supabaseService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Уведомление удалено')
    },
    onError: (error: Error) => {
      toast.error('Ошибка удаления: ' + error.message)
    }
  })

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id)
  }

  const handleDeleteNotification = (id: string) => {
    if (confirm('Удалить уведомление?')) {
      deleteNotificationMutation.mutate(id)
    }
  }

  const handleRowClick = (item: Notification) => {
    if (!item.прочитано) {
      handleMarkAsRead(item.id)
    }
  }

  // Filter notifications
  const filteredNotifications = notifications?.filter(notification => {
    const matchesType = !filterType || notification.тип_уведомления === filterType
    const matchesStatus = !filterStatus ||
      (filterStatus === 'прочитано' && notification.прочитано) ||
      (filterStatus === 'непрочитано' && !notification.прочитано)
    return matchesType && matchesStatus
  }) || []

  // Get unique notification types
  const notificationTypes = [...new Set(notifications?.map(n => n.тип_уведомления) || [])]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Уведомления</h1>
          <p className="text-gray-600 dark:text-gray-400">Просмотр и настройка системы уведомлений</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['notifications'] })}
            className="btn btn-secondary"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Обновить
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="input"
        >
          <option value="">Все типы</option>
          {notificationTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input"
        >
          <option value="">Все статусы</option>
          <option value="прочитано">Прочитано</option>
          <option value="непрочитано">Непрочитано</option>
        </select>
        <button
          onClick={() => {
            setFilterType('')
            setFilterStatus('')
          }}
          className="btn btn-outline-secondary"
        >
          <i className="fas fa-times mr-2"></i>
          Сбросить фильтры
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
              <i className="fas fa-bell text-blue-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Всего уведомлений</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {notifications?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900">
              <i className="fas fa-envelope text-orange-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Непрочитано</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {notifications?.filter(n => !n.прочитано).length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <i className="fas fa-check-circle text-green-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Прочитано</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {notifications?.filter(n => n.прочитано).length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container with Independent Scrolling */}
      <div className="card">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Список уведомлений
          </h3>
        </div>
        <div className="table-container max-h-96 overflow-auto">
          <DataTable
            data={filteredNotifications}
            columns={columns}
            loading={isLoading}
            onRowClick={handleRowClick}
          />
        </div>
      </div>

      {/* Quick Actions */}
      {filteredNotifications.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Действия с уведомлениями
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                const unreadIds = filteredNotifications
                  .filter(n => !n.прочитано)
                  .map(n => n.id)
                unreadIds.forEach(id => markAsReadMutation.mutate(id))
              }}
              className="btn btn-primary"
            >
              <i className="fas fa-check-double mr-2"></i>
              Отметить все как прочитанные
            </button>
            <button
              onClick={() => {
                if (confirm('Удалить все уведомления?')) {
                  filteredNotifications.forEach(notification =>
                    deleteNotificationMutation.mutate(notification.id)
                  )
                }
              }}
              className="btn btn-danger"
            >
              <i className="fas fa-trash mr-2"></i>
              Удалить все
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card p-6 border-red-200 dark:border-red-800">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900">
              <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Ошибка загрузки уведомлений</h3>
              <p className="text-red-600 dark:text-red-400">{(error as Error).message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Notifications