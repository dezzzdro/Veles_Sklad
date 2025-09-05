/**
 * Точка входа нового приложения
 * Модульная архитектура
 */
import { initApp } from './core/App.js';
import { themeService } from './services/ThemeService.js';

// Глобальные переменные для обратной совместимости
window.app = null;
window.themeService = themeService;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 Запуск нового приложения...');

        // Инициализация приложения
        window.app = initApp();

        // Глобальные функции для обратной совместимости
        window.setTheme = (theme) => themeService.applyTheme(theme);
        window.showNotification = (message, type) => {
            const notificationService = window.app.getService('notification');
            notificationService.showToast(message, type);
        };

        console.log('✅ Новое приложение запущено');

    } catch (error) {
        console.error('❌ Ошибка запуска приложения:', error);
        alert('Ошибка запуска приложения: ' + error.message);
    }
});

// Обработка ошибок
window.addEventListener('error', (event) => {
    console.error('🔥 Глобальная ошибка:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('🔥 Неперехваченное отклонение промиса:', event.reason);
});