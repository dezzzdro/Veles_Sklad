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
}

// Placeholder functions for loading data
async function loadSklad() {
    const content = document.getElementById('sklad-content');
    content.innerHTML = '<p>Загрузка данных склада...</p>';
    try {
        const { data, error } = await supabase.from('склад').select('*');
        if (error) throw error;
        renderSkladTable(data);
    } catch (error) {
        content.innerHTML = '<p>Ошибка загрузки: ' + error.message + '</p>';
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
    content.innerHTML = '<p>Загрузка данных выданного...</p>';
    try {
        const { data, error } = await supabase.from('выданное').select('*');
        if (error) throw error;
        renderVydannoeTable(data);
    } catch (error) {
        content.innerHTML = '<p>Ошибка загрузки: ' + error.message + '</p>';
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
    content.innerHTML = '<p>Загрузка настроек...</p>';
    try {
        const { data, error } = await supabase.from('настройки').select('*').limit(1);
        if (error) throw error;
        renderNastroyki(data[0] || {});
    } catch (error) {
        content.innerHTML = '<p>Ошибка загрузки: ' + error.message + '</p>';
    }
}

async function loadUvedomleniya() {
    const content = document.getElementById('uvedomleniya-content');
    content.innerHTML = '<p>Загрузка уведомлений...</p>';
    try {
        const { data, error } = await supabase.from('уведомления').select('*');
        if (error) throw error;
        renderUvedomleniya(data);
    } catch (error) {
        content.innerHTML = '<p>Ошибка загрузки: ' + error.message + '</p>';
    }
}

async function loadOtladka() {
    const content = document.getElementById('otladka-content');
    const html = `
        <h3>Тестирование соединения с СУБД</h3>
        <button onclick="testConnection()">Тест соединения</button>
        <div id="connection-status"></div>
        <h3>Выбор таблицы для тестирования</h3>
        <select id="table-select">
            <option value="склад">Склад</option>
            <option value="сборка">Сборка</option>
            <option value="приход">Приход</option>
            <option value="выданное">Выданное</option>
            <option value="контрагенты">Контрагенты</option>
            <option value="настройки">Настройки</option>
            <option value="уведомления">Уведомления</option>
        </select>
        <button onclick="testTable()">Тест таблицы</button>
        <h3>Лог запросов</h3>
        <textarea id="log-area" rows="10" readonly></textarea>
        <button onclick="copyLog()">Копировать лог</button>
        <button onclick="clearLog()">Очистить лог</button>
        <button onclick="exportLog()">Экспорт в txt</button>
    `;
    content.innerHTML = html;
}

// Render functions
function renderSkladTable(data) {
    const content = document.getElementById('sklad-content');
    let html = `
        <div class="mb-3">
            <input type="text" id="sklad-filter-name" class="form-control d-inline-block w-auto me-2" placeholder="Фильтр по наименованию">
            <input type="text" id="sklad-filter-unit" class="form-control d-inline-block w-auto" placeholder="Фильтр по ед.изм.">
        </div>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
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
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editSklad(${item.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger me-1" onclick="deleteSklad(${item.id})"><i class="fas fa-trash"></i></button>
                    <button class="btn btn-sm btn-outline-success" onclick="transferToSborka(${item.id})"><i class="fas fa-arrow-right"></i></button>
                </td>
            </tr>
        `;
    });
    html += `
                </tbody>
            </table>
        </div>
        <button class="btn btn-primary" onclick="addSklad()"><i class="fas fa-plus"></i> Добавить</button>
    `;
    content.innerHTML = html;
    // Add filter listeners
    document.getElementById('sklad-filter-name').addEventListener('input', filterSklad);
    document.getElementById('sklad-filter-unit').addEventListener('input', filterSklad);
}

function filterSklad() {
    const nameFilter = document.getElementById('sklad-filter-name').value.toLowerCase();
    const unitFilter = document.getElementById('sklad-filter-unit').value.toLowerCase();
    const rows = document.querySelectorAll('#sklad-content tbody tr');
    rows.forEach(row => {
        const name = row.cells[1].textContent.toLowerCase();
        const unit = row.cells[2].textContent.toLowerCase();
        row.style.display = name.includes(nameFilter) && unit.includes(unitFilter) ? '' : 'none';
    });
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
        <table>
            <thead>
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
                    <button onclick="editSborka(${item.id})">Редактировать</button>
                    <button onclick="deleteSborka(${item.id})">Удалить</button>
                </td>
            </tr>
        `;
    });
    html += `
            </tbody>
        </table>
        <button onclick="addSborka()">Добавить</button>
    `;
    content.innerHTML = html;
}

function editSborka(id) { alert('Редактировать ' + id); }
function deleteSborka(id) { alert('Удалить ' + id); }
function addSborka() { alert('Добавить'); }

function renderPrihodTable(data) {
    const content = document.getElementById('prihod-content');
    let html = `
        <div>
            <h3>Принятие прихода</h3>
            <button onclick="pasteFromClipboard()">Вставить из буфера обмена</button>
            <button onclick="importPrihod()">Импорт из xlsx</button>
            <button onclick="addPrihod()">Добавить строку</button>
            <button onclick="acceptPrihod()">Принять</button>
        </div>
        <div>
            <h3>Документы прихода</h3>
            <input type="text" id="registry-number" placeholder="Реестровый номер заявки">
            <button onclick="applyRegistryNumber()">Применить реестровый номер</button>
            <input type="text" id="upd-number" placeholder="УПД">
            <button onclick="applyUPD()">Применить УПД</button>
        </div>
        <div>
            <h3>Редактирование</h3>
            <button onclick="clearPrihod()">Очистить приход</button>
            <button onclick="exportPrihod()">Экспорт в xlsx</button>
        </div>
        <table>
            <thead>
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
                <td>${item.дата}</td>
                <td>${item.наименование}</td>
                <td>${item.ед_изм}</td>
                <td>${item.количество}</td>
                <td>${item.реестровый_номер}</td>
                <td>${item.upd}</td>
                <td>
                    <button onclick="editPrihod(${item.id})">Редактировать</button>
                    <button onclick="deletePrihod(${item.id})">Удалить</button>
                </td>
            </tr>
        `;
    });
    html += `
            </tbody>
        </table>
    `;
    content.innerHTML = html;
}

function editPrihod(id) { alert('Редактировать ' + id); }
function deletePrihod(id) { alert('Удалить ' + id); }
function addPrihod() { alert('Добавить'); }

function importPrihod() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        for (const row of json) {
            await supabase.from('приход').insert({
                наименование: row.Наименование,
                ед_изм: row['Ед.изм.'],
                количество: row.Количество
            });
        }
        loadPrihod();
    };
    input.click();
}

function exportPrihod() {
    const { data } = supabase.from('приход').select('*');
    const ws = XLSX.utils.json_to_sheet(data.map(item => ({
        Наименование: item.наименование,
        'Ед.изм.': item.ед_изм,
        Количество: item.количество
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Приход');
    XLSX.writeFile(wb, 'Приход_' + new Date().toISOString().split('T')[0] + '.xlsx');
}

function clearPrihod() {
    if (confirm('Очистить все данные прихода?')) {
        supabase.from('приход').delete().neq('id', 0); // Delete all
        loadPrihod();
    }
}

function acceptPrihod() {
    // Implement accept logic as per TЗ
    alert('Принять приход - реализация в процессе');
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

function renderVydannoeTable(data) {
    const content = document.getElementById('vydannoe-content');
    let html = `
        <div>
            <input type="text" placeholder="Фильтр по дате">
            <input type="text" placeholder="Фильтр по ID">
            <input type="text" placeholder="Фильтр по наименованию">
            <input type="text" placeholder="Фильтр по реестровому номеру">
            <input type="text" placeholder="Фильтр по УПД">
            <select><option>Контрагент</option></select>
            <select><option>Ответственный</option></select>
        </div>
        <table>
            <thead>
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
                <td>${item.дата}</td>
                <td>${item.id}</td>
                <td>${item.наименование}</td>
                <td>${item.ед_изм}</td>
                <td>${item.количество}</td>
                <td>${item.контрагент}</td>
                <td>${item.ответственный}</td>
                <td>${item.реестровый_номер}</td>
                <td>${item.upd}</td>
                <td>
                    <button onclick="editVydannoe(${item.id})">Редактировать</button>
                    <button onclick="deleteVydannoe(${item.id})">Удалить</button>
                </td>
            </tr>
        `;
    });
    html += `
            </tbody>
        </table>
        <button onclick="addVydannoe()">Добавить</button>
    `;
    content.innerHTML = html;
}

function editVydannoe(id) { alert('Редактировать ' + id); }
function deleteVydannoe(id) { alert('Удалить ' + id); }
function addVydannoe() { alert('Добавить'); }

function renderKontragenty(kontragenty, persons) {
    const content = document.getElementById('kontragenty-content');
    let html = '<div class="kontragenty-cards">';
    kontragenty.forEach(kontr => {
        const kontrPersons = persons.filter(p => p.id_контрагента === kontr.id);
        html += `
            <div class="card">
                <h3>${kontr.организация}</h3>
                <ul>
                    ${kontrPersons.map(p => `<li>${p.имя}</li>`).join('')}
                </ul>
                <button onclick="editKontr(${kontr.id})">Редактировать</button>
                <button onclick="deleteKontr(${kontr.id})">Удалить</button>
            </div>
        `;
    });
    html += '</div><button onclick="addKontr()">Добавить контрагента</button>';
    content.innerHTML = html;
}

function editKontr(id) { alert('Редактировать ' + id); }
function deleteKontr(id) { alert('Удалить ' + id); }
function addKontr() { alert('Добавить'); }

function renderNastroyki(settings) {
    const content = document.getElementById('nastroyki-content');
    const html = `
        <h3>Выбор темы оформления</h3>
        <select id="theme-select">
            <option value="light" ${settings.тема === 'light' ? 'selected' : ''}>Светлая</option>
            <option value="dark" ${settings.тема === 'dark' ? 'selected' : ''}>Тёмная</option>
        </select>
        <button onclick="saveTheme()">Сохранить</button>
    `;
    content.innerHTML = html;
}

async function saveTheme() {
    const theme = document.getElementById('theme-select').value;
    try {
        const { error } = await supabase.from('настройки').upsert({ id: 1, тема: theme });
        if (error) throw error;
        alert('Тема сохранена');
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
}

function renderUvedomleniya(data) {
    const content = document.getElementById('uvedomleniya-content');
    let html = `
        <div>
            <input type="text" placeholder="Фильтр по дате">
            <input type="text" placeholder="Фильтр по типу">
            <input type="text" placeholder="Фильтр по тексту">
        </div>
        <table>
            <thead>
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
        html += `
            <tr>
                <td>${item.дата}</td>
                <td>${item.тип_уведомления}</td>
                <td>${item.текст_уведомления}</td>
                <td>
                    <button onclick="deleteUved(${item.id})">Удалить</button>
                </td>
            </tr>
        `;
    });
    html += `
            </tbody>
        </table>
        <button onclick="addUved()">Добавить уведомление</button>
    `;
    content.innerHTML = html;
}

function deleteUved(id) { alert('Удалить ' + id); }
function addUved() { alert('Добавить'); }

async function testConnection() {
    const status = document.getElementById('connection-status');
    try {
        const { data, error } = await supabase.from('склад').select('count').limit(1);
        if (error) throw error;
        status.innerHTML = '<p style="color: green;">Соединение успешно</p>';
        logMessage('Соединение успешно');
    } catch (error) {
        status.innerHTML = '<p style="color: red;">Ошибка соединения: ' + error.message + '</p>';
        logMessage('Ошибка соединения: ' + error.message);
    }
}

async function testTable() {
    const table = document.getElementById('table-select').value;
    try {
        const { data, error } = await supabase.from(table).select('*').limit(5);
        if (error) throw error;
        logMessage('Тест таблицы ' + table + ': ' + data.length + ' записей');
    } catch (error) {
        logMessage('Ошибка теста таблицы ' + table + ': ' + error.message);
    }
}

function logMessage(message) {
    const log = document.getElementById('log-area');
    log.value += new Date().toISOString() + ': ' + message + '\n';
}

function copyLog() {
    const log = document.getElementById('log-area');
    navigator.clipboard.writeText(log.value);
    alert('Лог скопирован');
}

function clearLog() {
    document.getElementById('log-area').value = '';
}

function exportLog() {
    const log = document.getElementById('log-area').value;
    const blob = new Blob([log], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'log.txt';
    a.click();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    showSection('sklad');
});