// Core data types for Veles Sklad

export interface WarehouseItem {
  id: string
  наименование: string
  ед_изм: string
  числится: number
  на_складе: number
  выдано: number
  created_at?: string
  updated_at?: string
}

export interface AssemblyItem {
  id: string
  наименование: string
  ед_изм: string
  количество: number
  created_at?: string
  updated_at?: string
}

export interface ArrivalItem {
  id: string
  дата: string
  наименование: string
  ед_изм: string
  количество: number
  реестровый_номер?: string
  упд?: string
  created_at?: string
}

export interface IssuedItem {
  id: string
  дата: string
  id_товара: string
  наименование: string
  ед_изм: string
  количество: number
  контрагент: string
  ответственный: string
  реестровый_номер?: string
  упд?: string
  created_at?: string
}

export interface Counterparty {
  id: string
  название: string
  created_at?: string
  updated_at?: string
}

export interface Person {
  id: string
  контрагент_id: string
  фио: string
  должность?: string
  телефон?: string
  email?: string
  created_at?: string
  updated_at?: string
}

export interface Notification {
  id: string
  дата: string
  тип_уведомления: string
  текст_уведомления: string
  прочитано?: boolean
  created_at?: string
}

export interface Settings {
  id: string
  тема: 'light' | 'dark' | 'auto'
  уведомления_включены: boolean
  язык: string
  created_at?: string
  updated_at?: string
}

export interface Operation {
  id: string
  тип: string
  описание: string
  данные?: any
  пользователь?: string
  created_at: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Form types
export interface WarehouseFormData {
  наименование: string
  ед_изм: string
  числится: number
  на_складе: number
  выдано: number
}

export interface ArrivalFormData {
  дата?: string
  наименование: string
  ед_изм: string
  количество: number
  реестровый_номер?: string
  упд?: string
}

export interface IssuedFormData {
  id_товара: string
  количество: number
  контрагент: string
  ответственный: string
  реестровый_номер?: string
  упд?: string
}

export interface CounterpartyFormData {
  название: string
}

export interface PersonFormData {
  контрагент_id: string
  фио: string
  должность?: string
  телефон?: string
  email?: string
}

// Filter types
export interface TableFilters {
  [key: string]: string | number | boolean | undefined
}

// Theme types
export type Theme = 'light' | 'dark' | 'auto'

// Navigation types
export interface NavItem {
  name: string
  href: string
  icon: string
}

// Component props types
export interface TableColumn<T = any> {
  key: keyof T
  label: string
  sortable?: boolean
  filterable?: boolean
  width?: string
}

export interface TableProps<T = any> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void
  onFilter?: (filters: TableFilters) => void
  onRowClick?: (item: T) => void
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
}

// Loading states
export interface LoadingState {
  isLoading: boolean
  error?: AppError | null
  data?: any
}