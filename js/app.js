// Supabase configuration
const SUPABASE_URL = 'https://tqwagbbppfklqgmyyrwj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxd2FnYmJwcGZrbHFnbXl5cndqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mjk2MjAsImV4cCI6MjA3MTEwNTYyMH0.C4d6-aNDisajHcg7lurnRHdbk-pe3AvE4AIaW_e53eE';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global variables
let currentSection = 'sklad';

// Debounce function for real-time filtering
function debounce(func, wait) {
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

// Navigation
document.querySelectorAll('#sidebar a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = e.target.closest('a').getAttribute('href').substring(1);
        showSection(sectionId);
    });
});

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    currentSection = sectionId;
    loadSectionData(sectionId);
}

// Clock and date
function updateDateTime() {
    const now = new Date();
    const datetime = now.toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('datetime').textContent = datetime;
}

setInterval(updateDateTime, 1000);
updateDateTime();

// Theme management
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
}

loadTheme();

// Load data for each section
async function loadSectionData(sectionId) {
    try {
        switch(sectionId) {
            case 'sklad':
                await loadSklad();
                break;
            case 'sborka':
                await loadSborka();
                break;
            case 'prihod':
                await loadPrihod();
                break;
            case 'vydannoe':
                await loadVydannoe();
                break;
            case 'kontragenty':
                await loadKontragenty();
                break;
            case 'nastroyki':
                await loadNastroyki();
                break;
            case 'uvedomleniya':
                await loadUvedomleniya();
                break;
            case 'otladka':
                await loadOtladka();
                break;
        }
    } catch (error) {
        console.error('Error loading section:', error);
        showError(sectionId, error.message);
    }
}

function showError(sectionId, message) {
    const content = document.getElementById(`${sectionId}-content`);
    content.innerHTML = `
        <div class="alert alert-danger" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Ошибка загрузки данных: ${message}
        </div>
    `;
}

// Load Sklad data
async function loadSklad() {
    const content = document.getElementById('sklad-content');
    content.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div><p>Загрузка данных склада...</p></div>';

    try {
        const { data, error } = await supabase.from('склад').select('*');
        if (error) throw error;
        renderSkladTable(data || []);
    } catch (error) {
        showError('sklad', error.message);
    }
}

async function loadSborka() {
    const content = document.getElementById('sborka-content');
    content.innerHTML = '<p>Загрузка данных сборки...</p>';
    try {
        const { data, error } = await supabase.from('сборка').select('*');
        if (error) throw error;
        renderSborkaTable(data);
    } catch (error) {
        content.innerHTML = '<p>Ошибка загрузки: ' + error.message + '</p>';
    }
}

async function loadPrihod() {
    const content = document.getElementById('prihod-content');
    content.innerHTML = '<p>Загрузка данных прихода...</p>';
    try {
        const { data, error } = await supabase.from('приход').select('*');
        if (error) throw error;
        renderPrihodTable(data);
    } catch (error) {
        content.innerHTML = '<p>Ошибка загрузки: ' + error.message + '</p>';
    }
}

async function loadVydannoe() {
    const content = document.getElementById('vydannoe-content');
    content.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div><p>Загрузка данных выданного...</p></div>';

    try {
        const { data, error } = await supabase.from('выданное').select('*');
        if (error) throw error;

        // Получить списки контрагентов и ответственных для выпадающих списков
        const { data: kontragenty, error: kontrError } = await supabase.from('контрагенты').select('*');
        if (kontrError) throw kontrError;

        const { data: persons, error: personsError } = await supabase.from('ответственные_лица').select('*');
        if (personsError) throw personsError;

        renderVydannoeTable(data || [], kontragenty || [], persons || []);
    } catch (error) {
        showError('vydannoe', error.message);
    }
}

async function loadKontragenty() {
    const content = document.getElementById('kontragenty-content');
    content.innerHTML = '<p>Загрузка данных контрагентов...</p>';
    try {
        const { data: kontragenty, error: error1 } = await supabase.from('контрагенты').select('*');
        if (error1) throw error1;
        const { data: persons, error: error2 } = await supabase.from('ответственные_лица').select('*');
        if (error2) throw error2;
        renderKontragenty(kontragenty, persons);
    } catch (error) {
        content.innerHTML = '<p>Ошибка загрузки: ' + error.message + '</p>';
    }
}

async function loadNastroyki() {
    const content = document.getElementById('nastroyki-content');
    content.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div><p>Загрузка настроек...</p></div>';

    try {
        const { data, error } = await supabase.from('настройки').select('*').limit(1);
        if (error) throw error;
        renderNastroyki(data[0] || { тема: 'light' });
    } catch (error) {
        showError('nastroyki', error.message);
    }
}

async function loadUvedomleniya() {
    const content = document.getElementById('uvedomleniya-content');
    content.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div><p>Загрузка уведомлений...</p></div>';

    try {
        const { data, error } = await supabase.from('уведомления').select('*').order('дата', { ascending: false });
        if (error) throw error;
        renderUvedomleniya(data || []);
    } catch (error) {
        showError('uvedomleniya', error.message);
    }
}

async function loadOtladka() {
    const content = document.getElementById('otladka-content');

    const html = `
        <!-- Main Action Panel -->
        <div class="debug-main-panel mb-4">
            <div class="action-panel">
                <div class="action-group">
                    <button class="btn btn-success btn-main-action" onclick="checkConnection()">
                        <i class="fas fa-plug"></i>
                        <span>Проверить подключение</span>
                    </button>
                    <button class="btn btn-primary btn-main-action" onclick="testWrite()">
                        <i class="fas fa-plus"></i>
                        <span>Тест записи</span>
                    </button>
                    <button class="btn btn-info btn-main-action" onclick="testRead()">
                        <i class="fas fa-search"></i>
                        <span>Тест чтения</span>
                    </button>
                    <button class="btn btn-warning btn-main-action" onclick="runStressTest()">
                        <i class="fas fa-tachometer-alt"></i>
                        <span>Стресс-тест</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Connection Status -->
        <div class="debug-section mb-4">
            <div class="section-header">
                <i class="fas fa-signal"></i>
                <h5>Статус подключения</h5>
            </div>
            <div class="section-content">
                <div id="connection-status-panel" class="connection-status-panel">
                    <div class="status-indicator">
                        <div class="status-light" id="status-light"></div>
                        <div class="status-text">
                            <span id="status-text">Не проверено</span>
                        </div>
                    </div>
                    <div class="status-details">
                        <div class="detail-row">
                            <span class="detail-label">Время отклика:</span>
                            <span class="detail-value" id="response-time">-</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Последняя проверка:</span>
                            <span class="detail-value" id="last-check">-</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Test Results -->
        <div class="debug-section mb-4">
            <div class="section-header">
                <i class="fas fa-flask"></i>
                <h5>Результаты тестирования</h5>
            </div>
            <div class="section-content">
                <div id="test-results-panel" class="test-results-panel">
                    <div class="no-results">
                        <i class="fas fa-info-circle"></i>
                        <p>Выполните тест для просмотра результатов</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Stress Test Settings -->
        <div class="debug-section mb-4">
            <div class="section-header">
                <i class="fas fa-sliders-h"></i>
                <h5>Настройки стресс-теста</h5>
            </div>
            <div class="section-content">
                <div class="stress-test-settings">
                    <div class="setting-row">
                        <label for="stress-requests" class="setting-label">Количество запросов:</label>
                        <input type="number" id="stress-requests" class="form-control setting-input" value="10" min="1" max="100">
                    </div>
                    <div class="setting-row">
                        <label for="stress-type" class="setting-label">Тип запроса:</label>
                        <select id="stress-type" class="form-select setting-input">
                            <option value="write">Запись</option>
                            <option value="read">Чтение</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <!-- Activity Log -->
        <div class="debug-section">
            <div class="section-header">
                <i class="fas fa-list"></i>
                <h5>Журнал операций</h5>
                <div class="header-actions">
                    <small class="text-muted" id="log-count">0 записей</small>
                </div>
            </div>
            <div class="section-content">
                <!-- Log Filters -->
                <div class="log-filters mb-3">
                    <div class="filter-group">
                        <select id="log-type-filter" class="form-select form-select-sm">
                            <option value="">Все типы</option>
                            <option value="connection">Подключение</option>
                            <option value="write">Запись</option>
                            <option value="read">Чтение</option>
                            <option value="stress">Стресс-тест</option>
                            <option value="error">Ошибка</option>
                        </select>
                        <select id="log-status-filter" class="form-select form-select-sm">
                            <option value="">Все статусы</option>
                            <option value="success">Успех</option>
                            <option value="warning">Предупреждение</option>
                            <option value="error">Ошибка</option>
                        </select>
                        <input type="text" id="log-search" class="form-control form-control-sm" placeholder="Поиск...">
                        <button class="btn btn-outline-secondary btn-sm" onclick="clearLogFilters()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <!-- Log Table -->
                <div class="log-table-container">
                    <table class="table table-sm log-table" id="log-table">
                        <thead>
                            <tr>
                                <th>Время</th>
                                <th>Тип</th>
                                <th>Статус</th>
                                <th>Описание</th>
                                <th>Время (мс)</th>
                            </tr>
                        </thead>
                        <tbody id="log-table-body">
                            <tr>
                                <td colspan="5" class="text-center text-muted">
                                    <i class="fas fa-info-circle me-2"></i>Журнал пуст
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Log Actions -->
                <div class="log-actions mt-3">
                    <div class="row g-2">
                        <div class="col-6">
                            <button class="btn btn-outline-primary w-100" onclick="copyLog()">
                                <i class="fas fa-copy me-1"></i>Копировать лог
                            </button>
                        </div>
                        <div class="col-6">
                            <button class="btn btn-outline-danger w-100" onclick="clearLog()">
                                <i class="fas fa-trash me-1"></i>Очистить лог
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    content.innerHTML = html;

    // Initialize debug system
    initializeDebugSystem();

    // Load initial metrics
    loadDebugMetrics();
}


async function loadDebugMetrics() {
    try {
        // Get total records count
        const tables = ['склад', 'сборка', 'приход', 'выданное', 'контрагенты', 'уведомления'];
        let totalRecords = 0;
        let activeTables = 0;

        for (const table of tables) {
            try {
                const { count, error } = await supabase
                    .from(table)
                    .select('*', { count: 'exact', head: true });

                if (!error) {
                    totalRecords += count || 0;
                    activeTables++;
                }
            } catch (e) {
                // Table might not exist
            }
        }

        document.getElementById('total-records').textContent = totalRecords;
        document.getElementById('active-tables').textContent = activeTables;
        document.getElementById('last-activity').textContent = new Date().toLocaleTimeString('ru-RU');

    } catch (error) {
        console.error('Error loading debug metrics:', error);
    }
}

async function testConnectionAdvanced() {
    const status = document.getElementById('connection-status');
    const startTime = Date.now();

    status.innerHTML = `
        <div class="alert alert-info">
            <i class="fas fa-spinner fa-spin me-2"></i>Выполняется расширенное тестирование...
        </div>
    `;

    try {
        // Test basic connection
        const { data: basicData, error: basicError } = await supabase.from('склад').select('count', { count: 'exact' }).limit(1);
        if (basicError) throw basicError;

        // Test write operation (if table is empty)
        const testRecord = { наименование: 'Тестовый товар', ед_изм: 'шт', числится: 0, на_складе: 0, выдано: 0 };
        const { error: insertError } = await supabase.from('склад').insert(testRecord);
        let writeTest = 'Успешно';
        if (insertError) {
            writeTest = `Ошибка: ${insertError.message}`;
        } else {
            // Clean up test record
            await supabase.from('склад').delete().eq('наименование', 'Тестовый товар');
        }

        const responseTime = Date.now() - startTime;

        status.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle me-2"></i>Расширенное тестирование завершено!
                <br><small>Время ответа: ${responseTime}ms</small>
                <br><small>Чтение: Успешно</small>
                <br><small>Запись: ${writeTest}</small>
            </div>
        `;

        document.getElementById('db-response-time').textContent = responseTime;
        document.getElementById('db-status').className = 'badge bg-success';
        document.getElementById('db-status').textContent = 'Подключено';
        document.getElementById('last-test-time').textContent = new Date().toLocaleTimeString('ru-RU');

        logMessage(`✅ Расширенное тестирование: ${responseTime}ms`);
        logMessage(`📊 Чтение: Успешно, Запись: ${writeTest}`);

    } catch (error) {
        const responseTime = Date.now() - startTime;

        status.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>Ошибка расширенного тестирования!
                <br><small>Код ошибки: ${error.code || 'Неизвестен'}</small>
                <br><small>Время ответа: ${responseTime}ms</small>
                <br><small>Сообщение: ${error.message}</small>
            </div>
        `;

        document.getElementById('db-status').className = 'badge bg-danger';
        document.getElementById('db-status').textContent = 'Ошибка';

        logMessage(`❌ Расширенное тестирование (${responseTime}ms)`);
        logMessage(`🔍 Код ошибки: ${error.code || 'Неизвестен'}`);
        logMessage(`📝 Сообщение: ${error.message}`);
    }
}

async function analyzeTable() {
    const table = document.getElementById('table-select').value;
    const resultDiv = document.getElementById('table-test-result');

    resultDiv.innerHTML = `
        <div class="alert alert-info">
            <i class="fas fa-spinner fa-spin me-2"></i>Анализ таблицы ${table}...
        </div>
    `;

    try {
        const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact' });

        if (error) throw error;

        let analysis = `
            <div class="alert alert-info">
                <h6>Анализ таблицы "${table}"</h6>
                <p><strong>Всего записей:</strong> ${count}</p>
        `;

        if (data && data.length > 0) {
            // Analyze data types and ranges
            const sample = data[0];
            analysis += `<p><strong>Колонки:</strong> ${Object.keys(sample).join(', ')}</p>`;

            // Basic statistics for numeric fields
            const numericFields = Object.keys(sample).filter(key =>
                typeof sample[key] === 'number' && !isNaN(sample[key])
            );

            if (numericFields.length > 0) {
                analysis += `<p><strong>Числовые поля:</strong> ${numericFields.join(', ')}</p>`;
            }
        }

        analysis += `</div>`;

        resultDiv.innerHTML = analysis;

        logMessage(`📊 Анализ таблицы ${table}: ${count} записей`);

    } catch (error) {
        resultDiv.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>Ошибка анализа таблицы ${table}
                <br><small>Сообщение: ${error.message}</small>
            </div>
        `;

        logMessage(`❌ Ошибка анализа таблицы ${table}: ${error.message}`);
    }
}

async function clearAllData() {
    if (!confirm('ВНИМАНИЕ! Это действие удалит ВСЕ данные из ВСЕХ таблиц. Продолжить?')) return;

    const tables = ['склад', 'сборка', 'приход', 'выданное', 'контрагенты', 'ответственные_лица', 'уведомления', 'операции'];
    let cleared = 0;

    for (const table of tables) {
        try {
            const { error } = await supabase.from(table).delete().neq('id', 0);
            if (!error) {
                cleared++;
                logMessage(`🗑️ Очищена таблица: ${table}`);
            }
        } catch (error) {
            logMessage(`❌ Ошибка очистки таблицы ${table}: ${error.message}`);
        }
    }

    showNotification(`Очищено ${cleared} из ${tables.length} таблиц`, cleared === tables.length ? 'success' : 'warning');
    loadDebugMetrics();
}

async function resetSettings() {
    if (!confirm('Сбросить все настройки к значениям по умолчанию?')) return;

    try {
        const { error } = await supabase.from('настройки').upsert({ id: 1, тема: 'light' });
        if (error) throw error;

        setTheme('light');
        localStorage.setItem('theme', 'light');

        showNotification('Настройки сброшены', 'success');
        logMessage('🔄 Настройки сброшены к значениям по умолчанию');

    } catch (error) {
        showNotification('Ошибка сброса настроек: ' + error.message, 'error');
        logMessage(`❌ Ошибка сброса настроек: ${error.message}`);
    }
}

async function generateTestData() {
    if (!confirm('Создать тестовые данные во всех таблицах?')) return;

    try {
        // Generate test data for each table
        const testItems = [
            { наименование: 'Ноутбук Lenovo', ед_изм: 'шт', числится: 10, на_складе: 8, выдано: 2 },
            { наименование: 'Монитор Dell', ед_изм: 'шт', числится: 5, на_складе: 5, выдано: 0 },
            { наименование: 'Клавиатура Logitech', ед_изм: 'шт', числится: 15, на_складе: 12, выдано: 3 }
        ];

        for (const item of testItems) {
            await supabase.from('склад').insert(item);
        }

        showNotification('Тестовые данные созданы', 'success');
        logMessage('🎲 Созданы тестовые данные');
        loadDebugMetrics();

    } catch (error) {
        showNotification('Ошибка создания тестовых данных: ' + error.message, 'error');
        logMessage(`❌ Ошибка создания тестовых данных: ${error.message}`);
    }
}

// Unified table rendering function
function renderUnifiedTable(sectionId, data, config) {
    const content = document.getElementById(`${sectionId}-content`);

    // Section title
    let html = `
        <div class="section-title mb-4">
            <h2 class="h4 mb-0">
                <i class="fas fa-${config.icon} me-2"></i>
                ${config.title}
            </h2>
        </div>
    `;

    // Action buttons
    html += `
        <div class="table-actions-primary mb-4">
            <button class="btn btn-primary" onclick="${config.refreshFunction}()" title="Обновить">
                <i class="fas fa-sync-alt"></i>
                <span>Обновить</span>
            </button>
            <button class="btn btn-success" onclick="${config.addFunction}()" title="Добавить запись">
                <i class="fas fa-plus"></i>
                <span>Добавить запись</span>
            </button>
            <button class="btn btn-secondary" onclick="${config.exportFunction}()" title="Экспорт в XLSX">
                <i class="fas fa-file-excel"></i>
                <span>Экспорт в XLSX</span>
            </button>
        </div>
    `;

    // Global search
    html += `
        <div class="global-search mb-3">
            <div class="input-group">
                <span class="input-group-text"><i class="fas fa-search"></i></span>
                <input type="text" id="${sectionId}-global-search" class="form-control" placeholder="Поиск по всем колонкам...">
            </div>
        </div>
    `;

    // Column filters
    html += `<div class="column-filters mb-3">`;
    config.columns.forEach(column => {
        if (column.filterable !== false) {
            html += `
                <div class="filter-cell">
                    <input type="text" id="${sectionId}-filter-${column.key}" placeholder="${column.placeholder || column.title}">
                </div>
            `;
        } else {
            html += `<div class="filter-cell"><!-- ${column.title} - no filter --></div>`;
        }
    });
    html += `</div>`;

    // Filter actions
    html += `
        <div class="filter-actions mb-4">
            <button class="btn btn-success" onclick="${config.applyFiltersFunction}()">
                <i class="fas fa-check"></i>
                <span>Применить фильтры</span>
            </button>
            <button class="btn btn-secondary" onclick="${config.resetFiltersFunction}()">
                <i class="fas fa-times"></i>
                <span>Сбросить фильтры</span>
            </button>
        </div>
    `;

    // Fixed header container
    html += `<div class="table-fixed-header-container">`;

    // Table header
    html += `
        <div class="table-header-fixed">
            <table class="table table-striped table-hover mb-0">
                <thead class="table-dark">
                    <tr>
    `;
    config.columns.forEach(column => {
        html += `<th>${column.title}</th>`;
    });
    html += `
                    </tr>
                </thead>
            </table>
        </div>
    `;

    // Table body
    html += `
        <div class="table-body-scroll">
            <table class="table table-striped table-hover mb-0">
                <tbody>
    `;
    data.forEach(item => {
        html += `<tr>`;
        config.columns.forEach(column => {
            if (column.key === 'actions') {
                html += `<td>${config.renderActions(item)}</td>`;
            } else {
                let value = item[column.key] || '';
                if (column.format) {
                    value = column.format(value, item);
                }
                html += `<td>${value}</td>`;
            }
        });
        html += `</tr>`;
    });
    html += `
                </tbody>
            </table>
        </div>
    `;

    html += `</div>`;

    content.innerHTML = html;

    // Add filter listeners with debounce
    config.columns.forEach(column => {
        if (column.filterable !== false) {
            const element = document.getElementById(`${sectionId}-filter-${column.key}`);
            if (element) {
                element.addEventListener('input', debounce(config.filterFunction, 300));
            }
        }
    });

    // Add global search listener
    const globalSearch = document.getElementById(`${sectionId}-global-search`);
    if (globalSearch) {
        globalSearch.addEventListener('input', debounce(config.filterFunction, 300));
    }
}

// Render Sklad table
function renderSkladTable(data) {
    const config = {
        icon: 'warehouse',
        title: 'Склад',
        refreshFunction: 'refreshSklad',
        addFunction: 'addSklad',
        exportFunction: 'exportSklad',
        applyFiltersFunction: 'applySkladFilters',
        resetFiltersFunction: 'resetSkladFilters',
        filterFunction: filterSklad,
        columns: [
            { key: 'id', title: 'ID', placeholder: 'ID' },
            { key: 'наименование', title: 'Наименование', placeholder: 'Наименование' },
            { key: 'ед_изм', title: 'Ед.изм.', placeholder: 'Ед.изм.' },
            { key: 'числится', title: 'Числится', placeholder: 'Числится' },
            { key: 'на_складе', title: 'На складе', placeholder: 'На складе' },
            { key: 'выдано', title: 'Выдано', placeholder: 'Выдано' },
            {
                key: 'actions',
                title: 'Действия',
                filterable: false,
                renderActions: (item) => `
                    <div class="btn-group" role="group">
                        <button class="btn btn-square btn-outline-primary btn-sm" onclick="editSklad(${item.id})" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-square btn-outline-danger btn-sm" onclick="deleteSklad(${item.id})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-square btn-outline-success btn-sm" onclick="transferToSborka(${item.id})" title="Передать в сборку">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                `
            }
        ]
    };

    renderUnifiedTable('sklad', data, config);
}

function refreshSklad() {
    loadSklad();
    showNotification('Данные склада обновлены', 'success');
}

async function exportSklad() {
    try {
        const { data, error } = await supabase.from('склад').select('*');
        if (error) throw error;

        const exportData = data.map(item => ({
            'ID': item.id,
            'Наименование': item.наименование || '',
            'Ед.изм.': item.ед_изм || '',
            'Числится': item.числится || 0,
            'На складе': item.на_складе || 0,
            'Выдано': item.выдано || 0
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Склад');

        const fileName = 'Склад_' + new Date().toISOString().split('T')[0] + '.xlsx';
        XLSX.writeFile(wb, fileName);

        alert(`Файл ${fileName} успешно экспортирован`);
    } catch (error) {
        alert('Ошибка экспорта: ' + error.message);
    }
}

function filterSklad() {
    const filters = {
        id: document.getElementById('sklad-filter-id')?.value.toLowerCase() || '',
        наименование: document.getElementById('sklad-filter-наименование')?.value.toLowerCase() || '',
        ед_изм: document.getElementById('sklad-filter-ед_изм')?.value.toLowerCase() || '',
        числится: document.getElementById('sklad-filter-числится')?.value.toLowerCase() || '',
        на_складе: document.getElementById('sklad-filter-на_складе')?.value.toLowerCase() || '',
        выдано: document.getElementById('sklad-filter-выдано')?.value.toLowerCase() || ''
    };

    const globalSearch = document.getElementById('sklad-global-search')?.value.toLowerCase() || '';

    const rows = document.querySelectorAll('#sklad-content .table-body-scroll tbody tr');
    rows.forEach(row => {
        const cells = row.cells;

        // Check column filters
        const columnMatches =
            cells[0].textContent.toLowerCase().includes(filters.id) &&
            cells[1].textContent.toLowerCase().includes(filters.наименование) &&
            cells[2].textContent.toLowerCase().includes(filters.ед_изм) &&
            cells[3].textContent.toLowerCase().includes(filters.числится) &&
            cells[4].textContent.toLowerCase().includes(filters.на_складе) &&
            cells[5].textContent.toLowerCase().includes(filters.выдано);

        // Check global search
        const globalMatches = globalSearch === '' || Array.from(cells).slice(0, -1).some(cell =>
            cell.textContent.toLowerCase().includes(globalSearch)
        );

        row.style.display = (columnMatches && globalMatches) ? '' : 'none';
    });
}

function applySkladFilters() {
    filterSklad();
    showNotification('Фильтры применены', 'success');
}

function resetSkladFilters() {
    // Clear all filter inputs
    const filterIds = ['id', 'наименование', 'ед_изм', 'числится', 'на_складе', 'выдано'];
    filterIds.forEach(id => {
        const element = document.getElementById(`sklad-filter-${id}`);
        if (element) element.value = '';
    });

    const globalSearch = document.getElementById('sklad-global-search');
    if (globalSearch) globalSearch.value = '';

    // Show all rows
    const rows = document.querySelectorAll('#sklad-content .table-body-scroll tbody tr');
    rows.forEach(row => {
        row.style.display = '';
    });

    showNotification('Фильтры сброшены', 'info');
}

function filterSborka() {
    const filters = {
        id: document.getElementById('sborka-filter-id')?.value.toLowerCase() || '',
        наименование: document.getElementById('sborka-filter-наименование')?.value.toLowerCase() || '',
        ед_изм: document.getElementById('sborka-filter-ед_изм')?.value.toLowerCase() || '',
        количество: document.getElementById('sborka-filter-количество')?.value.toLowerCase() || ''
    };

    const globalSearch = document.getElementById('sborka-global-search')?.value.toLowerCase() || '';

    const rows = document.querySelectorAll('#sborka-content .table-body-scroll tbody tr');
    rows.forEach(row => {
        const cells = row.cells;

        // Check column filters
        const columnMatches =
            cells[0].textContent.toLowerCase().includes(filters.id) &&
            cells[1].textContent.toLowerCase().includes(filters.наименование) &&
            cells[2].textContent.toLowerCase().includes(filters.ед_изм) &&
            cells[3].textContent.toLowerCase().includes(filters.количество);

        // Check global search
        const globalMatches = globalSearch === '' || Array.from(cells).slice(0, -1).some(cell =>
            cell.textContent.toLowerCase().includes(globalSearch)
        );

        row.style.display = (columnMatches && globalMatches) ? '' : 'none';
    });
}

function applySborkaFilters() {
    filterSborka();
    showNotification('Фильтры применены', 'success');
}

function resetSborkaFilters() {
    // Clear all filter inputs
    const filterIds = ['id', 'наименование', 'ед_изм', 'количество'];
    filterIds.forEach(id => {
        const element = document.getElementById(`sborka-filter-${id}`);
        if (element) element.value = '';
    });

    const globalSearch = document.getElementById('sborka-global-search');
    if (globalSearch) globalSearch.value = '';

    // Show all rows
    const rows = document.querySelectorAll('#sborka-content .table-body-scroll tbody tr');
    rows.forEach(row => {
        row.style.display = '';
    });

    showNotification('Фильтры сброшены', 'info');
}

function filterPrihod() {
    const filters = {
        дата: document.getElementById('prihod-filter-дата')?.value.toLowerCase() || '',
        наименование: document.getElementById('prihod-filter-наименование')?.value.toLowerCase() || '',
        ед_изм: document.getElementById('prihod-filter-ед_изм')?.value.toLowerCase() || '',
        количество: document.getElementById('prihod-filter-количество')?.value.toLowerCase() || '',
        реестровый_номер: document.getElementById('prihod-filter-реестровый_номер')?.value.toLowerCase() || '',
        upd: document.getElementById('prihod-filter-upd')?.value.toLowerCase() || ''
    };

    const globalSearch = document.getElementById('prihod-global-search')?.value.toLowerCase() || '';

    const rows = document.querySelectorAll('#prihod-content .table-body-scroll tbody tr');
    rows.forEach(row => {
        const cells = row.cells;

        // Check column filters
        const columnMatches =
            cells[0].textContent.toLowerCase().includes(filters.дата) &&
            cells[1].textContent.toLowerCase().includes(filters.наименование) &&
            cells[2].textContent.toLowerCase().includes(filters.ед_изм) &&
            cells[3].textContent.toLowerCase().includes(filters.количество) &&
            cells[4].textContent.toLowerCase().includes(filters.реестровый_номер) &&
            cells[5].textContent.toLowerCase().includes(filters.upd);

        // Check global search
        const globalMatches = globalSearch === '' || Array.from(cells).slice(0, -1).some(cell =>
            cell.textContent.toLowerCase().includes(globalSearch)
        );

        row.style.display = (columnMatches && globalMatches) ? '' : 'none';
    });
}

function applyPrihodFilters() {
    filterPrihod();
    showNotification('Фильтры применены', 'success');
}

function resetPrihodFilters() {
    // Clear all filter inputs
    const filterIds = ['дата', 'наименование', 'ед_изм', 'количество', 'реестровый_номер', 'upd'];
    filterIds.forEach(id => {
        const element = document.getElementById(`prihod-filter-${id}`);
        if (element) element.value = '';
    });

    const globalSearch = document.getElementById('prihod-global-search');
    if (globalSearch) globalSearch.value = '';

    // Show all rows
    const rows = document.querySelectorAll('#prihod-content .table-body-scroll tbody tr');
    rows.forEach(row => {
        row.style.display = '';
    });

    showNotification('Фильтры сброшены', 'info');
}

function filterVydannoe() {
    const filters = {
        date: document.getElementById('vydannoe-filter-date').value.toLowerCase(),
        id: document.getElementById('vydannoe-filter-id').value.toLowerCase(),
        name: document.getElementById('vydannoe-filter-name').value.toLowerCase(),
        unit: document.getElementById('vydannoe-filter-unit').value.toLowerCase(),
        quantity: document.getElementById('vydannoe-filter-quantity').value.toLowerCase(),
        contractor: document.getElementById('vydannoe-filter-contractor').value,
        responsible: document.getElementById('vydannoe-filter-responsible').value,
        registry: document.getElementById('vydannoe-filter-registry').value.toLowerCase(),
        upd: document.getElementById('vydannoe-filter-upd').value.toLowerCase()
    };

    const globalSearch = document.getElementById('vydannoe-global-search').value.toLowerCase();

    const rows = document.querySelectorAll('#vydannoe-content tbody tr');
    rows.forEach(row => {
        const cells = row.cells;

        // Check column filters
        const columnMatches =
            cells[0].textContent.toLowerCase().includes(filters.date) &&
            cells[1].textContent.toLowerCase().includes(filters.id) &&
            cells[2].textContent.toLowerCase().includes(filters.name) &&
            cells[3].textContent.toLowerCase().includes(filters.unit) &&
            cells[4].textContent.toLowerCase().includes(filters.quantity) &&
            (filters.contractor === '' || cells[5].textContent.includes(filters.contractor)) &&
            (filters.responsible === '' || cells[6].textContent.includes(filters.responsible)) &&
            cells[7].textContent.toLowerCase().includes(filters.registry) &&
            cells[8].textContent.toLowerCase().includes(filters.upd);

        // Check global search
        const globalMatches = globalSearch === '' || Array.from(cells).slice(0, -1).some(cell =>
            cell.textContent.toLowerCase().includes(globalSearch)
        );

        row.style.display = (columnMatches && globalMatches) ? '' : 'none';
    });
}

function filterVydannoe() {
    const filters = {
        дата: document.getElementById('vydannoe-filter-дата')?.value.toLowerCase() || '',
        id: document.getElementById('vydannoe-filter-id')?.value.toLowerCase() || '',
        наименование: document.getElementById('vydannoe-filter-наименование')?.value.toLowerCase() || '',
        ед_изм: document.getElementById('vydannoe-filter-ед_изм')?.value.toLowerCase() || '',
        количество: document.getElementById('vydannoe-filter-количество')?.value.toLowerCase() || '',
        контрагент: document.getElementById('vydannoe-filter-контрагент')?.value || '',
        ответственный: document.getElementById('vydannoe-filter-ответственный')?.value || '',
        реестровый_номер: document.getElementById('vydannoe-filter-реестровый_номер')?.value.toLowerCase() || '',
        upd: document.getElementById('vydannoe-filter-upd')?.value.toLowerCase() || ''
    };

    const globalSearch = document.getElementById('vydannoe-global-search')?.value.toLowerCase() || '';

    const rows = document.querySelectorAll('#vydannoe-content .table-body-scroll tbody tr');
    rows.forEach(row => {
        const cells = row.cells;

        // Check column filters
        const columnMatches =
            cells[0].textContent.toLowerCase().includes(filters.дата) &&
            cells[1].textContent.toLowerCase().includes(filters.id) &&
            cells[2].textContent.toLowerCase().includes(filters.наименование) &&
            cells[3].textContent.toLowerCase().includes(filters.ед_изм) &&
            cells[4].textContent.toLowerCase().includes(filters.количество) &&
            (filters.контрагент === '' || cells[5].textContent.includes(filters.контрагент)) &&
            (filters.ответственный === '' || cells[6].textContent.includes(filters.ответственный)) &&
            cells[7].textContent.toLowerCase().includes(filters.реестровый_номер) &&
            cells[8].textContent.toLowerCase().includes(filters.upd);

        // Check global search
        const globalMatches = globalSearch === '' || Array.from(cells).slice(0, -1).some(cell =>
            cell.textContent.toLowerCase().includes(globalSearch)
        );

        row.style.display = (columnMatches && globalMatches) ? '' : 'none';
    });
}

function applyVydannoeFilters() {
    filterVydannoe();
    showNotification('Фильтры применены', 'success');
}

function resetVydannoeFilters() {
    // Clear all filter inputs
    const filterIds = ['дата', 'id', 'наименование', 'ед_изм', 'количество', 'контрагент', 'ответственный', 'реестровый_номер', 'upd'];
    filterIds.forEach(id => {
        const element = document.getElementById(`vydannoe-filter-${id}`);
        if (element) element.value = '';
    });

    const globalSearch = document.getElementById('vydannoe-global-search');
    if (globalSearch) globalSearch.value = '';

    // Show all rows
    const rows = document.querySelectorAll('#vydannoe-content .table-body-scroll tbody tr');
    rows.forEach(row => {
        row.style.display = '';
    });

    showNotification('Фильтры сброшены', 'info');
}

async function refreshSborka() {
    await loadSborka();
}

// Placeholder CRUD functions
async function editSklad(id) {
    // Get current data
    const { data, error } = await supabase.from('склад').select('*').eq('id', id).single();
    if (error) { alert('Ошибка: ' + error.message); return; }
    const name = prompt('Наименование:', data.наименование);
    const unit = prompt('Ед.изм.:', data.ед_изм);
    const accounted = prompt('Числится:', data.числится);
    const inStock = prompt('На складе:', data.на_складе);
    const issued = prompt('Выдано:', data.выдано);
    if (name && unit) {
        try {
            const { error } = await supabase.from('склад').update({
                наименование: name,
                ед_изм: unit,
                числится: parseFloat(accounted) || 0,
                на_складе: parseFloat(inStock) || 0,
                выдано: parseFloat(issued) || 0
            }).eq('id', id);
            if (error) throw error;
            loadSklad(); // Reload
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }
}
async function deleteSklad(id) {
    if (confirm('Удалить запись?')) {
        try {
            const { error } = await supabase.from('склад').delete().eq('id', id);
            if (error) throw error;
            loadSklad(); // Reload
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }
}
async function transferToSborka(id) {
    const quantity = prompt('Количество для передачи:');
    if (quantity) {
        try {
            // Get current item
            const { data: item, error: err1 } = await supabase.from('склад').select('*').eq('id', id).single();
            if (err1) throw err1;
            // Insert into sborka
            const { error: err2 } = await supabase.from('сборка').insert({
                наименование: item.наименование,
                ед_изм: item.ед_изм,
                количество: parseFloat(quantity)
            });
            if (err2) throw err2;
            // Update sklad
            const newStock = item.на_складе - parseFloat(quantity);
            const { error: err3 } = await supabase.from('склад').update({
                на_складе: newStock,
                выдано: item.выдано + parseFloat(quantity)
            }).eq('id', id);
            if (err3) throw err3;
            loadSklad(); // Reload
            alert('Передано в сборку');
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }
}
async function addSklad() {
    const name = prompt('Наименование:');
    const unit = prompt('Ед.изм.:');
    const accounted = prompt('Числится:');
    const inStock = prompt('На складе:');
    const issued = prompt('Выдано:');
    if (name && unit) {
        try {
            const { error } = await supabase.from('склад').insert({
                наименование: name,
                ед_изм: unit,
                числится: parseFloat(accounted) || 0,
                на_складе: parseFloat(inStock) || 0,
                выдано: parseFloat(issued) || 0
            });
            if (error) throw error;
            loadSklad(); // Reload
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }
}

// Render Sborka table
function renderSborkaTable(data) {
    const config = {
        icon: 'cogs',
        title: 'Сборка',
        refreshFunction: 'refreshSborka',
        addFunction: 'addSborka',
        exportFunction: 'exportSborka',
        applyFiltersFunction: 'applySborkaFilters',
        resetFiltersFunction: 'resetSborkaFilters',
        filterFunction: filterSborka,
        columns: [
            { key: 'id', title: 'ID', placeholder: 'ID' },
            { key: 'наименование', title: 'Наименование', placeholder: 'Наименование' },
            { key: 'ед_изм', title: 'Ед.изм.', placeholder: 'Ед.изм.' },
            { key: 'количество', title: 'Количество', placeholder: 'Количество' },
            {
                key: 'actions',
                title: 'Действия',
                filterable: false,
                renderActions: (item) => `
                    <div class="btn-group" role="group">
                        <button class="btn btn-square btn-outline-primary btn-sm" onclick="editSborka(${item.id})" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-square btn-outline-danger btn-sm" onclick="deleteSborka(${item.id})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-square btn-outline-success btn-sm" onclick="transferToSborkaFromSborka(${item.id})" title="Передать в сборку">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                `
            }
        ]
    };

    renderUnifiedTable('sborka', data, config);
}

async function editSborka(id) {
    const { data, error } = await supabase.from('сборка').select('*').eq('id', id).single();
    if (error) { alert('Ошибка: ' + error.message); return; }

    const name = prompt('Наименование:', data.наименование);
    const unit = prompt('Ед.изм.:', data.ед_изм);
    const quantity = prompt('Количество:', data.количество);

    if (name && unit) {
        try {
            const { error } = await supabase.from('сборка').update({
                наименование: name,
                ед_изм: unit,
                количество: parseFloat(quantity) || 0
            }).eq('id', id);
            if (error) throw error;
            loadSborka();
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }
}

async function deleteSborka(id) {
    if (confirm('Удалить запись?')) {
        try {
            const { error } = await supabase.from('сборка').delete().eq('id', id);
            if (error) throw error;
            loadSborka();
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }
}

async function addSborka() {
    const name = prompt('Наименование:');
    const unit = prompt('Ед.изм.:');
    const quantity = prompt('Количество:');

    if (name && unit) {
        try {
            const { error } = await supabase.from('сборка').insert({
                наименование: name,
                ед_изм: unit,
                количество: parseFloat(quantity) || 0
            });
            if (error) throw error;
            loadSborka();
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }
}

async function transferToSborkaFromSborka(id) {
    // Модальное окно для передачи в сборку
    const { data: item, error } = await supabase.from('сборка').select('*').eq('id', id).single();
    if (error) { alert('Ошибка: ' + error.message); return; }

    const quantity = prompt(`Количество для передачи (доступно: ${item.количество}):`);
    if (quantity && parseFloat(quantity) > 0) {
        // Здесь можно добавить логику передачи в производство
        alert(`Передано в сборку: ${quantity} ${item.ед_изм} ${item.наименование}`);
    }
}

async function exportSborka() {
    try {
        const { data, error } = await supabase.from('сборка').select('*');
        if (error) throw error;

        const exportData = data.map(item => ({
            'ID': item.id,
            'Наименование': item.наименование || '',
            'Ед.изм.': item.ед_изм || '',
            'Количество': item.количество || 0
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Сборка');

        const fileName = 'Сборка_' + new Date().toISOString().split('T')[0] + '.xlsx';
        XLSX.writeFile(wb, fileName);

        alert(`Файл ${fileName} успешно экспортирован`);
    } catch (error) {
        alert('Ошибка экспорта: ' + error.message);
    }
}

// Render Prihod table
function renderPrihodTable(data) {
    const content = document.getElementById('prihod-content');

    // Section title
    let html = `
        <div class="section-title mb-4">
            <h2 class="h4 mb-0">
                <i class="fas fa-truck me-2"></i>
                Приход
            </h2>
        </div>
    `;

    // Action buttons
    html += `
        <div class="table-actions-primary mb-4">
            <button class="btn btn-primary" onclick="refreshPrihod()" title="Обновить">
                <i class="fas fa-sync-alt"></i>
                <span>Обновить</span>
            </button>
            <button class="btn btn-success" onclick="addPrihod()" title="Добавить запись">
                <i class="fas fa-plus"></i>
                <span>Добавить запись</span>
            </button>
            <button class="btn btn-secondary" onclick="exportPrihod()" title="Экспорт в XLSX">
                <i class="fas fa-file-excel"></i>
                <span>Экспорт в XLSX</span>
            </button>
        </div>
    `;

    // Global search
    html += `
        <div class="global-search mb-3">
            <div class="input-group">
                <span class="input-group-text"><i class="fas fa-search"></i></span>
                <input type="text" id="prihod-global-search" class="form-control" placeholder="Поиск по всем колонкам...">
            </div>
        </div>
    `;

    // Column filters
    html += `
        <div class="column-filters mb-3">
            <div class="filter-cell">
                <input type="text" id="prihod-filter-дата" placeholder="Дата">
            </div>
            <div class="filter-cell">
                <input type="text" id="prihod-filter-наименование" placeholder="Наименование">
            </div>
            <div class="filter-cell">
                <input type="text" id="prihod-filter-ед_изм" placeholder="Ед.изм.">
            </div>
            <div class="filter-cell">
                <input type="text" id="prihod-filter-количество" placeholder="Количество">
            </div>
            <div class="filter-cell">
                <input type="text" id="prihod-filter-реестровый_номер" placeholder="Реестровый номер">
            </div>
            <div class="filter-cell">
                <input type="text" id="prihod-filter-upd" placeholder="УПД">
            </div>
            <div class="filter-cell"><!-- Actions - no filter --></div>
        </div>
    `;

    // Filter actions
    html += `
        <div class="filter-actions mb-4">
            <button class="btn btn-success" onclick="applyPrihodFilters()">
                <i class="fas fa-check"></i>
                <span>Применить фильтры</span>
            </button>
            <button class="btn btn-secondary" onclick="resetPrihodFilters()">
                <i class="fas fa-times"></i>
                <span>Сбросить фильтры</span>
            </button>
        </div>
    `;

    // Specific tools for Prihod section
    html += `
        <div class="mb-4">
            <!-- Acceptance section -->
            <div class="card mb-3">
                <div class="card-header">
                    <h5 class="mb-0">Принятие прихода</h5>
                </div>
                <div class="card-body">
                    <div class="row g-2">
                        <div class="col-md-3">
                            <button class="btn btn-outline-primary w-100" onclick="pasteFromClipboard()">
                                <i class="fas fa-paste me-1"></i>Вставить из буфера обмена
                            </button>
                        </div>
                        <div class="col-md-3">
                            <button class="btn btn-outline-success w-100" onclick="importPrihod()">
                                <i class="fas fa-file-excel me-1"></i>Импорт из xlsx
                            </button>
                        </div>
                        <div class="col-md-3">
                            <button class="btn btn-outline-info w-100" onclick="addPrihod()">
                                <i class="fas fa-plus me-1"></i>Добавить строку
                            </button>
                        </div>
                        <div class="col-md-3">
                            <button class="btn btn-success w-100" onclick="acceptPrihod()">
                                <i class="fas fa-check me-1"></i>Принять
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Documents section -->
            <div class="card mb-3">
                <div class="card-header">
                    <h5 class="mb-0">Документы прихода</h5>
                </div>
                <div class="card-body">
                    <div class="row g-2">
                        <div class="col-md-5">
                            <input type="text" id="registry-number" class="form-control" placeholder="Реестровый номер заявки">
                        </div>
                        <div class="col-md-2">
                            <button class="btn btn-outline-secondary w-100" onclick="applyRegistryNumber()">
                                <i class="fas fa-arrow-right me-1"></i>Применить
                            </button>
                        </div>
                        <div class="col-md-3">
                            <input type="text" id="upd-number" class="form-control" placeholder="УПД">
                        </div>
                        <div class="col-md-2">
                            <button class="btn btn-outline-secondary w-100" onclick="applyUPD()">
                                <i class="fas fa-arrow-right me-1"></i>Применить
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Editing section -->
            <div class="card mb-3">
                <div class="card-header">
                    <h5 class="mb-0">Редактирование</h5>
                </div>
                <div class="card-body">
                    <div class="row g-2">
                        <div class="col-md-6">
                            <button class="btn btn-outline-danger w-100" onclick="clearPrihod()">
                                <i class="fas fa-trash me-1"></i>Очистить приход
                            </button>
                        </div>
                        <div class="col-md-6">
                            <button class="btn btn-outline-primary w-100" onclick="exportPrihod()">
                                <i class="fas fa-file-export me-1"></i>Экспорт в xlsx
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Use unified table rendering
    const config = {
        icon: 'truck',
        title: 'Приход',
        refreshFunction: 'refreshPrihod',
        addFunction: 'addPrihod',
        exportFunction: 'exportPrihod',
        applyFiltersFunction: 'applyPrihodFilters',
        resetFiltersFunction: 'resetPrihodFilters',
        filterFunction: filterPrihod,
        columns: [
            {
                key: 'дата',
                title: 'Дата',
                placeholder: 'Дата',
                format: (value) => new Date(value).toLocaleDateString('ru-RU')
            },
            { key: 'наименование', title: 'Наименование', placeholder: 'Наименование' },
            { key: 'ед_изм', title: 'Ед.изм.', placeholder: 'Ед.изм.' },
            { key: 'количество', title: 'Количество', placeholder: 'Количество' },
            { key: 'реестровый_номер', title: 'Реестровый номер', placeholder: 'Реестровый номер' },
            { key: 'upd', title: 'УПД', placeholder: 'УПД' },
            {
                key: 'actions',
                title: 'Действия',
                filterable: false,
                renderActions: (item) => `
                    <div class="btn-group" role="group">
                        <button class="btn btn-square btn-outline-primary btn-sm" onclick="editPrihod(${item.id})" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-square btn-outline-danger btn-sm" onclick="deletePrihod(${item.id})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `
            }
        ]
    };

    // Create a temporary container for unified table
    const tempContainer = document.createElement('div');
    tempContainer.id = 'prihod-temp';
    document.body.appendChild(tempContainer);

    // Use unified table rendering
    renderUnifiedTable('prihod-temp', data, config);

    // Get the table HTML and add it to main HTML
    html += tempContainer.innerHTML;

    // Remove temporary container
    document.body.removeChild(tempContainer);

    content.innerHTML = html;

    // Add filter listeners with debounce
    config.columns.forEach(column => {
        if (column.filterable !== false && column.key !== 'actions') {
            const element = document.getElementById(`prihod-filter-${column.key}`);
            if (element) {
                element.addEventListener('input', debounce(filterPrihod, 300));
            }
        }
    });

    // Add global search listener
    const globalSearch = document.getElementById('prihod-global-search');
    if (globalSearch) {
        globalSearch.addEventListener('input', debounce(filterPrihod, 300));
    }
}

async function editPrihod(id) {
    const { data, error } = await supabase.from('приход').select('*').eq('id', id).single();
    if (error) { alert('Ошибка: ' + error.message); return; }

    const name = prompt('Наименование:', data.наименование);
    const unit = prompt('Ед.изм.:', data.ед_изм);
    const quantity = prompt('Количество:', data.количество);
    const registry = prompt('Реестровый номер:', data.реестровый_номер);
    const upd = prompt('УПД:', data.upd);

    if (name && unit) {
        try {
            const { error } = await supabase.from('приход').update({
                наименование: name,
                ед_изм: unit,
                количество: parseFloat(quantity) || 0,
                реестровый_номер: registry,
                upd: upd
            }).eq('id', id);
            if (error) throw error;
            loadPrihod();
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }
}

async function deletePrihod(id) {
    if (confirm('Удалить запись?')) {
        try {
            const { error } = await supabase.from('приход').delete().eq('id', id);
            if (error) throw error;
            loadPrihod();
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }
}

async function addPrihod() {
    const name = prompt('Наименование:');
    const unit = prompt('Ед.изм.:');
    const quantity = prompt('Количество:');
    const registry = prompt('Реестровый номер:');
    const upd = prompt('УПД:');

    if (name && unit) {
        try {
            const { error } = await supabase.from('приход').insert({
                наименование: name,
                ед_изм: unit,
                количество: parseFloat(quantity) || 0,
                реестровый_номер: registry,
                upd: upd
            });
            if (error) throw error;
            loadPrihod();
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }
}

async function importPrihod() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            // Пропустить заголовок и обработать данные
            const rows = json.slice(1);
            let imported = 0;

            for (const row of rows) {
                if (row.length >= 3 && row[0] && row[1] && row[2]) {
                    const { error } = await supabase.from('приход').insert({
                        наименование: row[0].toString().trim(),
                        ед_изм: row[1].toString().trim(),
                        количество: parseFloat(row[2]) || 0
                    });
                    if (!error) imported++;
                }
            }

            alert(`Импортировано ${imported} записей из файла ${file.name}`);
            loadPrihod();
        } catch (error) {
            alert('Ошибка импорта: ' + error.message);
        }
    };
    input.click();
}

async function exportPrihod() {
    try {
        const { data, error } = await supabase.from('приход').select('*');
        if (error) throw error;

        const exportData = data.map(item => ({
            'Дата': new Date(item.дата).toLocaleDateString('ru-RU'),
            'Наименование': item.наименование || '',
            'Ед.изм.': item.ед_изм || '',
            'Количество': item.количество || 0,
            'Реестровый номер': item.реестровый_номер || '',
            'УПД': item.upd || ''
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Приход');

        const fileName = 'Приход_' + new Date().toISOString().split('T')[0] + '.xlsx';
        XLSX.writeFile(wb, fileName);

        alert(`Файл ${fileName} успешно экспортирован`);
    } catch (error) {
        alert('Ошибка экспорта: ' + error.message);
    }
}

function clearPrihod() {
    if (confirm('Очистить все данные прихода?')) {
        supabase.from('приход').delete().neq('id', 0); // Delete all
        loadPrihod();
    }
}

async function acceptPrihod() {
    if (!confirm('Принять приход? Все данные будут перенесены в Склад.')) return;

    try {
        // Получить все записи прихода
        const { data: prihodData, error: prihodError } = await supabase.from('приход').select('*');
        if (prihodError) throw prihodError;

        for (const item of prihodData) {
            if (!item.наименование || !item.ед_изм || !item.количество) continue;

            // Проверить, существует ли товар в складе
            const { data: existingItem, error: checkError } = await supabase
                .from('склад')
                .select('*')
                .eq('наименование', item.наименование)
                .eq('ед_изм', item.ед_изм)
                .single();

            if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
                throw checkError;
            }

            if (existingItem) {
                // Обновить существующий товар
                const { error: updateError } = await supabase
                    .from('склад')
                    .update({
                        числится: existingItem.числится + item.количество,
                        на_складе: existingItem.на_складе + item.количество
                    })
                    .eq('id', existingItem.id);
                if (updateError) throw updateError;
            } else {
                // Создать новый товар
                const { error: insertError } = await supabase
                    .from('склад')
                    .insert({
                        наименование: item.наименование,
                        ед_изм: item.ед_изм,
                        числится: item.количество,
                        на_складе: item.количество,
                        выдано: 0
                    });
                if (insertError) throw insertError;
            }

            // Записать операцию
            const { error: operationError } = await supabase
                .from('операции')
                .insert({
                    тип_операции: 'Принятый приход',
                    детали: `Принят приход: ${item.наименование} - ${item.количество} ${item.ед_изм}`
                });
            if (operationError) throw operationError;
        }

        // Очистить таблицу прихода
        const { error: clearError } = await supabase.from('приход').delete().neq('id', 0);
        if (clearError) throw clearError;

        alert('Приход успешно принят!');
        loadPrihod();
        // Обновить склад если открыт
        if (currentSection === 'sklad') {
            loadSklad();
        }

    } catch (error) {
        alert('Ошибка при принятии прихода: ' + error.message);
    }
}

async function pasteFromClipboard() {
    const text = await navigator.clipboard.readText();
    const rows = text.split('\n').map(row => row.split('\t'));
    for (const row of rows) {
        if (row.length >= 3) {
            await supabase.from('приход').insert({
                наименование: row[0],
                ед_изм: row[1],
                количество: parseFloat(row[2])
            });
        }
    }
    loadPrihod();
}

async function applyRegistryNumber() {
    const number = document.getElementById('registry-number').value;
    if (number) {
        await supabase.from('приход').update({ реестровый_номер: number }).neq('наименование', '');
        loadPrihod();
    }
}

async function applyUPD() {
    const upd = document.getElementById('upd-number').value;
    if (upd) {
        await supabase.from('приход').update({ upd: upd }).neq('наименование', '');
        loadPrihod();
    }
}

async function refreshPrihod() {
    await loadPrihod();
    showNotification('Данные прихода обновлены', 'success');
}

// Render Vydannoe table
function renderVydannoeTable(data, kontragenty, persons) {
    const content = document.getElementById('vydannoe-content');

    // Create maps for quick lookup
    const kontrMap = {};
    kontragenty.forEach(k => kontrMap[k.id] = k.организация);

    const personsMap = {};
    persons.forEach(p => {
        if (!personsMap[p.id_контрагента]) personsMap[p.id_контрагента] = [];
        personsMap[p.id_контрагента].push(p.имя);
    });

    // Section title
    let html = `
        <div class="section-title mb-4">
            <h2 class="h4 mb-0">
                <i class="fas fa-hand-holding me-2"></i>
                Выданное
            </h2>
        </div>
    `;

    // Action buttons
    html += `
        <div class="table-actions-primary mb-4">
            <button class="btn btn-primary" onclick="refreshVydannoe()" title="Обновить">
                <i class="fas fa-sync-alt"></i>
                <span>Обновить</span>
            </button>
            <button class="btn btn-success" onclick="addVydannoe()" title="Добавить запись">
                <i class="fas fa-plus"></i>
                <span>Добавить запись</span>
            </button>
            <button class="btn btn-secondary" onclick="exportVydannoe()" title="Экспорт в XLSX">
                <i class="fas fa-file-excel"></i>
                <span>Экспорт в XLSX</span>
            </button>
        </div>
    `;

    // Global search
    html += `
        <div class="global-search mb-3">
            <div class="input-group">
                <span class="input-group-text"><i class="fas fa-search"></i></span>
                <input type="text" id="vydannoe-global-search" class="form-control" placeholder="Поиск по всем колонкам...">
            </div>
        </div>
    `;

    // Column filters
    html += `<div class="column-filters mb-3">`;
    html += `
        <div class="filter-cell">
            <input type="text" id="vydannoe-filter-дата" placeholder="Дата">
        </div>
        <div class="filter-cell">
            <input type="text" id="vydannoe-filter-id" placeholder="ID">
        </div>
        <div class="filter-cell">
            <input type="text" id="vydannoe-filter-наименование" placeholder="Наименование">
        </div>
        <div class="filter-cell">
            <input type="text" id="vydannoe-filter-ед_изм" placeholder="Ед.изм.">
        </div>
        <div class="filter-cell">
            <input type="text" id="vydannoe-filter-количество" placeholder="Количество">
        </div>
        <div class="filter-cell">
            <select id="vydannoe-filter-контрагент">
                <option value="">Контрагент</option>
    `;
    kontragenty.forEach(k => {
        html += `<option value="${k.id}">${k.организация}</option>`;
    });
    html += `
            </select>
        </div>
        <div class="filter-cell">
            <select id="vydannoe-filter-ответственный">
                <option value="">Ответственный</option>
    `;
    // Collect unique responsible persons
    const uniquePersons = [...new Set(persons.map(p => p.имя))];
    uniquePersons.forEach(name => {
        html += `<option value="${name}">${name}</option>`;
    });
    html += `
            </select>
        </div>
        <div class="filter-cell">
            <input type="text" id="vydannoe-filter-реестровый_номер" placeholder="Реестровый номер">
        </div>
        <div class="filter-cell">
            <input type="text" id="vydannoe-filter-upd" placeholder="УПД">
        </div>
        <div class="filter-cell"><!-- Actions - no filter --></div>
    `;
    html += `</div>`;

    // Filter actions
    html += `
        <div class="filter-actions mb-4">
            <button class="btn btn-success" onclick="applyVydannoeFilters()">
                <i class="fas fa-check"></i>
                <span>Применить фильтры</span>
            </button>
            <button class="btn btn-secondary" onclick="resetVydannoeFilters()">
                <i class="fas fa-times"></i>
                <span>Сбросить фильтры</span>
            </button>
        </div>
    `;

    // Use unified table rendering
    const config = {
        icon: 'hand-holding',
        title: 'Выданное',
        refreshFunction: 'refreshVydannoe',
        addFunction: 'addVydannoe',
        exportFunction: 'exportVydannoe',
        applyFiltersFunction: 'applyVydannoeFilters',
        resetFiltersFunction: 'resetVydannoeFilters',
        filterFunction: filterVydannoe,
        columns: [
            {
                key: 'дата',
                title: 'Дата',
                placeholder: 'Дата',
                format: (value) => new Date(value).toLocaleDateString('ru-RU')
            },
            { key: 'id', title: 'ID', placeholder: 'ID' },
            { key: 'наименование', title: 'Наименование', placeholder: 'Наименование' },
            { key: 'ед_изм', title: 'Ед.изм.', placeholder: 'Ед.изм.' },
            { key: 'количество', title: 'Количество', placeholder: 'Количество' },
            { key: 'контрагент', title: 'Контрагент', placeholder: 'Контрагент' },
            { key: 'ответственный', title: 'Ответственный', placeholder: 'Ответственный' },
            { key: 'реестровый_номер', title: 'Реестровый номер', placeholder: 'Реестровый номер' },
            { key: 'upd', title: 'УПД', placeholder: 'УПД' },
            {
                key: 'actions',
                title: 'Действия',
                filterable: false,
                renderActions: (item) => `
                    <div class="btn-group" role="group">
                        <button class="btn btn-square btn-outline-primary btn-sm" onclick="editVydannoe(${item.id})" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-square btn-outline-danger btn-sm" onclick="deleteVydannoe(${item.id})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `
            }
        ]
    };

    // Create a temporary container for unified table
    const tempContainer = document.createElement('div');
    tempContainer.id = 'vydannoe-temp';
    document.body.appendChild(tempContainer);

    // Use unified table rendering
    renderUnifiedTable('vydannoe-temp', data, config);

    // Get the table HTML and add it to main HTML
    html += tempContainer.innerHTML;

    // Remove temporary container
    document.body.removeChild(tempContainer);

    content.innerHTML = html;

    // Add filter listeners with debounce
    config.columns.forEach(column => {
        if (column.filterable !== false && column.key !== 'actions') {
            const element = document.getElementById(`vydannoe-filter-${column.key}`);
            if (element) {
                if (element.tagName === 'SELECT') {
                    element.addEventListener('change', debounce(filterVydannoe, 300));
                } else {
                    element.addEventListener('input', debounce(filterVydannoe, 300));
                }
            }
        }
    });

    // Add global search listener
    const globalSearch = document.getElementById('vydannoe-global-search');
    if (globalSearch) {
        globalSearch.addEventListener('input', debounce(filterVydannoe, 300));
    }
}

async function editVydannoe(id) {
    const { data, error } = await supabase.from('выданное').select('*').eq('id', id).single();
    if (error) { alert('Ошибка: ' + error.message); return; }

    const name = prompt('Наименование:', data.наименование);
    const unit = prompt('Ед.изм.:', data.ед_изм);
    const quantity = prompt('Количество:', data.количество);
    const contractor = prompt('Контрагент:', data.контрагент);
    const responsible = prompt('Ответственный:', data.ответственный);
    const registry = prompt('Реестровый номер:', data.реестровый_номер);
    const upd = prompt('УПД:', data.upd);

    if (name && unit) {
        try {
            const { error } = await supabase.from('выданное').update({
                наименование: name,
                ед_изм: unit,
                количество: parseFloat(quantity) || 0,
                контрагент: contractor,
                ответственный: responsible,
                реестровый_номер: registry,
                upd: upd
            }).eq('id', id);
            if (error) throw error;
            loadVydannoe();
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }
}

async function deleteVydannoe(id) {
    if (confirm('Удалить запись?')) {
        try {
            const { error } = await supabase.from('выданное').delete().eq('id', id);
            if (error) throw error;
            loadVydannoe();
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }
}

async function addVydannoe() {
    const name = prompt('Наименование:');
    const unit = prompt('Ед.изм.:');
    const quantity = prompt('Количество:');
    const contractor = prompt('Контрагент:');
    const responsible = prompt('Ответственный:');
    const registry = prompt('Реестровый номер:');
    const upd = prompt('УПД:');

    if (name && unit) {
        try {
            const { error } = await supabase.from('выданное').insert({
                наименование: name,
                ед_изм: unit,
                количество: parseFloat(quantity) || 0,
                контрагент: contractor,
                ответственный: responsible,
                реестровый_номер: registry,
                upd: upd
            });
            if (error) throw error;
            loadVydannoe();
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }
}

async function refreshVydannoe() {
    await loadVydannoe();
    showNotification('Данные выданного обновлены', 'success');
}

async function exportVydannoe() {
    try {
        const { data, error } = await supabase.from('выданное').select('*');
        if (error) throw error;

        const exportData = data.map(item => ({
            'Дата': new Date(item.дата).toLocaleDateString('ru-RU'),
            'ID': item.id,
            'Наименование': item.наименование || '',
            'Ед.изм.': item.ед_изм || '',
            'Количество': item.количество || 0,
            'Контрагент': item.контрагент || '',
            'Ответственный': item.ответственный || '',
            'Реестровый номер': item.реестровый_номер || '',
            'УПД': item.upd || ''
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Выданное');

        const fileName = 'Выданное_' + new Date().toISOString().split('T')[0] + '.xlsx';
        XLSX.writeFile(wb, fileName);

        alert(`Файл ${fileName} успешно экспортирован`);
    } catch (error) {
        alert('Ошибка экспорта: ' + error.message);
    }
}

function renderKontragenty(kontragenty, persons) {
    const content = document.getElementById('kontragenty-content');

    let html = `
        <div class="row">
    `;

    kontragenty.forEach(kontr => {
        const kontrPersons = persons.filter(p => p.id_контрагента === kontr.id);
        html += `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-header bg-primary text-white">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-building me-2"></i>${kontr.организация}
                        </h5>
                    </div>
                    <div class="card-body">
                        <h6 class="card-subtitle mb-3 text-muted">
                            <i class="fas fa-users me-2"></i>Ответственные лица:
                        </h6>
                        <ul class="list-group list-group-flush">
        `;

        if (kontrPersons.length > 0) {
            kontrPersons.forEach(person => {
                html += `<li class="list-group-item px-0">${person.имя}</li>`;
            });
        } else {
            html += `<li class="list-group-item px-0 text-muted">Нет ответственных лиц</li>`;
        }

        html += `
                        </ul>
                    </div>
                    <div class="card-footer bg-transparent">
                        <div class="btn-group w-100" role="group">
                            <button class="btn btn-outline-primary" onclick="editKontr(${kontr.id})" title="Редактировать">
                                <i class="fas fa-edit me-1"></i>Редактировать
                            </button>
                            <button class="btn btn-outline-danger" onclick="deleteKontr(${kontr.id})" title="Удалить">
                                <i class="fas fa-trash me-1"></i>Удалить
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += `
        </div>
        <div class="mt-4 text-center">
            <button class="btn btn-success btn-lg" onclick="addKontr()">
                <i class="fas fa-plus me-2"></i>Добавить контрагента
            </button>
        </div>
    `;

    content.innerHTML = html;
}

async function editKontr(id) {
    const { data: kontr, error: kontrError } = await supabase.from('контрагенты').select('*').eq('id', id).single();
    if (kontrError) { alert('Ошибка: ' + kontrError.message); return; }

    const { data: persons, error: personsError } = await supabase.from('ответственные_лица').select('*').eq('id_контрагента', id);
    if (personsError) { alert('Ошибка: ' + personsError.message); return; }

    const organization = prompt('Название организации:', kontr.организация);
    if (!organization) return;

    // Обновить организацию
    const { error: updateError } = await supabase.from('контрагенты').update({ организация: organization }).eq('id', id);
    if (updateError) { alert('Ошибка: ' + updateError.message); return; }

    // Обновить ответственных лиц
    const personsText = prompt('Ответственные лица (через запятую):', persons.map(p => p.имя).join(', '));
    if (personsText !== null) {
        // Удалить старых
        await supabase.from('ответственные_лица').delete().eq('id_контрагента', id);

        // Добавить новых
        const names = personsText.split(',').map(name => name.trim()).filter(name => name);
        for (const name of names) {
            await supabase.from('ответственные_лица').insert({
                id_контрагента: id,
                имя: name
            });
        }
    }

    loadKontragenty();
}

async function deleteKontr(id) {
    if (confirm('Удалить контрагента и всех его ответственных лиц?')) {
        try {
            // Удалить ответственных лиц
            await supabase.from('ответственные_лица').delete().eq('id_контрагента', id);
            // Удалить контрагента
            const { error } = await supabase.from('контрагенты').delete().eq('id', id);
            if (error) throw error;
            loadKontragenty();
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }
}

async function addKontr() {
    const organization = prompt('Название организации:');
    if (!organization) return;

    const personsText = prompt('Ответственные лица (через запятую):');
    const names = personsText ? personsText.split(',').map(name => name.trim()).filter(name => name) : [];

    try {
        // Добавить контрагента
        const { data: kontr, error: kontrError } = await supabase.from('контрагенты').insert({ организация: organization }).select().single();
        if (kontrError) throw kontrError;

        // Добавить ответственных лиц
        for (const name of names) {
            await supabase.from('ответственные_лица').insert({
                id_контрагента: kontr.id,
                имя: name
            });
        }

        loadKontragenty();
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
}

function renderNastroyki(settings) {
    const content = document.getElementById('nastroyki-content');

    const html = `
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card shadow">
                    <div class="card-header bg-primary text-white">
                        <h4 class="mb-0">
                            <i class="fas fa-palette me-2"></i>Выбор темы оформления
                        </h4>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group mb-4">
                                    <label for="theme-select" class="form-label fw-bold">
                                        <i class="fas fa-sun me-2"></i>Тема интерфейса
                                    </label>
                                    <select id="theme-select" class="form-select form-select-lg">
                                        <option value="light" ${settings.тема === 'light' ? 'selected' : ''}>
                                            <i class="fas fa-sun me-2"></i>Светлая тема
                                        </option>
                                        <option value="dark" ${settings.тема === 'dark' ? 'selected' : ''}>
                                            <i class="fas fa-moon me-2"></i>Тёмная тема
                                        </option>
                                        <option value="auto" ${settings.тема === 'auto' ? 'selected' : ''}>
                                            <i class="fas fa-adjust me-2"></i>Автоматическая
                                        </option>
                                    </select>
                                    <div class="form-text">
                                        Выберите предпочтительную тему оформления интерфейса
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="theme-preview p-3 border rounded">
                                    <h6 class="fw-bold mb-3">Предварительный просмотр:</h6>
                                    <div class="d-flex justify-content-around">
                                        <div class="theme-option ${settings.тема === 'light' ? 'active' : ''}" onclick="previewTheme('light')">
                                            <div class="theme-sample bg-light border p-2 mb-2">
                                                <div class="bg-primary text-white p-1 mb-1"></div>
                                                <div class="bg-secondary p-1"></div>
                                            </div>
                                            <small class="text-center d-block">Светлая</small>
                                        </div>
                                        <div class="theme-option ${settings.тема === 'dark' ? 'active' : ''}" onclick="previewTheme('dark')">
                                            <div class="theme-sample bg-dark border p-2 mb-2">
                                                <div class="bg-primary text-white p-1 mb-1"></div>
                                                <div class="bg-secondary p-1"></div>
                                            </div>
                                            <small class="text-center d-block">Тёмная</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row mt-4">
                            <div class="col-12 text-center">
                                <button class="btn btn-success btn-lg px-5" onclick="saveTheme()">
                                    <i class="fas fa-save me-2"></i>Сохранить настройки
                                </button>
                                <button class="btn btn-outline-secondary ms-3" onclick="resetTheme()">
                                    <i class="fas fa-undo me-2"></i>Сбросить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Дополнительные настройки -->
                <div class="card mt-4 shadow">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="fas fa-cogs me-2"></i>Дополнительные настройки
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-check form-switch mb-3">
                                    <input class="form-check-input" type="checkbox" id="notifications-enabled">
                                    <label class="form-check-label" for="notifications-enabled">
                                        <i class="fas fa-bell me-2"></i>Включить уведомления
                                    </label>
                                </div>
                                <div class="form-check form-switch mb-3">
                                    <input class="form-check-input" type="checkbox" id="auto-save-enabled">
                                    <label class="form-check-label" for="auto-save-enabled">
                                        <i class="fas fa-save me-2"></i>Автосохранение данных
                                    </label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-check form-switch mb-3">
                                    <input class="form-check-input" type="checkbox" id="compact-view-enabled">
                                    <label class="form-check-label" for="compact-view-enabled">
                                        <i class="fas fa-compress me-2"></i>Компактный вид таблиц
                                    </label>
                                </div>
                                <div class="form-check form-switch mb-3">
                                    <input class="form-check-input" type="checkbox" id="animations-enabled">
                                    <label class="form-check-label" for="animations-enabled">
                                        <i class="fas fa-magic me-2"></i>Включить анимации
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    content.innerHTML = html;

    // Добавить обработчики для предварительного просмотра тем
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

async function saveTheme() {
    const theme = document.getElementById('theme-select').value;
    try {
        const { error } = await supabase.from('настройки').upsert({ id: 1, тема: theme });
        if (error) throw error;

        // Применить тему сразу
        setTheme(theme);
        localStorage.setItem('theme', theme);

        // Показать уведомление об успехе
        showNotification('Тема успешно сохранена!', 'success');
    } catch (error) {
        showNotification('Ошибка сохранения темы: ' + error.message, 'error');
    }
}

function previewTheme(theme) {
    // Временно применить тему для предварительного просмотра
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('theme-select').value = theme;
}

async function resetTheme() {
    try {
        const { error } = await supabase.from('настройки').upsert({ id: 1, тема: 'light' });
        if (error) throw error;

        setTheme('light');
        localStorage.setItem('theme', 'light');
        document.getElementById('theme-select').value = 'light';

        showNotification('Настройки сброшены к значениям по умолчанию', 'info');
        loadNastroyki(); // Перезагрузить настройки
    } catch (error) {
        showNotification('Ошибка сброса настроек: ' + error.message, 'error');
    }
}

function showNotification(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');

    const toast = document.createElement('div');
    toast.className = `toast ${type} fade show`;
    toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">
                <i class="fas fa-${getNotificationIcon(type)} me-2"></i>
                ${getNotificationTitle(type)}
            </strong>
            <button type="button" class="close" onclick="this.parentElement.parentElement.remove()">
                <span>&times;</span>
            </button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;

    toastContainer.appendChild(toast);

    // Автоматически удалить через 5 секунд
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-triangle';
        case 'warning': return 'exclamation-circle';
        default: return 'info-circle';
    }
}

function getNotificationTitle(type) {
    switch(type) {
        case 'success': return 'Успех';
        case 'error': return 'Ошибка';
        case 'warning': return 'Предупреждение';
        default: return 'Информация';
    }
}

function renderUvedomleniya(data) {
    const content = document.getElementById('uvedomleniya-content');

    let html = `
        <!-- Фильтры -->
        <div class="mb-3">
            <div class="row g-2">
                <div class="col-md-4">
                    <input type="text" id="uvedomleniya-filter-date" class="form-control" placeholder="Дата">
                </div>
                <div class="col-md-4">
                    <input type="text" id="uvedomleniya-filter-type" class="form-control" placeholder="Тип уведомления">
                </div>
                <div class="col-md-4">
                    <input type="text" id="uvedomleniya-filter-text" class="form-control" placeholder="Текст уведомления">
                </div>
            </div>
        </div>

        <!-- Управление уведомлениями -->
        <div class="mb-3">
            <div class="row g-2">
                <div class="col-md-6">
                    <button class="btn btn-outline-primary w-100" onclick="refreshUvedomleniya()">
                        <i class="fas fa-sync-alt me-1"></i>Обновить список
                    </button>
                </div>
                <div class="col-md-6">
                    <button class="btn btn-success w-100" onclick="addUved()">
                        <i class="fas fa-plus me-1"></i>Добавить уведомление
                    </button>
                </div>
            </div>
        </div>

        <!-- Таблица -->
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Дата</th>
                        <th>Тип уведомления</th>
                        <th>Текст уведомления</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
    `;

    data.forEach(item => {
        const notificationType = getNotificationTypeIcon(item.тип_уведомления);
        html += `
            <tr>
                <td>${new Date(item.дата).toLocaleDateString('ru-RU')} ${new Date(item.дата).toLocaleTimeString('ru-RU')}</td>
                <td>
                    <span class="badge ${notificationType.class}">
                        <i class="${notificationType.icon} me-1"></i>${item.тип_уведомления || 'Неизвестно'}
                    </span>
                </td>
                <td>${item.текст_уведомления || ''}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-info" onclick="viewUved(${item.id})" title="Просмотреть">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteUved(${item.id})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>

        <!-- Статистика -->
        <div class="mt-4">
            <div class="row text-center">
                <div class="col-md-4">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <h5 class="card-title">${data.length}</h5>
                            <p class="card-text">Всего уведомлений</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <h5 class="card-title">${data.filter(item => item.тип_уведомления === 'Информация').length}</h5>
                            <p class="card-text">Информационных</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card bg-warning text-white">
                        <div class="card-body">
                            <h5 class="card-title">${data.filter(item => item.тип_уведомления === 'Предупреждение').length}</h5>
                            <p class="card-text">Предупреждений</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    content.innerHTML = html;

    // Add filter listeners
    ['date', 'type', 'text'].forEach(field => {
        document.getElementById(`uvedomleniya-filter-${field}`).addEventListener('input', filterUvedomleniya);
    });
}

function getNotificationTypeIcon(type) {
    switch(type) {
        case 'Ошибка':
            return { icon: 'fas fa-exclamation-triangle', class: 'bg-danger' };
        case 'Предупреждение':
            return { icon: 'fas fa-exclamation-circle', class: 'bg-warning text-dark' };
        case 'Информация':
            return { icon: 'fas fa-info-circle', class: 'bg-info' };
        case 'Успех':
            return { icon: 'fas fa-check-circle', class: 'bg-success' };
        default:
            return { icon: 'fas fa-bell', class: 'bg-secondary' };
    }
}

function filterUvedomleniya() {
    const filters = {
        date: document.getElementById('uvedomleniya-filter-date').value.toLowerCase(),
        type: document.getElementById('uvedomleniya-filter-type').value.toLowerCase(),
        text: document.getElementById('uvedomleniya-filter-text').value.toLowerCase()
    };

    const rows = document.querySelectorAll('#uvedomleniya-content tbody tr');
    rows.forEach(row => {
        const cells = row.cells;
        const matches =
            cells[0].textContent.toLowerCase().includes(filters.date) &&
            cells[1].textContent.toLowerCase().includes(filters.type) &&
            cells[2].textContent.toLowerCase().includes(filters.text);

        row.style.display = matches ? '' : 'none';
    });
}

async function refreshUvedomleniya() {
    await loadUvedomleniya();
}

async function deleteUved(id) {
    if (confirm('Удалить уведомление?')) {
        try {
            const { error } = await supabase.from('уведомления').delete().eq('id', id);
            if (error) throw error;
            loadUvedomleniya();
            showNotification('Уведомление удалено', 'success');
        } catch (error) {
            showNotification('Ошибка удаления: ' + error.message, 'error');
        }
    }
}

async function addUved() {
    const type = prompt('Тип уведомления (Ошибка/Предупреждение/Информация/Успех):');
    const text = prompt('Текст уведомления:');

    if (type && text) {
        try {
            const { error } = await supabase.from('уведомления').insert({
                тип_уведомления: type,
                текст_уведомления: text
            });
            if (error) throw error;
            loadUvedomleniya();
            showNotification('Уведомление добавлено', 'success');
        } catch (error) {
            showNotification('Ошибка добавления: ' + error.message, 'error');
        }
    }
}

async function viewUved(id) {
    try {
        const { data, error } = await supabase.from('уведомления').select('*').eq('id', id).single();
        if (error) throw error;

        const notificationType = getNotificationTypeIcon(data.тип_уведомления);

        // Показать модальное окно с деталями
        const modalHtml = `
            <div class="modal fade" id="notificationModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="${notificationType.icon} me-2"></i>Уведомление
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <strong>Дата:</strong> ${new Date(data.дата).toLocaleString('ru-RU')}
                            </div>
                            <div class="mb-3">
                                <strong>Тип:</strong>
                                <span class="badge ${notificationType.class} ms-2">
                                    ${data.тип_уведомления}
                                </span>
                            </div>
                            <div class="mb-3">
                                <strong>Текст:</strong>
                                <div class="alert alert-light mt-2">${data.текст_уведомления}</div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Добавить модальное окно в DOM
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Показать модальное окно
        const modal = new bootstrap.Modal(document.getElementById('notificationModal'));
        modal.show();

        // Удалить модальное окно после закрытия
        document.getElementById('notificationModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });

    } catch (error) {
        showNotification('Ошибка просмотра уведомления: ' + error.message, 'error');
    }
}

async function testConnection() {
    const status = document.getElementById('connection-status');
    const startTime = Date.now();

    status.innerHTML = `
        <div class="alert alert-info">
            <i class="fas fa-spinner fa-spin me-2"></i>Тестирование соединения...
        </div>
    `;

    try {
        const { data, error } = await supabase.from('склад').select('count', { count: 'exact' }).limit(1);
        const responseTime = Date.now() - startTime;

        if (error) throw error;

        status.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle me-2"></i>Соединение успешно!
                <br><small>Время ответа: ${responseTime}ms</small>
            </div>
        `;

        document.getElementById('db-status').className = 'badge bg-success';
        document.getElementById('db-status').textContent = 'Подключено';
        document.getElementById('last-test-time').textContent = new Date().toLocaleTimeString('ru-RU');

        logMessage(`✅ Соединение успешно (${responseTime}ms)`);
        logMessage(`📊 Доступно записей в таблице склад: ${data.length || 0}`);

    } catch (error) {
        const responseTime = Date.now() - startTime;

        status.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>Ошибка соединения!
                <br><small>Код ошибки: ${error.code || 'Неизвестен'}</small>
                <br><small>Время ответа: ${responseTime}ms</small>
                <br><small>Сообщение: ${error.message}</small>
            </div>
        `;

        document.getElementById('db-status').className = 'badge bg-danger';
        document.getElementById('db-status').textContent = 'Ошибка';

        logMessage(`❌ Ошибка соединения (${responseTime}ms)`);
        logMessage(`🔍 Код ошибки: ${error.code || 'Неизвестен'}`);
        logMessage(`📝 Сообщение: ${error.message}`);
    }
}

async function testTable() {
    const table = document.getElementById('table-select').value;
    const resultDiv = document.getElementById('table-test-result');
    const startTime = Date.now();

    resultDiv.innerHTML = `
        <div class="alert alert-info">
            <i class="fas fa-spinner fa-spin me-2"></i>Тестирование таблицы ${table}...
        </div>
    `;

    try {
        const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact' })
            .limit(5);

        const responseTime = Date.now() - startTime;

        if (error) throw error;

        resultDiv.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle me-2"></i>Таблица ${table} доступна
                <br><small>Всего записей: ${count}</small>
                <br><small>Время ответа: ${responseTime}ms</small>
            </div>
        `;

        logMessage(`✅ Таблица ${table}: ${count} записей (${responseTime}ms)`);
        if (data && data.length > 0) {
            logMessage(`📋 Пример данных: ${JSON.stringify(data[0], null, 2)}`);
        }

    } catch (error) {
        const responseTime = Date.now() - startTime;

        resultDiv.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>Ошибка тестирования таблицы ${table}
                <br><small>Код ошибки: ${error.code || 'Неизвестен'}</small>
                <br><small>Время ответа: ${responseTime}ms</small>
            </div>
        `;

        logMessage(`❌ Ошибка таблицы ${table} (${responseTime}ms)`);
        logMessage(`🔍 Код ошибки: ${error.code || 'Неизвестен'}`);
        logMessage(`📝 Сообщение: ${error.message}`);
    }
}

async function testAllTables() {
    const tables = [
        'склад', 'сборка', 'приход', 'выданное',
        'контрагенты', 'ответственные_лица', 'настройки',
        'уведомления', 'операции'
    ];

    logMessage('🚀 Начало тестирования всех таблиц');

    for (const table of tables) {
        try {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                logMessage(`❌ Таблица ${table}: Ошибка - ${error.message}`);
            } else {
                logMessage(`✅ Таблица ${table}: ${count} записей`);
            }
        } catch (error) {
            logMessage(`❌ Таблица ${table}: Исключение - ${error.message}`);
        }

        // Небольшая задержка между запросами
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    logMessage('🏁 Тестирование всех таблиц завершено');
}

function logMessage(message) {
    const log = document.getElementById('log-area');
    const timestamp = new Date().toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const logEntry = `[${timestamp}] ${message}\n`;
    log.value += logEntry;

    // Автоматическая прокрутка вниз
    log.scrollTop = log.scrollHeight;

    console.log(message); // Также выводим в консоль браузера
}

function copyLog() {
    const log = document.getElementById('log-area');
    if (log.value.trim() === '') {
        showNotification('Лог пуст', 'warning');
        return;
    }

    navigator.clipboard.writeText(log.value).then(() => {
        showNotification('Лог скопирован в буфер обмена', 'success');
    }).catch(() => {
        showNotification('Ошибка копирования лога', 'error');
    });
}

function clearLog() {
    const log = document.getElementById('log-area');
    if (confirm('Очистить лог запросов?')) {
        log.value = '';
        logMessage('🧹 Лог очищен пользователем');
        showNotification('Лог очищен', 'info');
    }
}

function exportLog() {
    const log = document.getElementById('log-area');
    if (log.value.trim() === '') {
        showNotification('Лог пуст, нечего экспортировать', 'warning');
        return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `debug_log_${timestamp}.txt`;

    const blob = new Blob([log.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
    logMessage(`📤 Лог экспортирован в файл: ${filename}`);
    showNotification(`Лог экспортирован: ${filename}`, 'success');
}

// Debug System Variables
let debugLog = [];
const MAX_LOG_ENTRIES = 100;

// Error Codes and Messages
const ERROR_CODES = {
    DB_CONN_001: {
        message: 'Ошибка подключения к базе данных',
        recommendation: 'Проверьте Project URL и API Key в настройках приложения'
    },
    DB_AUTH_002: {
        message: 'Ошибка авторизации',
        recommendation: 'Обновите anon-ключ в настройках Supabase'
    },
    DB_TABLE_003: {
        message: 'Таблица не найдена',
        recommendation: 'Проверьте структуру базы данных, возможно требуется миграция'
    },
    DB_QUERY_004: {
        message: 'Ошибка выполнения запроса',
        recommendation: 'Проверьте синтаксис запроса и структуру таблицы'
    }
};

// Initialize Debug System
async function initializeDebugSystem() {
    // Load log from localStorage
    const savedLog = localStorage.getItem('debugLog');
    if (savedLog) {
        debugLog = JSON.parse(savedLog);
        updateLogDisplay();
    }

    // Create debug test table if not exists
    await createDebugTable();

    logOperation('system', 'info', 'Система отладки инициализирована');
}

// Create Debug Test Table
async function createDebugTable() {
    try {
        // Check if debug_test table exists
        const { error } = await supabase
            .from('debug_test')
            .select('id')
            .limit(1);

        if (error && error.code === 'PGRST116') {
            // Table doesn't exist, we'll handle this in individual operations
            console.log('Debug table will be created on first use');
        }
    } catch (e) {
        console.log('Debug table check completed');
    }
}

// Log Operation
function logOperation(type, status, description, executionTime = null, errorCode = null) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        type: type,
        status: status,
        description: description,
        executionTime: executionTime,
        errorCode: errorCode
    };

    debugLog.unshift(logEntry);

    // Keep only last 100 entries
    if (debugLog.length > MAX_LOG_ENTRIES) {
        debugLog = debugLog.slice(0, MAX_LOG_ENTRIES);
    }

    // Save to localStorage
    localStorage.setItem('debugLog', JSON.stringify(debugLog));

    updateLogDisplay();
}

// Update Log Display
function updateLogDisplay() {
    const tbody = document.getElementById('log-table-body');
    const count = document.getElementById('log-count');

    if (!tbody || !count) {
        console.log('Log display elements not found, skipping update');
        return;
    }

    count.textContent = `${debugLog.length} записей`;

    if (debugLog.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    <i class="fas fa-info-circle me-2"></i>Журнал пуст
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = debugLog.map(entry => {
        const time = new Date(entry.timestamp).toLocaleString('ru-RU');
        const statusClass = getStatusClass(entry.status);
        const statusIcon = getStatusIcon(entry.status);

        return `
            <tr class="${statusClass}" title="${entry.errorCode ? ERROR_CODES[entry.errorCode]?.recommendation || '' : ''}">
                <td>${time}</td>
                <td><span class="badge bg-secondary">${entry.type}</span></td>
                <td>${statusIcon} ${entry.status}</td>
                <td>${entry.description}</td>
                <td>${entry.executionTime ? entry.executionTime + 'ms' : '-'}</td>
            </tr>
        `;
    }).join('');
}

// Get Status Class for Table Row
function getStatusClass(status) {
    switch (status) {
        case 'success': return 'table-success';
        case 'warning': return 'table-warning';
        case 'error': return 'table-danger';
        default: return '';
    }
}

// Get Status Icon
function getStatusIcon(status) {
    switch (status) {
        case 'success': return '<i class="fas fa-check-circle text-success"></i>';
        case 'warning': return '<i class="fas fa-exclamation-triangle text-warning"></i>';
        case 'error': return '<i class="fas fa-times-circle text-danger"></i>';
        default: return '<i class="fas fa-info-circle text-info"></i>';
    }
}

// Check Connection
async function checkConnection() {
    const startTime = Date.now();
    const statusPanel = document.getElementById('connection-status-panel');
    const statusLight = document.getElementById('status-light');
    const statusText = document.getElementById('status-text');
    const responseTime = document.getElementById('response-time');
    const lastCheck = document.getElementById('last-check');

    if (!statusPanel || !statusLight || !statusText || !responseTime || !lastCheck) {
        console.error('Connection status elements not found');
        return;
    }

    // Set checking state
    statusLight.className = 'status-light checking';
    statusText.textContent = 'Проверка...';
    responseTime.textContent = '-';

    try {
        // Test connection with a simple query
        const { data, error } = await supabase
            .from('склад')
            .select('count', { count: 'exact', head: true });

        const executionTime = Date.now() - startTime;

        if (error) {
            throw error;
        }

        // Determine status based on response time
        let status, statusClass, statusMessage;
        if (executionTime < 500) {
            status = 'success';
            statusClass = 'success';
            statusMessage = 'Подключение успешно';
        } else {
            status = 'warning';
            statusClass = 'warning';
            statusMessage = 'Подключение медленное';
        }

        statusLight.className = `status-light ${statusClass}`;
        statusText.textContent = statusMessage;
        responseTime.textContent = `${executionTime}ms`;
        lastCheck.textContent = new Date().toLocaleTimeString('ru-RU');

        logOperation('connection', status, statusMessage, executionTime);

    } catch (error) {
        const executionTime = Date.now() - startTime;

        statusLight.className = 'status-light error';
        statusText.textContent = 'Ошибка подключения';
        responseTime.textContent = `${executionTime}ms`;
        lastCheck.textContent = new Date().toLocaleTimeString('ru-RU');

        const errorCode = getErrorCode(error);
        logOperation('connection', 'error', ERROR_CODES[errorCode].message, executionTime, errorCode);
    }
}

// Test Write Operation
async function testWrite() {
    const startTime = Date.now();
    const resultsPanel = document.getElementById('test-results-panel');

    if (!resultsPanel) {
        console.error('Test results panel not found');
        return;
    }

    try {
        const testValue = `Тестовая запись от ${new Date().toLocaleString('ru-RU')}`;

        const { data, error } = await supabase
            .from('debug_test')
            .insert({
                test_value: testValue
            })
            .select();

        if (error) {
            throw error;
        }

        const executionTime = Date.now() - startTime;
        const recordId = data[0]?.id;

        resultsPanel.innerHTML = `
            <div class="test-result success">
                <div class="result-header">
                    <i class="fas fa-check-circle"></i>
                    <h6>Тест записи выполнен успешно</h6>
                </div>
                <div class="result-details">
                    <div class="detail-item">
                        <span class="detail-label">ID записи:</span>
                        <span class="detail-value">${recordId}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Значение:</span>
                        <span class="detail-value">${testValue}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Время выполнения:</span>
                        <span class="detail-value">${executionTime}ms</span>
                    </div>
                </div>
            </div>
        `;

        logOperation('write', 'success', `Создана запись с ID ${recordId}`, executionTime);

    } catch (error) {
        const executionTime = Date.now() - startTime;
        const errorCode = getErrorCode(error);

        resultsPanel.innerHTML = `
            <div class="test-result error">
                <div class="result-header">
                    <i class="fas fa-times-circle"></i>
                    <h6>Ошибка при записи данных</h6>
                </div>
                <div class="result-details">
                    <div class="detail-item">
                        <span class="detail-label">Код ошибки:</span>
                        <span class="detail-value">${errorCode}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Сообщение:</span>
                        <span class="detail-value">${ERROR_CODES[errorCode].message}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Рекомендация:</span>
                        <span class="detail-value">${ERROR_CODES[errorCode].recommendation}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Время выполнения:</span>
                        <span class="detail-value">${executionTime}ms</span>
                    </div>
                </div>
            </div>
        `;

        logOperation('write', 'error', ERROR_CODES[errorCode].message, executionTime, errorCode);
    }
}

// Test Read Operation
async function testRead() {
    const startTime = Date.now();
    const resultsPanel = document.getElementById('test-results-panel');

    if (!resultsPanel) {
        console.error('Test results panel not found');
        return;
    }

    try {
        const { data, error } = await supabase
            .from('debug_test')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            throw error;
        }

        const executionTime = Date.now() - startTime;

        let recordsHtml = '';
        if (data && data.length > 0) {
            recordsHtml = data.map(record => `
                <tr>
                    <td>${record.id}</td>
                    <td>${new Date(record.created_at).toLocaleString('ru-RU')}</td>
                    <td>${record.test_value}</td>
                </tr>
            `).join('');
        } else {
            recordsHtml = `
                <tr>
                    <td colspan="3" class="text-center text-muted">Нет записей для отображения</td>
                </tr>
            `;
        }

        resultsPanel.innerHTML = `
            <div class="test-result success">
                <div class="result-header">
                    <i class="fas fa-check-circle"></i>
                    <h6>Тест чтения выполнен успешно</h6>
                </div>
                <div class="result-details">
                    <div class="detail-item">
                        <span class="detail-label">Найдено записей:</span>
                        <span class="detail-value">${data?.length || 0}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Время выполнения:</span>
                        <span class="detail-value">${executionTime}ms</span>
                    </div>
                </div>
                <div class="records-table">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Дата создания</th>
                                <th>Значение</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recordsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        logOperation('read', 'success', `Прочитано ${data?.length || 0} записей`, executionTime);

    } catch (error) {
        const executionTime = Date.now() - startTime;
        const errorCode = getErrorCode(error);

        resultsPanel.innerHTML = `
            <div class="test-result error">
                <div class="result-header">
                    <i class="fas fa-times-circle"></i>
                    <h6>Ошибка при чтении данных</h6>
                </div>
                <div class="result-details">
                    <div class="detail-item">
                        <span class="detail-label">Код ошибки:</span>
                        <span class="detail-value">${errorCode}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Сообщение:</span>
                        <span class="detail-value">${ERROR_CODES[errorCode].message}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Рекомендация:</span>
                        <span class="detail-value">${ERROR_CODES[errorCode].recommendation}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Время выполнения:</span>
                        <span class="detail-value">${executionTime}ms</span>
                    </div>
                </div>
            </div>
        `;

        logOperation('read', 'error', ERROR_CODES[errorCode].message, executionTime, errorCode);
    }
}

// Run Stress Test
async function runStressTest() {
    const requestsCount = parseInt(document.getElementById('stress-requests').value) || 10;
    const requestType = document.getElementById('stress-type').value;
    const resultsPanel = document.getElementById('test-results-panel');

    if (!resultsPanel) {
        console.error('Test results panel not found');
        return;
    }

    resultsPanel.innerHTML = `
        <div class="test-result info">
            <div class="result-header">
                <i class="fas fa-spinner fa-spin"></i>
                <h6>Выполняется стресс-тест...</h6>
            </div>
            <div class="result-details">
                <div class="detail-item">
                    <span class="detail-label">Запросов:</span>
                    <span class="detail-value">${requestsCount}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Тип:</span>
                    <span class="detail-value">${requestType === 'write' ? 'Запись' : 'Чтение'}</span>
                </div>
            </div>
        </div>
    `;

    const startTime = Date.now();
    const responseTimes = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < requestsCount; i++) {
        const requestStart = Date.now();

        try {
            if (requestType === 'write') {
                const testValue = `Стресс-тест ${i + 1} от ${new Date().toLocaleString('ru-RU')}`;
                const { error } = await supabase
                    .from('debug_test')
                    .insert({ test_value: testValue });

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('debug_test')
                    .select('id')
                    .limit(1);

                if (error) throw error;
            }

            successCount++;
            responseTimes.push(Date.now() - requestStart);

        } catch (error) {
            errorCount++;
            responseTimes.push(Date.now() - requestStart);
        }

        // Update progress
        const progress = Math.round((i + 1) / requestsCount * 100);
        resultsPanel.innerHTML = `
            <div class="test-result info">
                <div class="result-header">
                    <i class="fas fa-spinner fa-spin"></i>
                    <h6>Выполняется стресс-тест... ${progress}%</h6>
                </div>
                <div class="result-details">
                    <div class="detail-item">
                        <span class="detail-label">Выполнено:</span>
                        <span class="detail-value">${i + 1}/${requestsCount}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Успешно:</span>
                        <span class="detail-value">${successCount}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Ошибок:</span>
                        <span class="detail-value">${errorCount}</span>
                    </div>
                </div>
            </div>
        `;
    }

    const totalTime = Date.now() - startTime;
    const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

    resultsPanel.innerHTML = `
        <div class="test-result ${errorCount === 0 ? 'success' : 'warning'}">
            <div class="result-header">
                <i class="fas fa-${errorCount === 0 ? 'check-circle' : 'exclamation-triangle'}"></i>
                <h6>Стресс-тест завершен</h6>
            </div>
            <div class="result-details">
                <div class="detail-item">
                    <span class="detail-label">Общее время:</span>
                    <span class="detail-value">${totalTime}ms</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Среднее время:</span>
                    <span class="detail-value">${Math.round(avgTime)}ms</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Успешных запросов:</span>
                    <span class="detail-value">${successCount}/${requestsCount}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Ошибок:</span>
                    <span class="detail-value">${errorCount}</span>
                </div>
            </div>
        </div>
    `;

    logOperation('stress', errorCount === 0 ? 'success' : 'warning',
        `Стресс-тест: ${successCount}/${requestsCount} успешных, среднее время ${Math.round(avgTime)}ms`,
        totalTime);
}

// Get Error Code from Error
function getErrorCode(error) {
    if (error.message.includes('JWT') || error.message.includes('auth')) {
        return 'DB_AUTH_002';
    }
    if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return 'DB_TABLE_003';
    }
    if (error.code === 'PGRST116' || error.message.includes('connection')) {
        return 'DB_CONN_001';
    }
    return 'DB_QUERY_004';
}

// Clear Log Filters
function clearLogFilters() {
    document.getElementById('log-type-filter').value = '';
    document.getElementById('log-status-filter').value = '';
    document.getElementById('log-search').value = '';
    updateLogDisplay();
}

// Copy Log
function copyLog() {
    const logText = debugLog.map(entry =>
        `${new Date(entry.timestamp).toLocaleString('ru-RU')} [${entry.type}] ${entry.status}: ${entry.description}`
    ).join('\n');

    navigator.clipboard.writeText(logText).then(() => {
        showNotification('Лог скопирован в буфер обмена', 'success');
    });
}

// Clear Log
function clearLog() {
    if (confirm('Очистить журнал операций?')) {
        debugLog = [];
        localStorage.removeItem('debugLog');
        updateLogDisplay();
        logOperation('system', 'info', 'Журнал очищен');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    showSection('sklad');
});