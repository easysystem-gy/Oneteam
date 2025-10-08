-- Oneteam PostgreSQL Database Setup Script
-- Run this script to set up the database and user for Oneteam

-- Create database (run as postgres superuser)
-- CREATE DATABASE oneteam;

-- Create user (run as postgres superuser)
-- CREATE USER oneteam_user WITH PASSWORD 'your_password_here';

-- Grant privileges (run as postgres superuser)
-- GRANT ALL PRIVILEGES ON DATABASE oneteam TO oneteam_user;

-- Connect to oneteam database and run the following:
-- \c oneteam;

-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    workspace_id INTEGER NOT NULL DEFAULT 1,
    parent_id INTEGER NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    icon VARCHAR(100) DEFAULT 'fas fa-circle',
    module_name VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_workspaces table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_workspaces (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, workspace_id)
);

-- Grant privileges to oneteam_user on all tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO oneteam_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO oneteam_user;

-- Insert default workspace
INSERT INTO workspaces (name, description) VALUES
('Default Workspace', 'Default workspace for Oneteam application')
ON CONFLICT DO NOTHING;

-- Insert sample menu items
-- First insert parent items
INSERT INTO menu_items (uuid, workspace_id, parent_id, title, icon, module_name, sort_order) VALUES
('dashboard-uuid', 1, NULL, 'Dashboard', 'fas fa-tachometer-alt', 'dashboard', 1),
('users-uuid', 1, NULL, 'User Management', 'fas fa-users', NULL, 2),
('reports-uuid', 1, NULL, 'Reports', 'fas fa-chart-bar', 'reports', 3),
('settings-uuid', 1, NULL, 'Settings', 'fas fa-cog', 'settings', 4)
ON CONFLICT (uuid) DO NOTHING;

-- Then insert child items using subquery to get parent ID
INSERT INTO menu_items (uuid, workspace_id, parent_id, title, icon, module_name, sort_order) VALUES
('users-list-uuid', 1, (SELECT id FROM menu_items WHERE uuid = 'users-uuid'), 'Users List', 'fas fa-list', 'users/list', 1),
('users-roles-uuid', 1, (SELECT id FROM menu_items WHERE uuid = 'users-uuid'), 'User Roles', 'fas fa-user-tag', 'users/roles', 2),
('reports-sales-uuid', 1, (SELECT id FROM menu_items WHERE uuid = 'reports-uuid'), 'Sales Reports', 'fas fa-chart-line', 'reports/sales', 1),
('reports-analytics-uuid', 1, (SELECT id FROM menu_items WHERE uuid = 'reports-uuid'), 'Analytics', 'fas fa-chart-pie', 'reports/analytics', 2)
ON CONFLICT (uuid) DO NOTHING;

-- Insert default admin user (password: admin123)
INSERT INTO users (uuid, username, email, password_hash, first_name, last_name) VALUES
('admin-uuid', 'admin', 'admin@oneteam.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User')
ON CONFLICT (uuid) DO NOTHING;

-- Assign admin user to default workspace
INSERT INTO user_workspaces (user_id, workspace_id, role) VALUES
(1, 1, 'admin')
ON CONFLICT (user_id, workspace_id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_workspace_id ON menu_items(workspace_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id ON menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON menu_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_user_workspaces_user_id ON user_workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workspaces_workspace_id ON user_workspaces(workspace_id);

-- Display success message
SELECT 'Oneteam PostgreSQL database setup completed successfully!' as message;
