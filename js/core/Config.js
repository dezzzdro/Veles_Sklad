/**
 * Конфигурация приложения
 */
export const CONFIG = {
    // Supabase настройки
    SUPABASE: {
        URL: 'https://tqwagbbppfklqgmyyrwj.supabase.co',
        ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxd2FnYmJwcGZrbHFnbXl5cndqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mjk2MjAsImV4cCI6MjA3MTEwNTYyMH0.C4d6-aNDisajHcg7lurnRHdbk-pe3AvE4AIaW_e53eE'
    },

    // Разделы приложения
    SECTIONS: {
        SKLAD: 'sklad',
        SBORKA: 'sborka',
        PRIHOD: 'prihod',
        VYDANNOE: 'vydannoe',
        KONTRAGENTY: 'kontragenty',
        NASTROYKI: 'nastroyki',
        UVEDOMLENIYA: 'uvedomleniya',
        OTLADKA: 'otladka'
    },

    // Названия разделов
    SECTION_NAMES: {
        sklad: 'Склад',
        sborka: 'Сборка',
        prihod: 'Приход',
        vydannoe: 'Выданное',
        kontragenty: 'Контрагенты',
        nastroyki: 'Настройки',
        uvedomleniya: 'Уведомления',
        otladka: 'Отладка'
    },

    // Иконки разделов
    SECTION_ICONS: {
        sklad: 'warehouse',
        sborka: 'cogs',
        prihod: 'truck',
        vydannoe: 'hand-holding',
        kontragenty: 'users',
        nastroyki: 'cog',
        uvedomleniya: 'bell',
        otladka: 'tools'
    },

    // Таблицы базы данных
    TABLES: {
        SKLAD: 'склад',
        SBORKA: 'сборка',
        PRIHOD: 'приход',
        VYDANNOE: 'выданное',
        KONTRAGENTY: 'контрагенты',
        OTVETSTVENNYE: 'ответственные_лица',
        NASTROYKI: 'настройки',
        UVEDOMLENIYA: 'уведомления',
        OPERATSII: 'операции'
    },

    // Настройки интерфейса
    UI: {
        DEFAULT_SECTION: 'sklad',
        THEME_STORAGE_KEY: 'theme',
        DEFAULT_THEME: 'light',
        TABLE_PAGE_SIZE: 50,
        DEBOUNCE_DELAY: 300
    },

    // API настройки
    API: {
        TIMEOUT: 10000,
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000
    }
};

/**
 * Получить конфигурацию раздела
 */
export function getSectionConfig(sectionId) {
    return {
        id: sectionId,
        name: CONFIG.SECTION_NAMES[sectionId],
        icon: CONFIG.SECTION_ICONS[sectionId],
        table: CONFIG.TABLES[sectionId.toUpperCase()]
    };
}

/**
 * Получить все разделы
 */
export function getAllSections() {
    return Object.values(CONFIG.SECTIONS);
}

/**
 * Проверить, является ли раздел валидным
 */
export function isValidSection(sectionId) {
    return Object.values(CONFIG.SECTIONS).includes(sectionId);
}