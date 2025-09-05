/**
 * Модуль контрагентов
 */
import { CONFIG } from '../core/Config.js';
import { Logger } from '../core/Utils.js';

export class KontragentyModule {
    constructor(services) {
        this.services = services;
        this.data = [];
        this.otvetstvennye = [];
    }

    async load() {
        Logger.info('KontragentyModule: Загрузка модуля контрагентов');

        try {
            await this.loadKontragenty();
            await this.loadOtvetstvennye();
            this.render();
            Logger.info('KontragentyModule: Модуль контрагентов загружен');
        } catch (error) {
            Logger.error('KontragentyModule: Ошибка загрузки модуля', error);
            this.services.notification.error('Ошибка загрузки контрагентов: ' + error.message);
        }
    }

    async loadKontragenty() {
        const result = await this.services.database.getData(CONFIG.TABLES.KONTRAGENTY);
        if (result.success) {
            this.data = result.data;
            Logger.info(`KontragentyModule: Загружено ${this.data.length} контрагентов`);
        } else {
            throw new Error(result.error);
        }
    }

    async loadOtvetstvennye() {
        const result = await this.services.database.getData(CONFIG.TABLES.OTVETSTVENNYE);
        if (result.success) {
            this.otvetstvennye = result.data;
            Logger.info(`KontragentyModule: Загружено ${this.otvetstvennye.length} ответственных`);
        }
    }

    render() {
        const content = document.getElementById('kontragenty-content');
        if (!content) return;

        const html = `
            <div class="section-title mb-4">
                <h2 class="h4 mb-0">
                    <i class="fas fa-users me-2"></i>
                    Контрагенты
                </h2>
            </div>

            <!-- Панель действий -->
            <div class="table-actions-primary mb-4">
                <button class="btn btn-primary" onclick="window.app.getModule('kontragenty').refresh()">
                    <i class="fas fa-sync-alt"></i>
                    <span>Обновить</span>
                </button>
                <button class="btn btn-success" onclick="window.app.getModule('kontragenty').addKontragent()">
                    <i class="fas fa-plus"></i>
                    <span>Добавить контрагента</span>
                </button>
            </div>

            <div class="row">
                ${this.data.length === 0 ? `
                    <div class="col-12">
                        <div class="text-center text-muted">
                            <i class="fas fa-users fa-3x mb-3"></i>
                            <p>Нет контрагентов для отображения</p>
                        </div>
                    </div>
                ` : this.data.map(kontragent => `
                    <div class="col-md-6 mb-4">
                        <div class="card h-100">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">${kontragent.организация || kontragent.название || 'Без названия'}</h5>
                                <div class="btn-group" role="group">
                                    <button class="btn btn-sm btn-outline-primary"
                                            onclick="window.app.getModule('kontragenty').editKontragent(${kontragent.id})"
                                            title="Редактировать">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger"
                                            onclick="window.app.getModule('kontragenty').deleteKontragent(${kontragent.id})"
                                            title="Удалить">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="card-body">
                                <p class="text-muted mb-2">Ответственные лица:</p>
                                <ul class="list-unstyled">
                                    ${this.getResponsiblePersons(kontragent.id).map(person => `
                                        <li class="d-flex justify-content-between align-items-center">
                                            <span>${person.имя || person.фио || 'Без имени'}</span>
                                            <small class="text-muted">${person.должность || ''}</small>
                                        </li>
                                    `).join('') || '<li class="text-muted">Нет ответственных лиц</li>'}
                                </ul>
                                <button class="btn btn-sm btn-outline-success mt-2"
                                        onclick="window.app.getModule('kontragenty').addResponsiblePerson(${kontragent.id})">
                                    <i class="fas fa-plus me-1"></i>
                                    Добавить ответственного
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        content.innerHTML = html;
    }

    getResponsiblePersons(kontragentId) {
        // В реальной реализации здесь должна быть связь между контрагентами и ответственными
        // Пока возвращаем всех ответственных для демонстрации
        return this.otvetstvennye.slice(0, 2); // Ограничиваем до 2 для демонстрации
    }

    addKontragent() {
        const name = prompt('Название организации:');
        if (!name) return;

        this.services.database.insertData(CONFIG.TABLES.KONTRAGENTY, {
            организация: name
        }).then(result => {
            if (result.success) {
                this.services.notification.success('Контрагент добавлен');
                this.refresh();
            } else {
                this.services.notification.error('Ошибка добавления: ' + result.error);
            }
        });
    }

    editKontragent(id) {
        const kontragent = this.data.find(k => k.id === id);
        if (!kontragent) return;

        const name = prompt('Название организации:', kontragent.организация || kontragent.название);
        if (!name) return;

        this.services.database.updateData(CONFIG.TABLES.KONTRAGENTY, id, {
            организация: name
        }).then(result => {
            if (result.success) {
                this.services.notification.success('Контрагент обновлен');
                this.refresh();
            } else {
                this.services.notification.error('Ошибка обновления: ' + result.error);
            }
        });
    }

    deleteKontragent(id) {
        if (!confirm('Удалить контрагента?')) return;

        this.services.database.deleteData(CONFIG.TABLES.KONTRAGENTY, id).then(result => {
            if (result.success) {
                this.services.notification.success('Контрагент удален');
                this.refresh();
            } else {
                this.services.notification.error('Ошибка удаления: ' + result.error);
            }
        });
    }

    addResponsiblePerson(kontragentId) {
        const name = prompt('Имя ответственного лица:');
        if (!name) return;

        const position = prompt('Должность:');

        this.services.database.insertData(CONFIG.TABLES.OTVETSTVENNYE, {
            имя: name,
            должность: position,
            kontragent_id: kontragentId
        }).then(result => {
            if (result.success) {
                this.services.notification.success('Ответственное лицо добавлено');
                this.refresh();
            } else {
                this.services.notification.error('Ошибка добавления: ' + result.error);
            }
        });
    }

    async refresh() {
        try {
            await this.loadKontragenty();
            await this.loadOtvetstvennye();
            this.render();
            this.services.notification.success('Данные контрагентов обновлены');
        } catch (error) {
            Logger.error('KontragentyModule: Ошибка обновления данных', error);
            this.services.notification.error('Ошибка обновления данных');
        }
    }

    async destroy() {
        Logger.info('KontragentyModule: Очистка модуля контрагентов');
        this.data = [];
        this.otvetstvennye = [];
    }
}