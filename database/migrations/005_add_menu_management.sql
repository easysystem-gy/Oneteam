-- Add Menu Management to Settings menu
-- This migration adds the menu management functionality to the system settings

-- First, let's add a Settings parent menu if it doesn't exist
INSERT OR IGNORE INTO menu_items (uuid, workspace_id, parent_id, title, icon, module_name, sort_order, is_active, is_visible, created_at, updated_at)
VALUES 
    ('menu-settings-' || substr(hex(randomblob(16)), 1, 32), 1, NULL, 'Settings', 'fas fa-cogs', NULL, 10, 1, 1, datetime('now'), datetime('now'));

-- Get the Settings menu ID (it should be the System menu from the previous migration)
-- We'll add Menu Management as a sub-item under System/Settings

-- Add Menu Management under System menu
INSERT INTO menu_items (uuid, workspace_id, parent_id, title, icon, module_name, sort_order, is_active, is_visible, created_at, updated_at)
VALUES 
    ('menu-management-' || substr(hex(randomblob(16)), 1, 32), 1, 
     (SELECT id FROM menu_items WHERE title = 'System' AND workspace_id = 1 LIMIT 1), 
     'Menu Management', 'fas fa-bars', 'menu-management', 3, 1, 1, datetime('now'), datetime('now'));

-- Add permissions for Menu Management (admin only by default)
INSERT INTO menu_permissions (menu_item_id, role, can_view, can_edit, created_at)
SELECT 
    id,
    'admin',
    1,
    1,
    datetime('now')
FROM menu_items 
WHERE title = 'Menu Management' AND workspace_id = 1;

-- Add limited permissions for members (view only)
INSERT INTO menu_permissions (menu_item_id, role, can_view, can_edit, created_at)
SELECT 
    id,
    'member',
    1,
    0,
    datetime('now')
FROM menu_items 
WHERE title = 'Menu Management' AND workspace_id = 1;

-- No permissions for viewers (they can't manage menus)
INSERT INTO menu_permissions (menu_item_id, role, can_view, can_edit, created_at)
SELECT 
    id,
    'viewer',
    0,
    0,
    datetime('now')
FROM menu_items 
WHERE title = 'Menu Management' AND workspace_id = 1;
