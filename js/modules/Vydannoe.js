/**
 * Модуль выданного
 */
import { CONFIG } from '../core/Config.js';
import { Logger, debounce } from '../core/Utils.js';

export class VydannoeModule {
    constructor(services) {
        this.services = services;
        this.data = [];
        this.filters = {};
        this.kontragenty = [];
        this.otvetstvennye = [];
    }

    async load() {
        Logger.info('VydannoeModule: Загрузка модуля выданного');

        try {
            await this.loadKontragenty();
            await this.loadOtvetstvennye();
            await this.loadData();
            this.render();
            this.setupEventListeners();
            Logger.info('VydannoeModule: Модуль выданного загружен');
        } catch (error) {
            Logger.error('VydannoeModule: Ошибка загрузки модуля', error);
            this.services.notification.error('Ошибка загрузки выданного: ' + error.message);
        }
    }

    async loadData() {
        const result = await this.services.database.getData(CONFIG.TABLES.VYDANNOE);
        if (result.success) {
            this.data = result.data;
            Logger.info(`VydannoeModule: Загружено ${this.data.length} записей`);
        } else {
            throw new Error(result.error);
        }
    }

    async loadKontragenty() {
        const result = await this.services.database.getData(CONFIG.TABLES.KONTRAGENTY);
        if (result.success) {
            this.kontragenty = result.data;
        }
    }

    async loadOtvetstvennye() {
        const result = await this.services.database.getData(CONFIG.TABLES.OTVETSTVENNYE);
        if (result.success) {
            this.otvetstvennye = result.data;
        }
    }

    render() {
        const content = document.getElementById('vydannoe-content');
        if (!content) return;

        const kontragentyOptions = this.kontragenty.map(k => `<option value="${k.организация}">${k.организация}</option>`).join('');
        const otvetstvennyeOptions = this.otvetstvennye.map(o => `<option value="${o.имя}">${o.имя}</option>`).join('');

        const html = `
            <div class="section-title mb-4">
                <h2 class="h4 mb-0">
                    <i class="fas fa-box-open me-2"></i>
                    Выданное
                </h2>
            </div>

            <!-- Блок 1: Основные действия (в правой части) -->
            <div class="d-flex justify-content-end mb-4">
                <div class="btn-group" role="group">
                    <button class="btn btn-primary d-flex align-items-center px-3"
                            onclick="window.app.getModule('vydannoe').refresh()"
                            style="min-height: 40px; font-size: 14px; font-weight: bold;">
                        <i class="fas fa-sync-alt me-2" style="font-size: 18px;"></i>
                        <span>Обновить</span>
                    </button>
                    <button class="btn btn-success d-flex align-items-center px-3"
                            onclick="window.app.getModule('vydannoe').addItem()"
                            style="min-height: 40px; font-size: 14px; font-weight: bold;">
                        <i class="fas fa-plus me-2" style="font-size: 18px;"></i>
                        <span>Добавить</span>
                    </button>
                </div>
            </div>

            <!-- Блок 2: Фильтрация данных -->
            <div class="column-filters mb-3">
                <div class="filter-cell">
                    <input type="text" id="vydannoe-filter-дата" placeholder="Дата"
                           style="height: 36px; width: 100%; padding: 8px 12px; border: 1px solid #d1d9e0; border-radius: 4px;">
                </div>
                <div class="filter-cell">
                    <input type="text" id="vydannoe-filter-id" placeholder="ID"
                           style="height: 36px; width: 100%; padding: 8px 12px; border: 1px solid #d1d9e0; border-radius: 4px;">
                </div>
                <div class="filter-cell">
                    <input type="text" id="vydannoe-filter-наименование" placeholder="Наименование"
                           style="height: 36px; width: 100%; padding: 8px 12px; border: 1px solid #d1d9e0; border-radius: 4px;">
                </div>
                <div class="filter-cell">
                    <select id="vydannoe-filter-контрагент" class="form-select"
                            style="height: 36px; width: 100%; padding: 8px 12px; border: 1px solid #d1d9e0; border-radius: 4px;">
                        <option value="">Все контрагенты</option>
                        ${kontragentyOptions}
                    </select>
                </div>
                <div class="filter-cell">
                    <select id="vydannoe-filter-ответственный" class="form-select"
                            style="height: 36px; width: 100%; padding: 8px 12px; border: 1px solid #d1d9e0; border-radius: 4px;">
                        <option value="">Все ответственные</option>
                        ${otvetstvennyeOptions}
                    </select>
                </div>
            </div>

            <!-- Кнопки фильтров -->
            <div class="filter-actions mb-4">
                <button class="btn btn-success d-flex align-items-center px-3 me-2"
                        onclick="window.app.getModule('vydannoe').applyFilters()"
                        style="min-height: 40px; font-size: 14px; font-weight: bold;">
                    <i class="fas fa-check me-2" style="font-size: 18px;"></i>
                    <span>Применить фильтры</span>
                </button>
                <button class="btn btn-secondary d-flex align-items-center px-3"
                        onclick="window.app.getModule('vydannoe').resetFilters()"
                        style="min-height: 40px; font-size: 14px; font-weight: bold;">
                    <i class="fas fa-times me-2" style="font-size: 18px;"></i>
                    <span>Сбросить фильтры</span>
                </button>
            </div>

            <!-- Заголовок таблицы -->
            <div class="table-fixed-header-container">
                <div class="table-header-fixed">
                    <table class="table table-striped table-hover mb-0">
                        <thead style="background-color: #f8f9fa; height: 45px;">
                            <tr>
                                <th style="font-weight: bold; vertical-align: middle;">Дата</th>
                                <th style="font-weight: bold; vertical-align: middle;">ID</th>
                                <th style="font-weight: bold; vertical-align: middle;">Наименование</th>
                                <th style="font-weight: bold; vertical-align: middle;">Ед.изм.</th>
                                <th style="font-weight: bold; vertical-align: middle;">Количество</th>
                                <th style="font-weight: bold; vertical-align: middle;">Контрагент</th>
                                <th style="font-weight: bold; vertical-align: middle;">Ответственный</th>
                                <th style="font-weight: bold; vertical-align: middle;">Реестровый номер</th>
                                <th style="font-weight: bold; vertical-align: middle;">УПД</th>
                            </tr>
                        </thead>
                    </table>
                </div>
                <div class="table-body-scroll">
                    <table class="table table-striped table-hover mb-0">
                        <tbody id="vydannoe-table-body">
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
                    <td colspan="9" class="text-center text-muted">
                        <i class="fas fa-info-circle me-2"></i>
                        Нет данных для отображения
                    </td>
                </tr>
            `;
        }

        return this.data.map(item => `
            <tr style="height: 40px;">
                <td style="vertical-align: middle;">${item.дата ? new Date(item.дата).toLocaleDateString('ru-RU') : ''}</td>
                <td style="vertical-align: middle;">${item.id || ''}</td>
                <td style="vertical-align: middle;">${item.наименование || ''}</td>
                <td style="vertical-align: middle;">${item.ед_изм || ''}</td>
                <td style="vertical-align: middle;">${item.количество || 0}</td>
                <td style="vertical-align: middle;">${item.контрагент || ''}</td>
                <td style="vertical-align: middle;">${item.ответственный || ''}</td>
                <td style="vertical-align: middle;">${item.реестровый_номер || ''}</td>
                <td style="vertical-align: middle;">${item.упд || ''}</td>
            </tr>
        `).join('');
    }

    setupEventListeners() {
        // Глобальный поиск и фильтры
        const filterIds = ['дата', 'id', 'наименование'];
        filterIds.forEach(id => {
            const element = document.getElementById(`vydannoe-filter-${id}`);
            if (element) {
                element.addEventListener('input', () => this.applyFilters());
            }
        });

        // Dropdown фильтры
        const dropdownIds = ['контрагент', 'ответственный'];
        dropdownIds.forEach(id => {
            const element = document.getElementById(`vydannoe-filter-${id}`);
            if (element) {
                element.addEventListener('change', () => this.applyFilters());
            }
        });
    }

    applyFilters() {
        const filters = {
            дата: document.getElementById('vydannoe-filter-дата')?.value.toLowerCase() || '',
            id: document.getElementById('vydannoe-filter-id')?.value.toLowerCase() || '',
            наименование: document.getElementById('vydannoe-filter-наименование')?.value.toLowerCase() || '',
            контрагент: document.getElementById('vydannoe-filter-контрагент')?.value || '',
            ответственный: document.getElementById('vydannoe-filter-ответственный')?.value || ''
        };

        const rows = document.querySelectorAll('#vydannoe-table-body tr');

        rows.forEach(row => {
            const cells = row.cells;
            if (cells.length < 9) return; // Пропускаем строку "Нет данных"

            const rowData = {
                дата: cells[0].textContent.toLowerCase(),
                id: cells[1].textContent.toLowerCase(),
                наименование: cells[2].textContent.toLowerCase(),
                контрагент: cells[5].textContent,
                ответственный: cells[6].textContent
            };

            const matches =
                rowData.дата.includes(filters.дата) &&
                rowData.id.includes(filters.id) &&
                rowData.наименование.includes(filters.наименование) &&
                (filters.контрагент === '' || rowData.контрагент === filters.контрагент) &&
                (filters.ответственный === '' || rowData.ответственный === filters.ответственный);

            row.style.display = matches ? '' : 'none';
        });

        this.services.notification.success('Фильтры применены');
    }

    resetFilters() {
        // Очистка полей фильтров
        const filterIds = ['дата', 'id', 'наименование'];
        filterIds.forEach(id => {
            const element = document.getElementById(`vydannoe-filter-${id}`);
            if (element) element.value = '';
        });

        const dropdownIds = ['контрагент', 'ответственный'];
        dropdownIds.forEach(id => {
            const element = document.getElementById(`vydannoe-filter-${id}`);
            if (element) element.value = '';
        });

        // Показать все строки
        const rows = document.querySelectorAll('#vydannoe-table-body tr');
        rows.forEach(row => {
            row.style.display = '';
        });

        this.services.notification.info('Фильтры сброшены');
    }

    addItem() {
        const kontragentyOptions = this.kontragenty.map(k => `<option value="${k.организация}">${k.организация}</option>`).join('');
        const otvetstvennyeOptions = this.otvetstvennye.map(o => `<option value="${o.имя}">${o.имя}</option>`).join('');

        const name = prompt('Наименование:');
        if (!name) return;

        const unit = prompt('Ед.изм.:');
        if (!unit) return;

        const quantity = parseFloat(prompt('Количество:', '0')) || 0;

        // Для контрагента и ответственного можно использовать dropdown в будущем
        // Пока используем prompt для простоты
        const kontragent = prompt('Контрагент:');
        const otvetstvenny = prompt('Ответственный:');

        this.services.database.insertData(CONFIG.TABLES.VYDANNOE, {
            дата: new Date().toISOString(),
            наименование: name,
            ед_изм: unit,
            количество: quantity,
            контрагент: kontragent,
            ответственный: otvetstvenny
        }).then(result => {
            if (result.success) {
                this.services.notification.success('Запись добавлена');
                this.refresh();
            } else {
                this.services.notification.error('Ошибка добавления: ' + result.error);
            }
        });
    }

    async refresh() {
        try {
            await this.loadData();
            this.render();
            this.services.notification.success('Данные выданного обновлены');
        } catch (error) {
            Logger.error('VydannoeModule: Ошибка обновления данных', error);
            this.services.notification.error('Ошибка обновления данных');
        }
    }

    async destroy() {
        Logger.info('VydannoeModule: Очистка модуля выданного');
        this.data = [];
        this.kontragenty = [];
        this.otvetstvennye = [];
    }
}