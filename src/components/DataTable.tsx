import { useState, useMemo } from 'react'
import { TableColumn, TableFilters } from '@/types'

interface FilterField {
  type: 'text' | 'select'
  placeholder?: string
  options?: { value: string; label: string }[]
  onChange?: (value: string) => void
}

interface DataTableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  onRowClick?: (item: T) => void
  className?: string
  filters?: FilterField[]
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  onRowClick,
  className = '',
  filters = []
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })

  // Sort data
  const processedData = useMemo(() => {
    let sorted = data

    // Apply sorting
    if (sortConfig.key) {
      sorted = [...data].sort((a, b) => {
        const aValue = a[sortConfig.key!]
        const bValue = b[sortConfig.key!]

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return sorted
  }, [data, sortConfig])

  const handleSort = (key: keyof T) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const getSortIcon = (key: keyof T) => {
    if (sortConfig.key !== key) return 'fas fa-sort'
    return sortConfig.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'
  }

  if (loading) {
    return (
      <div className={`card p-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Загрузка данных...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`card ${className}`}>
      {/* Fixed Height Table Container - No Page Scrolling */}
      <div className="table-scroll-container">
        {/* Single Table with Fixed Header and Scrollable Body */}
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {/* Fixed Header Section */}
          <thead className="table-header-fixed">
            {/* Header Row */}
            <tr className="bg-gray-50 dark:bg-gray-800">
              {columns.map((column, index) => (
                <th
                  key={`header-${String(column.key)}`}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider table-header-cell"
                  style={{ width: column.width }}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <span>{column.label}</span>
                      <i className={`${getSortIcon(column.key)} text-xs`}></i>
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>

            {/* Filter Row - Fixed with Header */}
            {filters.length > 0 && (
              <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                {columns.map((column, index) => {
                  const filter = filters[index]
                  return (
                    <th
                      key={`filter-${String(column.key)}`}
                      className="px-6 py-2 table-filter-cell"
                      style={{ width: column.width }}
                    >
                      {filter ? (
                        filter.type === 'select' ? (
                          <select
                            className="input text-xs py-1 px-2 h-8 w-full"
                            onChange={(e) => filter.onChange?.(e.target.value)}
                          >
                            <option value="">{filter.placeholder || 'Все'}</option>
                            {filter.options?.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder={filter.placeholder}
                            className="input text-xs py-1 px-2 h-8 w-full"
                            onChange={(e) => filter.onChange?.(e.target.value)}
                          />
                        )
                      ) : (
                        <div className="h-8"></div> // Empty space for alignment
                      )}
                    </th>
                  )
                })}
              </tr>
            )}
          </thead>

          {/* Scrollable Body Section */}
          <tbody className="table-body-scroll bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {processedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  <i className="fas fa-inbox text-4xl mb-4 block"></i>
                  Нет данных
                </td>
              </tr>
            ) : (
              processedData.map((item, index) => (
                <tr
                  key={index}
                  onClick={() => onRowClick?.(item)}
                  className={`${
                    onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''
                  } ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 table-body-cell"
                      style={{ width: column.width }}
                    >
                      {String(item[column.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Показано {processedData.length} из {data.length} записей
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataTable