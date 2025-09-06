import { render, screen, fireEvent } from '@testing-library/react'
import DataTable from './DataTable'
import { TableColumn } from '@/types'

interface TestItem {
  id: string
  name: string
  value: number
}

const mockData: TestItem[] = [
  { id: '1', name: 'Item 1', value: 100 },
  { id: '2', name: 'Item 2', value: 200 },
  { id: '3', name: 'Item 3', value: 300 },
]

const columns: TableColumn<TestItem>[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'value', label: 'Value', sortable: true },
]

describe('DataTable', () => {
  it('renders table with data', () => {
    render(<DataTable data={mockData} columns={columns} />)

    // Check if table headers are rendered
    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Value')).toBeInTheDocument()

    // Check if data is rendered
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<DataTable data={[]} columns={columns} loading={true} />)

    expect(screen.getByText('Загрузка данных...')).toBeInTheDocument()
  })

  it('shows empty state when no data', () => {
    render(<DataTable data={[]} columns={columns} />)

    expect(screen.getByText('Нет данных')).toBeInTheDocument()
  })

  it('filters data based on search term', () => {
    render(<DataTable data={mockData} columns={columns} searchable={true} />)

    const searchInput = screen.getByPlaceholderText('Поиск...')

    // Search for "Item 1"
    fireEvent.change(searchInput, { target: { value: 'Item 1' } })

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.queryByText('Item 2')).not.toBeInTheDocument()
    expect(screen.queryByText('Item 3')).not.toBeInTheDocument()
  })

  it('shows correct record count', () => {
    render(<DataTable data={mockData} columns={columns} />)

    expect(screen.getByText('Показано 3 из 3 записей')).toBeInTheDocument()
  })
})