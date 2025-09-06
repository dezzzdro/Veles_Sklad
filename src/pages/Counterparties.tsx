import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { supabaseService } from '@/services/supabase'
import { Counterparty, Person, CounterpartyFormData, PersonFormData } from '@/types'

function Counterparties() {
  const queryClient = useQueryClient()

  const { data: counterparties, isLoading, error } = useQuery({
    queryKey: ['counterparties'],
    queryFn: async () => {
      const result = await supabaseService.getCounterparties()
      if (result.error) throw new Error(result.error)
      return result.data || []
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const { data: persons } = useQuery({
    queryKey: ['persons'],
    queryFn: async () => {
      const result = await supabaseService.getPersons()
      if (result.error) throw new Error(result.error)
      return result.data || []
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const createCounterpartyMutation = useMutation({
    mutationFn: (data: CounterpartyFormData) => supabaseService.createCounterparty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counterparties'] })
      toast.success('Контрагент добавлен')
    },
    onError: (error: Error) => {
      toast.error('Ошибка добавления: ' + error.message)
    }
  })

  const updateCounterpartyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Counterparty> }) =>
      supabaseService.updateCounterparty(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counterparties'] })
      toast.success('Контрагент обновлен')
    },
    onError: (error: Error) => {
      toast.error('Ошибка обновления: ' + error.message)
    }
  })

  const deleteCounterpartyMutation = useMutation({
    mutationFn: (id: string) => supabaseService.deleteCounterparty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counterparties'] })
      toast.success('Контрагент удален')
    },
    onError: (error: Error) => {
      toast.error('Ошибка удаления: ' + error.message)
    }
  })

  const createPersonMutation = useMutation({
    mutationFn: (data: PersonFormData) => supabaseService.createPerson(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['persons'] })
      toast.success('Ответственное лицо добавлено')
    },
    onError: (error: Error) => {
      toast.error('Ошибка добавления: ' + error.message)
    }
  })

  const handleAddCounterparty = () => {
    const name = prompt('Название организации:')
    if (!name) return

    createCounterpartyMutation.mutate({
      название: name
    })
  }

  const handleEditCounterparty = (counterparty: Counterparty) => {
    const name = prompt('Название организации:', counterparty.название)
    if (!name) return

    updateCounterpartyMutation.mutate({
      id: counterparty.id,
      data: { название: name }
    })
  }

  const handleDeleteCounterparty = (id: string) => {
    if (confirm('Удалить контрагента?')) {
      deleteCounterpartyMutation.mutate(id)
    }
  }

  const handleAddResponsiblePerson = (counterpartyId: string) => {
    const name = prompt('Имя ответственного лица:')
    if (!name) return

    const position = prompt('Должность:') || ''

    createPersonMutation.mutate({
      контрагент_id: counterpartyId,
      фио: name,
      должность: position
    })
  }

  const getResponsiblePersons = (counterpartyId: string) => {
    return persons?.filter(person => person.контрагент_id === counterpartyId) || []
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Контрагенты</h1>
          <p className="text-gray-600 dark:text-gray-400">Управление партнёрами</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['counterparties'] })}
            className="btn btn-secondary"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Обновить
          </button>
          <button
            onClick={handleAddCounterparty}
            className="btn btn-primary"
          >
            <i className="fas fa-plus mr-2"></i>
            Добавить контрагента
          </button>
        </div>
      </div>

      {/* Counterparties Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Загрузка данных...</span>
        </div>
      ) : counterparties && counterparties.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-users text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Нет контрагентов</h3>
          <p className="text-gray-600 dark:text-gray-400">Добавьте первого контрагента для начала работы</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {counterparties?.map((counterparty) => (
            <div key={counterparty.id} className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{counterparty.название}</h5>
                <div className="btn-group" role="group">
                  <button
                    onClick={() => handleEditCounterparty(counterparty)}
                    className="btn btn-sm btn-outline-primary"
                    title="Редактировать"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDeleteCounterparty(counterparty.id)}
                    className="btn btn-sm btn-outline-danger"
                    title="Удалить"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div className="card-body">
                <p className="text-muted mb-2">Ответственные лица:</p>
                <ul className="list-unstyled space-y-1">
                  {getResponsiblePersons(counterparty.id).length === 0 ? (
                    <li className="text-muted">Нет ответственных лиц</li>
                  ) : (
                    getResponsiblePersons(counterparty.id).map((person) => (
                      <li key={person.id} className="d-flex justify-content-between align-items-center">
                        <span>{person.фио}</span>
                        <small className="text-muted">{person.должность || ''}</small>
                      </li>
                    ))
                  )}
                </ul>
                <button
                  onClick={() => handleAddResponsiblePerson(counterparty.id)}
                  className="btn btn-sm btn-outline-success mt-3"
                >
                  <i className="fas fa-plus me-1"></i>
                  Добавить ответственного
                </button>
              </div>
            </div>
          ))}
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
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Ошибка загрузки данных</h3>
              <p className="text-red-600 dark:text-red-400">{(error as Error).message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Counterparties