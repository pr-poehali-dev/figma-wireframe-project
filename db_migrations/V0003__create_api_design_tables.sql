-- API Design Studio tables

CREATE TABLE IF NOT EXISTS api_services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    protocol VARCHAR(50) NOT NULL DEFAULT 'REST',
    base_url VARCHAR(500),
    version VARCHAR(50) NOT NULL DEFAULT '1.0',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_endpoints (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES api_services(id),
    method VARCHAR(20) NOT NULL,
    path VARCHAR(500) NOT NULL,
    summary VARCHAR(500),
    description TEXT,
    tags TEXT[],
    status VARCHAR(50) NOT NULL DEFAULT 'development',
    use_case_id VARCHAR(50),
    requirement_ids TEXT[],
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(service_id, method, path)
);

CREATE TABLE IF NOT EXISTS api_parameters (
    id SERIAL PRIMARY KEY,
    endpoint_id INTEGER REFERENCES api_endpoints(id),
    name VARCHAR(255) NOT NULL,
    param_in VARCHAR(50) NOT NULL,
    param_type VARCHAR(100) NOT NULL,
    required BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    default_value TEXT,
    example TEXT,
    source VARCHAR(50) NOT NULL DEFAULT 'manual',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_responses (
    id SERIAL PRIMARY KEY,
    endpoint_id INTEGER REFERENCES api_endpoints(id),
    status_code INTEGER NOT NULL,
    description TEXT,
    content_type VARCHAR(100) NOT NULL DEFAULT 'application/json',
    schema_id INTEGER,
    example TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_security (
    id SERIAL PRIMARY KEY,
    endpoint_id INTEGER REFERENCES api_endpoints(id),
    auth_type VARCHAR(50) NOT NULL,
    scopes TEXT[],
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_rate_limiting (
    id SERIAL PRIMARY KEY,
    endpoint_id INTEGER REFERENCES api_endpoints(id),
    enabled BOOLEAN NOT NULL DEFAULT false,
    limit_value INTEGER NOT NULL DEFAULT 1000,
    period VARCHAR(20) NOT NULL DEFAULT 'hour',
    per_user BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_schemas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    schema_type VARCHAR(50) NOT NULL DEFAULT 'object',
    description TEXT,
    linked_db_table VARCHAR(255),
    example TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name)
);

CREATE TABLE IF NOT EXISTS schema_properties (
    id SERIAL PRIMARY KEY,
    schema_id INTEGER REFERENCES data_schemas(id),
    name VARCHAR(255) NOT NULL,
    prop_type VARCHAR(100) NOT NULL,
    required BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    example TEXT,
    reference VARCHAR(255),
    validation JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    source_service_id INTEGER REFERENCES api_services(id),
    trigger_endpoint_id INTEGER REFERENCES api_endpoints(id),
    protocol VARCHAR(50) NOT NULL DEFAULT 'kafka',
    topic VARCHAR(255) NOT NULL,
    payload_schema_id INTEGER REFERENCES data_schemas(id),
    retry_max_attempts INTEGER NOT NULL DEFAULT 3,
    retry_backoff_type VARCHAR(50) NOT NULL DEFAULT 'exponential',
    retry_timeout_seconds INTEGER NOT NULL DEFAULT 30,
    dead_letter_queue BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name)
);

CREATE TABLE IF NOT EXISTS event_consumers (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES api_events(id),
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    last_processed TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS webhooks (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES api_events(id),
    url VARCHAR(500) NOT NULL,
    method VARCHAR(20) NOT NULL DEFAULT 'POST',
    headers JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    last_triggered TIMESTAMP,
    last_error TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_endpoints_service ON api_endpoints(service_id);
CREATE INDEX IF NOT EXISTS idx_endpoints_status ON api_endpoints(status);
CREATE INDEX IF NOT EXISTS idx_endpoints_use_case ON api_endpoints(use_case_id);
CREATE INDEX IF NOT EXISTS idx_parameters_endpoint ON api_parameters(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_responses_endpoint ON api_responses(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_schema_props_schema ON schema_properties(schema_id);
CREATE INDEX IF NOT EXISTS idx_events_service ON api_events(source_service_id);
CREATE INDEX IF NOT EXISTS idx_consumers_event ON event_consumers(event_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_event ON webhooks(event_id);