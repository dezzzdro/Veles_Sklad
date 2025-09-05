/**
 * Сервис для работы с базой данных Supabase
 */
import { CONFIG } from '../core/Config.js';
import { Logger } from '../core/Utils.js';

export class DatabaseService {
    constructor() {
        this.supabase = null;
        this.isConnected = false;
        this.init();
    }

    /**
     * Инициализация подключения к Supabase
     */
    init() {
        try {
            this.supabase = window.supabase.createClient(
                CONFIG.SUPABASE.URL,
                CONFIG.SUPABASE.ANON_KEY
            );
            this.isConnected = true;
            Logger.info('DatabaseService: Подключение к Supabase установлено');
        } catch (error) {
            Logger.error('DatabaseService: Ошибка подключения к Supabase', error);
            this.isConnected = false;
        }
    }

    /**
     * Проверка подключения
     */
    async checkConnection() {
        if (!this.isConnected || !this.supabase) {
            return { success: false, error: 'Нет подключения к базе данных' };
        }

        try {
            const { data, error } = await this.supabase
                .from(CONFIG.TABLES.SKLAD)
                .select('count', { count: 'exact', head: true });

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            Logger.error('DatabaseService: Ошибка проверки подключения', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Получение данных из таблицы
     */
    async getData(tableName, options = {}) {
        try {
            let query = this.supabase.from(tableName).select('*');

            if (options.limit) query = query.limit(options.limit);
            if (options.orderBy) {
                query = query.order(options.orderBy.column, {
                    ascending: options.orderBy.ascending !== false
                });
            }
            if (options.filters) {
                Object.keys(options.filters).forEach(key => {
                    if (options.filters[key] !== null && options.filters[key] !== undefined) {
                        query = query.eq(key, options.filters[key]);
                    }
                });
            }

            const { data, error, count } = await query;

            if (error) throw error;

            return { success: true, data: data || [], count };
        } catch (error) {
            Logger.error(`DatabaseService: Ошибка получения данных из ${tableName}`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Вставка данных в таблицу
     */
    async insertData(tableName, data) {
        try {
            const { data: result, error } = await this.supabase
                .from(tableName)
                .insert(data)
                .select();

            if (error) throw error;

            Logger.info(`DatabaseService: Данные вставлены в ${tableName}`, result);
            return { success: true, data: result };
        } catch (error) {
            Logger.error(`DatabaseService: Ошибка вставки данных в ${tableName}`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Обновление данных в таблице
     */
    async updateData(tableName, id, data) {
        try {
            const { data: result, error } = await this.supabase
                .from(tableName)
                .update(data)
                .eq('id', id)
                .select();

            if (error) throw error;

            Logger.info(`DatabaseService: Данные обновлены в ${tableName}`, result);
            return { success: true, data: result };
        } catch (error) {
            Logger.error(`DatabaseService: Ошибка обновления данных в ${tableName}`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Удаление данных из таблицы
     */
    async deleteData(tableName, id) {
        try {
            const { error } = await this.supabase
                .from(tableName)
                .delete()
                .eq('id', id);

            if (error) throw error;

            Logger.info(`DatabaseService: Данные удалены из ${tableName}, ID: ${id}`);
            return { success: true };
        } catch (error) {
            Logger.error(`DatabaseService: Ошибка удаления данных из ${tableName}`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Поиск данных
     */
    async searchData(tableName, searchTerm, columns = []) {
        try {
            let query = this.supabase.from(tableName).select('*');

            if (columns.length > 0 && searchTerm) {
                const searchConditions = columns.map(col => `${col}.ilike.%${searchTerm}%`);
                query = query.or(searchConditions.join(','));
            }

            const { data, error } = await query;

            if (error) throw error;

            return { success: true, data: data || [] };
        } catch (error) {
            Logger.error(`DatabaseService: Ошибка поиска в ${tableName}`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Получение количества записей
     */
    async getCount(tableName, filters = {}) {
        try {
            let query = this.supabase
                .from(tableName)
                .select('*', { count: 'exact', head: true });

            Object.keys(filters).forEach(key => {
                if (filters[key] !== null && filters[key] !== undefined) {
                    query = query.eq(key, filters[key]);
                }
            });

            const { count, error } = await query;

            if (error) throw error;

            return { success: true, count: count || 0 };
        } catch (error) {
            Logger.error(`DatabaseService: Ошибка получения количества записей из ${tableName}`, error);
            return { success: false, error: error.message, count: 0 };
        }
    }

    /**
     * Транзакция
     */
    async executeTransaction(operations) {
        try {
            // Supabase не поддерживает явные транзакции в JS SDK
            // Выполняем операции последовательно
            const results = [];

            for (const operation of operations) {
                const result = await this[operation.method](...operation.args);
                results.push(result);

                if (!result.success) {
                    throw new Error(`Операция ${operation.method} failed: ${result.error}`);
                }
            }

            return { success: true, results };
        } catch (error) {
            Logger.error('DatabaseService: Ошибка выполнения транзакции', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Получение метрик базы данных
     */
    async getDatabaseMetrics() {
        const tables = [
            CONFIG.TABLES.SKLAD,
            CONFIG.TABLES.SBORKA,
            CONFIG.TABLES.PRIHOD,
            CONFIG.TABLES.VYDANNOE,
            CONFIG.TABLES.KONTRAGENTY,
            CONFIG.TABLES.UVEDOMLENIYA
        ];

        let totalRecords = 0;
        let activeTables = 0;

        for (const table of tables) {
            try {
                const result = await this.getCount(table);
                if (result.success) {
                    totalRecords += result.count;
                    activeTables++;
                }
            } catch (e) {
                // Таблица может не существовать
            }
        }

        return {
            totalRecords,
            activeTables,
            lastActivity: new Date().toLocaleTimeString('ru-RU')
        };
    }
}

// Создаем singleton instance
export const databaseService = new DatabaseService();