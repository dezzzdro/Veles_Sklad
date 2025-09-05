/**
 * Модуль настроек
 */
import { CONFIG } from '../core/Config.js';
import { Logger } from '../core/Utils.js';

export class NastroykiModule {
    constructor(services) {
        this.services = services;
    }

    async load() {
        Logger.info('NastroykiModule: Загрузка модуля настроек');

        try {
            this.render();
            Logger.info('NastroykiModule: Модуль настроек загружен');
        } catch (error) {
            Logger.error('NastroykiModule: Ошибка загрузки модуля', error);
            this.services.notification.error('Ошибка загрузки настроек: ' + error.message);
        }
    }

    render() {
        const content = document.getElementById('nastroyki-content');
        if (!content) return;

        const html = `
            <div class="section-title mb-4">
                <h2 class="h4 mb-0">
                    <i class="fas fa-cog me-2"></i>
                    Настройки
                </h2>
            </div>

            <div class="row">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5>Цветовая схема</h5>
                        </div>
                        <div class="card-body">
                            <div class="d-grid gap-2">
                                <button class="btn btn-light" onclick="window.app.getService('theme').applyTheme('light')">
                                    <i class="fas fa-sun me-2"></i>Светлая
                                </button>
                                <button class="btn btn-dark" onclick="window.app.getService('theme').applyTheme('dark')">
                                    <i class="fas fa-moon me-2"></i>Темная
                                </button>
                                <button class="btn btn-secondary" onclick="window.app.getService('theme').applyTheme('auto')">
                                    <i class="fas fa-adjust me-2"></i>Автоматическая
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        content.innerHTML = html;
    }

    async destroy() {
        Logger.info('NastroykiModule: Очистка модуля настроек');
    }
}