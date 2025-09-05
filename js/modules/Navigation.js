/**
 * Модуль навигации
 */
import { CONFIG } from '../core/Config.js';
import { Logger } from '../core/Utils.js';

export class NavigationModule {
    constructor(services) {
        this.services = services;
        this.currentSection = CONFIG.UI.DEFAULT_SECTION;
        this.navigationHistory = [];
    }

    /**
     * Инициализация модуля
     */
    async init() {
        Logger.info('NavigationModule: Инициализация модуля навигации');
        this.setupNavigation();
        this.setupKeyboardNavigation();
    }

    /**
     * Настройка навигации
     */
    setupNavigation() {
        const sidebarLinks = document.querySelectorAll('#sidebar a');

        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = e.target.closest('a').getAttribute('href').substring(1);
                this.navigateToSection(sectionId);
            });
        });

        Logger.info('NavigationModule: Навигация настроена');
    }

    /**
     * Настройка клавиатурной навигации
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
    }

    /**
     * Навигация к разделу
     */
    async navigateToSection(sectionId) {
        if (!this.isValidSection(sectionId)) {
            Logger.error(`NavigationModule: Неверный раздел ${sectionId}`);
            return;
        }

        try {
            // Сохраняем в истории
            this.navigationHistory.push(this.currentSection);

            // Скрываем текущий раздел
            await this.hideCurrentSection();

            // Показываем новый раздел
            await this.showSection(sectionId);

            this.currentSection = sectionId;

            // Обновляем URL и навигацию
            this.updateUrl(sectionId);
            this.updateNavigationUI(sectionId);

            Logger.info(`NavigationModule: Переход к разделу ${sectionId}`);

        } catch (error) {
            Logger.error(`NavigationModule: Ошибка навигации к ${sectionId}`, error);
            this.services.notification.error(`Ошибка загрузки раздела ${sectionId}`);
        }
    }

    /**
     * Проверка валидности раздела
     */
    isValidSection(sectionId) {
        return Object.values(CONFIG.SECTIONS).includes(sectionId);
    }

    /**
     * Скрыть текущий раздел
     */
    async hideCurrentSection() {
        if (this.currentSection) {
            const currentElement = document.getElementById(this.currentSection);
            if (currentElement) {
                currentElement.classList.remove('active');
            }
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
    }

    /**
     * Загрузка данных раздела
     */
    async loadSectionData(sectionId) {
        // Импортируем модуль раздела динамически
        try {
            const modulePath = `./${sectionId}.js`;
            const module = await import(modulePath);
            const ModuleClass = module[sectionId.charAt(0).toUpperCase() + sectionId.slice(1) + 'Module'];

            if (ModuleClass) {
                const instance = new ModuleClass(this.services);
                await instance.load();
            }
        } catch (error) {
            Logger.error(`NavigationModule: Ошибка загрузки модуля ${sectionId}`, error);
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
     * Обновление UI навигации
     */
    updateNavigationUI(activeSectionId) {
        // Убираем активный класс со всех ссылок
        document.querySelectorAll('#sidebar a').forEach(link => {
            link.classList.remove('active');
        });

        // Добавляем активный класс к активной ссылке
        const activeLink = document.querySelector(`#sidebar a[href="#${activeSectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Обновляем заголовок страницы
        this.updatePageTitle(activeSectionId);
    }

    /**
     * Обновление заголовка страницы
     */
    updatePageTitle(sectionId) {
        const sectionConfig = this.getSectionConfig(sectionId);
        if (sectionConfig) {
            document.title = `${sectionConfig.name} - Велес Склад`;
        }
    }

    /**
     * Получить конфигурацию раздела
     */
    getSectionConfig(sectionId) {
        return {
            id: sectionId,
            name: CONFIG.SECTION_NAMES[sectionId] || sectionId,
            icon: CONFIG.SECTION_ICONS[sectionId] || 'circle',
            table: CONFIG.TABLES[sectionId.toUpperCase()]
        };
    }

    /**
     * Обработка клавиатурной навигации
     */
    handleKeyboardNavigation(event) {
        // Alt + цифра для быстрого перехода к разделу
        if (event.altKey && event.key >= '1' && event.key <= '9') {
            const sections = Object.values(CONFIG.SECTIONS);
            const index = parseInt(event.key) - 1;

            if (sections[index]) {
                event.preventDefault();
                this.navigateToSection(sections[index]);
            }
        }

        // Ctrl + H - показать историю навигации
        if (event.ctrlKey && event.key === 'h') {
            event.preventDefault();
            this.showNavigationHistory();
        }

        // Backspace - вернуться к предыдущему разделу
        if (event.key === 'Backspace' && !event.target.matches('input, textarea')) {
            event.preventDefault();
            this.goBack();
        }
    }

    /**
     * Вернуться к предыдущему разделу
     */
    goBack() {
        if (this.navigationHistory.length > 0) {
            const previousSection = this.navigationHistory.pop();
            this.navigateToSection(previousSection);
        }
    }

    /**
     * Показать историю навигации
     */
    showNavigationHistory() {
        const history = this.navigationHistory.slice(-10); // Последние 10 разделов

        if (history.length === 0) {
            this.services.notification.info('История навигации пуста');
            return;
        }

        const historyHtml = history.map(section => {
            const config = this.getSectionConfig(section);
            return `<li class="list-group-item">${config.name}</li>`;
        }).join('');

        this.services.notification.showModal({
            title: 'История навигации',
            content: `<ul class="list-group">${historyHtml}</ul>`,
            type: 'info',
            buttons: [
                { text: 'Закрыть', class: 'btn-secondary', action: () => {} }
            ]
        });
    }

    /**
     * Получить текущий раздел
     */
    getCurrentSection() {
        return this.currentSection;
    }

    /**
     * Получить список всех разделов
     */
    getAllSections() {
        return Object.values(CONFIG.SECTIONS);
    }

    /**
     * Создать быстрые ссылки
     */
    createQuickLinks(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const sections = this.getAllSections();
        const quickLinksHtml = sections.map(section => {
            const config = this.getSectionConfig(section);
            return `
                <button class="btn btn-outline-primary btn-sm me-2 mb-2"
                        onclick="window.app.getModule('navigation').navigateToSection('${section}')"
                        title="${config.name}">
                    <i class="fas fa-${config.icon} me-1"></i>
                    ${config.name}
                </button>
            `;
        }).join('');

        container.innerHTML = quickLinksHtml;
    }

    /**
     * Поиск раздела
     */
    searchSection(query) {
        const sections = this.getAllSections();
        const results = sections.filter(section => {
            const config = this.getSectionConfig(section);
            return config.name.toLowerCase().includes(query.toLowerCase());
        });

        return results;
    }

    /**
     * Очистка модуля
     */
    async destroy() {
        Logger.info('NavigationModule: Очистка модуля навигации');
        this.navigationHistory = [];
    }
}