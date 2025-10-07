-- PostgreSQL Migration: Create menu system tables
-- This migration creates the menu system tables with PostgreSQL-specific features

-- Create menu_items table with hierarchical structure support
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    workspace_id INTEGER NOT NULL,
    parent_id INTEGER NULL, -- Self-referencing for hierarchical menu structure
    title VARCHAR(255) NOT NULL,
    icon VARCHAR(100) DEFAULT 'fas fa-circle',
    url TEXT,
    module_name VARCHAR(100), -- Name of the module to load
    target VARCHAR(20) DEFAULT '_self' CHECK (target IN ('_self', '_blank', '_parent', '_top')),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    permissions JSONB, -- JSON array of required permissions
    metadata JSONB, -- Additional metadata for the menu item
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_menu_items_workspace_id FOREIGN KEY (workspace_id) 
        REFERENCES workspaces(id) ON DELETE CASCADE,
    CONSTRAINT fk_menu_items_parent_id FOREIGN KEY (parent_id) 
        REFERENCES menu_items(id) ON DELETE CASCADE
);

-- Create menu_permissions table for role-based access control
CREATE TABLE menu_permissions (
    id SERIAL PRIMARY KEY,
    menu_item_id INTEGER NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'member', 'viewer', 'custom')),
    can_view BOOLEAN DEFAULT true,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    additional_permissions JSONB, -- Store custom permissions as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_menu_permissions_menu_item_id FOREIGN KEY (menu_item_id) 
        REFERENCES menu_items(id) ON DELETE CASCADE,
    CONSTRAINT uk_menu_permissions_item_role UNIQUE(menu_item_id, role)
);

-- Create menu_user_permissions table for user-specific overrides
CREATE TABLE menu_user_permissions (
    id SERIAL PRIMARY KEY,
    menu_item_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    workspace_id INTEGER NOT NULL,
    can_view BOOLEAN DEFAULT true,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    additional_permissions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_menu_user_permissions_menu_item_id FOREIGN KEY (menu_item_id) 
        REFERENCES menu_items(id) ON DELETE CASCADE,
    CONSTRAINT fk_menu_user_permissions_user_id FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_menu_user_permissions_workspace_id FOREIGN KEY (workspace_id) 
        REFERENCES workspaces(id) ON DELETE CASCADE,
    CONSTRAINT uk_menu_user_permissions_item_user_workspace UNIQUE(menu_item_id, user_id, workspace_id)
);

-- Create indexes for better performance
CREATE INDEX idx_menu_items_uuid ON menu_items(uuid);
CREATE INDEX idx_menu_items_workspace_id ON menu_items(workspace_id);
CREATE INDEX idx_menu_items_parent_id ON menu_items(parent_id);
CREATE INDEX idx_menu_items_active ON menu_items(is_active);
CREATE INDEX idx_menu_items_visible ON menu_items(is_visible);
CREATE INDEX idx_menu_items_sort_order ON menu_items(sort_order);
CREATE INDEX idx_menu_items_module_name ON menu_items(module_name);

CREATE INDEX idx_menu_permissions_menu_item_id ON menu_permissions(menu_item_id);
CREATE INDEX idx_menu_permissions_role ON menu_permissions(role);

CREATE INDEX idx_menu_user_permissions_menu_item_id ON menu_user_permissions(menu_item_id);
CREATE INDEX idx_menu_user_permissions_user_id ON menu_user_permissions(user_id);
CREATE INDEX idx_menu_user_permissions_workspace_id ON menu_user_permissions(workspace_id);

-- Create GIN indexes for JSONB columns
CREATE INDEX idx_menu_items_permissions_gin ON menu_items USING GIN (permissions);
CREATE INDEX idx_menu_items_metadata_gin ON menu_items USING GIN (metadata);
CREATE INDEX idx_menu_permissions_additional_gin ON menu_permissions USING GIN (additional_permissions);
CREATE INDEX idx_menu_user_permissions_additional_gin ON menu_user_permissions USING GIN (additional_permissions);

-- Create trigger to automatically update updated_at on menu_items
CREATE TRIGGER update_menu_items_updated_at 
    BEFORE UPDATE ON menu_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add constraints
ALTER TABLE menu_items ADD CONSTRAINT chk_menu_items_title_length 
    CHECK (char_length(title) >= 1 AND char_length(title) <= 255);

-- Prevent circular references in parent-child relationships
ALTER TABLE menu_items ADD CONSTRAINT chk_menu_items_no_self_parent 
    CHECK (id != parent_id);

-- Add comments for documentation
COMMENT ON TABLE menu_items IS 'Hierarchical menu items for workspace navigation';
COMMENT ON COLUMN menu_items.id IS 'Primary key - auto-incrementing integer';
COMMENT ON COLUMN menu_items.uuid IS 'Unique identifier for external references';
COMMENT ON COLUMN menu_items.workspace_id IS 'Workspace this menu item belongs to';
COMMENT ON COLUMN menu_items.parent_id IS 'Parent menu item ID for hierarchical structure';
COMMENT ON COLUMN menu_items.title IS 'Display title of the menu item';
COMMENT ON COLUMN menu_items.icon IS 'Font Awesome icon class';
COMMENT ON COLUMN menu_items.url IS 'External URL (if not using module_name)';
COMMENT ON COLUMN menu_items.module_name IS 'Internal module name to load';
COMMENT ON COLUMN menu_items.target IS 'Link target (_self, _blank, etc.)';
COMMENT ON COLUMN menu_items.sort_order IS 'Sort order within the same level';
COMMENT ON COLUMN menu_items.is_active IS 'Whether the menu item is active';
COMMENT ON COLUMN menu_items.is_visible IS 'Whether the menu item is visible';
COMMENT ON COLUMN menu_items.permissions IS 'JSON array of required permissions';
COMMENT ON COLUMN menu_items.metadata IS 'Additional metadata as JSON';

COMMENT ON TABLE menu_permissions IS 'Role-based permissions for menu items';
COMMENT ON TABLE menu_user_permissions IS 'User-specific permission overrides for menu items';

-- Insert default menu items for the default workspace
INSERT INTO menu_items (uuid, workspace_id, parent_id, title, icon, module_name, sort_order, is_active, is_visible, permissions, metadata, created_at, updated_at)
VALUES 
    -- Top-level menu items
    (uuid_generate_v4(), 1, NULL, 'Dashboard', 'fas fa-tachometer-alt', 'dashboard', 1, true, true, '["dashboard.view"]', '{"description": "Main dashboard with overview"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    (uuid_generate_v4(), 1, NULL, 'User Management', 'fas fa-users', NULL, 2, true, true, '["users.view"]', '{"description": "User management section"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    (uuid_generate_v4(), 1, NULL, 'Workspaces', 'fas fa-briefcase', NULL, 3, true, true, '["workspaces.view"]', '{"description": "Workspace management"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    (uuid_generate_v4(), 1, NULL, 'System', 'fas fa-cogs', NULL, 4, true, true, '["system.view"]', '{"description": "System administration"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    (uuid_generate_v4(), 1, NULL, 'Reports', 'fas fa-chart-bar', 'reports', 5, true, true, '["reports.view"]', '{"description": "Reports and analytics"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert submenu items (using the IDs from the parent items)
INSERT INTO menu_items (uuid, workspace_id, parent_id, title, icon, module_name, sort_order, is_active, is_visible, permissions, metadata, created_at, updated_at)
VALUES 
    -- User Management submenu
    (uuid_generate_v4(), 1, 2, 'Users List', 'fas fa-list', 'users/list', 1, true, true, '["users.view"]', '{"description": "View all users"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 1, 2, 'Create User', 'fas fa-user-plus', 'users/create', 2, true, true, '["users.create"]', '{"description": "Create new user"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 1, 2, 'User Roles', 'fas fa-user-tag', 'users/roles', 3, true, true, '["users.manage_roles"]', '{"description": "Manage user roles"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    -- Workspaces submenu
    (uuid_generate_v4(), 1, 3, 'Workspaces List', 'fas fa-list', 'workspaces/list', 1, true, true, '["workspaces.view"]', '{"description": "View all workspaces"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 1, 3, 'Create Workspace', 'fas fa-plus', 'workspaces/create', 2, true, true, '["workspaces.create"]', '{"description": "Create new workspace"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 1, 3, 'Workspace Settings', 'fas fa-cog', 'workspaces/settings', 3, true, true, '["workspaces.manage"]', '{"description": "Manage workspace settings"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    -- System submenu
    (uuid_generate_v4(), 1, 4, 'System Settings', 'fas fa-cog', 'system/settings', 1, true, true, '["system.settings"]', '{"description": "System configuration"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 1, 4, 'System Logs', 'fas fa-file-alt', 'system/logs', 2, true, true, '["system.logs"]', '{"description": "View system logs"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 1, 4, 'Database Management', 'fas fa-database', 'system/database', 3, true, true, '["system.database"]', '{"description": "Database administration"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 1, 4, 'Menu Management', 'fas fa-bars', 'system/menu', 4, true, true, '["system.menu"]', '{"description": "Manage menu structure"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert default permissions for menu items
-- Admin permissions (full access)
INSERT INTO menu_permissions (menu_item_id, role, can_view, can_edit, can_delete, additional_permissions, created_at)
SELECT 
    id,
    'admin',
    true,
    true,
    true,
    '{"can_manage": true, "can_configure": true}',
    CURRENT_TIMESTAMP
FROM menu_items;

-- Member permissions (limited access)
INSERT INTO menu_permissions (menu_item_id, role, can_view, can_edit, can_delete, additional_permissions, created_at)
SELECT 
    id,
    'member',
    CASE 
        WHEN title IN ('Dashboard', 'Reports', 'Users List', 'Workspaces List') THEN true
        WHEN title LIKE '%List' THEN true
        ELSE false
    END,
    false,
    false,
    '{"can_manage": false, "can_configure": false}',
    CURRENT_TIMESTAMP
FROM menu_items;

-- Viewer permissions (very limited access)
INSERT INTO menu_permissions (menu_item_id, role, can_view, can_edit, can_delete, additional_permissions, created_at)
SELECT 
    id,
    'viewer',
    CASE 
        WHEN title IN ('Dashboard', 'Reports') THEN true
        ELSE false
    END,
    false,
    false,
    '{"can_manage": false, "can_configure": false}',
    CURRENT_TIMESTAMP
FROM menu_items;

-- Create a recursive CTE view for hierarchical menu structure
CREATE VIEW menu_hierarchy AS
WITH RECURSIVE menu_tree AS (
    -- Base case: root menu items
    SELECT 
        id,
        uuid,
        workspace_id,
        parent_id,
        title,
        icon,
        url,
        module_name,
        target,
        sort_order,
        is_active,
        is_visible,
        permissions,
        metadata,
        created_at,
        updated_at,
        0 as level,
        ARRAY[sort_order] as path,
        title as full_path
    FROM menu_items 
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- Recursive case: child menu items
    SELECT 
        mi.id,
        mi.uuid,
        mi.workspace_id,
        mi.parent_id,
        mi.title,
        mi.icon,
        mi.url,
        mi.module_name,
        mi.target,
        mi.sort_order,
        mi.is_active,
        mi.is_visible,
        mi.permissions,
        mi.metadata,
        mi.created_at,
        mi.updated_at,
        mt.level + 1,
        mt.path || mi.sort_order,
        mt.full_path || ' > ' || mi.title
    FROM menu_items mi
    JOIN menu_tree mt ON mi.parent_id = mt.id
)
SELECT * FROM menu_tree;

COMMENT ON VIEW menu_hierarchy IS 'Hierarchical view of menu items with level and path information';

-- Create function to get menu items for a user in a workspace
CREATE OR REPLACE FUNCTION get_user_menu(p_user_id INTEGER, p_workspace_id INTEGER)
RETURNS TABLE (
    id INTEGER,
    uuid UUID,
    parent_id INTEGER,
    title VARCHAR(255),
    icon VARCHAR(100),
    url TEXT,
    module_name VARCHAR(100),
    target VARCHAR(20),
    sort_order INTEGER,
    level INTEGER,
    has_children BOOLEAN,
    can_view BOOLEAN,
    can_edit BOOLEAN,
    can_delete BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH user_role AS (
        SELECT uw.role
        FROM user_workspaces uw
        WHERE uw.user_id = p_user_id AND uw.workspace_id = p_workspace_id
    ),
    menu_with_permissions AS (
        SELECT 
            mh.id,
            mh.uuid,
            mh.parent_id,
            mh.title,
            mh.icon,
            mh.url,
            mh.module_name,
            mh.target,
            mh.sort_order,
            mh.level,
            EXISTS(SELECT 1 FROM menu_items child WHERE child.parent_id = mh.id) as has_children,
            COALESCE(mup.can_view, mp.can_view, false) as can_view,
            COALESCE(mup.can_edit, mp.can_edit, false) as can_edit,
            COALESCE(mup.can_delete, mp.can_delete, false) as can_delete
        FROM menu_hierarchy mh
        LEFT JOIN menu_permissions mp ON mh.id = mp.menu_item_id 
            AND mp.role = (SELECT role FROM user_role)
        LEFT JOIN menu_user_permissions mup ON mh.id = mup.menu_item_id 
            AND mup.user_id = p_user_id 
            AND mup.workspace_id = p_workspace_id
        WHERE mh.workspace_id = p_workspace_id
          AND mh.is_active = true
          AND mh.is_visible = true
    )
    SELECT 
        mwp.id,
        mwp.uuid,
        mwp.parent_id,
        mwp.title,
        mwp.icon,
        mwp.url,
        mwp.module_name,
        mwp.target,
        mwp.sort_order,
        mwp.level,
        mwp.has_children,
        mwp.can_view,
        mwp.can_edit,
        mwp.can_delete
    FROM menu_with_permissions mwp
    WHERE mwp.can_view = true
    ORDER BY mwp.level, mwp.sort_order;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_user_menu(INTEGER, INTEGER) IS 'Get menu items for a specific user in a workspace with permissions';

-- Create function to reorder menu items
CREATE OR REPLACE FUNCTION reorder_menu_items(p_menu_items JSONB)
RETURNS BOOLEAN AS $$
DECLARE
    item JSONB;
BEGIN
    -- Update sort order for each menu item
    FOR item IN SELECT * FROM jsonb_array_elements(p_menu_items)
    LOOP
        UPDATE menu_items 
        SET sort_order = (item->>'sort_order')::INTEGER,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = (item->>'id')::INTEGER;
    END LOOP;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION reorder_menu_items(JSONB) IS 'Reorder menu items based on provided JSON array';
