/**
 * Главный класс приложения
 */
import { CONFIG } from './Config.js';
import { Logger, ready, startDateTimeUpdate } from './Utils.js';
import { databaseService } from '../services/DatabaseService.js';
import { notificationService } from '../services/NotificationService.js';
import { themeService } from '../services/ThemeService.js';
import { getDatabaseInitService } from '../services/DatabaseInitService.js';

export class App {
    constructor() {
        this.currentSection = CONFIG.UI.DEFAULT_SECTION;
        this.modules = new Map();
        this.services = {
            database: databaseService,
            notification: notificationService,
            theme: themeService
        };
        this.isInitialized = false;
    }

    /**
     * Инициализация приложения
     */
    async init() {
        try {
            Logger.info('App: Начало инициализации приложения');

            // Инициализация сервисов
            await this.initServices();

            // Регистрация модулей
            await this.registerModules();

            // Настройка обработчиков событий
            this.setupEventListeners();

            // Загрузка начального раздела
            await this.loadInitialSection();

            this.isInitialized = true;
            Logger.info('App: Приложение успешно инициализировано');

        } catch (error) {
            Logger.error('App: Ошибка инициализации приложения', error);
            notificationService.error('Ошибка инициализации приложения: ' + error.message);
        }
    }

    /**
     * Инициализация сервисов
     */
    async initServices() {
        Logger.info('App: Инициализация сервисов');

        // Проверка подключения к базе данных
        const connectionResult = await this.services.database.checkConnection();
        if (!connectionResult.success) {
            notificationService.warning('Проблемы с подключением к базе данных');
        }

        // Инициализация базы данных (создание таблиц)
        const databaseInitService = getDatabaseInitService(this.services.database);
        const initResult = await databaseInitService.initializeDatabase();
        if (!initResult.success) {
            notificationService.warning('Не удалось инициализировать базу данных: ' + initResult.error);
        }

        // Настройка тем
        this.services.theme.watchSystemTheme();

        // Создание элементов управления темой
        this.services.theme.createThemeControls('theme-controls');
    }

    /**
     * Регистрация модулей разделов
     */
    async registerModules() {
        Logger.info('App: Регистрация модулей');

        const modules = [
            'Navigation',
            'Sklad',
            'Sborka',
            'Prihod',
            'Vydannoe',
            'Kontragenty',
            'Nastroyki',
            'Uvedomleniya',
            'Otladka'
        ];

        for (const moduleName of modules) {
            try {
                const modulePath = `../modules/${moduleName}.js`;
                const module = await import(modulePath);
                const ModuleClass = module[moduleName + 'Module'];

                if (ModuleClass) {
                    const instance = new ModuleClass(this.services);
                    this.modules.set(moduleName.toLowerCase(), instance);
                    Logger.info(`App: Модуль ${moduleName} зарегистрирован`);
                }
            } catch (error) {
                Logger.error(`App: Ошибка загрузки модуля ${moduleName}`, error);
            }
        }
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        Logger.info('App: Настройка обработчиков событий');

        // Запуск обновления времени
        startDateTimeUpdate();

        // Обработчик навигации
        document.querySelectorAll('#sidebar a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = e.target.closest('a').getAttribute('href').substring(1);
                this.navigateToSection(sectionId);
            });
        });

        // Обработчик изменения размера окна
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Обработчик клавиш
        document.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });
    }

    /**
     * Загрузка начального раздела
     */
    async loadInitialSection() {
        const initialSection = this.getInitialSection();
        await this.navigateToSection(initialSection);
    }

    /**
     * Получить начальный раздел
     */
    getInitialSection() {
        // Проверяем URL параметры
        const urlParams = new URLSearchParams(window.location.search);
        const sectionParam = urlParams.get('section');

        if (sectionParam && CONFIG.SECTIONS[sectionParam.toUpperCase()]) {
            return sectionParam;
        }

        return CONFIG.UI.DEFAULT_SECTION;
    }

    /**
     * Навигация к разделу
     */
    async navigateToSection(sectionId) {
        if (!CONFIG.SECTIONS[sectionId.toUpperCase()]) {
            Logger.error(`App: Неизвестный раздел ${sectionId}`);
            return;
        }

        try {
            // Скрываем текущий раздел
            if (this.currentSection) {
                await this.hideSection(this.currentSection);
            }

            // Показываем новый раздел
            await this.showSection(sectionId);
            this.currentSection = sectionId;

            // Обновляем URL
            this.updateUrl(sectionId);

            Logger.info(`App: Переход к разделу ${sectionId}`);

        } catch (error) {
            Logger.error(`App: Ошибка навигации к разделу ${sectionId}`, error);
            notificationService.error(`Ошибка загрузки раздела ${sectionId}`);
        }
    }

    /**
     * Показать раздел
     */
    async showSection(sectionId) {
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
            sectionElement.classList.add('active');
        }

        // Загружаем данные раздела
        await this.loadSectionData(sectionId);

        // Обновляем навигацию
        this.updateNavigation(sectionId);
    }

    /**
     * Скрыть раздел
     */
    async hideSection(sectionId) {
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
            sectionElement.classList.remove('active');
        }

        // Вызываем cleanup для модуля
        const module = this.modules.get(sectionId);
        if (module && typeof module.destroy === 'function') {
            await module.destroy();
        }
    }

    /**
     * Загрузка данных раздела
     */
    async loadSectionData(sectionId) {
        const module = this.modules.get(sectionId);
        if (module && typeof module.load === 'function') {
            await module.load();
        }
    }

    /**
     * Обновление навигации
     */
    updateNavigation(activeSectionId) {
        // Убираем активный класс со всех ссылок
        document.querySelectorAll('#sidebar a').forEach(link => {
            link.classList.remove('active');
        });

        // Добавляем активный класс к текущей ссылке
        const activeLink = document.querySelector(`#sidebar a[href="#${activeSectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * Обновление URL
     */
    updateUrl(sectionId) {
        const url = new URL(window.location);
        url.searchParams.set('section', sectionId);
        window.history.pushState({}, '', url);
    }

    /**
     * Обработчик изменения размера окна
     */
    handleResize() {
        // Адаптивность для мобильных устройств
        const isMobile = window.innerWidth < 768;

        if (isMobile) {
            // Мобильная адаптация
            document.body.classList.add('mobile');
        } else {
            document.body.classList.remove('mobile');
        }
    }

    /**
     * Обработчик клавиш
     */
    handleKeydown(event) {
        // Глобальные горячие клавиши
        switch (event.key) {
            case 'F1':
                event.preventDefault();
                this.navigateToSection('otladka');
                break;
            case 'Escape':
                // Закрыть модальные окна
                this.closeModals();
                break;
        }
    }

    /**
     * Закрыть модальные окна
     */
    closeModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        });
    }

    /**
     * Получить текущий раздел
     */
    getCurrentSection() {
        return this.currentSection;
    }

    /**
     * Получить сервис
     */
    getService(serviceName) {
        return this.services[serviceName];
    }

    /**
     * Получить модуль
     */
    getModule(moduleName) {
        return this.modules.get(moduleName.toLowerCase());
    }

    /**
     * Перезагрузка приложения
     */
    async reload() {
        Logger.info('App: Перезагрузка приложения');
        window.location.reload();
    }

    /**
     * Экспорт состояния приложения
     */
    exportState() {
        return {
            currentSection: this.currentSection,
            isInitialized: this.isInitialized,
            modules: Array.from(this.modules.keys()),
            services: Object.keys(this.services)
        };
    }
}

// Создаем глобальный instance приложения
let appInstance = null;

export function getApp() {
    if (!appInstance) {
        appInstance = new App();
    }
    return appInstance;
}

export function initApp() {
    const app = getApp();
    ready(() => app.init());
    return app;
}