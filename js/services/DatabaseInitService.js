/**
 * Сервис инициализации базы данных
 */
import { CONFIG } from '../core/Config.js';
import { Logger } from '../core/Utils.js';

export class DatabaseInitService {
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.isInitialized = false;
    }

    /**
     * Инициализация базы данных
     */
    async initializeDatabase() {
        try {
            Logger.info('DatabaseInitService: Начало инициализации базы данных');

            // Проверяем, инициализирована ли уже БД
            const isInitialized = await this.checkDatabaseInitialized();

            if (isInitialized) {
                Logger.info('DatabaseInitService: База данных уже инициализирована');
                this.isInitialized = true;
                return { success: true, message: 'База данных уже инициализирована' };
            }

            // Создаем таблицы
            await this.createTables();

            // Создаем начальные данные
            await this.createInitialData();

            this.isInitialized = true;
            Logger.info('DatabaseInitService: База данных успешно инициализирована');

            return { success: true, message: 'База данных инициализирована' };

        } catch (error) {
            Logger.error('DatabaseInitService: Ошибка инициализации базы данных', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Проверка, инициализирована ли база данных
     */
    async checkDatabaseInitialized() {
        try {
            // Проверяем наличие основной таблицы
            const result = await this.databaseService.getData(CONFIG.TABLES.SKLAD, { limit: 1 });
            return result.success;
        } catch (error) {
            return false;
        }
    }

    /**
     * Создание таблиц
     */
    async createTables() {
        Logger.info('DatabaseInitService: Создание таблиц');

        const createTableSQL = `
            -- Таблица Склад
            CREATE TABLE IF NOT EXISTS склад (
                id SERIAL PRIMARY KEY,
                наименование VARCHAR(255) NOT NULL,
                ед_изм VARCHAR(50) NOT NULL,
                числится DECIMAL(10,2) NOT NULL DEFAULT 0,
                на_складе DECIMAL(10,2) NOT NULL DEFAULT 0,
                выдано DECIMAL(10,2) NOT NULL DEFAULT 0
            );

            -- Таблица Сборка
            CREATE TABLE IF NOT EXISTS сборка (
                id SERIAL PRIMARY KEY,
                наименование VARCHAR(255) NOT NULL,
                ед_изм VARCHAR(50) NOT NULL,
                количество DECIMAL(10,2) NOT NULL DEFAULT 0
            );

            -- Таблица Приход
            CREATE TABLE IF NOT EXISTS приход (
                id SERIAL PRIMARY KEY,
                дата TIMESTAMP DEFAULT NOW(),
                наименование VARCHAR(255) NOT NULL,
                ед_изм VARCHAR(50) NOT NULL,
                количество DECIMAL(10,2) NOT NULL DEFAULT 0,
                реестровый_номер VARCHAR(100),
                upd VARCHAR(100)
            );

            -- Таблица Выданное
            CREATE TABLE IF NOT EXISTS выданное (
                id SERIAL PRIMARY KEY,
                дата TIMESTAMP DEFAULT NOW(),
                id_товара INTEGER,
                наименование VARCHAR(255) NOT NULL,
                ед_изм VARCHAR(50) NOT NULL,
                количество DECIMAL(10,2) NOT NULL DEFAULT 0,
                контрагент VARCHAR(255),
                ответственный VARCHAR(255),
                реестровый_номер VARCHAR(100),
                upd VARCHAR(100)
            );

            -- Таблица Контрагенты
            CREATE TABLE IF NOT EXISTS контрагенты (
                id SERIAL PRIMARY KEY,
                организация VARCHAR(255) NOT NULL
            );

            -- Таблица Ответственные лица для контрагентов
            CREATE TABLE IF NOT EXISTS ответственные_лица (
                id SERIAL PRIMARY KEY,
                id_контрагента INTEGER REFERENCES контрагенты(id),
                имя VARCHAR(255) NOT NULL
            );

            -- Таблица Настройки
            CREATE TABLE IF NOT EXISTS настройки (
                id SERIAL PRIMARY KEY,
                тема VARCHAR(50) DEFAULT 'light'
            );

            -- Таблица Уведомления
            CREATE TABLE IF NOT EXISTS уведомления (
                id SERIAL PRIMARY KEY,
                дата TIMESTAMP DEFAULT NOW(),
                тип_уведомления VARCHAR(100) NOT NULL,
                текст_уведомления TEXT NOT NULL
            );

            -- Таблица Операции (для истории)
            CREATE TABLE IF NOT EXISTS операции (
                id SERIAL PRIMARY KEY,
                дата TIMESTAMP DEFAULT NOW(),
                тип_операции VARCHAR(100) NOT NULL,
                детали TEXT
            );
        `;

        // Supabase не поддерживает прямое выполнение SQL через JS SDK
        // Поэтому создаем таблицы через отдельные запросы
        await this.createTablesViaAPI();
    }

    /**
     * Создание таблиц через API (проверка существования и инициализация)
     */
    async createTablesViaAPI() {
        Logger.info('DatabaseInitService: Инициализация таблиц через API');

        const tables = [
            { name: CONFIG.TABLES.SKLAD, initData: { наименование: 'Инициализация', ед_изм: 'шт', числится: 0, на_складе: 0, выдано: 0 } },
            { name: CONFIG.TABLES.SBORKA, initData: { наименование: 'Инициализация', ед_изм: 'шт', количество: 0 } },
            { name: CONFIG.TABLES.PRIHOD, initData: { дата: new Date().toISOString(), наименование: 'Инициализация', ед_изм: 'шт', количество: 0 } },
            { name: CONFIG.TABLES.VYDANNOE, initData: { дата: new Date().toISOString(), наименование: 'Инициализация', ед_изм: 'шт', количество: 0 } },
            { name: CONFIG.TABLES.KONTRAGENTY, initData: { организация: 'Инициализация' } },
            { name: CONFIG.TABLES.OTVETSTVENNYE, initData: { имя: 'Инициализация', должность: 'Администратор' } },
            { name: CONFIG.TABLES.NASTROYKI, initData: { тема: 'light' } },
            { name: CONFIG.TABLES.UVEDOMLENIYA, initData: { дата: new Date().toISOString(), тип_уведомления: 'Система', текст_уведомления: 'Инициализация базы данных' } },
            { name: CONFIG.TABLES.OPERATSII, initData: { дата: new Date().toISOString(), тип_операции: 'Инициализация', детали: 'База данных инициализирована' } }
        ];

        for (const table of tables) {
            try {
                // Проверяем, существует ли таблица и есть ли в ней данные
                const result = await this.databaseService.getData(table.name, { limit: 1 });

                if (result.success && result.data && result.data.length > 0) {
                    Logger.info(`DatabaseInitService: Таблица ${table.name} уже содержит данные`);
                } else {
                    // Таблица существует но пуста, или создаем тестовую запись для проверки
                    const initResult = await this.databaseService.insertData(table.name, table.initData);

                    if (initResult.success) {
                        Logger.info(`DatabaseInitService: Таблица ${table.name} инициализирована`);

                        // Удаляем тестовую запись, оставляя таблицу пустой
                        if (initResult.data && initResult.data.length > 0) {
                            await this.databaseService.deleteData(table.name, initResult.data[0].id);
                        }
                    } else {
                        Logger.warn(`DatabaseInitService: Не удалось инициализировать таблицу ${table.name}: ${initResult.error}`);
                    }
                }
            } catch (error) {
                Logger.error(`DatabaseInitService: Ошибка работы с таблицей ${table.name}:`, error);
            }
        }
    }

    /**
     * Создание начальных данных
     */
    async createInitialData() {
        Logger.info('DatabaseInitService: Создание начальных данных');

        // Создаем начальную настройку темы
        try {
            await this.databaseService.insertData(CONFIG.TABLES.NASTROYKI, {
                тема: 'light'
            });
        } catch (error) {
            Logger.warn('DatabaseInitService: Не удалось создать начальную настройку темы:', error);
        }

        // Создаем тестовое уведомление
        try {
            await this.databaseService.insertData(CONFIG.TABLES.UVEDOMLENIYA, {
                тип_уведомления: 'Система',
                текст_уведомления: 'База данных инициализирована'
            });
        } catch (error) {
            Logger.warn('DatabaseInitService: Не удалось создать тестовое уведомление:', error);
        }
    }

    /**
     * Получение статуса инициализации
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            message: this.isInitialized ? 'База данных инициализирована' : 'База данных не инициализирована'
        };
    }
}

// Создаем singleton instance
let databaseInitServiceInstance = null;

export function getDatabaseInitService(databaseService) {
    if (!databaseInitServiceInstance) {
        databaseInitServiceInstance = new DatabaseInitService(databaseService);
    }
    return databaseInitServiceInstance;
}