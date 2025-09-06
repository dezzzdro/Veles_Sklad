import { useEffect } from 'react'
import DataTable from '@/components/DataTable'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useWarehouseStore } from '@/stores/warehouseStore'
import { WarehouseItem, TableColumn } from '@/types'

const columns: TableColumn<WarehouseItem>[] = [
  { key: 'id', label: 'ID', sortable: true, width: '120px' },
  { key: 'наименование', label: 'Наименование', sortable: true },
  { key: 'ед_изм', label: 'Ед.изм.', sortable: true, width: '100px' },
  { key: 'числится', label: 'Числится', sortable: true, width: '100px' },
  { key: 'на_складе', label: 'На складе', sortable: true, width: '100px' },
  { key: 'выдано', label: 'Выдано', sortable: true, width: '100px' },
]

function Warehouse() {
  const {
    warehouseItems,
    loading,
    errors,
    fetchWarehouseItems,
    clearErrors
  } = useWarehouseStore()

  useEffect(() => {
    fetchWarehouseItems()
  }, [fetchWarehouseItems])

  const handleRowClick = (item: WarehouseItem) => {
    console.log('Row clicked:', item)
    // TODO: Open edit modal
  }

  const handleRefresh = () => {
    clearErrors()
    fetchWarehouseItems()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Склад</h1>
          <p className="text-gray-600 dark:text-gray-400">Управление товарами на складе</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleRefresh} variant="secondary">
            <i className="fas fa-sync-alt mr-2"></i>
            Обновить
          </Button>
          <Button variant="secondary">
            <i className="fas fa-download mr-2"></i>
            Экспорт
          </Button>
          <Button variant="default">
            <i className="fas fa-plus mr-2"></i>
            Добавить товар
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                <i className="fas fa-box text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Всего товаров</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {warehouseItems.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                <i className="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">На складе</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {warehouseItems.reduce((sum: number, item: WarehouseItem) => sum + (item.на_складе || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900">
                <i className="fas fa-clock text-orange-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">В резерве</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {warehouseItems.reduce((sum: number, item: WarehouseItem) => sum + (item.выдано || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                <i className="fas fa-calculator text-purple-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Общая стоимость</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">-</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters above table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
            placeholder="Числится"
            className="input"
            onChange={(e) => {
              // TODO: Implement filtering
              console.log('Filter Числится:', e.target.value)
            }}
          />
          <input
            type="text"
            placeholder="На складе"
            className="input"
            onChange={(e) => {
              // TODO: Implement filtering
              console.log('Filter На складе:', e.target.value)
            }}
          />
          <input
            type="text"
            placeholder="Выдано"
            className="input"
            onChange={(e) => {
              // TODO: Implement filtering
              console.log('Filter Выдано:', e.target.value)
            }}
          />
        </div>
      </div>

      {/* Table with Independent Scrolling */}
      <DataTable
        data={warehouseItems}
        columns={columns}
        loading={loading.warehouse}
        onRowClick={handleRowClick}
      />

      {/* Error State */}
      {errors.warehouse && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900">
                <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Ошибка загрузки данных</h3>
                <p className="text-red-600 dark:text-red-400">{errors.warehouse}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Warehouse