// Supabase configuration
const SUPABASE_URL = 'https://tqwagbbppfklqgmyyrwj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxd2FnYmJwcGZrbHFnbXl5cndqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mjk2MjAsImV4cCI6MjA3MTEwNTYyMH0.C4d6-aNDisajHcg7lurnRHdbk-pe3AvE4AIaW_e53eE';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global variables
let currentSection = 'sklad';

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
        <div class="row">
            <div class="col-md-6">
                <!-- Тестирование соединения -->
                <div class="card mb-4">
                    <div class="card-header bg-info text-white">
                        <h5 class="mb-0">
                            <i class="fas fa-plug me-2"></i>Тестирование соединения с СУБД
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="d-grid gap-2">
                            <button class="btn btn-success" onclick="testConnection()">
                                <i class="fas fa-play me-2"></i>Тест соединения
                            </button>
                        </div>
                        <div id="connection-status" class="mt-3">
                            <div class="alert alert-secondary">
                                <i class="fas fa-info-circle me-2"></i>Нажмите кнопку для тестирования
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Выбор таблицы для тестирования -->
                <div class="card mb-4">
                    <div class="card-header bg-warning text-dark">
                        <h5 class="mb-0">
                            <i class="fas fa-table me-2"></i>Выбор таблицы для тестирования
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="table-select" class="form-label">Выберите таблицу:</label>
                            <select id="table-select" class="form-select">
                                <option value="склад">Склад</option>
                                <option value="сборка">Сборка</option>
                                <option value="приход">Приход</option>
                                <option value="выданное">Выданное</option>
                                <option value="контрагенты">Контрагенты</option>
                                <option value="ответственные_лица">Ответственные лица</option>
                                <option value="настройки">Настройки</option>
                                <option value="уведомления">Уведомления</option>
                                <option value="операции">Операции</option>
                            </select>
                        </div>
                        <div class="d-grid gap-2">
                            <button class="btn btn-primary" onclick="testTable()">
                                <i class="fas fa-search me-2"></i>Тест таблицы
                            </button>
                            <button class="btn btn-outline-secondary" onclick="testAllTables()">
                                <i class="fas fa-list me-2"></i>Тест всех таблиц
                            </button>
                        </div>
                        <div id="table-test-result" class="mt-3"></div>
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <!-- Лог запросов -->
                <div class="card">
                    <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="fas fa-terminal me-2"></i>Лог запросов и ответов
                        </h5>
                        <small class="text-light">Коды ошибок с расшифровкой</small>
                    </div>
                    <div class="card-body p-0">
                        <textarea id="log-area" class="form-control border-0" rows="15" readonly
                            style="resize: none; font-family: 'Courier New', monospace; font-size: 12px;"></textarea>
                    </div>
                    <div class="card-footer">
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
                        <div class="mt-2">
                            <button class="btn btn-outline-success w-100" onclick="exportLog()">
                                <i class="fas fa-file-export me-1"></i>Экспорт в txt
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Дополнительная информация -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="fas fa-info-circle me-2"></i>Информация о системе
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Supabase URL:</strong> <code>https://tqwagbbppfklqgmyyrwj.supabase.co</code></p>
                                <p><strong>Время последнего теста:</strong> <span id="last-test-time">-</span></p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Версия приложения:</strong> 1.0.0</p>
                                <p><strong>Статус БД:</strong> <span id="db-status" class="badge bg-secondary">Неизвестно</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    content.innerHTML = html;
}

// Render Sklad table
function renderSkladTable(data) {
    const content = document.getElementById('sklad-content');
    let html = `
        <div class="mb-3">
            <div class="row g-2">
                <div class="col-md-2">
                    <input type="text" id="sklad-filter-id" class="form-control" placeholder="ID">
                </div>
                <div class="col-md-3">
                    <input type="text" id="sklad-filter-name" class="form-control" placeholder="Наименование">
                </div>
                <div class="col-md-2">
                    <input type="text" id="sklad-filter-unit" class="form-control" placeholder="Ед.изм.">
                </div>
                <div class="col-md-2">
                    <input type="text" id="sklad-filter-accounted" class="form-control" placeholder="Числится">
                </div>
                <div class="col-md-2">
                    <input type="text" id="sklad-filter-stock" class="form-control" placeholder="На складе">
                </div>
                <div class="col-md-1">
                    <input type="text" id="sklad-filter-issued" class="form-control" placeholder="Выдано">
                </div>
            </div>
        </div>
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Наименование</th>
                        <th>Ед.изм.</th>
                        <th>Числится</th>
                        <th>На складе</th>
                        <th>Выдано</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
    `;
    data.forEach(item => {
        html += `
            <tr>
                <td>${item.id}</td>
                <td>${item.наименование}</td>
                <td>${item.ед_изм}</td>
                <td>${item.числится}</td>
                <td>${item.на_складе}</td>
                <td>${item.выдано}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="editSklad(${item.id})" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteSklad(${item.id})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="transferToSborka(${item.id})" title="Передать в сборку">
                            <i class="fas fa-arrow-right"></i>
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
        <div class="mt-3">
            <button class="btn btn-primary" onclick="addSklad()">
                <i class="fas fa-plus me-2"></i>Добавить товар
            </button>
        </div>
    `;
    content.innerHTML = html;

    // Add filter listeners for all columns
    ['id', 'name', 'unit', 'accounted', 'stock', 'issued'].forEach(field => {
        document.getElementById(`sklad-filter-${field}`).addEventListener('input', filterSklad);
    });
}

function filterSklad() {
    const filters = {
        id: document.getElementById('sklad-filter-id').value.toLowerCase(),
        name: document.getElementById('sklad-filter-name').value.toLowerCase(),
        unit: document.getElementById('sklad-filter-unit').value.toLowerCase(),
        accounted: document.getElementById('sklad-filter-accounted').value.toLowerCase(),
        stock: document.getElementById('sklad-filter-stock').value.toLowerCase(),
        issued: document.getElementById('sklad-filter-issued').value.toLowerCase()
    };

    const rows = document.querySelectorAll('#sklad-content tbody tr');
    rows.forEach(row => {
        const cells = row.cells;
        const matches =
            cells[0].textContent.toLowerCase().includes(filters.id) &&
            cells[1].textContent.toLowerCase().includes(filters.name) &&
            cells[2].textContent.toLowerCase().includes(filters.unit) &&
            cells[3].textContent.toLowerCase().includes(filters.accounted) &&
            cells[4].textContent.toLowerCase().includes(filters.stock) &&
            cells[5].textContent.toLowerCase().includes(filters.issued);

        row.style.display = matches ? '' : 'none';
    });
}

function filterSborka() {
    const filters = {
        id: document.getElementById('sborka-filter-id').value.toLowerCase(),
        name: document.getElementById('sborka-filter-name').value.toLowerCase(),
        unit: document.getElementById('sborka-filter-unit').value.toLowerCase(),
        quantity: document.getElementById('sborka-filter-quantity').value.toLowerCase()
    };

    const rows = document.querySelectorAll('#sborka-content tbody tr');
    rows.forEach(row => {
        const cells = row.cells;
        const matches =
            cells[0].textContent.toLowerCase().includes(filters.id) &&
            cells[1].textContent.toLowerCase().includes(filters.name) &&
            cells[2].textContent.toLowerCase().includes(filters.unit) &&
            cells[3].textContent.toLowerCase().includes(filters.quantity);

        row.style.display = matches ? '' : 'none';
    });
}

function filterPrihod() {
    const filters = {
        date: document.getElementById('prihod-filter-date').value.toLowerCase(),
        name: document.getElementById('prihod-filter-name').value.toLowerCase(),
        unit: document.getElementById('prihod-filter-unit').value.toLowerCase(),
        quantity: document.getElementById('prihod-filter-quantity').value.toLowerCase(),
        registry: document.getElementById('prihod-filter-registry').value.toLowerCase(),
        upd: document.getElementById('prihod-filter-upd').value.toLowerCase()
    };

    const rows = document.querySelectorAll('#prihod-content tbody tr');
    rows.forEach(row => {
        const cells = row.cells;
        const matches =
            cells[0].textContent.toLowerCase().includes(filters.date) &&
            cells[1].textContent.toLowerCase().includes(filters.name) &&
            cells[2].textContent.toLowerCase().includes(filters.unit) &&
            cells[3].textContent.toLowerCase().includes(filters.quantity) &&
            cells[4].textContent.toLowerCase().includes(filters.registry) &&
            cells[5].textContent.toLowerCase().includes(filters.upd);

        row.style.display = matches ? '' : 'none';
    });
}

function filterVydannoe() {
    const filters = {
        date: document.getElementById('vydannoe-filter-date').value.toLowerCase(),
        id: document.getElementById('vydannoe-filter-id').value.toLowerCase(),
        name: document.getElementById('vydannoe-filter-name').value.toLowerCase(),
        registry: document.getElementById('vydannoe-filter-registry').value.toLowerCase(),
        upd: document.getElementById('vydannoe-filter-upd').value.toLowerCase(),
        contractor: document.getElementById('vydannoe-filter-contractor').value,
        responsible: document.getElementById('vydannoe-filter-responsible').value
    };

    const rows = document.querySelectorAll('#vydannoe-content tbody tr');
    rows.forEach(row => {
        const cells = row.cells;
        const matches =
            cells[0].textContent.toLowerCase().includes(filters.date) &&
            cells[1].textContent.toLowerCase().includes(filters.id) &&
            cells[2].textContent.toLowerCase().includes(filters.name) &&
            cells[7].textContent.toLowerCase().includes(filters.registry) &&
            cells[8].textContent.toLowerCase().includes(filters.upd) &&
            (filters.contractor === '' || cells[5].textContent.includes(filters.contractor)) &&
            (filters.responsible === '' || cells[6].textContent.includes(filters.responsible));

        row.style.display = matches ? '' : 'none';
    });
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

function renderSborkaTable(data) {
    const content = document.getElementById('sborka-content');
    let html = `
        <!-- Кнопки управления -->
        <div class="mb-3">
            <button class="btn btn-outline-primary me-2" onclick="refreshSborka()">
                <i class="fas fa-sync-alt me-1"></i>Обновить
            </button>
            <button class="btn btn-primary" onclick="addSborka()">
                <i class="fas fa-plus me-1"></i>Добавить
            </button>
        </div>

        <!-- Фильтры -->
        <div class="mb-3">
            <div class="row g-2">
                <div class="col-md-3">
                    <input type="text" id="sborka-filter-id" class="form-control" placeholder="ID">
                </div>
                <div class="col-md-4">
                    <input type="text" id="sborka-filter-name" class="form-control" placeholder="Наименование">
                </div>
                <div class="col-md-3">
                    <input type="text" id="sborka-filter-unit" class="form-control" placeholder="Ед.изм.">
                </div>
                <div class="col-md-2">
                    <input type="text" id="sborka-filter-quantity" class="form-control" placeholder="Количество">
                </div>
            </div>
        </div>

        <!-- Таблица -->
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Наименование</th>
                        <th>Ед.изм.</th>
                        <th>Количество</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
    `;
    data.forEach(item => {
        html += `
            <tr>
                <td>${item.id}</td>
                <td>${item.наименование}</td>
                <td>${item.ед_изм}</td>
                <td>${item.количество}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="editSborka(${item.id})" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteSborka(${item.id})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="transferToSborkaFromSborka(${item.id})" title="Передать в сборку">
                            <i class="fas fa-arrow-right"></i>
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
    `;
    content.innerHTML = html;

    // Add filter listeners
    ['id', 'name', 'unit', 'quantity'].forEach(field => {
        document.getElementById(`sborka-filter-${field}`).addEventListener('input', filterSborka);
    });
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

function renderPrihodTable(data) {
    const content = document.getElementById('prihod-content');

    // Фильтры
    let html = `
        <div class="mb-3">
            <div class="row g-2">
                <div class="col-md-2">
                    <input type="text" id="prihod-filter-date" class="form-control" placeholder="Дата">
                </div>
                <div class="col-md-3">
                    <input type="text" id="prihod-filter-name" class="form-control" placeholder="Наименование">
                </div>
                <div class="col-md-2">
                    <input type="text" id="prihod-filter-unit" class="form-control" placeholder="Ед.изм.">
                </div>
                <div class="col-md-2">
                    <input type="text" id="prihod-filter-quantity" class="form-control" placeholder="Количество">
                </div>
                <div class="col-md-2">
                    <input type="text" id="prihod-filter-registry" class="form-control" placeholder="Реестровый номер">
                </div>
                <div class="col-md-1">
                    <input type="text" id="prihod-filter-upd" class="form-control" placeholder="УПД">
                </div>
            </div>
        </div>

        <!-- Секция 1: Принятие прихода -->
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

        <!-- Секция 2: Документы прихода -->
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

        <!-- Секция 3: Редактирование -->
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

        <!-- Таблица -->
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Дата</th>
                        <th>Наименование</th>
                        <th>Ед.изм.</th>
                        <th>Количество</th>
                        <th>Реестровый номер</th>
                        <th>УПД</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
    `;
    data.forEach(item => {
        html += `
            <tr>
                <td>${new Date(item.дата).toLocaleDateString('ru-RU')}</td>
                <td>${item.наименование || ''}</td>
                <td>${item.ед_изм || ''}</td>
                <td>${item.количество || ''}</td>
                <td>${item.реестровый_номер || ''}</td>
                <td>${item.upd || ''}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="editPrihod(${item.id})" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deletePrihod(${item.id})" title="Удалить">
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
    `;
    content.innerHTML = html;

    // Add filter listeners
    ['date', 'name', 'unit', 'quantity', 'registry', 'upd'].forEach(field => {
        document.getElementById(`prihod-filter-${field}`).addEventListener('input', filterPrihod);
    });
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

function renderVydannoeTable(data, kontragenty, persons) {
    const content = document.getElementById('vydannoe-content');

    // Создать карты для быстрого поиска
    const kontrMap = {};
    kontragenty.forEach(k => kontrMap[k.id] = k.организация);

    const personsMap = {};
    persons.forEach(p => {
        if (!personsMap[p.id_контрагента]) personsMap[p.id_контрагента] = [];
        personsMap[p.id_контрагента].push(p.имя);
    });

    let html = `
        <!-- Фильтры -->
        <div class="mb-3">
            <div class="row g-2">
                <div class="col-md-2">
                    <input type="text" id="vydannoe-filter-date" class="form-control" placeholder="Дата">
                </div>
                <div class="col-md-2">
                    <input type="text" id="vydannoe-filter-id" class="form-control" placeholder="ID">
                </div>
                <div class="col-md-3">
                    <input type="text" id="vydannoe-filter-name" class="form-control" placeholder="Наименование">
                </div>
                <div class="col-md-2">
                    <input type="text" id="vydannoe-filter-registry" class="form-control" placeholder="Реестровый номер">
                </div>
                <div class="col-md-2">
                    <input type="text" id="vydannoe-filter-upd" class="form-control" placeholder="УПД">
                </div>
            </div>
            <div class="row g-2 mt-2">
                <div class="col-md-4">
                    <select id="vydannoe-filter-contractor" class="form-select">
                        <option value="">Все контрагенты</option>
    `;
    kontragenty.forEach(k => {
        html += `<option value="${k.id}">${k.организация}</option>`;
    });
    html += `
                    </select>
                </div>
                <div class="col-md-4">
                    <select id="vydannoe-filter-responsible" class="form-select">
                        <option value="">Все ответственные</option>
    `;
    // Соберем уникальных ответственных
    const uniquePersons = [...new Set(persons.map(p => p.имя))];
    uniquePersons.forEach(name => {
        html += `<option value="${name}">${name}</option>`;
    });
    html += `
                    </select>
                </div>
            </div>
        </div>

        <!-- Таблица -->
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Дата</th>
                        <th>ID</th>
                        <th>Наименование</th>
                        <th>Ед.изм.</th>
                        <th>Количество</th>
                        <th>Контрагент</th>
                        <th>Ответственный</th>
                        <th>Реестровый номер</th>
                        <th>УПД</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
    `;
    data.forEach(item => {
        html += `
            <tr>
                <td>${new Date(item.дата).toLocaleDateString('ru-RU')}</td>
                <td>${item.id}</td>
                <td>${item.наименование || ''}</td>
                <td>${item.ед_изм || ''}</td>
                <td>${item.количество || ''}</td>
                <td>${item.контрагент || ''}</td>
                <td>${item.ответственный || ''}</td>
                <td>${item.реестровый_номер || ''}</td>
                <td>${item.upd || ''}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="editVydannoe(${item.id})" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteVydannoe(${item.id})" title="Удалить">
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

        <!-- Кнопка добавления -->
        <div class="mt-3">
            <button class="btn btn-primary" onclick="addVydannoe()">
                <i class="fas fa-plus me-1"></i>Добавить выдачу
            </button>
        </div>
    `;
    content.innerHTML = html;

    // Add filter listeners
    ['date', 'id', 'name', 'registry', 'upd'].forEach(field => {
        document.getElementById(`vydannoe-filter-${field}`).addEventListener('input', filterVydannoe);
    });
    document.getElementById('vydannoe-filter-contractor').addEventListener('change', filterVydannoe);
    document.getElementById('vydannoe-filter-responsible').addEventListener('change', filterVydannoe);
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
    // Создать временное уведомление
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    // Автоматически удалить через 5 секунд
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    showSection('sklad');
});