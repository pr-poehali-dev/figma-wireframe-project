-- Add vision and goals fields to projects table
ALTER TABLE projects 
ADD COLUMN vision TEXT,
ADD COLUMN target_audience TEXT,
ADD COLUMN value_proposition TEXT,
ADD COLUMN timeline VARCHAR(100),
ADD COLUMN budget VARCHAR(100),
ADD COLUMN success_metric VARCHAR(100);

-- Create OKR table for objectives and key results
CREATE TABLE IF NOT EXISTS project_okrs (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    objective TEXT NOT NULL,
    key_results JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample OKR data for project 1
INSERT INTO project_okrs (project_id, objective, key_results)
VALUES 
    (1, 'Запустить MVP', '["100+ пользователей за первый месяц", "NPS > 50", "80% retention"]'::jsonb),
    (1, 'Достичь product-market fit', '["50% organic growth", "10+ enterprise клиентов", "ARR $100k"]'::jsonb);

-- Update sample project with vision data
UPDATE projects 
SET 
    vision = 'Создать платформу для управления проектами, которая упростит коллаборацию команд разработки',
    target_audience = 'Команды разработки, Product Managers, Архитекторы',
    value_proposition = 'Единое место для управления требованиями, архитектурой и API',
    timeline = '6 месяцев',
    budget = '$50k',
    success_metric = '1000+'
WHERE id = 1;