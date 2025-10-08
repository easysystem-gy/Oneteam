-- Add Menu Management to Settings menu (PostgreSQL version)
-- This migration adds the menu management functionality to the system settings

-- First, let's add a Settings parent menu if it doesn't exist (PostgreSQL syntax)
INSERT INTO menu_items (uuid, workspace_id, parent_id, title, icon, module_name, sort_order, is_active, is_visible, created_at, updated_at)
SELECT 
    'menu-settings-' || substr(md5(random()::text), 1, 32),
    1, 
    NULL, 
    'Settings', 
    'fas fa-cogs', 
    NULL, 
    10, 
    1, 
    1, 
    NOW(), 
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM menu_items WHERE title = 'Settings' AND workspace_id = 1
);

-- Add Menu Management under System menu (PostgreSQL syntax)
INSERT INTO menu_items (uuid, workspace_id, parent_id, title, icon, module_name, sort_order, is_active, is_visible, created_at, updated_at)
SELECT 
    'menu-management-' || substr(md5(random()::text), 1, 32),
    1,
    (SELECT id FROM menu_items WHERE title = 'System' AND workspace_id = 1 LIMIT 1),
    'Menu Management',
    'fas fa-bars',
    'menu-management',
    3,
    1,
    1,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM menu_items WHERE title = 'Menu Management' AND workspace_id = 1
);

-- Add permissions for Menu Management (admin only by default)
INSERT INTO menu_permissions (menu_item_id, role, can_view, can_edit, created_at)
SELECT 
    mi.id,
    'admin',
    true,
    true,
    NOW()
FROM menu_items mi
WHERE mi.title = 'Menu Management' 
  AND mi.workspace_id = 1
  AND NOT EXISTS (
      SELECT 1 FROM menu_permissions mp 
      WHERE mp.menu_item_id = mi.id AND mp.role = 'admin'
  );

-- Add limited permissions for members (view only)
INSERT INTO menu_permissions (menu_item_id, role, can_view, can_edit, created_at)
SELECT 
    mi.id,
    'member',
    true,
    false,
    NOW()
FROM menu_items mi
WHERE mi.title = 'Menu Management' 
  AND mi.workspace_id = 1
  AND NOT EXISTS (
      SELECT 1 FROM menu_permissions mp 
      WHERE mp.menu_item_id = mi.id AND mp.role = 'member'
  );

-- No permissions for viewers (they can't manage menus)
INSERT INTO menu_permissions (menu_item_id, role, can_view, can_edit, created_at)
SELECT 
    mi.id,
    'viewer',
    false,
    false,
    NOW()
FROM menu_items mi
WHERE mi.title = 'Menu Management' 
  AND mi.workspace_id = 1
  AND NOT EXISTS (
      SELECT 1 FROM menu_permissions mp 
      WHERE mp.menu_item_id = mi.id AND mp.role = 'viewer'
  );
