-- PostgreSQL Migration: Create workspaces and user_workspaces tables
-- This migration creates workspace management tables with PostgreSQL-specific features

-- Create workspaces table
CREATE TABLE workspaces (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#0d6efd',
    icon VARCHAR(100) DEFAULT 'fas fa-briefcase',
    is_active BOOLEAN DEFAULT true,
    settings JSONB, -- PostgreSQL native JSON support
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_workspaces_created_by FOREIGN KEY (created_by) 
        REFERENCES users(id) ON DELETE CASCADE
);

-- Create user_workspaces junction table for many-to-many relationship
CREATE TABLE user_workspaces (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    workspace_id INTEGER NOT NULL,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
    is_default BOOLEAN DEFAULT false,
    permissions JSONB, -- Store additional permissions as JSON
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_workspaces_user_id FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_workspaces_workspace_id FOREIGN KEY (workspace_id) 
        REFERENCES workspaces(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_workspaces_user_workspace UNIQUE(user_id, workspace_id)
);

-- Create indexes for better performance
CREATE INDEX idx_workspaces_uuid ON workspaces(uuid);
CREATE INDEX idx_workspaces_name ON workspaces(name);
CREATE INDEX idx_workspaces_active ON workspaces(is_active);
CREATE INDEX idx_workspaces_created_by ON workspaces(created_by);
CREATE INDEX idx_workspaces_created_at ON workspaces(created_at);

CREATE INDEX idx_user_workspaces_user_id ON user_workspaces(user_id);
CREATE INDEX idx_user_workspaces_workspace_id ON user_workspaces(workspace_id);
CREATE INDEX idx_user_workspaces_role ON user_workspaces(role);
CREATE INDEX idx_user_workspaces_default ON user_workspaces(is_default);

-- Create GIN index for JSONB columns for better JSON query performance
CREATE INDEX idx_workspaces_settings_gin ON workspaces USING GIN (settings);
CREATE INDEX idx_user_workspaces_permissions_gin ON user_workspaces USING GIN (permissions);

-- Create trigger to automatically update updated_at on workspaces
CREATE TRIGGER update_workspaces_updated_at 
    BEFORE UPDATE ON workspaces 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add constraints
ALTER TABLE workspaces ADD CONSTRAINT chk_workspaces_name_length 
    CHECK (char_length(name) >= 1 AND char_length(name) <= 255);

ALTER TABLE workspaces ADD CONSTRAINT chk_workspaces_color_format 
    CHECK (color ~* '^#[0-9A-Fa-f]{6}$');

-- Add constraint to ensure only one default workspace per user
CREATE UNIQUE INDEX idx_user_workspaces_default_unique 
    ON user_workspaces(user_id) 
    WHERE is_default = true;

-- Add comments for documentation
COMMENT ON TABLE workspaces IS 'Workspaces/profiles for organizing users and content';
COMMENT ON COLUMN workspaces.id IS 'Primary key - auto-incrementing integer';
COMMENT ON COLUMN workspaces.uuid IS 'Unique identifier for external references';
COMMENT ON COLUMN workspaces.name IS 'Workspace display name';
COMMENT ON COLUMN workspaces.description IS 'Optional workspace description';
COMMENT ON COLUMN workspaces.color IS 'Hex color code for workspace theme';
COMMENT ON COLUMN workspaces.icon IS 'Font Awesome icon class for workspace';
COMMENT ON COLUMN workspaces.is_active IS 'Whether the workspace is active';
COMMENT ON COLUMN workspaces.settings IS 'JSON configuration for workspace-specific settings';
COMMENT ON COLUMN workspaces.created_by IS 'User ID who created the workspace';

COMMENT ON TABLE user_workspaces IS 'Many-to-many relationship between users and workspaces';
COMMENT ON COLUMN user_workspaces.role IS 'User role in the workspace (admin, member, viewer)';
COMMENT ON COLUMN user_workspaces.is_default IS 'Whether this is the user default workspace';
COMMENT ON COLUMN user_workspaces.permissions IS 'Additional JSON permissions for the user in this workspace';

-- Insert default workspace
INSERT INTO workspaces (
    uuid, 
    name, 
    description, 
    color, 
    icon, 
    is_active, 
    settings,
    created_by,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(),
    'Default Workspace',
    'Default workspace for all users',
    '#0d6efd',
    'fas fa-home',
    true,
    '{"theme": "default", "features": {"dashboard": true, "reports": true}}',
    1, -- Admin user ID
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Assign admin user to default workspace
INSERT INTO user_workspaces (
    user_id, 
    workspace_id, 
    role, 
    is_default,
    permissions,
    joined_at
) VALUES (
    1, -- Admin user ID
    1, -- Default workspace ID
    'admin',
    true,
    '{"can_manage_users": true, "can_manage_workspaces": true, "can_manage_settings": true}',
    CURRENT_TIMESTAMP
);

-- Create a view for workspace information with user counts
CREATE VIEW workspace_stats AS
SELECT 
    w.id,
    w.uuid,
    w.name,
    w.description,
    w.color,
    w.icon,
    w.is_active,
    w.settings,
    w.created_by,
    u.username as created_by_username,
    CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
    w.created_at,
    w.updated_at,
    COUNT(uw.user_id) as user_count,
    COUNT(CASE WHEN uw.role = 'admin' THEN 1 END) as admin_count,
    COUNT(CASE WHEN uw.role = 'member' THEN 1 END) as member_count,
    COUNT(CASE WHEN uw.role = 'viewer' THEN 1 END) as viewer_count
FROM workspaces w
LEFT JOIN users u ON w.created_by = u.id
LEFT JOIN user_workspaces uw ON w.id = uw.workspace_id
GROUP BY w.id, w.uuid, w.name, w.description, w.color, w.icon, w.is_active, 
         w.settings, w.created_by, u.username, u.first_name, u.last_name, 
         w.created_at, w.updated_at;

COMMENT ON VIEW workspace_stats IS 'Workspace information with user statistics';

-- Create a view for user workspace relationships
CREATE VIEW user_workspace_details AS
SELECT 
    uw.id,
    uw.user_id,
    u.username,
    u.email,
    CONCAT(u.first_name, ' ', u.last_name) as user_name,
    uw.workspace_id,
    w.name as workspace_name,
    w.color as workspace_color,
    w.icon as workspace_icon,
    uw.role,
    uw.is_default,
    uw.permissions,
    uw.joined_at,
    u.is_active as user_active,
    w.is_active as workspace_active
FROM user_workspaces uw
JOIN users u ON uw.user_id = u.id
JOIN workspaces w ON uw.workspace_id = w.id;

COMMENT ON VIEW user_workspace_details IS 'Detailed view of user-workspace relationships';

-- Create function to get user workspaces with role information
CREATE OR REPLACE FUNCTION get_user_workspaces(p_user_id INTEGER)
RETURNS TABLE (
    workspace_id INTEGER,
    workspace_uuid UUID,
    workspace_name VARCHAR(255),
    workspace_description TEXT,
    workspace_color VARCHAR(7),
    workspace_icon VARCHAR(100),
    user_role VARCHAR(20),
    is_default BOOLEAN,
    permissions JSONB,
    joined_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id,
        w.uuid,
        w.name,
        w.description,
        w.color,
        w.icon,
        uw.role,
        uw.is_default,
        uw.permissions,
        uw.joined_at
    FROM workspaces w
    JOIN user_workspaces uw ON w.id = uw.workspace_id
    WHERE uw.user_id = p_user_id 
      AND w.is_active = true
    ORDER BY uw.is_default DESC, w.name ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_user_workspaces(INTEGER) IS 'Get all workspaces for a specific user with role information';
