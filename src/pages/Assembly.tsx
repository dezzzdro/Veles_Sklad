import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import DataTable from '@/components/DataTable'
import { supabaseService } from '@/services/supabase'
import { AssemblyItem, TableColumn } from '@/types'

const columns: TableColumn<AssemblyItem>[] = [
  { key: 'id', label: 'ID', sortable: true, width: '120px' },
  { key: 'наименование', label: 'Наименование', sortable: true },
  { key: 'ед_изм', label: 'Ед.изм.', sortable: true, width: '100px' },
  { key: 'количество', label: 'Количество', sortable: true, width: '120px' },
]

function Assembly() {
  const queryClient = useQueryClient()

  const { data: assemblyItems, isLoading, error } = useQuery({
    queryKey: ['assembly'],
    queryFn: async () => {
      const result = await supabaseService.getAssemblyItems()
      if (result.error) throw new Error(result.error)
      return result.data || []
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const createMutation = useMutation({
    mutationFn: (item: Omit<AssemblyItem, 'id' | 'created_at'>) => supabaseService.createAssemblyItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assembly'] })
      toast.success('Элемент добавлен в сборку')
    },
    onError: (error: Error) => {
      toast.error('Ошибка добавления: ' + error.message)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => supabaseService.deleteAssemblyItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assembly'] })
      toast.success('Элемент удален из сборки')
    },
    onError: (error: Error) => {
      toast.error('Ошибка удаления: ' + error.message)
    }
  })

  const transferMutation = useMutation({
    mutationFn: async (assemblyItem: AssemblyItem) => {
      // Get warehouse item
      const warehouseResult = await supabaseService.getWarehouseItems()
      if (warehouseResult.error) throw new Error(warehouseResult.error)

      const warehouseItem = warehouseResult.data?.find(item => item.наименование === assemblyItem.наименование)
      if (!warehouseItem) throw new Error('Товар не найден на складе')

      const remaining = warehouseItem.на_складе - assemblyItem.количество
      if (remaining < 0) throw new Error('Недостаточно товара на складе')

      // Update warehouse
      await supabaseService.updateWarehouseItem(warehouseItem.id, {
        на_складе: remaining,
        выдано: (warehouseItem.выдано || 0) + assemblyItem.количество
      })

      // Delete from assembly
      await supabaseService.deleteAssemblyItem(assemblyItem.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assembly'] })
      queryClient.invalidateQueries({ queryKey: ['warehouse'] })
      toast.success('Товар передан в сборку')
    },
    onError: (error: Error) => {
      toast.error('Ошибка передачи: ' + error.message)
    }
  })

  const handleAddItem = () => {
    const name = prompt('Наименование:')
    if (!name) return

    const unit = prompt('Ед.изм.:')
    if (!unit) return

    const quantityInput = prompt('Количество:', '0')
    if (quantityInput === null) return
    const quantity = parseFloat(quantityInput) || 0

    createMutation.mutate({
      наименование: name,
      ед_изм: unit,
      количество: quantity
    })
  }

  const handleTransferItem = (item: AssemblyItem) => {
    const confirmed = confirm(
      `Передать в сборку:\n\n` +
      `Товар: ${item.наименование}\n` +
      `Количество: ${item.количество} ${item.ед_изм}\n\n` +
      `Продолжить?`
    )

    if (confirmed) {
      transferMutation.mutate(item)
    }
  }

  const handleDeleteItem = (id: string) => {
    if (confirm('Удалить элемент из сборки?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleRowClick = (item: AssemblyItem) => {
    console.log('Row clicked:', item)
    // TODO: Open edit modal
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Сборка</h1>
          <p className="text-gray-600 dark:text-gray-400">Подготовка товаров к выдаче</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['assembly'] })}
            className="btn btn-secondary"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Обновить
          </button>
          <button
            onClick={handleAddItem}
            className="btn btn-primary"
          >
            <i className="fas fa-plus mr-2"></i>
            Добавить в сборку
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
              <i className="fas fa-cogs text-blue-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">В сборке</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {assemblyItems?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <i className="fas fa-box text-green-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Общее количество</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {assemblyItems?.reduce((sum, item) => sum + (item.количество || 0), 0) || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900">
              <i className="fas fa-arrow-right text-orange-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Готово к выдаче</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {assemblyItems?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="ID"
          className="input"
          onChange={(e) => {
            // TODO: Implement filtering
            console.log('Filter ID:', e.target.value)
          }}
        />
        <input
          type="text"
          placeholder="Наименование"
          className="input"
          onChange={(e) => {
            // TODO: Implement filtering
            console.log('Filter Наименование:', e.target.value)
          }}
        />
        <input
          type="text"
          placeholder="Ед.изм."
          className="input"
          onChange={(e) => {
            // TODO: Implement filtering
            console.log('Filter Ед.изм.:', e.target.value)
          }}
        />
        <input
          type="text"
          placeholder="Количество"
          className="input"
          onChange={(e) => {
            // TODO: Implement filtering
            console.log('Filter Количество:', e.target.value)
          }}
        />
      </div>

      {/* Table Container with Independent Scrolling */}
      <div className="table-container max-h-96 overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-soft border border-gray-200 dark:border-gray-700">
        <DataTable
          data={assemblyItems || []}
          columns={columns}
          loading={isLoading}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Action Buttons for Selected Items */}
      {assemblyItems && assemblyItems.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Действия с элементами сборки
          </h3>
          <div className="flex flex-wrap gap-3">
            {assemblyItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <span className="text-sm font-medium">{item.наименование}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ({item.количество} {item.ед_изм})
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleTransferItem(item)}
                    className="btn btn-sm btn-outline-success"
                    title="Передать в сборку"
                  >
                    <i className="fas fa-arrow-right"></i>
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="btn btn-sm btn-outline-danger"
                    title="Удалить"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
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
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Ошибка загрузки данных</h3>
              <p className="text-red-600 dark:text-red-400">{(error as Error).message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Assembly