/**
 * Модуль отладки - Полная реализация согласно ТЗ
 */
import { CONFIG } from '../core/Config.js';
import { Logger } from '../core/Utils.js';

export class OtladkaModule {
    constructor(services) {
        this.services = services;
        this.logs = [];
        this.connectionStatus = 'unknown';
        this.responseTime = 0;
        this.testResults = [];
        this.stressTestRunning = false;
    }

    async load() {
        Logger.info('OtladkaModule: Загрузка модуля отладки');

        try {
            await this.initializeDebugTable();
            await this.loadMetrics();
            this.render();
            this.setupEventListeners();
            Logger.info('OtladkaModule: Модуль отладки загружен');
        } catch (error) {
            Logger.error('OtladkaModule: Ошибка загрузки модуля', error);
            this.services.notification.error('Ошибка загрузки отладки: ' + error.message);
        }
    }

    async initializeDebugTable() {
        try {
            // Проверяем существование тестовой таблицы
            const result = await this.services.database.getData('debug_test', { limit: 1 });
            if (!result.success) {
                // Создаем тестовую таблицу через вставку данных
                await this.services.database.insertData('debug_test', {
                    created_at: new Date().toISOString(),
                    test_value: 'Тестовая инициализация'
                });
                this.addLogEntry('info', 'Тестовая таблица debug_test создана', 'DB_INIT_001');
            }
        } catch (error) {
            this.addLogEntry('error', 'Ошибка создания тестовой таблицы: ' + error.message, 'DB_INIT_002');
        }
    }

    async loadMetrics() {
        try {
            const metrics = await this.services.database.getDatabaseMetrics();
            this.metrics = metrics;
        } catch (error) {
            this.metrics = {
                totalRecords: 0,
                activeTables: 0,
                lastActivity: 'Ошибка'
            };
        }
    }

    render() {
        const content = document.getElementById('otladka-content');
        if (!content) return;

        const html = `
            <div class="section-title mb-4">
                <h2 class="h4 mb-0">
                    <i class="fas fa-tools me-2"></i>
                    Инструмент отладки
                </h2>
            </div>

            <!-- Верхняя панель: Основные действия -->
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="mb-0">Основные действия</h5>
                </div>
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-3">
                            <button class="btn btn-primary w-100" onclick="window.app.getModule('otladka').testConnection()">
                                <i class="fas fa-plug me-2"></i>
                                Проверить подключение
                            </button>
                        </div>
                        <div class="col-md-3">
                            <button class="btn btn-success w-100" onclick="window.app.getModule('otladka').testWrite()">
                                <i class="fas fa-plus me-2"></i>
                                Тест записи
                            </button>
                        </div>
                        <div class="col-md-3">
                            <button class="btn btn-info w-100" onclick="window.app.getModule('otladka').testRead()">
                                <i class="fas fa-eye me-2"></i>
                                Тест чтения
                            </button>
                        </div>
                        <div class="col-md-3">
                            <button class="btn btn-warning w-100" onclick="window.app.getModule('otladka').runStressTest()">
                                <i class="fas fa-tachometer-alt me-2"></i>
                                Стресс-тест
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Средняя область: Результаты -->
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Статус подключения</h5>
                        </div>
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-2">
                                <div class="connection-status ${this.getStatusClass()}" style="width: 20px; height: 20px; border-radius: 50%; margin-right: 10px;"></div>
                                <span class="fw-bold">${this.getStatusText()}</span>
                            </div>
                            <p class="text-muted mb-0">Время отклика: ${this.responseTime}ms</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Стресс-тест</h5>
                        </div>
                        <div class="card-body">
                            <div class="row g-2">
                                <div class="col-6">
                                    <label class="form-label small">Количество запросов</label>
                                    <input type="number" id="stress-count" class="form-control form-control-sm" value="10" min="1" max="100">
                                </div>
                                <div class="col-6">
                                    <label class="form-label small">Тип запроса</label>
                                    <select id="stress-type" class="form-select form-select-sm">
                                        <option value="write">Запись</option>
                                        <option value="read">Чтение</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Метрики базы данных -->
            <div class="row mb-4">
                <div class="col-md-4">
                    <div class="card bg-primary text-white">
                        <div class="card-body text-center">
                            <h5 class="card-title">
                                <i class="fas fa-database fa-2x mb-2"></i>
                            </h5>
                            <h3 id="total-records">${this.metrics.totalRecords}</h3>
                            <p class="card-text">Всего записей</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card bg-success text-white">
                        <div class="card-body text-center">
                            <h5 class="card-title">
                                <i class="fas fa-table fa-2x mb-2"></i>
                            </h5>
                            <h3 id="active-tables">${this.metrics.activeTables}</h3>
                            <p class="card-text">Активных таблиц</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card bg-info text-white">
                        <div class="card-body text-center">
                            <h5 class="card-title">
                                <i class="fas fa-clock fa-2x mb-2"></i>
                            </h5>
                            <h3 id="last-activity">${this.metrics.lastActivity}</h3>
                            <p class="card-text">Последняя активность</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Нижняя область: Лог -->
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Система логирования</h5>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="window.app.getModule('otladka').copyLog()">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="window.app.getModule('otladka').clearLog()">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="window.app.getModule('otladka').exportLog()">
                            <i class="fas fa-file-export"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <div class="row g-2">
                            <div class="col-md-3">
                                <select id="log-filter-type" class="form-select form-select-sm">
                                    <option value="">Все типы</option>
                                    <option value="info">Информация</option>
                                    <option value="warning">Предупреждение</option>
                                    <option value="error">Ошибка</option>
                                    <option value="success">Успех</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <select id="log-filter-status" class="form-select form-select-sm">
                                    <option value="">Все статусы</option>
                                    <option value="success">Успешные</option>
                                    <option value="warning">Предупреждения</option>
                                    <option value="error">Ошибки</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <input type="text" id="log-search" class="form-control form-control-sm" placeholder="Поиск по ключевым словам...">
                            </div>
                        </div>
                    </div>
                    <div id="debug-log" class="bg-dark text-light p-3 rounded" style="height: 400px; overflow-y: auto; font-family: monospace; font-size: 12px;">
                        ${this.renderLog()}
                    </div>
                </div>
            </div>
        `;

        content.innerHTML = html;
    }

    getStatusClass() {
        switch (this.connectionStatus) {
            case 'success': return 'bg-success';
            case 'warning': return 'bg-warning';
            case 'error': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }

    getStatusText() {
        switch (this.connectionStatus) {
            case 'success': return 'Подключение успешно';
            case 'warning': return 'Подключение медленное';
            case 'error': return 'Ошибка подключения';
            default: return 'Статус неизвестен';
        }
    }

    async testConnection() {
        const startTime = Date.now();

        try {
            this.addLogEntry('info', 'Проверка подключения к Supabase...', 'DB_CONN_TEST');

            const result = await this.services.database.checkConnection();
            const endTime = Date.now();
            this.responseTime = endTime - startTime;

            if (result.success) {
                if (this.responseTime < 500) {
                    this.connectionStatus = 'success';
                    this.addLogEntry('success', `Подключение успешно. Время отклика: ${this.responseTime}ms`, 'DB_CONN_001');
                } else {
                    this.connectionStatus = 'warning';
                    this.addLogEntry('warning', `Подключение медленное. Время отклика: ${this.responseTime}ms`, 'DB_CONN_002');
                }
            } else {
                this.connectionStatus = 'error';
                this.addLogEntry('error', `Ошибка подключения: ${result.error}`, 'DB_CONN_003');
            }

            this.updateConnectionStatus();
            this.services.notification.success(`Проверка завершена за ${this.responseTime}ms`);

        } catch (error) {
            this.connectionStatus = 'error';
            this.responseTime = Date.now() - startTime;
            this.addLogEntry('error', `Критическая ошибка подключения: ${error.message}`, 'DB_CONN_004');
            this.services.notification.error('Ошибка проверки подключения');
        }
    }

    async testWrite() {
        const startTime = Date.now();

        try {
            this.addLogEntry('info', 'Выполнение тестовой записи...', 'DB_WRITE_TEST');

            const testData = {
                created_at: new Date().toISOString(),
                test_value: `Тестовая запись от ${new Date().toLocaleString('ru-RU')}`
            };

            const result = await this.services.database.insertData('debug_test', testData);
            const endTime = Date.now();
            const duration = endTime - startTime;

            if (result.success) {
                this.addLogEntry('success', `Запись успешна. ID: ${result.data?.[0]?.id || 'неизвестен'}. Время: ${duration}ms`, 'DB_WRITE_001');
                this.services.notification.success(`Запись выполнена за ${duration}ms`);
            } else {
                this.addLogEntry('error', `Ошибка записи: ${result.error}`, 'DB_WRITE_002');
                this.services.notification.error('Ошибка тестовой записи');
            }

        } catch (error) {
            const duration = Date.now() - startTime;
            this.addLogEntry('error', `Критическая ошибка записи: ${error.message}`, 'DB_WRITE_003');
            this.services.notification.error('Критическая ошибка тестовой записи');
        }
    }

    async testRead() {
        const startTime = Date.now();

        try {
            this.addLogEntry('info', 'Выполнение тестового чтения...', 'DB_READ_TEST');

            const result = await this.services.database.getData('debug_test', {
                limit: 5,
                orderBy: { column: 'created_at', ascending: false }
            });

            const endTime = Date.now();
            const duration = endTime - startTime;

            if (result.success) {
                const count = result.data?.length || 0;
                this.addLogEntry('success', `Чтение успешно. Получено ${count} записей. Время: ${duration}ms`, 'DB_READ_001');

                // Отображаем результаты в лог
                if (count > 0) {
                    result.data.forEach((item, index) => {
                        this.addLogEntry('info', `Запись ${index + 1}: ${item.test_value}`, 'DB_READ_DATA');
                    });
                }

                this.services.notification.success(`Чтение выполнено за ${duration}ms`);
            } else {
                this.addLogEntry('error', `Ошибка чтения: ${result.error}`, 'DB_READ_002');
                this.services.notification.error('Ошибка тестового чтения');
            }

        } catch (error) {
            const duration = Date.now() - startTime;
            this.addLogEntry('error', `Критическая ошибка чтения: ${error.message}`, 'DB_READ_003');
            this.services.notification.error('Критическая ошибка тестового чтения');
        }
    }

    async runStressTest() {
        if (this.stressTestRunning) {
            this.services.notification.warning('Стресс-тест уже выполняется');
            return;
        }

        const count = parseInt(document.getElementById('stress-count')?.value) || 10;
        const type = document.getElementById('stress-type')?.value || 'write';

        this.stressTestRunning = true;
        this.addLogEntry('info', `Запуск стресс-теста: ${count} запросов типа "${type}"`, 'STRESS_START');

        const startTime = Date.now();
        let successCount = 0;
        let errorCount = 0;
        const responseTimes = [];

        try {
            for (let i = 0; i < count; i++) {
                const requestStart = Date.now();

                try {
                    if (type === 'write') {
                        const testData = {
                            created_at: new Date().toISOString(),
                            test_value: `Стресс-тест ${i + 1} от ${new Date().toLocaleString('ru-RU')}`
                        };
                        await this.services.database.insertData('debug_test', testData);
                    } else {
                        await this.services.database.getData('debug_test', { limit: 1 });
                    }

                    const requestEnd = Date.now();
                    responseTimes.push(requestEnd - requestStart);
                    successCount++;

                } catch (error) {
                    errorCount++;
                    this.addLogEntry('error', `Запрос ${i + 1} failed: ${error.message}`, 'STRESS_ERROR');
                }

                // Небольшая задержка между запросами
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            const endTime = Date.now();
            const totalTime = endTime - startTime;
            const avgTime = responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0;

            this.addLogEntry('success',
                `Стресс-тест завершен. Общее время: ${totalTime}ms, Среднее: ${avgTime}ms, Успешных: ${successCount}, Ошибок: ${errorCount}`,
                'STRESS_COMPLETE'
            );

            this.services.notification.success(`Стресс-тест завершен: ${successCount}/${count} успешных`);

        } catch (error) {
            this.addLogEntry('error', `Критическая ошибка стресс-теста: ${error.message}`, 'STRESS_CRITICAL');
            this.services.notification.error('Критическая ошибка стресс-теста');
        } finally {
            this.stressTestRunning = false;
        }
    }

    addLogEntry(type, message, code = null) {
        const logEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            time: new Date().toLocaleString('ru-RU'),
            type: type,
            message: message,
            code: code,
            duration: null
        };

        this.logs.unshift(logEntry); // Добавляем в начало для показа последних

        // Ограничиваем до 100 записей
        if (this.logs.length > 100) {
            this.logs = this.logs.slice(0, 100);
        }

        this.updateLogDisplay();
    }

    renderLog() {
        if (this.logs.length === 0) {
            return '<div class="text-muted">Лог пуст</div>';
        }

        const filteredLogs = this.filterLogs();

        return filteredLogs.map(log => {
            const typeClass = this.getLogTypeClass(log.type);
            const codeInfo = log.code ? this.getErrorCodeInfo(log.code) : '';

            return `
                <div class="log-entry ${typeClass} mb-1 p-1 rounded" style="border-left: 3px solid ${this.getLogColor(log.type)};">
                    <div class="d-flex justify-content-between align-items-start">
                        <small class="text-muted">${log.time}</small>
                        <small class="badge ${this.getBadgeClass(log.type)}">${log.type.toUpperCase()}</small>
                    </div>
                    <div class="log-message">${log.message}</div>
                    ${codeInfo ? `<div class="text-muted small mt-1">${codeInfo}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    filterLogs() {
        const typeFilter = document.getElementById('log-filter-type')?.value || '';
        const statusFilter = document.getElementById('log-filter-status')?.value || '';
        const searchFilter = document.getElementById('log-search')?.value?.toLowerCase() || '';

        return this.logs.filter(log => {
            if (typeFilter && log.type !== typeFilter) return false;
            if (statusFilter && !this.matchesStatus(log.type, statusFilter)) return false;
            if (searchFilter && !log.message.toLowerCase().includes(searchFilter)) return false;
            return true;
        });
    }

    matchesStatus(type, statusFilter) {
        switch (statusFilter) {
            case 'success': return type === 'success';
            case 'warning': return type === 'warning';
            case 'error': return type === 'error';
            default: return true;
        }
    }

    getLogTypeClass(type) {
        switch (type) {
            case 'error': return 'text-danger';
            case 'warning': return 'text-warning';
            case 'success': return 'text-success';
            case 'info': return 'text-info';
            default: return 'text-muted';
        }
    }

    getLogColor(type) {
        switch (type) {
            case 'error': return '#dc3545';
            case 'warning': return '#ffc107';
            case 'success': return '#198754';
            case 'info': return '#0dcaf0';
            default: return '#6c757d';
        }
    }

    getBadgeClass(type) {
        switch (type) {
            case 'error': return 'bg-danger';
            case 'warning': return 'bg-warning';
            case 'success': return 'bg-success';
            case 'info': return 'bg-info';
            default: return 'bg-secondary';
        }
    }

    getErrorCodeInfo(code) {
        const errorCodes = {
            'DB_CONN_001': 'Подключение к базе данных успешно установлено',
            'DB_CONN_002': 'Подключение установлено, но время отклика велико',
            'DB_CONN_003': 'Ошибка подключения к базе данных',
            'DB_CONN_004': 'Критическая ошибка подключения',
            'DB_INIT_001': 'Тестовая таблица успешно создана',
            'DB_INIT_002': 'Ошибка создания тестовой таблицы',
            'DB_WRITE_001': 'Запись в базу данных выполнена успешно',
            'DB_WRITE_002': 'Ошибка выполнения записи',
            'DB_WRITE_003': 'Критическая ошибка записи',
            'DB_READ_001': 'Чтение из базы данных выполнено успешно',
            'DB_READ_002': 'Ошибка выполнения чтения',
            'DB_READ_003': 'Критическая ошибка чтения',
            'STRESS_START': 'Начало выполнения стресс-теста',
            'STRESS_COMPLETE': 'Стресс-тест выполнен успешно',
            'STRESS_ERROR': 'Ошибка выполнения запроса в стресс-тесте',
            'STRESS_CRITICAL': 'Критическая ошибка стресс-теста'
        };

        return errorCodes[code] || '';
    }

    setupEventListeners() {
        // Обработчики фильтров лога
        document.getElementById('log-filter-type')?.addEventListener('change', () => this.updateLogDisplay());
        document.getElementById('log-filter-status')?.addEventListener('change', () => this.updateLogDisplay());
        document.getElementById('log-search')?.addEventListener('input', () => this.updateLogDisplay());
    }

    updateConnectionStatus() {
        const statusElement = document.querySelector('.connection-status');
        if (statusElement) {
            statusElement.className = `connection-status ${this.getStatusClass()}`;
        }

        const statusText = document.querySelector('.connection-status').nextElementSibling;
        if (statusText) {
            statusText.textContent = this.getStatusText();
        }

        const responseTimeElement = document.querySelector('.connection-status').parentElement.nextElementSibling;
        if (responseTimeElement) {
            responseTimeElement.textContent = `Время отклика: ${this.responseTime}ms`;
        }
    }

    updateLogDisplay() {
        const logContainer = document.getElementById('debug-log');
        if (logContainer) {
            logContainer.innerHTML = this.renderLog();
        }
    }

    copyLog() {
        const filteredLogs = this.filterLogs();
        const logText = filteredLogs.map(log =>
            `${log.time} [${log.type.toUpperCase()}] ${log.message}${log.code ? ` (${log.code})` : ''}`
        ).join('\n');

        navigator.clipboard.writeText(logText).then(() => {
            this.services.notification.success('Лог скопирован в буфер обмена');
        }).catch(() => {
            this.services.notification.error('Ошибка копирования лога');
        });
    }

    clearLog() {
        this.logs = [];
        this.updateLogDisplay();
        this.services.notification.success('Лог очищен');
    }

    exportLog() {
        const filteredLogs = this.filterLogs();
        const logText = filteredLogs.map(log =>
            `${log.time} [${log.type.toUpperCase()}] ${log.message}${log.code ? ` (${log.code})` : ''}`
        ).join('\n');

        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `debug_log_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.services.notification.success('Лог экспортирован');
    }

    async destroy() {
        Logger.info('OtladkaModule: Очистка модуля отладки');
        this.logs = [];
    }
}