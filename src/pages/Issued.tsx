import { useEffect } from 'react'
import DataTable from '@/components/DataTable'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useWarehouseStore } from '@/stores/warehouseStore'
import { IssuedItem, TableColumn } from '@/types'

const columns: TableColumn<IssuedItem>[] = [
  { key: 'дата', label: 'Дата', sortable: true, width: '120px' },
  { key: 'наименование', label: 'Наименование', sortable: true },
  { key: 'ед_изм', label: 'Ед.изм.', sortable: true, width: '100px' },
  { key: 'количество', label: 'Количество', sortable: true, width: '120px' },
  { key: 'контрагент', label: 'Контрагент', sortable: true },
  { key: 'ответственный', label: 'Ответственный', sortable: true },
  { key: 'реестровый_номер', label: 'Реестровый номер', sortable: true },
  { key: 'упд', label: 'УПД', sortable: true },
]

function Issued() {
  const {
    issuedItems,
    loading,
    errors,
    fetchIssuedItems,
    clearErrors
  } = useWarehouseStore()

  useEffect(() => {
    fetchIssuedItems()
  }, [fetchIssuedItems])

  const handleRowClick = (item: IssuedItem) => {
    console.log('Row clicked:', item)
    // TODO: Open details modal
  }

  const handleRefresh = () => {
    clearErrors()
    fetchIssuedItems()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Выданное</h1>
          <p className="text-gray-600 dark:text-gray-400">История выдачи товаров</p>
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                <i className="fas fa-box-open text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Всего выдач</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {issuedItems.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                <i className="fas fa-cubes text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Общее количество</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {issuedItems.reduce((sum: number, item: IssuedItem) => sum + (item.количество || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                <i className="fas fa-users text-purple-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Уникальных контрагентов</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {new Set(issuedItems.map(item => item.контрагент)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <select className="input">
          <option value="">Все контрагенты</option>
          {/* TODO: Populate with actual counterparties */}
        </select>
        <select className="input">
          <option value="">Все ответственные</option>
          {/* TODO: Populate with actual persons */}
        </select>
        <input
          type="text"
          placeholder="Реестровый номер"
          className="input"
          onChange={(e) => {
            // TODO: Implement filtering
            console.log('Filter Реестровый номер:', e.target.value)
          }}
        />
        <input
          type="text"
          placeholder="УПД"
          className="input"
          onChange={(e) => {
            // TODO: Implement filtering
            console.log('Filter УПД:', e.target.value)
          }}
        />
      </div>

      {/* Table Container with Independent Scrolling */}
      <div className="table-container max-h-96 overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-soft border border-gray-200 dark:border-gray-700">
        <DataTable
          data={issuedItems}
          columns={columns}
          loading={loading.issued}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Error State */}
      {errors.issued && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900">
                <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Ошибка загрузки данных</h3>
                <p className="text-red-600 dark:text-red-400">{errors.issued}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Issued