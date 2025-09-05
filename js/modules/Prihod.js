/**
 * Модуль прихода
 */
import { CONFIG } from '../core/Config.js';
import { Logger, debounce } from '../core/Utils.js';

export class PrihodModule {
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
        Logger.info('PrihodModule: Загрузка модуля прихода');

        try {
            // Загружаем данные
            await this.loadData();

            // Рендерим интерфейс
            this.render();

            // Настраиваем обработчики событий
            this.setupEventListeners();

            Logger.info('PrihodModule: Модуль прихода загружен');

        } catch (error) {
            Logger.error('PrihodModule: Ошибка загрузки модуля', error);
            this.services.notification.error('Ошибка загрузки прихода: ' + error.message);
        }
    }

    /**
     * Загрузка данных прихода
     */
    async loadData() {
        const result = await this.services.database.getData(CONFIG.TABLES.PRIHOD);

        if (result.success) {
            this.data = result.data;
            Logger.info(`PrihodModule: Загружено ${this.data.length} записей прихода`);
        } else {
            throw new Error(result.error);
        }
    }

    /**
     * Рендеринг интерфейса
     */
    render() {
        const content = document.getElementById('prihod-content');

        if (!content) {
            Logger.error('PrihodModule: Контейнер prihod-content не найден');
            return;
        }

        const html = `
            <div class="section-title mb-4">
                <h2 class="h4 mb-0">
                    <i class="fas fa-truck me-2"></i>
                    Приход
                </h2>
            </div>

            <!-- Секция 1: Принятие прихода -->
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="mb-0">Принятие прихода</h5>
                </div>
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <button class="btn btn-outline-primary w-100" onclick="window.app.getModule('prihod').pasteFromClipboard()">
                                <i class="fas fa-paste me-2"></i>
                                Вставить из буфера обмена
                            </button>
                        </div>
                        <div class="col-md-4">
                            <button class="btn btn-outline-success w-100" onclick="window.app.getModule('prihod').importFromExcel()">
                                <i class="fas fa-file-excel me-2"></i>
                                Импорт из xlsx
                            </button>
                        </div>
                        <div class="col-md-4">
                            <button class="btn btn-outline-secondary w-100" onclick="window.app.getModule('prihod').addRow()">
                                <i class="fas fa-plus me-2"></i>
                                Добавить строку
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Секция 2: Документы прихода -->
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="mb-0">Документы прихода</h5>
                </div>
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label">Реестровый номер заявки</label>
                            <div class="input-group">
                                <input type="text" id="prihod-registry-number" class="form-control" placeholder="Введите номер">
                                <button class="btn btn-outline-primary" onclick="window.app.getModule('prihod').applyRegistryNumber()">
                                    Применить
                                </button>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">УПД</label>
                            <div class="input-group">
                                <input type="text" id="prihod-upd" class="form-control" placeholder="Введите УПД">
                                <button class="btn btn-outline-primary" onclick="window.app.getModule('prihod').applyUPD()">
                                    Применить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Секция 3: Редактирование -->
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="mb-0">Редактирование</h5>
                </div>
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <button class="btn btn-warning w-100" onclick="window.app.getModule('prihod').clearPrihod()">
                                <i class="fas fa-trash me-2"></i>
                                Очистить приход
                            </button>
                        </div>
                        <div class="col-md-4">
                            <button class="btn btn-info w-100" onclick="window.app.getModule('prihod').exportToExcel()">
                                <i class="fas fa-file-excel me-2"></i>
                                Экспорт в xlsx
                            </button>
                        </div>
                        <div class="col-md-4">
                            <button class="btn btn-success w-100" onclick="window.app.getModule('prihod').acceptPrihod()">
                                <i class="fas fa-check me-2"></i>
                                Принять
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Заголовок таблицы -->
            <div class="table-fixed-header-container">
                <div class="table-header-fixed">
                    <table class="table table-striped table-hover mb-0">
                        <thead style="background-color: #f8f9fa; height: 45px;">
                            <tr>
                                <th style="font-weight: bold; vertical-align: middle;">Дата</th>
                                <th style="font-weight: bold; vertical-align: middle;">Наименование</th>
                                <th style="font-weight: bold; vertical-align: middle;">Ед.изм.</th>
                                <th style="font-weight: bold; vertical-align: middle;">Количество</th>
                                <th style="font-weight: bold; vertical-align: middle;">Реестровый номер</th>
                                <th style="font-weight: bold; vertical-align: middle;">УПД</th>
                                <th style="font-weight: bold; vertical-align: middle;">Действия</th>
                            </tr>
                        </thead>
                    </table>
                </div>

                <div class="table-body-scroll">
                    <table class="table table-striped table-hover mb-0">
                        <tbody id="prihod-table-body">
                            ${this.renderTableRows()}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Hidden file input for Excel import -->
            <input type="file" id="excel-file-input" accept=".xlsx,.xls" style="display: none;">
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
                <td style="vertical-align: middle;">${item.дата ? new Date(item.дата).toLocaleDateString('ru-RU') : new Date().toLocaleDateString('ru-RU')}</td>
                <td style="vertical-align: middle;">${item.наименование || ''}</td>
                <td style="vertical-align: middle;">${item.ед_изм || ''}</td>
                <td style="vertical-align: middle;">${item.количество || 0}</td>
                <td style="vertical-align: middle;">${item.реестровый_номер || ''}</td>
                <td style="vertical-align: middle;">${item.упд || ''}</td>
                <td style="vertical-align: middle;">
                    <div class="btn-group" role="group">
                        <button class="btn btn-square btn-outline-danger btn-sm"
                                onclick="window.app.getModule('prihod').deleteRow(${item.id})"
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
        // File input for Excel import
        const fileInput = document.getElementById('excel-file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleExcelFile(e));
        }
    }

    /**
     * Вставить из буфера обмена
     */
    async pasteFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            const rows = this.parseClipboardData(text);

            if (rows.length === 0) {
                this.services.notification.warning('Не удалось распознать данные в буфере обмена');
                return;
            }

            // Добавляем строки в базу данных
            for (const row of rows) {
                await this.services.database.insertData(CONFIG.TABLES.PRIHOD, {
                    дата: new Date().toISOString(),
                    наименование: row.name,
                    ед_изм: row.unit,
                    количество: row.quantity
                });
            }

            this.services.notification.success(`Добавлено ${rows.length} строк из буфера обмена`);
            this.refresh();

        } catch (error) {
            Logger.error('PrihodModule: Ошибка вставки из буфера', error);
            this.services.notification.error('Ошибка вставки из буфера обмена');
        }
    }

    /**
     * Парсинг данных из буфера обмена
     */
    parseClipboardData(text) {
        const rows = [];
        const lines = text.split('\n');

        for (const line of lines) {
            const parts = line.split('\t');
            if (parts.length >= 3) {
                rows.push({
                    name: parts[0].trim(),
                    unit: parts[1].trim(),
                    quantity: parseFloat(parts[2]) || 0
                });
            }
        }

        return rows;
    }

    /**
     * Импорт из Excel
     */
    importFromExcel() {
        const fileInput = document.getElementById('excel-file-input');
        if (fileInput) {
            fileInput.click();
        }
    }

    /**
     * Обработка Excel файла
     */
    async handleExcelFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const data = await this.readExcelFile(file);
            const rows = this.parseExcelData(data);

            // Добавляем строки в базу данных
            for (const row of rows) {
                await this.services.database.insertData(CONFIG.TABLES.PRIHOD, {
                    дата: new Date().toISOString(),
                    наименование: row.name,
                    ед_изм: row.unit,
                    количество: row.quantity
                });
            }

            this.services.notification.success(`Импортировано ${rows.length} строк из Excel`);
            this.refresh();

        } catch (error) {
            Logger.error('PrihodModule: Ошибка импорта Excel', error);
            this.services.notification.error('Ошибка импорта из Excel');
        }

        // Очищаем input
        event.target.value = '';
    }

    /**
     * Чтение Excel файла
     */
    async readExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                resolve(jsonData);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * Парсинг данных Excel
     */
    parseExcelData(data) {
        const rows = [];

        // Пропускаем заголовок, начинаем с первой строки данных
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (row.length >= 3) {
                rows.push({
                    name: row[0]?.toString().trim() || '',
                    unit: row[1]?.toString().trim() || '',
                    quantity: parseFloat(row[2]) || 0
                });
            }
        }

        return rows;
    }

    /**
     * Добавить строку
     */
    addRow() {
        const name = prompt('Наименование:');
        if (!name) return;

        const unit = prompt('Ед.изм.:');
        if (!unit) return;

        const quantity = parseFloat(prompt('Количество:', '0')) || 0;

        this.services.database.insertData(CONFIG.TABLES.PRIHOD, {
            дата: new Date().toISOString(),
            наименование: name,
            ед_изм: unit,
            количество: quantity
        }).then(result => {
            if (result.success) {
                this.services.notification.success('Строка добавлена');
                this.refresh();
            } else {
                this.services.notification.error('Ошибка добавления: ' + result.error);
            }
        });
    }

    /**
     * Применить реестровый номер
     */
    applyRegistryNumber() {
        const registryNumber = document.getElementById('prihod-registry-number')?.value;
        if (!registryNumber) {
            this.services.notification.warning('Введите реестровый номер');
            return;
        }

        // Обновляем все строки с заполненным наименованием
        const updates = this.data
            .filter(item => item.наименование)
            .map(item => this.services.database.updateData(CONFIG.TABLES.PRIHOD, item.id, {
                реестровый_номер: registryNumber
            }));

        Promise.all(updates).then(() => {
            this.services.notification.success('Реестровый номер применен');
            this.refresh();
        }).catch(error => {
            Logger.error('PrihodModule: Ошибка применения реестрового номера', error);
            this.services.notification.error('Ошибка применения реестрового номера');
        });
    }

    /**
     * Применить УПД
     */
    applyUPD() {
        const upd = document.getElementById('prihod-upd')?.value;
        if (!upd) {
            this.services.notification.warning('Введите УПД');
            return;
        }

        // Обновляем все строки с заполненным наименованием
        const updates = this.data
            .filter(item => item.наименование)
            .map(item => this.services.database.updateData(CONFIG.TABLES.PRIHOD, item.id, {
                упд: upd
            }));

        Promise.all(updates).then(() => {
            this.services.notification.success('УПД применен');
            this.refresh();
        }).catch(error => {
            Logger.error('PrihodModule: Ошибка применения УПД', error);
            this.services.notification.error('Ошибка применения УПД');
        });
    }

    /**
     * Принять приход
     */
    async acceptPrihod() {
        if (this.data.length === 0) {
            this.services.notification.warning('Нет данных для принятия');
            return;
        }

        try {
            for (const item of this.data) {
                if (!item.наименование || !item.количество) continue;

                // Проверяем, существует ли товар на складе
                const skladResult = await this.services.database.getData(CONFIG.TABLES.SKLAD, {
                    filters: { наименование: item.наименование }
                });

                if (skladResult.success && skladResult.data.length > 0) {
                    // Обновляем существующий товар
                    const existing = skladResult.data[0];
                    await this.services.database.updateData(CONFIG.TABLES.SKLAD, existing.id, {
                        числится: (existing.числится || 0) + item.количество,
                        на_складе: (existing.на_складе || 0) + item.количество
                    });
                } else {
                    // Создаем новый товар
                    await this.services.database.insertData(CONFIG.TABLES.SKLAD, {
                        наименование: item.наименование,
                        ед_изм: item.ед_изм,
                        числится: item.количество,
                        на_складе: item.количество,
                        выдано: 0
                    });
                }

                // Записываем в таблицу операций
                await this.services.database.insertData(CONFIG.TABLES.OPERATSII, {
                    тип_операции: 'Принятый приход',
                    детали: JSON.stringify({
                        наименование: item.наименование,
                        количество: item.количество,
                        реестровый_номер: item.реестровый_номер,
                        упд: item.упд,
                        дата: new Date().toISOString()
                    })
                });
            }

            // Очищаем таблицу прихода
            await this.clearPrihodData();

            this.services.notification.success('Приход принят успешно');
            this.refresh();

        } catch (error) {
            Logger.error('PrihodModule: Ошибка принятия прихода', error);
            this.services.notification.error('Ошибка принятия прихода');
        }
    }

    /**
     * Очистить приход
     */
    async clearPrihod() {
        if (!confirm('Очистить все данные прихода?')) return;

        await this.clearPrihodData();
        this.services.notification.success('Приход очищен');
        this.refresh();
    }

    /**
     * Очистка данных прихода
     */
    async clearPrihodData() {
        for (const item of this.data) {
            await this.services.database.deleteData(CONFIG.TABLES.PRIHOD, item.id);
        }
        this.data = [];
    }

    /**
     * Экспорт в Excel
     */
    exportToExcel() {
        if (this.data.length === 0) {
            this.services.notification.warning('Нет данных для экспорта');
            return;
        }

        const filename = `Приход_${new Date().toISOString().split('T')[0]}.xlsx`;

        // Подготавливаем данные для экспорта
        const exportData = this.data.map(item => ({
            'Дата': item.дата ? new Date(item.дата).toLocaleDateString('ru-RU') : '',
            'Наименование': item.наименование || '',
            'Ед.изм.': item.ед_изм || '',
            'Количество': item.количество || 0,
            'Реестровый номер': item.реестровый_номер || '',
            'УПД': item.упд || ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Приход');
        XLSX.writeFile(workbook, filename);

        this.services.notification.success('Данные экспортированы в Excel');
    }

    /**
     * Удалить строку
     */
    deleteRow(id) {
        if (!confirm('Удалить строку?')) return;

        this.services.database.deleteData(CONFIG.TABLES.PRIHOD, id).then(result => {
            if (result.success) {
                this.services.notification.success('Строка удалена');
                this.refresh();
            } else {
                this.services.notification.error('Ошибка удаления: ' + result.error);
            }
        });
    }

    /**
     * Обновление данных
     */
    async refresh() {
        try {
            await this.loadData();
            this.render();
            this.services.notification.success('Данные прихода обновлены');
        } catch (error) {
            Logger.error('PrihodModule: Ошибка обновления данных', error);
            this.services.notification.error('Ошибка обновления данных');
        }
    }

    /**
     * Очистка модуля
     */
    async destroy() {
        Logger.info('PrihodModule: Очистка модуля прихода');
        this.data = [];
        this.filters = {};
    }
}