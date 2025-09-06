import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import DataTable from '@/components/DataTable'
import { useWarehouseStore } from '@/stores/warehouseStore'
import { ArrivalItem, TableColumn, ArrivalFormData } from '@/types'

const columns: TableColumn<ArrivalItem>[] = [
  { key: 'дата', label: 'Дата', sortable: true, width: '120px' },
  { key: 'наименование', label: 'Наименование', sortable: true },
  { key: 'ед_изм', label: 'Ед.изм.', sortable: true, width: '100px' },
  { key: 'количество', label: 'Количество', sortable: true, width: '120px' },
  { key: 'реестровый_номер', label: 'Реестровый номер', sortable: true },
  { key: 'упд', label: 'УПД', sortable: true },
]

function Arrival() {
  const [registryNumber, setRegistryNumber] = useState('')
  const [upd, setUpd] = useState('')

  const {
    arrivalItems,
    loading,
    errors,
    fetchArrivalItems,
    addArrivalItem,
    deleteArrivalItem,
    clearErrors
  } = useWarehouseStore()

  useEffect(() => {
    fetchArrivalItems()
  }, [fetchArrivalItems])

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const rows = parseClipboardData(text)

      if (rows.length === 0) {
        toast.error('Не удалось распознать данные в буфере обмена')
        return
      }

      // Add items one by one using Zustand store
      for (const row of rows) {
        await addArrivalItem({
          ...row,
          дата: row.дата || new Date().toISOString()
        } as Omit<ArrivalItem, 'id' | 'created_at'>)
      }
      toast.success(`Добавлено ${rows.length} строк из буфера обмена`)
    } catch (error) {
      toast.error('Ошибка вставки из буфера обмена')
    }
  }

  const parseClipboardData = (text: string): ArrivalFormData[] => {
    const rows: ArrivalFormData[] = []
    const lines = text.split('\n')

    for (const line of lines) {
      const parts = line.split('\t')
      if (parts.length >= 3) {
        rows.push({
          наименование: parts[0].trim(),
          ед_изм: parts[1].trim(),
          количество: parseFloat(parts[2]) || 0
        })
      }
    }

    return rows
  }

  const handleAddRow = async () => {
    const name = prompt('Наименование:')
    if (!name) return

    const unit = prompt('Ед.изм.:')
    if (!unit) return

    const quantityInput = prompt('Количество:', '0')
    if (quantityInput === null) return
    const quantity = parseFloat(quantityInput) || 0

    try {
      await addArrivalItem({
        наименование: name,
        ед_изм: unit,
        количество: quantity,
        дата: new Date().toISOString()
      } as Omit<ArrivalItem, 'id' | 'created_at'>)
      toast.success('Строка добавлена')
    } catch (error) {
      toast.error('Ошибка добавления')
    }
  }

  const handleApplyRegistryNumber = async () => {
    if (!registryNumber) {
      toast.error('Введите реестровый номер')
      return
    }

    // TODO: Implement bulk update for registry number
    toast('Функция применения реестрового номера в разработке')
  }

  const handleApplyUPD = async () => {
    if (!upd) {
      toast.error('Введите УПД')
      return
    }

    // TODO: Implement bulk update for UPD
    toast('Функция применения УПД в разработке')
  }

  const handleAcceptArrival = async () => {
    if (!arrivalItems || arrivalItems.length === 0) {
      toast.error('Нет данных для принятия')
      return
    }

    // TODO: Implement accept arrival logic
    toast('Функция принятия прихода в разработке')
  }

  const handleExportToExcel = () => {
    if (!arrivalItems || arrivalItems.length === 0) {
      toast.error('Нет данных для экспорта')
      return
    }

    // TODO: Implement Excel export
    toast('Экспорт в Excel в разработке')
  }

  const handleDeleteRow = async (id: string) => {
    if (confirm('Удалить строку?')) {
      try {
        await deleteArrivalItem(id)
        toast.success('Строка удалена')
      } catch (error) {
        toast.error('Ошибка удаления')
      }
    }
  }

  const handleRowClick = (item: ArrivalItem) => {
    console.log('Row clicked:', item)
    // TODO: Open edit modal
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Приход</h1>
          <p className="text-gray-600 dark:text-gray-400">Регистрация поступления товаров</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              clearErrors()
              fetchArrivalItems()
            }}
            className="btn btn-secondary"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Обновить
          </button>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Paste from clipboard */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            <i className="fas fa-paste mr-2"></i>
            Вставка данных
          </h3>
          <div className="space-y-3">
            <button
              onClick={handlePasteFromClipboard}
              className="btn btn-outline-primary w-full"
            >
              <i className="fas fa-paste mr-2"></i>
              Вставить из буфера
            </button>
            <button
              onClick={handleAddRow}
              className="btn btn-outline-secondary w-full"
            >
              <i className="fas fa-plus mr-2"></i>
              Добавить строку
            </button>
          </div>
        </div>

        {/* Document info */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            <i className="fas fa-file-alt mr-2"></i>
            Документы
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Реестровый номер
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={registryNumber}
                  onChange={(e) => setRegistryNumber(e.target.value)}
                  className="input flex-1"
                  placeholder="Введите номер"
                />
                <button
                  onClick={handleApplyRegistryNumber}
                  className="btn btn-outline-primary"
                >
                  Применить
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                УПД
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={upd}
                  onChange={(e) => setUpd(e.target.value)}
                  className="input flex-1"
                  placeholder="Введите УПД"
                />
                <button
                  onClick={handleApplyUPD}
                  className="btn btn-outline-primary"
                >
                  Применить
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            <i className="fas fa-cogs mr-2"></i>
            Действия
          </h3>
          <div className="space-y-3">
            <button
              onClick={async () => {
                if (confirm('Очистить все данные прихода?')) {
                  try {
                    // Delete all arrival items
                    for (const item of arrivalItems) {
                      await deleteArrivalItem(item.id)
                    }
                    toast.success('Приход очищен')
                  } catch (error) {
                    toast.error('Ошибка очистки')
                  }
                }
              }}
              className="btn btn-outline-danger w-full"
            >
              <i className="fas fa-trash mr-2"></i>
              Очистить приход
            </button>
            <button
              onClick={handleExportToExcel}
              className="btn btn-outline-info w-full"
            >
              <i className="fas fa-file-excel mr-2"></i>
              Экспорт в Excel
            </button>
            <button
              onClick={handleAcceptArrival}
              className="btn btn-success w-full"
            >
              <i className="fas fa-check mr-2"></i>
              Принять приход
            </button>
          </div>
        </div>
      </div>

      {/* Table Container with Independent Scrolling */}
      <div className="card">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Элементы прихода
          </h3>
        </div>
        <div className="table-container max-h-96 overflow-auto">
          <DataTable
            data={arrivalItems}
            columns={columns}
            loading={loading.arrival}
            onRowClick={handleRowClick}
          />
        </div>
      </div>

      {/* Error State */}
      {errors.arrival && (
        <div className="card p-6 border-red-200 dark:border-red-800">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900">
              <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Ошибка загрузки данных</h3>
              <p className="text-red-600 dark:text-red-400">{errors.arrival}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Arrival