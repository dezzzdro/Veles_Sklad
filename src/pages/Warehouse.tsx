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
      {/* 1. Заголовок раздела (чистый, без лишних блоков) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Склад</h1>
          <p className="text-gray-600 dark:text-gray-400">Управление товарами на складе</p>
        </div>
      </div>

      {/* 2. Кнопки-функции для работы с разделом */}
      <div className="flex flex-wrap gap-3">
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

      {/* 3. Заголовок таблицы */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          <i className="fas fa-table mr-2"></i>
          Таблица товаров
        </h3>

        {/* 5. Строки таблицы (прокручиваемые независимо) */}
        <DataTable
          data={warehouseItems}
          columns={columns}
          loading={loading.warehouse}
          onRowClick={handleRowClick}
          filters={[
            {
              type: 'text',
              placeholder: 'ID',
              onChange: (value) => {
                // TODO: Implement filtering by ID
                console.log('Filter ID:', value)
              }
            },
            {
              type: 'text',
              placeholder: 'Наименование',
              onChange: (value) => {
                // TODO: Implement filtering by name
                console.log('Filter Наименование:', value)
              }
            },
            {
              type: 'text',
              placeholder: 'Ед.изм.',
              onChange: (value) => {
                // TODO: Implement filtering by unit
                console.log('Filter Ед.изм.:', value)
              }
            },
            {
              type: 'text',
              placeholder: 'Числится',
              onChange: (value) => {
                // TODO: Implement filtering by accounted
                console.log('Filter Числится:', value)
              }
            },
            {
              type: 'text',
              placeholder: 'На складе',
              onChange: (value) => {
                // TODO: Implement filtering by in stock
                console.log('Filter На складе:', value)
              }
            },
            {
              type: 'text',
              placeholder: 'Выдано',
              onChange: (value) => {
                // TODO: Implement filtering by issued
                console.log('Filter Выдано:', value)
              }
            }
          ]}
        />
      </div>

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