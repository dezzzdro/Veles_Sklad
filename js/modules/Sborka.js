/**
 * Модуль сборки
 */
import { CONFIG } from '../core/Config.js';
import { Logger, debounce } from '../core/Utils.js';

export class SborkaModule {
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
        Logger.info('SborkaModule: Загрузка модуля сборки');

        try {
            // Загружаем данные
            await this.loadData();

            // Рендерим интерфейс
            this.render();

            // Настраиваем обработчики событий
            this.setupEventListeners();

            Logger.info('SborkaModule: Модуль сборки загружен');

        } catch (error) {
            Logger.error('SborkaModule: Ошибка загрузки модуля', error);
            this.services.notification.error('Ошибка загрузки сборки: ' + error.message);
        }
    }

    /**
     * Загрузка данных сборки
     */
    async loadData() {
        const result = await this.services.database.getData(CONFIG.TABLES.SBORKA);

        if (result.success) {
            this.data = result.data;
            Logger.info(`SborkaModule: Загружено ${this.data.length} записей сборки`);
        } else {
            throw new Error(result.error);
        }
    }

    /**
     * Рендеринг интерфейса
     */
    render() {
        const content = document.getElementById('sborka-content');

        if (!content) {
            Logger.error('SborkaModule: Контейнер sborka-content не найден');
            return;
        }

        const html = `
            <div class="section-title mb-4">
                <h2 class="h4 mb-0">
                    <i class="fas fa-cogs me-2"></i>
                    Сборка
                </h2>
            </div>

            <!-- Блок 1: Основные действия (в правой части) -->
            <div class="d-flex justify-content-end mb-4">
                <div class="btn-group" role="group">
                    <button class="btn btn-primary d-flex align-items-center px-3"
                            onclick="window.app.getModule('sborka').refresh()"
                            style="min-height: 40px; font-size: 14px; font-weight: bold;">
                        <i class="fas fa-sync-alt me-2" style="font-size: 18px;"></i>
                        <span>Обновить</span>
                    </button>
                    <button class="btn btn-success d-flex align-items-center px-3"
                            onclick="window.app.getModule('sborka').addItem()"
                            style="min-height: 40px; font-size: 14px; font-weight: bold;">
                        <i class="fas fa-plus me-2" style="font-size: 18px;"></i>
                        <span>Добавить</span>
                    </button>
                </div>
            </div>

            <!-- Глобальный поиск -->
            <div class="global-search mb-3">
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                    <input type="text" id="sborka-global-search" class="form-control"
                           placeholder="Поиск по всем колонкам..."
                           style="height: 36px;">
                </div>
            </div>

            <!-- Таблица с интегрированными фильтрами -->
            <div class="table-fixed-header-container">
                <div class="table-header-fixed">
                    <table class="table table-striped table-hover mb-0">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Наименование</th>
                                <th>Ед.изм.</th>
                                <th>Количество</th>
                                <th>Действия</th>
                            </tr>
                            <tr class="filter-row">
                                <th><input type="text" id="sborka-filter-id" placeholder="ID"></th>
                                <th><input type="text" id="sborka-filter-наименование" placeholder="Наименование"></th>
                                <th><input type="text" id="sborka-filter-ед_изм" placeholder="Ед.изм."></th>
                                <th><input type="text" id="sborka-filter-количество" placeholder="Количество"></th>
                                <th><button class="btn btn-secondary btn-sm" onclick="window.app.getModule('sborka').resetFilters()"><i class="fas fa-times"></i> Сброс</button></th>
                            </tr>
                        </thead>
                    </table>
                </div>

                <div class="table-body-scroll">
                    <table class="table table-striped table-hover mb-0">
                        <tbody id="sborka-table-body">
                            ${this.renderTableRows()}
                        </tbody>
                    </table>
                </div>
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
                    <td colspan="5" class="text-center text-muted">
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
                <td style="vertical-align: middle;">${item.количество || 0}</td>
                <td style="vertical-align: middle;">
                    <div class="btn-group" role="group">
                        <button class="btn btn-square btn-outline-primary btn-sm"
                                onclick="window.app.getModule('sborka').editItem(${item.id})"
                                title="Редактировать"
                                style="font-size: 16px; width: 32px; height: 32px; padding: 0;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-square btn-outline-warning btn-sm"
                                onclick="window.app.getModule('sborka').transferItem(${item.id})"
                                title="Передать в сборку"
                                style="font-size: 16px; width: 32px; height: 32px; padding: 0;">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                        <button class="btn btn-square btn-outline-danger btn-sm"
                                onclick="window.app.getModule('sborka').deleteItem(${item.id})"
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
        // Синхронизация ширины фильтров с колонками таблицы
        this.syncFilterWidths();

        // Глобальный поиск
        const globalSearch = document.getElementById('sborka-global-search');
        if (globalSearch) {
            globalSearch.addEventListener('input', debounce(() => {
                this.applyFilters();
            }, CONFIG.UI.DEBOUNCE_DELAY));
        }

        // Фильтры колонок
        const filterIds = ['id', 'наименование', 'ед_изм', 'количество'];
        filterIds.forEach(id => {
            const element = document.getElementById(`sborka-filter-${id}`);
            if (element) {
                element.addEventListener('input', debounce(() => {
                    this.applyFilters();
                }, CONFIG.UI.DEBOUNCE_DELAY));
            }
        });

        // Пересинхронизация ширины при изменении размера окна
        window.addEventListener('resize', () => {
            setTimeout(() => this.syncFilterWidths(), 100);
        });
    }

    /**
     * Абсолютная синхронизация ширины фильтров с колонками таблицы
     */
    syncFilterWidths() {
        // Ждем полной загрузки DOM
        setTimeout(() => {
            const headerRow = document.querySelector('.table-header-fixed thead tr:first-child');
            const filterRow = document.querySelector('.table-header-fixed thead tr.filter-row');

            if (!headerRow || !filterRow) return;

            const headerCells = headerRow.querySelectorAll('th');
            const filterCells = filterRow.querySelectorAll('th');

            headerCells.forEach((headerCell, index) => {
                const filterCell = filterCells[index];
                if (filterCell && headerCell.textContent.trim() !== 'Действия') {
                    // Точное копирование ширины
                    const headerWidth = headerCell.offsetWidth;
                    const filterInput = filterCell.querySelector('input');

                    if (filterInput) {
                        // Учитываем точные отступы и границы
                        const computedStyle = window.getComputedStyle(headerCell);
                        const paddingLeft = parseFloat(computedStyle.paddingLeft);
                        const paddingRight = parseFloat(computedStyle.paddingRight);
                        const borderLeft = parseFloat(computedStyle.borderLeftWidth);
                        const borderRight = parseFloat(computedStyle.borderRightWidth);

                        const contentWidth = headerWidth - paddingLeft - paddingRight - borderLeft - borderRight - 2; // -2 для точности

                        filterInput.style.width = contentWidth + 'px';
                        filterInput.style.minWidth = contentWidth + 'px';
                        filterInput.style.maxWidth = contentWidth + 'px';
                    }
                }
            });
        }, 50); // Небольшая задержка для полной загрузки
    }

    /**
     * Применение фильтров
     */
    applyFilters() {
        const filters = {
            id: document.getElementById('sborka-filter-id')?.value.toLowerCase() || '',
            наименование: document.getElementById('sborka-filter-наименование')?.value.toLowerCase() || '',
            ед_изм: document.getElementById('sborka-filter-ед_изм')?.value.toLowerCase() || '',
            количество: document.getElementById('sborka-filter-количество')?.value.toLowerCase() || ''
        };

        const globalSearch = document.getElementById('sborka-global-search')?.value.toLowerCase() || '';

        const rows = document.querySelectorAll('#sborka-table-body tr');

        rows.forEach(row => {
            const cells = row.cells;
            if (cells.length < 5) return; // Пропускаем строку "Нет данных"

            // Проверка фильтров колонок
            const columnMatches =
                cells[0].textContent.toLowerCase().includes(filters.id) &&
                cells[1].textContent.toLowerCase().includes(filters.наименование) &&
                cells[2].textContent.toLowerCase().includes(filters.ед_изм) &&
                cells[3].textContent.toLowerCase().includes(filters.количество);

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
        const filterIds = ['id', 'наименование', 'ед_изм', 'количество'];
        filterIds.forEach(id => {
            const element = document.getElementById(`sborka-filter-${id}`);
            if (element) element.value = '';
        });

        const globalSearch = document.getElementById('sborka-global-search');
        if (globalSearch) globalSearch.value = '';

        // Показать все строки
        const rows = document.querySelectorAll('#sborka-table-body tr');
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
            this.services.notification.success('Данные сборки обновлены');
        } catch (error) {
            Logger.error('SborkaModule: Ошибка обновления данных', error);
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

        const quantity = parseFloat(prompt('Количество:', '0')) || 0;

        this.services.database.insertData(CONFIG.TABLES.SBORKA, {
            наименование: name,
            ед_изм: unit,
            количество: quantity
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
     * Редактирование элемента (редактирует данные склада)
     */
    async editItem(id) {
        const item = this.data.find(item => item.id === id);
        if (!item) return;

        // Получаем данные из склада для редактирования
        const skladResult = await this.services.database.getData(CONFIG.TABLES.SKLAD, {
            filters: { наименование: item.наименование }
        });

        if (!skladResult.success || skladResult.data.length === 0) {
            this.services.notification.error('Товар не найден на складе');
            return;
        }

        const skladItem = skladResult.data[0];

        const name = prompt('Наименование:', skladItem.наименование);
        if (!name) return;

        const unit = prompt('Ед.изм.:', skladItem.ед_изм);
        if (!unit) return;

        const accounted = parseFloat(prompt('Числится:', skladItem.числится)) || 0;
        const inStock = parseFloat(prompt('На складе:', skladItem.на_складе)) || 0;
        const issued = parseFloat(prompt('Выдано:', skladItem.выдано)) || 0;

        // Обновляем данные на складе
        const updateResult = await this.services.database.updateData(CONFIG.TABLES.SKLAD, skladItem.id, {
            наименование: name,
            ед_изм: unit,
            числится: accounted,
            на_складе: inStock,
            выдано: issued
        });

        if (updateResult.success) {
            this.services.notification.success('Данные склада обновлены');
            this.refresh();
        } else {
            this.services.notification.error('Ошибка обновления склада: ' + updateResult.error);
        }
    }

    /**
     * Передача в сборку
     */
    async transferItem(id) {
        const item = this.data.find(item => item.id === id);
        if (!item) return;

        // Получаем данные из склада для проверки
        const skladResult = await this.services.database.getData(CONFIG.TABLES.SKLAD, {
            filters: { наименование: item.наименование }
        });

        if (!skladResult.success) {
            this.services.notification.error('Ошибка получения данных склада');
            return;
        }

        const skladItem = skladResult.data[0];
        if (!skladItem) {
            this.services.notification.warning('Товар не найден на складе');
            return;
        }

        // Показываем модальное окно с информацией
        const remaining = skladItem.на_складе - item.количество;
        const confirmed = confirm(
            `Передать в сборку:\n\n` +
            `Товар: ${item.наименование}\n` +
            `Количество: ${item.количество} ${item.ед_изм}\n` +
            `На складе: ${skladItem.на_складе}\n` +
            `Остаток после выдачи: ${remaining}\n\n` +
            `Продолжить?`
        );

        if (!confirmed) return;

        if (remaining < 0) {
            this.services.notification.error('Недостаточно товара на складе');
            return;
        }

        try {
            // Обновляем количество на складе
            await this.services.database.updateData(CONFIG.TABLES.SKLAD, skladItem.id, {
                на_складе: remaining,
                выдано: (skladItem.выдано || 0) + item.количество
            });

            // Удаляем из сборки
            await this.services.database.deleteData(CONFIG.TABLES.SBORKA, id);

            this.services.notification.success('Товар передан в сборку');
            this.refresh();

        } catch (error) {
            Logger.error('SborkaModule: Ошибка передачи в сборку', error);
            this.services.notification.error('Ошибка передачи в сборку');
        }
    }

    /**
     * Удаление элемента
     */
    deleteItem(id) {
        if (!confirm('Удалить элемент?')) return;

        this.services.database.deleteData(CONFIG.TABLES.SBORKA, id).then(result => {
            if (result.success) {
                this.services.notification.success('Элемент удален');
                this.refresh();
            } else {
                this.services.notification.error('Ошибка удаления: ' + result.error);
            }
        });
    }

    /**
     * Очистка модуля
     */
    async destroy() {
        Logger.info('SborkaModule: Очистка модуля сборки');
        this.data = [];
        this.filters = {};
    }
}