/**
 * Сервис для управления уведомлениями
 */
import { Logger } from '../core/Utils.js';

export class NotificationService {
    constructor() {
        this.toastContainer = null;
        this.init();
    }

    /**
     * Инициализация сервиса уведомлений
     */
    init() {
        this.createToastContainer();
        Logger.info('NotificationService: Сервис уведомлений инициализирован');
    }

    /**
     * Создание контейнера для toast уведомлений
     */
    createToastContainer() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.className = 'toast-container';
        this.toastContainer.id = 'toast-container';
        document.body.appendChild(this.toastContainer);
    }

    /**
     * Показать toast уведомление
     */
    showToast(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type} fade show`;
        toast.innerHTML = `
            <div class="toast-header">
                <strong class="me-auto">
                    <i class="fas fa-${this.getIconForType(type)} me-2"></i>
                    ${this.getTitleForType(type)}
                </strong>
                <button type="button" class="close" onclick="this.parentElement.parentElement.remove()">
                    <span>&times;</span>
                </button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        `;

        this.toastContainer.appendChild(toast);

        // Автоматическое удаление через указанное время
        if (duration > 0) {
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.classList.remove('show');
                    setTimeout(() => toast.remove(), 300);
                }
            }, duration);
        }

        return toast;
    }

    /**
     * Показать уведомление об успехе
     */
    success(message, duration = 5000) {
        return this.showToast(message, 'success', duration);
    }

    /**
     * Показать информационное уведомление
     */
    info(message, duration = 5000) {
        return this.showToast(message, 'info', duration);
    }

    /**
     * Показать предупреждение
     */
    warning(message, duration = 5000) {
        return this.showToast(message, 'warning', duration);
    }

    /**
     * Показать ошибку
     */
    error(message, duration = 7000) {
        return this.showToast(message, 'error', duration);
    }

    /**
     * Показать модальное окно
     */
    showModal(options = {}) {
        const {
            title = 'Подтверждение',
            content = '',
            type = 'info',
            buttons = [
                { text: 'Отмена', class: 'btn-secondary', action: () => {} },
                { text: 'OK', class: 'btn-primary', action: () => {} }
            ]
        } = options;

        const modalHtml = `
            <div class="modal fade" id="notification-modal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-${this.getIconForType(type)} me-2"></i>
                                ${title}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            ${content}
                        </div>
                        <div class="modal-footer">
                            ${buttons.map((btn, index) => `
                                <button type="button" class="btn ${btn.class}" data-bs-dismiss="modal"
                                        onclick="(${btn.action.toString()})()">
                                    ${btn.text}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Удаляем предыдущее модальное окно, если оно существует
        const existingModal = document.getElementById('notification-modal');
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const modal = new bootstrap.Modal(document.getElementById('notification-modal'));
        modal.show();

        // Удаляем модальное окно после закрытия
        document.getElementById('notification-modal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });

        return modal;
    }

    /**
     * Показать диалог подтверждения
     */
    confirm(message, onConfirm, onCancel = null) {
        return this.showModal({
            title: 'Подтверждение',
            content: message,
            type: 'warning',
            buttons: [
                {
                    text: 'Отмена',
                    class: 'btn-secondary',
                    action: onCancel || (() => {})
                },
                {
                    text: 'Подтвердить',
                    class: 'btn-danger',
                    action: onConfirm
                }
            ]
        });
    }

    /**
     * Показать алерт
     */
    alert(message, type = 'info') {
        return this.showModal({
            title: this.getTitleForType(type),
            content: message,
            type: type,
            buttons: [
                {
                    text: 'OK',
                    class: 'btn-primary',
                    action: () => {}
                }
            ]
        });
    }

    /**
     * Очистить все уведомления
     */
    clearAll() {
        if (this.toastContainer) {
            this.toastContainer.innerHTML = '';
        }
    }

    /**
     * Получить иконку для типа уведомления
     */
    getIconForType(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-triangle';
            case 'warning': return 'exclamation-circle';
            default: return 'info-circle';
        }
    }

    /**
     * Получить заголовок для типа уведомления
     */
    getTitleForType(type) {
        switch (type) {
            case 'success': return 'Успех';
            case 'error': return 'Ошибка';
            case 'warning': return 'Предупреждение';
            default: return 'Информация';
        }
    }

    /**
     * Создание прогресс-бара
     */
    createProgress(options = {}) {
        const {
            title = 'Загрузка...',
            showPercentage = true
        } = options;

        const progressHtml = `
            <div class="progress-modal" id="progress-modal">
                <div class="progress-backdrop"></div>
                <div class="progress-content">
                    <div class="progress-header">
                        <h5>${title}</h5>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" id="progress-bar">
                            <div class="progress-fill" id="progress-fill"></div>
                        </div>
                        ${showPercentage ? '<div class="progress-text" id="progress-text">0%</div>' : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', progressHtml);
        return {
            update: (percentage) => this.updateProgress(percentage),
            remove: () => this.removeProgress()
        };
    }

    /**
     * Обновление прогресса
     */
    updateProgress(percentage) {
        const fill = document.getElementById('progress-fill');
        const text = document.getElementById('progress-text');

        if (fill) {
            fill.style.width = `${percentage}%`;
        }
        if (text) {
            text.textContent = `${Math.round(percentage)}%`;
        }
    }

    /**
     * Удаление прогресса
     */
    removeProgress() {
        const modal = document.getElementById('progress-modal');
        if (modal) {
            modal.remove();
        }
    }
}

// Создаем singleton instance
export const notificationService = new NotificationService();