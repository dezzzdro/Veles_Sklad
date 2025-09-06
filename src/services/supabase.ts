import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type {
  WarehouseItem,
  AssemblyItem,
  ArrivalItem,
  IssuedItem,
  Counterparty,
  Person,
  Notification,
  Settings,
  Operation,
  ApiResponse,
  PaginatedResponse
} from '@/types'

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://tqwagbbppfklqgmyyrwj.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxd2FnYmJwcGZrbHFnbXl5cndqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mjk2MjAsImV4cCI6MjA3MTEwNTYyMH0.C4d6-aNDisajHcg7lurnRHdbk-pe3AvE4AIaW_e53eE'

// Create Supabase client
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Generic API wrapper with error handling
class SupabaseService {
  private client: SupabaseClient

  constructor(client: SupabaseClient) {
    this.client = client
  }

  // Generic query wrapper
  private async query<T>(
    operation: () => any
  ): Promise<ApiResponse<T>> {
    try {
      const result = await operation()
      const { data, error } = result

      if (error) {
        console.error('Supabase error:', error)
        return {
          data: null as any,
          error: error.message || 'Database operation failed'
        }
      }

      return { data: data as T }
    } catch (error: any) {
      console.error('Unexpected error:', error)
      return {
        data: null as any,
        error: error.message || 'Unexpected error occurred'
      }
    }
  }

  // Warehouse operations
  async getWarehouseItems(): Promise<ApiResponse<WarehouseItem[]>> {
    return this.query(() =>
      this.client
        .from('склад')
        .select('*')
        .order('id', { ascending: false })
    )
  }

  async createWarehouseItem(item: Omit<WarehouseItem, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<WarehouseItem>> {
    return this.query(() =>
      this.client
        .from('склад')
        .insert(item)
        .select()
        .single()
    )
  }

  async updateWarehouseItem(id: string, updates: Partial<WarehouseItem>): Promise<ApiResponse<WarehouseItem>> {
    return this.query(() =>
      this.client
        .from('склад')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
    )
  }

  async deleteWarehouseItem(id: string): Promise<ApiResponse<null>> {
    return this.query(() =>
      this.client
        .from('склад')
        .delete()
        .eq('id', id)
    )
  }

  // Assembly operations
  async getAssemblyItems(): Promise<ApiResponse<AssemblyItem[]>> {
    return this.query(() =>
      this.client
        .from('сборка')
        .select('*')
        .order('id', { ascending: false })
    )
  }

  async createAssemblyItem(item: Omit<AssemblyItem, 'id' | 'created_at'>): Promise<ApiResponse<AssemblyItem>> {
    return this.query(() =>
      this.client
        .from('сборка')
        .insert(item)
        .select()
        .single()
    )
  }

  async deleteAssemblyItem(id: string): Promise<ApiResponse<null>> {
    return this.query(() =>
      this.client
        .from('сборка')
        .delete()
        .eq('id', id)
    )
  }

  // Arrival operations
  async getArrivalItems(): Promise<ApiResponse<ArrivalItem[]>> {
    return this.query(() =>
      this.client
        .from('приход')
        .select('*')
        .order('дата', { ascending: false })
    )
  }

  async createArrivalItem(item: Omit<ArrivalItem, 'id' | 'created_at'>): Promise<ApiResponse<ArrivalItem>> {
    return this.query(() =>
      this.client
        .from('приход')
        .insert({ ...item, дата: new Date().toISOString() })
        .select()
        .single()
    )
  }

  async updateArrivalItem(id: string, updates: Partial<ArrivalItem>): Promise<ApiResponse<ArrivalItem>> {
    return this.query(() =>
      this.client
        .from('приход')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
    )
  }

  async deleteArrivalItem(id: string): Promise<ApiResponse<null>> {
    return this.query(() =>
      this.client
        .from('приход')
        .delete()
        .eq('id', id)
    )
  }

  // Issued operations
  async getIssuedItems(): Promise<ApiResponse<IssuedItem[]>> {
    return this.query(() =>
      this.client
        .from('выданное')
        .select('*')
        .order('дата', { ascending: false })
    )
  }

  // Counterparties operations
  async getCounterparties(): Promise<ApiResponse<Counterparty[]>> {
    return this.query(() =>
      this.client
        .from('контрагенты')
        .select('*')
        .order('created_at', { ascending: false })
    )
  }

  async getPersons(): Promise<ApiResponse<Person[]>> {
    return this.query(() =>
      this.client
        .from('ответственные_лица')
        .select('*')
        .order('created_at', { ascending: false })
    )
  }

  async createCounterparty(counterparty: Omit<Counterparty, 'id' | 'created_at'>): Promise<ApiResponse<Counterparty>> {
    return this.query(() =>
      this.client
        .from('контрагенты')
        .insert(counterparty)
        .select()
        .single()
    )
  }

  async updateCounterparty(id: string, updates: Partial<Counterparty>): Promise<ApiResponse<Counterparty>> {
    return this.query(() =>
      this.client
        .from('контрагенты')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
    )
  }

  async deleteCounterparty(id: string): Promise<ApiResponse<null>> {
    return this.query(() =>
      this.client
        .from('контрагенты')
        .delete()
        .eq('id', id)
    )
  }

  async createPerson(person: Omit<Person, 'id' | 'created_at'>): Promise<ApiResponse<Person>> {
    return this.query(() =>
      this.client
        .from('ответственные_лица')
        .insert(person)
        .select()
        .single()
    )
  }

  // Settings operations
  async getSettings(): Promise<ApiResponse<Settings>> {
    return this.query(() =>
      this.client
        .from('настройки')
        .select('*')
        .single()
    )
  }

  async updateSettings(updates: Partial<Settings>): Promise<ApiResponse<Settings>> {
    return this.query(() =>
      this.client
        .from('настройки')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', 1)
        .select()
        .single()
    )
  }

  // Notifications operations
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    return this.query(() =>
      this.client
        .from('уведомления')
        .select('*')
        .order('дата', { ascending: false })
    )
  }

  async updateNotification(id: string, updates: Partial<Notification>): Promise<ApiResponse<Notification>> {
    return this.query(() =>
      this.client
        .from('уведомления')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
    )
  }

  async deleteNotification(id: string): Promise<ApiResponse<null>> {
    return this.query(() =>
      this.client
        .from('уведомления')
        .delete()
        .eq('id', id)
    )
  }

  // Operations log
  async getOperations(): Promise<ApiResponse<Operation[]>> {
    return this.query(() =>
      this.client
        .from('операции')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
    )
  }

  async logOperation(operation: Omit<Operation, 'id' | 'created_at'>): Promise<ApiResponse<Operation>> {
    return this.query(() =>
      this.client
        .from('операции')
        .insert(operation)
        .select()
        .single()
    )
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.client
        .from('склад')
        .select('count', { count: 'exact', head: true })
        .limit(1)

      return !error
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService(supabase)

// Export types
export type { SupabaseService }