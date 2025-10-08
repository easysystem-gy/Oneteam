-- Add Menu Management to System menu (PostgreSQL version - Minimal)
-- This migration adds only the essential columns to avoid datatype issues

-- Add Menu Management under System menu (minimal columns)
INSERT INTO menu_items (workspace_id, parent_id, title, icon, module_name, sort_order)
SELECT 
    1,
    (SELECT id FROM menu_items WHERE title = 'System' AND workspace_id = 1 LIMIT 1),
    'Menu Management',
    'fas fa-bars',
    'menu-management',
    3
WHERE NOT EXISTS (
    SELECT 1 FROM menu_items WHERE title = 'Menu Management' AND workspace_id = 1
);

-- Add permissions for Menu Management (admin only by default)
INSERT INTO menu_permissions (menu_item_id, role, can_view, can_edit)
SELECT 
    mi.id,
    'admin',
    true,
    true
FROM menu_items mi
WHERE mi.title = 'Menu Management' 
  AND mi.workspace_id = 1
  AND NOT EXISTS (
      SELECT 1 FROM menu_permissions mp 
      WHERE mp.menu_item_id = mi.id AND mp.role = 'admin'
  );

-- Add limited permissions for members (view only)
INSERT INTO menu_permissions (menu_item_id, role, can_view, can_edit)
SELECT 
    mi.id,
    'member',
    true,
    false
FROM menu_items mi
WHERE mi.title = 'Menu Management' 
  AND mi.workspace_id = 1
  AND NOT EXISTS (
      SELECT 1 FROM menu_permissions mp 
      WHERE mp.menu_item_id = mi.id AND mp.role = 'member'
  );

-- No permissions for viewers (they can't manage menus)
INSERT INTO menu_permissions (menu_item_id, role, can_view, can_edit)
SELECT 
    mi.id,
    'viewer',
    false,
    false
FROM menu_items mi
WHERE mi.title = 'Menu Management' 
  AND mi.workspace_id = 1
  AND NOT EXISTS (
      SELECT 1 FROM menu_permissions mp 
      WHERE mp.menu_item_id = mi.id AND mp.role = 'viewer'
  );
