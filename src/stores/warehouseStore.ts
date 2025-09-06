import { create } from 'zustand'
import { supabaseService } from '@/services/supabase'
import type {
  WarehouseItem,
  ArrivalItem,
  Counterparty,
  Person,
  IssuedItem,
  AssemblyItem
} from '@/types'

interface WarehouseState {
  // Data
  warehouseItems: WarehouseItem[]
  arrivalItems: ArrivalItem[]
  counterparties: Counterparty[]
  persons: Person[]
  issuedItems: IssuedItem[]
  assemblyItems: AssemblyItem[]

  // Loading states
  loading: {
    warehouse: boolean
    arrival: boolean
    counterparties: boolean
    persons: boolean
    issued: boolean
    assembly: boolean
  }

  // Errors
  errors: {
    warehouse?: string
    arrival?: string
    counterparties?: string
    persons?: string
    issued?: string
    assembly?: string
  }

  // Actions
  fetchWarehouseItems: () => Promise<void>
  fetchArrivalItems: () => Promise<void>
  fetchCounterparties: () => Promise<void>
  fetchPersons: () => Promise<void>
  fetchIssuedItems: () => Promise<void>
  fetchAssemblyItems: () => Promise<void>

  // CRUD operations
  addWarehouseItem: (item: Omit<WarehouseItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateWarehouseItem: (id: string, updates: Partial<WarehouseItem>) => Promise<void>
  deleteWarehouseItem: (id: string) => Promise<void>

  addArrivalItem: (item: Omit<ArrivalItem, 'id' | 'created_at'>) => Promise<void>
  updateArrivalItem: (id: string, updates: Partial<ArrivalItem>) => Promise<void>
  deleteArrivalItem: (id: string) => Promise<void>

  addCounterparty: (item: Omit<Counterparty, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateCounterparty: (id: string, updates: Partial<Counterparty>) => Promise<void>
  deleteCounterparty: (id: string) => Promise<void>

  // Utility functions
  clearErrors: () => void
  refreshAll: () => Promise<void>
}

export const useWarehouseStore = create<WarehouseState>((set, get) => ({
  // Initial state
  warehouseItems: [],
  arrivalItems: [],
  counterparties: [],
  persons: [],
  issuedItems: [],
  assemblyItems: [],

  loading: {
    warehouse: false,
    arrival: false,
    counterparties: false,
    persons: false,
    issued: false,
    assembly: false,
  },

  errors: {},

  // Fetch functions
  fetchWarehouseItems: async () => {
    set(state => ({ loading: { ...state.loading, warehouse: true } }))
    try {
      const result = await supabaseService.getWarehouseItems()
      if (result.error) throw new Error(result.error)

      set(state => ({
        warehouseItems: result.data || [],
        loading: { ...state.loading, warehouse: false },
        errors: { ...state.errors, warehouse: undefined }
      }))
    } catch (error) {
      set(state => ({
        loading: { ...state.loading, warehouse: false },
        errors: { ...state.errors, warehouse: (error as Error).message }
      }))
    }
  },

  fetchArrivalItems: async () => {
    set(state => ({ loading: { ...state.loading, arrival: true } }))
    try {
      const result = await supabaseService.getArrivalItems()
      if (result.error) throw new Error(result.error)

      set(state => ({
        arrivalItems: result.data || [],
        loading: { ...state.loading, arrival: false },
        errors: { ...state.errors, arrival: undefined }
      }))
    } catch (error) {
      set(state => ({
        loading: { ...state.loading, arrival: false },
        errors: { ...state.errors, arrival: (error as Error).message }
      }))
    }
  },

  fetchCounterparties: async () => {
    set(state => ({ loading: { ...state.loading, counterparties: true } }))
    try {
      const result = await supabaseService.getCounterparties()
      if (result.error) throw new Error(result.error)

      set(state => ({
        counterparties: result.data || [],
        loading: { ...state.loading, counterparties: false },
        errors: { ...state.errors, counterparties: undefined }
      }))
    } catch (error) {
      set(state => ({
        loading: { ...state.loading, counterparties: false },
        errors: { ...state.errors, counterparties: (error as Error).message }
      }))
    }
  },

  fetchPersons: async () => {
    set(state => ({ loading: { ...state.loading, persons: true } }))
    try {
      const result = await supabaseService.getPersons()
      if (result.error) throw new Error(result.error)

      set(state => ({
        persons: result.data || [],
        loading: { ...state.loading, persons: false },
        errors: { ...state.errors, persons: undefined }
      }))
    } catch (error) {
      set(state => ({
        loading: { ...state.loading, persons: false },
        errors: { ...state.errors, persons: (error as Error).message }
      }))
    }
  },

  fetchIssuedItems: async () => {
    set(state => ({ loading: { ...state.loading, issued: true } }))
    try {
      const result = await supabaseService.getIssuedItems()
      if (result.error) throw new Error(result.error)

      set(state => ({
        issuedItems: result.data || [],
        loading: { ...state.loading, issued: false },
        errors: { ...state.errors, issued: undefined }
      }))
    } catch (error) {
      set(state => ({
        loading: { ...state.loading, issued: false },
        errors: { ...state.errors, issued: (error as Error).message }
      }))
    }
  },

  fetchAssemblyItems: async () => {
    set(state => ({ loading: { ...state.loading, assembly: true } }))
    try {
      const result = await supabaseService.getAssemblyItems()
      if (result.error) throw new Error(result.error)

      set(state => ({
        assemblyItems: result.data || [],
        loading: { ...state.loading, assembly: false },
        errors: { ...state.errors, assembly: undefined }
      }))
    } catch (error) {
      set(state => ({
        loading: { ...state.loading, assembly: false },
        errors: { ...state.errors, assembly: (error as Error).message }
      }))
    }
  },

  // CRUD operations for warehouse
  addWarehouseItem: async (item) => {
    try {
      const result = await supabaseService.createWarehouseItem(item)
      if (result.error) throw new Error(result.error)

      // Refresh warehouse items
      await get().fetchWarehouseItems()
    } catch (error) {
      set(state => ({
        errors: { ...state.errors, warehouse: (error as Error).message }
      }))
      throw error
    }
  },

  updateWarehouseItem: async (id, updates) => {
    try {
      const result = await supabaseService.updateWarehouseItem(id, updates)
      if (result.error) throw new Error(result.error)

      // Update local state
      set(state => ({
        warehouseItems: state.warehouseItems.map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      }))
    } catch (error) {
      set(state => ({
        errors: { ...state.errors, warehouse: (error as Error).message }
      }))
      throw error
    }
  },

  deleteWarehouseItem: async (id) => {
    try {
      const result = await supabaseService.deleteWarehouseItem(id)
      if (result.error) throw new Error(result.error)

      // Update local state
      set(state => ({
        warehouseItems: state.warehouseItems.filter(item => item.id !== id)
      }))
    } catch (error) {
      set(state => ({
        errors: { ...state.errors, warehouse: (error as Error).message }
      }))
      throw error
    }
  },

  // CRUD operations for arrival
  addArrivalItem: async (item) => {
    try {
      const result = await supabaseService.createArrivalItem(item)
      if (result.error) throw new Error(result.error)

      // Refresh arrival items
      await get().fetchArrivalItems()
    } catch (error) {
      set(state => ({
        errors: { ...state.errors, arrival: (error as Error).message }
      }))
      throw error
    }
  },

  updateArrivalItem: async (id, updates) => {
    try {
      const result = await supabaseService.updateArrivalItem(id, updates)
      if (result.error) throw new Error(result.error)

      // Update local state
      set(state => ({
        arrivalItems: state.arrivalItems.map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      }))
    } catch (error) {
      set(state => ({
        errors: { ...state.errors, arrival: (error as Error).message }
      }))
      throw error
    }
  },

  deleteArrivalItem: async (id) => {
    try {
      const result = await supabaseService.deleteArrivalItem(id)
      if (result.error) throw new Error(result.error)

      // Update local state
      set(state => ({
        arrivalItems: state.arrivalItems.filter(item => item.id !== id)
      }))
    } catch (error) {
      set(state => ({
        errors: { ...state.errors, arrival: (error as Error).message }
      }))
      throw error
    }
  },

  // CRUD operations for counterparties
  addCounterparty: async (item) => {
    try {
      const result = await supabaseService.createCounterparty(item)
      if (result.error) throw new Error(result.error)

      // Refresh counterparties
      await get().fetchCounterparties()
    } catch (error) {
      set(state => ({
        errors: { ...state.errors, counterparties: (error as Error).message }
      }))
      throw error
    }
  },

  updateCounterparty: async (id, updates) => {
    try {
      const result = await supabaseService.updateCounterparty(id, updates)
      if (result.error) throw new Error(result.error)

      // Update local state
      set(state => ({
        counterparties: state.counterparties.map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      }))
    } catch (error) {
      set(state => ({
        errors: { ...state.errors, counterparties: (error as Error).message }
      }))
      throw error
    }
  },

  deleteCounterparty: async (id) => {
    try {
      const result = await supabaseService.deleteCounterparty(id)
      if (result.error) throw new Error(result.error)

      // Update local state
      set(state => ({
        counterparties: state.counterparties.filter(item => item.id !== id)
      }))
    } catch (error) {
      set(state => ({
        errors: { ...state.errors, counterparties: (error as Error).message }
      }))
      throw error
    }
  },

  // Utility functions
  clearErrors: () => {
    set({ errors: {} })
  },

  refreshAll: async () => {
    await Promise.all([
      get().fetchWarehouseItems(),
      get().fetchArrivalItems(),
      get().fetchCounterparties(),
      get().fetchPersons(),
      get().fetchIssuedItems(),
      get().fetchAssemblyItems(),
    ])
  },
}))