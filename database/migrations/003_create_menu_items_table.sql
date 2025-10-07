-- Create menu_items table
-- This migration creates the menu system tables for configurable navigation

-- SQLite version (active for this example)
CREATE TABLE menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    workspace_id INTEGER NOT NULL,
    parent_id INTEGER NULL, -- For hierarchical menu structure
    title TEXT NOT NULL,
    icon TEXT DEFAULT 'fas fa-circle',
    url TEXT,
    module_name TEXT, -- Name of the module to load
    target TEXT DEFAULT '_self', -- _self, _blank, etc.
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    is_visible INTEGER DEFAULT 1,
    permissions TEXT, -- JSON array of required permissions
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- Create menu_permissions table for role-based access
CREATE TABLE menu_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_item_id INTEGER NOT NULL,
    role TEXT NOT NULL, -- admin, member, viewer, etc.
    can_view INTEGER DEFAULT 1,
    can_edit INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    UNIQUE(menu_item_id, role)
);

-- Create indexes
CREATE INDEX idx_menu_items_uuid ON menu_items(uuid);
CREATE INDEX idx_menu_items_workspace_id ON menu_items(workspace_id);
CREATE INDEX idx_menu_items_parent_id ON menu_items(parent_id);
CREATE INDEX idx_menu_items_active ON menu_items(is_active);
CREATE INDEX idx_menu_items_visible ON menu_items(is_visible);
CREATE INDEX idx_menu_items_sort_order ON menu_items(sort_order);
CREATE INDEX idx_menu_permissions_menu_item_id ON menu_permissions(menu_item_id);
CREATE INDEX idx_menu_permissions_role ON menu_permissions(role);

-- Insert default menu items for the default workspace
INSERT INTO menu_items (uuid, workspace_id, parent_id, title, icon, module_name, sort_order, is_active, is_visible, created_at, updated_at)
VALUES 
    -- Dashboard
    ('menu-dashboard-' || substr(hex(randomblob(16)), 1, 32), 1, NULL, 'Dashboard', 'fas fa-tachometer-alt', 'dashboard', 1, 1, 1, datetime('now'), datetime('now')),
    
    -- User Management
    ('menu-users-' || substr(hex(randomblob(16)), 1, 32), 1, NULL, 'User Management', 'fas fa-users', NULL, 2, 1, 1, datetime('now'), datetime('now')),
    ('menu-users-list-' || substr(hex(randomblob(16)), 1, 32), 1, 2, 'Users List', 'fas fa-list', 'users/list', 1, 1, 1, datetime('now'), datetime('now')),
    ('menu-users-create-' || substr(hex(randomblob(16)), 1, 32), 1, 2, 'Create User', 'fas fa-user-plus', 'users/create', 2, 1, 1, datetime('now'), datetime('now')),
    
    -- Workspace Management
    ('menu-workspaces-' || substr(hex(randomblob(16)), 1, 32), 1, NULL, 'Workspaces', 'fas fa-briefcase', NULL, 3, 1, 1, datetime('now'), datetime('now')),
    ('menu-workspaces-list-' || substr(hex(randomblob(16)), 1, 32), 1, 5, 'Workspaces List', 'fas fa-list', 'workspaces/list', 1, 1, 1, datetime('now'), datetime('now')),
    ('menu-workspaces-create-' || substr(hex(randomblob(16)), 1, 32), 1, 5, 'Create Workspace', 'fas fa-plus', 'workspaces/create', 2, 1, 1, datetime('now'), datetime('now')),
    
    -- System
    ('menu-system-' || substr(hex(randomblob(16)), 1, 32), 1, NULL, 'System', 'fas fa-cogs', NULL, 4, 1, 1, datetime('now'), datetime('now')),
    ('menu-system-settings-' || substr(hex(randomblob(16)), 1, 32), 1, 8, 'Settings', 'fas fa-cog', 'system/settings', 1, 1, 1, datetime('now'), datetime('now')),
    ('menu-system-logs-' || substr(hex(randomblob(16)), 1, 32), 1, 8, 'System Logs', 'fas fa-file-alt', 'system/logs', 2, 1, 1, datetime('now'), datetime('now')),
    
    -- Reports
    ('menu-reports-' || substr(hex(randomblob(16)), 1, 32), 1, NULL, 'Reports', 'fas fa-chart-bar', 'reports', 5, 1, 1, datetime('now'), datetime('now'));

-- Insert default permissions for menu items
INSERT INTO menu_permissions (menu_item_id, role, can_view, can_edit, created_at)
SELECT 
    id,
    'admin',
    1,
    1,
    datetime('now')
FROM menu_items;

-- Insert member permissions (view only for most items)
INSERT INTO menu_permissions (menu_item_id, role, can_view, can_edit, created_at)
SELECT 
    id,
    'member',
    CASE 
        WHEN title IN ('Dashboard', 'Reports') THEN 1
        WHEN title LIKE '%List' THEN 1
        ELSE 0
    END,
    0,
    datetime('now')
FROM menu_items;

-- Insert viewer permissions (very limited access)
INSERT INTO menu_permissions (menu_item_id, role, can_view, can_edit, created_at)
SELECT 
    id,
    'viewer',
    CASE 
        WHEN title IN ('Dashboard', 'Reports') THEN 1
        ELSE 0
    END,
    0,
    datetime('now')
FROM menu_items;
