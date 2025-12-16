-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    current_stage INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_stories table
CREATE TABLE IF NOT EXISTS user_stories (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    role VARCHAR(255) NOT NULL,
    action TEXT NOT NULL,
    benefit TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL,
    epic VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    story_id INTEGER REFERENCES user_stories(id),
    author VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create architecture_elements table
CREATE TABLE IF NOT EXISTS architecture_elements (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    canvas_type VARCHAR(50) NOT NULL,
    element_type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    x_position INTEGER NOT NULL,
    y_position INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create acceptance_criteria table
CREATE TABLE IF NOT EXISTS acceptance_criteria (
    id SERIAL PRIMARY KEY,
    story_id INTEGER REFERENCES user_stories(id),
    given_condition TEXT,
    when_action TEXT,
    then_result TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample project
INSERT INTO projects (name, description, current_stage) 
VALUES ('Project Pipeline Demo', 'Платформа управления разработкой проектов', 2);

-- Insert sample user stories
INSERT INTO user_stories (project_id, role, action, benefit, priority, epic)
VALUES 
    (1, 'Product Manager', 'создать User Story', 'управлять требованиями', 'Must', 'Управление требованиями'),
    (1, 'Architect', 'построить C4 диаграмму', 'визуализировать архитектуру', 'Should', 'Архитектура системы'),
    (1, 'Developer', 'просмотреть API эндпоинты', 'понимать интерфейсы', 'Must', 'API Design');

-- Insert sample comments
INSERT INTO comments (story_id, author, text)
VALUES 
    (1, 'Иван Петров', 'Отличная история, нужно уточнить критерии'),
    (2, 'Мария Сидорова', 'Согласовано с командой');

-- Insert sample architecture elements
INSERT INTO architecture_elements (project_id, canvas_type, element_type, name, x_position, y_position)
VALUES 
    (1, 'context', 'Пользователь', 'Web Client', 50, 100),
    (1, 'context', 'Система', 'Project Platform', 250, 100),
    (1, 'context', 'База данных', 'PostgreSQL', 250, 300),
    (1, 'context', 'Внешняя система', 'Auth Service', 450, 100);
