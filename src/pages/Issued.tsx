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
      {/* 1. Заголовок раздела (чистый, без лишних блоков) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Выданное</h1>
          <p className="text-gray-600 dark:text-gray-400">История выдачи товаров</p>
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
      </div>

      {/* 3. Заголовок таблицы */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          <i className="fas fa-table mr-2"></i>
          Таблица выданного
        </h3>

        {/* 4. Поля ввода фильтра контента (над таблицей) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <select className="input">
            <option value="">Все контрагенты</option>
            {/* TODO: Implement filtering by counterparty */}
          </select>
          <select className="input">
            <option value="">Все ответственные</option>
            {/* TODO: Implement filtering by responsible person */}
          </select>
          <input
            type="text"
            placeholder="Реестровый номер"
            className="input"
            onChange={(e) => {
              // TODO: Implement filtering by registry number
              console.log('Filter Реестровый номер:', e.target.value)
            }}
          />
          <input
            type="text"
            placeholder="УПД"
            className="input"
            onChange={(e) => {
              // TODO: Implement filtering by UPD
              console.log('Filter УПД:', e.target.value)
            }}
          />
        </div>

        {/* 5. Строки таблицы (прокручиваемые независимо) */}
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