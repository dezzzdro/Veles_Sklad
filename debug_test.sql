-- Создание тестовой таблицы для отладки
CREATE TABLE IF NOT EXISTS debug_test (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    test_value TEXT NOT NULL
);

-- Создание индекса для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_debug_test_created_at ON debug_test(created_at DESC);

-- Добавление RLS (Row Level Security) политик
ALTER TABLE debug_test ENABLE ROW LEVEL SECURITY;

-- Политика для чтения (все могут читать)
CREATE POLICY "Allow read access to debug_test" ON debug_test
    FOR SELECT USING (true);

-- Политика для вставки (все могут вставлять)
CREATE POLICY "Allow insert access to debug_test" ON debug_test
    FOR INSERT WITH CHECK (true);

-- Политика для обновления (все могут обновлять)
CREATE POLICY "Allow update access to debug_test" ON debug_test
    FOR UPDATE USING (true);

-- Политика для удаления (все могут удалять)
CREATE POLICY "Allow delete access to debug_test" ON debug_test
    FOR DELETE USING (true);