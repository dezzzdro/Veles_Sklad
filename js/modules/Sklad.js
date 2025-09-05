/**
 * Модуль склада
 */
import { CONFIG } from '../core/Config.js';
import { Logger, debounce } from '../core/Utils.js';

export class SkladModule {
    constructor(services) {
        this.services = services;
        this.data = [];
        this.filters = {};
        this.searchTimeout = null;
    }

    /**
     * Загрузка модуля
     */
    async load() {
        Logger.info('SkladModule: Загрузка модуля склада');

        try {
            // Загружаем данные
            await this.loadData();

            // Рендерим интерфейс
            this.render();

            // Настраиваем обработчики событий
            this.setupEventListeners();

            Logger.info('SkladModule: Модуль склада загружен');

        } catch (error) {
            Logger.error('SkladModule: Ошибка загрузки модуля', error);
            this.services.notification.error('Ошибка загрузки склада: ' + error.message);
        }
    }

    /**
     * Загрузка данных склада
     */
    async loadData() {
        const result = await this.services.database.getData(CONFIG.TABLES.SKLAD);

        if (result.success) {
            this.data = result.data;
            Logger.info(`SkladModule: Загружено ${this.data.length} записей склада`);
        } else {
            throw new Error(result.error);
        }
    }

    /**
     * Рендеринг интерфейса
     */
    render() {
        const content = document.getElementById('sklad-content');

        if (!content) {
            Logger.error('SkladModule: Контейнер sklad-content не найден');
            return;
        }

        const html = `
            <div class="section-title mb-4">
                <h2 class="h4 mb-0">
                    <i class="fas fa-warehouse me-2"></i>
                    Склад
                </h2>
            </div>

            <!-- Блок 1: Основные действия (в правой части) -->
            <div class="d-flex justify-content-end mb-4">
                <div class="btn-group" role="group">
                    <button class="btn btn-primary d-flex align-items-center px-3"
                            onclick="window.app.getModule('sklad').refresh()"
                            style="min-height: 40px; font-size: 14px; font-weight: bold;">
                        <i class="fas fa-sync-alt me-2" style="font-size: 18px;"></i>
                        <span>Обновить</span>
                    </button>
                    <button class="btn btn-success d-flex align-items-center px-3"
                            onclick="window.app.getModule('sklad').addItem()"
                            style="min-height: 40px; font-size: 14px; font-weight: bold;">
                        <i class="fas fa-plus me-2" style="font-size: 18px;"></i>
                        <span>Добавить</span>
                    </button>
                    <button class="btn btn-secondary d-flex align-items-center px-3"
                            onclick="window.app.getModule('sklad').exportData()"
                            style="min-height: 40px; font-size: 14px; font-weight: bold;">
                        <i class="fas fa-file-excel me-2" style="font-size: 18px;"></i>
                        <span>Экспорт</span>
                    </button>
                </div>
            </div>

            <!-- Глобальный поиск -->
            <div class="global-search mb-3">
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                    <input type="text" id="sklad-global-search" class="form-control"
                           placeholder="Поиск по всем колонкам..."
                           style="height: 36px;">
                </div>
            </div>

            <!-- Единая таблица с фиксированным заголовком -->
            <div class="table-container">
                <table class="table table-striped table-hover">
                    <thead class="table-header-fixed">
                        <tr>
                            <th>ID</th>
                            <th>Наименование</th>
                            <th>Ед.изм.</th>
                            <th>Числится</th>
                            <th>На складе</th>
                            <th>Выдано</th>
                            <th>Действия</th>
                        </tr>
                        <tr class="filter-row">
                            <th><input type="text" id="sklad-filter-id" placeholder="ID"></th>
                            <th><input type="text" id="sklad-filter-наименование" placeholder="Наименование"></th>
                            <th><input type="text" id="sklad-filter-ед_изм" placeholder="Ед.изм."></th>
                            <th><input type="text" id="sklad-filter-числится" placeholder="Числится"></th>
                            <th><input type="text" id="sklad-filter-на_складе" placeholder="На складе"></th>
                            <th><input type="text" id="sklad-filter-выдано" placeholder="Выдано"></th>
                            <th><button class="btn btn-secondary btn-sm" onclick="window.app.getModule('sklad').resetFilters()"><i class="fas fa-times"></i> Сброс</button></th>
                        </tr>
                    </thead>
                    <tbody id="sklad-table-body" class="table-body-scroll">
                        ${this.renderTableRows()}
                    </tbody>
                </table>
            </div>
        `;

        content.innerHTML = html;
    }

    /**
     * Рендеринг строк таблицы
     */
    renderTableRows() {
        if (this.data.length === 0) {
            return `
                <tr>
                    <td colspan="7" class="text-center text-muted">
                        <i class="fas fa-info-circle me-2"></i>
                        Нет данных для отображения
                    </td>
                </tr>
            `;
        }

        return this.data.map(item => `
            <tr style="height: 40px;">
                <td style="vertical-align: middle;">${item.id || ''}</td>
                <td style="vertical-align: middle;">${item.наименование || ''}</td>
                <td style="vertical-align: middle;">${item.ед_изм || ''}</td>
                <td style="vertical-align: middle;">${item.числится || 0}</td>
                <td style="vertical-align: middle;">${item.на_складе || 0}</td>
                <td style="vertical-align: middle;">${item.выдано || 0}</td>
                <td style="vertical-align: middle;">
                    <div class="btn-group" role="group">
                        <button class="btn btn-square btn-outline-primary btn-sm"
                                onclick="window.app.getModule('sklad').editItem(${item.id})"
                                title="Редактировать"
                                style="font-size: 16px; width: 32px; height: 32px; padding: 0;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-square btn-outline-danger btn-sm"
                                onclick="window.app.getModule('sklad').deleteItem(${item.id})"
                                title="Удалить"
                                style="font-size: 16px; width: 32px; height: 32px; padding: 0;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Глобальный поиск
        const globalSearch = document.getElementById('sklad-global-search');
        if (globalSearch) {
            globalSearch.addEventListener('input', debounce(() => {
                this.applyFilters();
            }, CONFIG.UI.DEBOUNCE_DELAY));
        }

        // Фильтры колонок
        const filterIds = ['id', 'наименование', 'ед_изм', 'числится', 'на_складе', 'выдано'];
        filterIds.forEach(id => {
            const element = document.getElementById(`sklad-filter-${id}`);
            if (element) {
                element.addEventListener('input', debounce(() => {
                    this.applyFilters();
                }, CONFIG.UI.DEBOUNCE_DELAY));
            }
        });
    }

    /**
     * Применение фильтров
     */
    applyFilters() {
        const filters = {
            id: document.getElementById('sklad-filter-id')?.value.toLowerCase() || '',
            наименование: document.getElementById('sklad-filter-наименование')?.value.toLowerCase() || '',
            ед_изм: document.getElementById('sklad-filter-ед_изм')?.value.toLowerCase() || '',
            числится: document.getElementById('sklad-filter-числится')?.value.toLowerCase() || '',
            на_складе: document.getElementById('sklad-filter-на_складе')?.value.toLowerCase() || '',
            выдано: document.getElementById('sklad-filter-выдано')?.value.toLowerCase() || ''
        };

        const globalSearch = document.getElementById('sklad-global-search')?.value.toLowerCase() || '';

        const rows = document.querySelectorAll('#sklad-table-body tr');

        rows.forEach(row => {
            const cells = row.cells;
            if (cells.length < 7) return; // Пропускаем строку "Нет данных"

            // Проверка фильтров колонок
            const columnMatches =
                cells[0].textContent.toLowerCase().includes(filters.id) &&
                cells[1].textContent.toLowerCase().includes(filters.наименование) &&
                cells[2].textContent.toLowerCase().includes(filters.ед_изм) &&
                cells[3].textContent.toLowerCase().includes(filters.числится) &&
                cells[4].textContent.toLowerCase().includes(filters.на_складе) &&
                cells[5].textContent.toLowerCase().includes(filters.выдано);

            // Проверка глобального поиска
            const globalMatches = globalSearch === '' ||
                Array.from(cells).slice(0, -1).some(cell =>
                    cell.textContent.toLowerCase().includes(globalSearch)
                );

            row.style.display = (columnMatches && globalMatches) ? '' : 'none';
        });

    }

    /**
     * Сброс фильтров
     */
    resetFilters() {
        // Очистка полей фильтров
        const filterIds = ['id', 'наименование', 'ед_изм', 'числится', 'на_складе', 'выдано'];
        filterIds.forEach(id => {
            const element = document.getElementById(`sklad-filter-${id}`);
            if (element) element.value = '';
        });

        const globalSearch = document.getElementById('sklad-global-search');
        if (globalSearch) globalSearch.value = '';

        // Показать все строки
        const rows = document.querySelectorAll('#sklad-table-body tr');
        rows.forEach(row => {
            row.style.display = '';
        });

        this.services.notification.info('Фильтры сброшены');
    }

    /**
     * Обновление данных
     */
    async refresh() {
        try {
            await this.loadData();
            this.render();
            this.services.notification.success('Данные склада обновлены');
        } catch (error) {
            Logger.error('SkladModule: Ошибка обновления данных', error);
            this.services.notification.error('Ошибка обновления данных');
        }
    }

    /**
     * Добавление элемента
     */
    addItem() {
        const name = prompt('Наименование:');
        if (!name) return;

        const unit = prompt('Ед.изм.:');
        if (!unit) return;

        const accounted = parseFloat(prompt('Числится:', '0')) || 0;
        const inStock = parseFloat(prompt('На складе:', '0')) || 0;
        const issued = parseFloat(prompt('Выдано:', '0')) || 0;

        this.services.database.insertData(CONFIG.TABLES.SKLAD, {
            наименование: name,
            ед_изм: unit,
            числится: accounted,
            на_складе: inStock,
            выдано: issued
        }).then(result => {
            if (result.success) {
                this.services.notification.success('Элемент добавлен');
                this.refresh();
            } else {
                this.services.notification.error('Ошибка добавления: ' + result.error);
            }
        });
    }

    /**
     * Редактирование элемента
     */
    editItem(id) {
        const item = this.data.find(item => item.id === id);
        if (!item) return;

        const name = prompt('Наименование:', item.наименование);
        if (!name) return;

        const unit = prompt('Ед.изм.:', item.ед_изм);
        if (!unit) return;

        const accounted = parseFloat(prompt('Числится:', item.числится)) || 0;
        const inStock = parseFloat(prompt('На складе:', item.на_складе)) || 0;
        const issued = parseFloat(prompt('Выдано:', item.выдано)) || 0;

        this.services.database.updateData(CONFIG.TABLES.SKLAD, id, {
            наименование: name,
            ед_изм: unit,
            числится: accounted,
            на_складе: inStock,
            выдано: issued
        }).then(result => {
            if (result.success) {
                this.services.notification.success('Элемент обновлен');
                this.refresh();
            } else {
                this.services.notification.error('Ошибка обновления: ' + result.error);
            }
        });
    }

    /**
     * Удаление элемента
     */
    deleteItem(id) {
        if (!confirm('Удалить элемент?')) return;

        this.services.database.deleteData(CONFIG.TABLES.SKLAD, id).then(result => {
            if (result.success) {
                this.services.notification.success('Элемент удален');
                this.refresh();
            } else {
                this.services.notification.error('Ошибка удаления: ' + result.error);
            }
        });
    }

    /**
     * Экспорт данных
     */
    exportData() {
        // Простая реализация экспорта
        this.services.notification.info('Экспорт данных (функция в разработке)');
    }

    /**
     * Очистка модуля
     */
    async destroy() {
        Logger.info('SkladModule: Очистка модуля склада');
        this.data = [];
        this.filters = {};
    }
}