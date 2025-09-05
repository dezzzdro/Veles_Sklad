/**
 * Сервис для управления темами оформления
 */
import { CONFIG } from '../core/Config.js';
import { Logger } from '../core/Utils.js';

export class ThemeService {
    constructor() {
        this.currentTheme = this.getSavedTheme();
        this.init();
    }

    /**
     * Инициализация сервиса тем
     */
    init() {
        this.applyTheme(this.currentTheme);
        Logger.info('ThemeService: Сервис тем инициализирован');
    }

    /**
     * Получить сохраненную тему
     */
    getSavedTheme() {
        return localStorage.getItem(CONFIG.UI.THEME_STORAGE_KEY) || CONFIG.UI.DEFAULT_THEME;
    }

    /**
     * Сохранить тему
     */
    saveTheme(theme) {
        localStorage.setItem(CONFIG.UI.THEME_STORAGE_KEY, theme);
        this.currentTheme = theme;
    }

    /**
     * Применить тему
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.saveTheme(theme);
        Logger.info(`ThemeService: Тема "${theme}" применена`);
    }

    /**
     * Переключить на светлую тему
     */
    setLightTheme() {
        this.applyTheme('light');
    }

    /**
     * Переключить на темную тему
     */
    setDarkTheme() {
        this.applyTheme('dark');
    }

    /**
     * Переключить на автоматическую тему
     */
    setAutoTheme() {
        this.applyTheme('auto');
    }

    /**
     * Получить текущую тему
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Проверить, является ли тема темной
     */
    isDarkTheme() {
        if (this.currentTheme === 'dark') return true;
        if (this.currentTheme === 'auto') {
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    }

    /**
     * Проверить, является ли тема светлой
     */
    isLightTheme() {
        return !this.isDarkTheme();
    }

    /**
     * Слушать изменения системной темы
     */
    watchSystemTheme() {
        if (this.currentTheme === 'auto' && window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                this.applyTheme('auto');
            });
        }
    }

    /**
     * Создать элементы управления темой
     */
    createThemeControls(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const themeControls = `
            <div class="theme-controls">
                <i class="fas fa-sun text-warning p-2 rounded-circle theme-btn"
                   onclick="window.themeService.setLightTheme()"
                   title="Светлая тема"></i>
                <i class="fas fa-moon text-secondary p-2 rounded-circle theme-btn"
                   onclick="window.themeService.setDarkTheme()"
                   title="Тёмная тема"></i>
                <i class="fas fa-adjust text-info p-2 rounded-circle theme-btn"
                   onclick="window.themeService.setAutoTheme()"
                   title="Автоматическая тема"></i>
            </div>
        `;

        container.innerHTML = themeControls;
        this.updateThemeButtons();
    }

    /**
     * Обновить активные кнопки тем
     */
    updateThemeButtons() {
        const buttons = document.querySelectorAll('.theme-btn');
        buttons.forEach(btn => btn.classList.remove('active'));

        let activeTheme = this.currentTheme;
        if (activeTheme === 'auto') {
            activeTheme = this.isDarkTheme() ? 'dark' : 'light';
        }

        const activeBtn = document.querySelector(`.theme-btn[onclick*="${activeTheme}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    /**
     * Получить CSS переменные для текущей темы
     */
    getThemeVariables() {
        const isDark = this.isDarkTheme();
        return {
            '--bg-color': isDark ? '#0d1117' : '#fafbfc',
            '--text-color': isDark ? '#f0f6fc' : '#24292f',
            '--sidebar-bg': isDark ? '#161b22' : '#f6f8fa',
            '--sidebar-text': isDark ? '#f0f6fc' : '#24292f',
            '--sidebar-hover': isDark ? '#21262d' : '#f3f4f6',
            '--sidebar-active': isDark ? '#1f6feb' : '#0969da',
            '--header-bg': isDark ? '#161b22' : '#ffffff',
            '--header-text': isDark ? '#f0f6fc' : '#24292f',
            '--card-bg': isDark ? '#161b22' : '#ffffff',
            '--border-color': isDark ? '#30363d' : '#d1d9e0',
            '--border-light': isDark ? '#21262d' : '#f0f2f5',
            '--shadow': isDark ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
            '--shadow-hover': isDark ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.15)',
            '--accent-color': isDark ? '#1f6feb' : '#0969da',
            '--accent-hover': isDark ? '#388bfd' : '#0757c2',
            '--success-color': '#238636',
            '--warning-color': '#bb8009',
            '--danger-color': '#da3633',
            '--info-color': '#79c0ff',
            '--muted-text': isDark ? '#8b949e' : '#656d76',
            '--table-header': isDark ? '#161b22' : '#f6f8fa',
            '--table-hover': isDark ? '#21262d' : '#f6f8fa'
        };
    }

    /**
     * Применить CSS переменные
     */
    applyThemeVariables() {
        const variables = this.getThemeVariables();
        const root = document.documentElement;

        Object.keys(variables).forEach(key => {
            root.style.setProperty(key, variables[key]);
        });
    }

    /**
     * Анимировать переход между темами
     */
    animateThemeTransition() {
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    /**
     * Сбросить тему к значениям по умолчанию
     */
    resetTheme() {
        this.applyTheme(CONFIG.UI.DEFAULT_THEME);
    }

    /**
     * Экспортировать настройки темы
     */
    exportThemeSettings() {
        return {
            currentTheme: this.currentTheme,
            isDark: this.isDarkTheme(),
            variables: this.getThemeVariables()
        };
    }

    /**
     * Импортировать настройки темы
     */
    importThemeSettings(settings) {
        if (settings.currentTheme) {
            this.applyTheme(settings.currentTheme);
        }
    }
}

// Создаем singleton instance
export const themeService = new ThemeService();