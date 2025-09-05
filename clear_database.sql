-- Очистка базы данных Велес Склад
-- Удаление всех таблиц в правильном порядке (сначала дочерние таблицы)

DROP TABLE IF EXISTS debug_test;
DROP TABLE IF EXISTS операции;
DROP TABLE IF EXISTS уведомления;
DROP TABLE IF EXISTS настройки;
DROP TABLE IF EXISTS ответственные_лица;
DROP TABLE IF EXISTS контрагенты;
DROP TABLE IF EXISTS выданное;
DROP TABLE IF EXISTS приход;
DROP TABLE IF EXISTS сборка;
DROP TABLE IF EXISTS склад;