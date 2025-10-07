-- Create workspaces table
-- This migration creates the workspaces table for storing workspace/profile information

-- SQLite version (active for this example)
CREATE TABLE workspaces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#0d6efd',
    icon TEXT DEFAULT 'fas fa-briefcase',
    is_active INTEGER DEFAULT 1,
    settings TEXT, -- JSON field for workspace-specific settings
    created_by INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create user_workspaces junction table for many-to-many relationship
CREATE TABLE user_workspaces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    workspace_id INTEGER NOT NULL,
    role TEXT DEFAULT 'member', -- admin, member, viewer
    is_default INTEGER DEFAULT 0,
    joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    UNIQUE(user_id, workspace_id)
);

-- Create indexes
CREATE INDEX idx_workspaces_uuid ON workspaces(uuid);
CREATE INDEX idx_workspaces_active ON workspaces(is_active);
CREATE INDEX idx_workspaces_created_by ON workspaces(created_by);
CREATE INDEX idx_user_workspaces_user_id ON user_workspaces(user_id);
CREATE INDEX idx_user_workspaces_workspace_id ON user_workspaces(workspace_id);
CREATE INDEX idx_user_workspaces_default ON user_workspaces(is_default);

-- Insert default workspace
INSERT INTO workspaces (uuid, name, description, color, icon, is_active, created_by, created_at, updated_at)
VALUES (
    'default-workspace-' || substr(hex(randomblob(16)), 1, 32),
    'Default Workspace',
    'Default workspace for all users',
    '#0d6efd',
    'fas fa-home',
    1,
    1, -- Admin user ID
    datetime('now'),
    datetime('now')
);

-- Assign admin user to default workspace
INSERT INTO user_workspaces (user_id, workspace_id, role, is_default, joined_at)
VALUES (
    1, -- Admin user ID
    1, -- Default workspace ID
    'admin',
    1,
    datetime('now')
);
