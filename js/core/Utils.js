/**
 * Вспомогательные функции
 */

/**
 * Debounce функция для оптимизации поиска
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Форматирование даты
 */
export function formatDate(date, locale = 'ru-RU') {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString(locale);
}

/**
 * Форматирование даты и времени
 */
export function formatDateTime(date, locale = 'ru-RU') {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString(locale);
}

/**
 * Проверка на пустое значение
 */
export function isEmpty(value) {
    return value === null || value === undefined || value === '';
}

/**
 * Безопасное получение значения
 */
export function safeValue(value, defaultValue = '') {
    return isEmpty(value) ? defaultValue : value;
}

/**
 * Генерация уникального ID
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Копирование текста в буфер обмена
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Ошибка копирования:', error);
        return false;
    }
}

/**
 * Проверка валидности email
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Форматирование числа
 */
export function formatNumber(num, decimals = 2) {
    if (isNaN(num)) return '0';
    return Number(num).toFixed(decimals);
}

/**
 * Создание URL с параметрами
 */
export function buildUrl(baseUrl, params = {}) {
    const url = new URL(baseUrl);
    Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
            url.searchParams.set(key, params[key]);
        }
    });
    return url.toString();
}

/**
 * Получение параметров из URL
 */
export function getUrlParams() {
    const params = {};
    const urlParams = new URLSearchParams(window.location.search);
    for (const [key, value] of urlParams) {
        params[key] = value;
    }
    return params;
}

/**
 * Логирование с уровнем
 */
export const Logger = {
    info: (message, ...args) => console.info(`[INFO] ${message}`, ...args),
    warn: (message, ...args) => console.warn(`[WARN] ${message}`, ...args),
    error: (message, ...args) => console.error(`[ERROR] ${message}`, ...args),
    debug: (message, ...args) => console.debug(`[DEBUG] ${message}`, ...args)
};

/**
 * Создание DOM элемента с атрибутами
 */
export function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);

    Object.keys(attributes).forEach(key => {
        if (key === 'className') {
            element.className = attributes[key];
        } else if (key === 'style' && typeof attributes[key] === 'object') {
            Object.assign(element.style, attributes[key]);
        } else {
            element.setAttribute(key, attributes[key]);
        }
    });

    if (content) {
        element.innerHTML = content;
    }

    return element;
}

/**
 * Показать/скрыть элемент
 */
export function toggleVisibility(element, show = true) {
    if (element) {
        element.style.display = show ? 'block' : 'none';
    }
}

/**
 * Добавление класса
 */
export function addClass(element, className) {
    if (element && className) {
        element.classList.add(className);
    }
}

/**
 * Удаление класса
 */
export function removeClass(element, className) {
    if (element && className) {
        element.classList.remove(className);
    }
}

/**
 * Переключение класса
 */
export function toggleClass(element, className) {
    if (element && className) {
        element.classList.toggle(className);
    }
}

/**
 * Получение элемента по селектору
 */
export function $(selector, context = document) {
    return context.querySelector(selector);
}

/**
 * Получение элементов по селектору
 */
export function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

/**
 * Обновление времени и даты в заголовке
 */
export function updateDateTime() {
    const datetimeElement = document.getElementById('datetime');
    if (datetimeElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const dateString = now.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        datetimeElement.textContent = `${timeString} ${dateString}`;
    }
}

/**
 * Запуск обновления времени
 */
export function startDateTimeUpdate() {
    updateDateTime(); // Обновить сразу
    setInterval(updateDateTime, 1000); // Обновлять каждую секунду
}

/**
 * Ожидание загрузки DOM
 */
export function ready(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}