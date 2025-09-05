-- Зачистка СУБД
DROP TABLE IF EXISTS operations CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS responsible_persons CASCADE;
DROP TABLE IF EXISTS kontragenty CASCADE;
DROP TABLE IF EXISTS vydannoe CASCADE;
DROP TABLE IF EXISTS prihod CASCADE;
DROP TABLE IF EXISTS sborka CASCADE;
DROP TABLE IF EXISTS sklad CASCADE;

-- Создание таблиц для Велес Склад с русскими названиями

-- Таблица Склад
CREATE TABLE IF NOT EXISTS склад (
    id SERIAL PRIMARY KEY,
    наименование VARCHAR(255) NOT NULL,
    ед_изм VARCHAR(50) NOT NULL,
    числится DECIMAL(10,2) NOT NULL DEFAULT 0,
    на_складе DECIMAL(10,2) NOT NULL DEFAULT 0,
    выдано DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- Таблица Сборка
CREATE TABLE IF NOT EXISTS сборка (
    id SERIAL PRIMARY KEY,
    наименование VARCHAR(255) NOT NULL,
    ед_изм VARCHAR(50) NOT NULL,
    количество DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- Таблица Приход
CREATE TABLE IF NOT EXISTS приход (
    id SERIAL PRIMARY KEY,
    дата TIMESTAMP DEFAULT NOW(),
    наименование VARCHAR(255) NOT NULL,
    ед_изм VARCHAR(50) NOT NULL,
    количество DECIMAL(10,2) NOT NULL DEFAULT 0,
    реестровый_номер VARCHAR(100),
    upd VARCHAR(100)
);

-- Таблица Выданное
CREATE TABLE IF NOT EXISTS выданное (
    id SERIAL PRIMARY KEY,
    дата TIMESTAMP DEFAULT NOW(),
    id_товара INTEGER REFERENCES склад(id),
    наименование VARCHAR(255) NOT NULL,
    ед_изм VARCHAR(50) NOT NULL,
    количество DECIMAL(10,2) NOT NULL DEFAULT 0,
    контрагент VARCHAR(255),
    ответственный VARCHAR(255),
    реестровый_номер VARCHAR(100),
    upd VARCHAR(100)
);

-- Таблица Контрагенты
CREATE TABLE IF NOT EXISTS контрагенты (
    id SERIAL PRIMARY KEY,
    организация VARCHAR(255) NOT NULL
);

-- Таблица Ответственные лица для контрагентов
CREATE TABLE IF NOT EXISTS ответственные_лица (
    id SERIAL PRIMARY KEY,
    id_контрагента INTEGER REFERENCES контрагенты(id),
    имя VARCHAR(255) NOT NULL
);

-- Таблица Настройки
CREATE TABLE IF NOT EXISTS настройки (
    id SERIAL PRIMARY KEY,
    тема VARCHAR(50) DEFAULT 'light'
);

-- Таблица Уведомления
CREATE TABLE IF NOT EXISTS уведомления (
    id SERIAL PRIMARY KEY,
    дата TIMESTAMP DEFAULT NOW(),
    тип_уведомления VARCHAR(100) NOT NULL,
    текст_уведомления TEXT NOT NULL
);

-- Таблица Операции (для истории)
CREATE TABLE IF NOT EXISTS операции (
    id SERIAL PRIMARY KEY,
    дата TIMESTAMP DEFAULT NOW(),
    тип_операции VARCHAR(100) NOT NULL,
    детали TEXT
);