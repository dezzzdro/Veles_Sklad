/**
 * Модуль уведомлений
 */
import { CONFIG } from '../core/Config.js';
import { Logger } from '../core/Utils.js';

export class UvedomleniyaModule {
    constructor(services) {
        this.services = services;
        this.data = [];
    }

    async load() {
        Logger.info('UvedomleniyaModule: Загрузка модуля уведомлений');

        try {
            await this.loadData();
            this.render();
            Logger.info('UvedomleniyaModule: Модуль уведомлений загружен');
        } catch (error) {
            Logger.error('UvedomleniyaModule: Ошибка загрузки модуля', error);
            this.services.notification.error('Ошибка загрузки уведомлений: ' + error.message);
        }
    }

    async loadData() {
        const result = await this.services.database.getData(CONFIG.TABLES.UVEDOMLENIYA);
        if (result.success) {
            this.data = result.data;
            Logger.info(`UvedomleniyaModule: Загружено ${this.data.length} уведомлений`);
        } else {
            throw new Error(result.error);
        }
    }

    render() {
        const content = document.getElementById('uvedomleniya-content');
        if (!content) return;

        const html = `
            <div class="section-title mb-4">
                <h2 class="h4 mb-0">
                    <i class="fas fa-bell me-2"></i>
                    Уведомления
                </h2>
            </div>

            <!-- Заголовок таблицы -->
            <div class="table-fixed-header-container">
                <div class="table-header-fixed">
                    <table class="table table-striped table-hover mb-0">
                        <thead style="background-color: #f8f9fa; height: 45px;">
                            <tr>
                                <th style="font-weight: bold; vertical-align: middle;">Дата</th>
                                <th style="font-weight: bold; vertical-align: middle;">Тип уведомления</th>
                                <th style="font-weight: bold; vertical-align: middle;">Текст уведомления</th>
                            </tr>
                        </thead>
                    </table>
                </div>
                <div class="table-body-scroll">
                    <table class="table table-striped table-hover mb-0">
                        <tbody id="uvedomleniya-table-body">
                            ${this.renderTableRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        content.innerHTML = html;
    }

    renderTableRows() {
        if (this.data.length === 0) {
            return `
                <tr>
                    <td colspan="3" class="text-center text-muted">
                        <i class="fas fa-info-circle me-2"></i>
                        Нет уведомлений
                    </td>
                </tr>
            `;
        }

        return this.data.map(item => `
            <tr style="height: 40px;">
                <td style="vertical-align: middle;">${item.дата ? new Date(item.дата).toLocaleDateString('ru-RU') : ''}</td>
                <td style="vertical-align: middle;">${item.тип || ''}</td>
                <td style="vertical-align: middle;">${item.текст || ''}</td>
            </tr>
        `).join('');
    }

    async destroy() {
        Logger.info('UvedomleniyaModule: Очистка модуля уведомлений');
        this.data = [];
    }
}