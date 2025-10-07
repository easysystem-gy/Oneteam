-- PostgreSQL Migration: Create sessions and audit tables
-- This migration creates session management and audit logging tables

-- Create sessions table for JWT token management
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    workspace_id INTEGER,
    token_hash VARCHAR(255) NOT NULL, -- Hash of the JWT token
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sessions_user_id FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_sessions_workspace_id FOREIGN KEY (workspace_id) 
        REFERENCES workspaces(id) ON DELETE SET NULL
);

-- Create audit_logs table for tracking user actions
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id INTEGER,
    workspace_id INTEGER,
    session_id INTEGER,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_logs_user_id FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_audit_logs_workspace_id FOREIGN KEY (workspace_id) 
        REFERENCES workspaces(id) ON DELETE SET NULL,
    CONSTRAINT fk_audit_logs_session_id FOREIGN KEY (session_id) 
        REFERENCES sessions(id) ON DELETE SET NULL
);

-- Create password_resets table for password recovery
CREATE TABLE password_resets (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_password_resets_user_id FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

-- Create login_attempts table for security monitoring
CREATE TABLE login_attempts (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    username VARCHAR(50),
    email VARCHAR(255),
    ip_address INET NOT NULL,
    user_agent TEXT,
    success BOOLEAN DEFAULT false,
    failure_reason VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_workspace_id ON sessions(workspace_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_active ON sessions(is_active);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_ip_address ON sessions(ip_address);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_workspace_id ON audit_logs(workspace_id);
CREATE INDEX idx_audit_logs_session_id ON audit_logs(session_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX idx_password_resets_token_hash ON password_resets(token_hash);
CREATE INDEX idx_password_resets_expires_at ON password_resets(expires_at);
CREATE INDEX idx_password_resets_used_at ON password_resets(used_at);

CREATE INDEX idx_login_attempts_username ON login_attempts(username);
CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_ip_address ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_success ON login_attempts(success);
CREATE INDEX idx_login_attempts_created_at ON login_attempts(created_at);

-- Create GIN indexes for JSONB columns
CREATE INDEX idx_audit_logs_old_values_gin ON audit_logs USING GIN (old_values);
CREATE INDEX idx_audit_logs_new_values_gin ON audit_logs USING GIN (new_values);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_sessions_updated_at 
    BEFORE UPDATE ON sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add constraints
ALTER TABLE sessions ADD CONSTRAINT chk_sessions_expires_future 
    CHECK (expires_at > created_at);

ALTER TABLE password_resets ADD CONSTRAINT chk_password_resets_expires_future 
    CHECK (expires_at > created_at);

-- Add comments for documentation
COMMENT ON TABLE sessions IS 'Active user sessions with JWT token management';
COMMENT ON COLUMN sessions.token_hash IS 'SHA-256 hash of the JWT token for validation';
COMMENT ON COLUMN sessions.ip_address IS 'IP address where the session was created';
COMMENT ON COLUMN sessions.user_agent IS 'Browser/client user agent string';
COMMENT ON COLUMN sessions.expires_at IS 'When the session expires';

COMMENT ON TABLE audit_logs IS 'Audit trail of user actions and system changes';
COMMENT ON COLUMN audit_logs.action IS 'Action performed (CREATE, UPDATE, DELETE, LOGIN, etc.)';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected (user, workspace, menu_item, etc.)';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID of the affected resource';
COMMENT ON COLUMN audit_logs.old_values IS 'Previous values before change (JSON)';
COMMENT ON COLUMN audit_logs.new_values IS 'New values after change (JSON)';

COMMENT ON TABLE password_resets IS 'Password reset tokens for user account recovery';
COMMENT ON COLUMN password_resets.token_hash IS 'SHA-256 hash of the reset token';
COMMENT ON COLUMN password_resets.used_at IS 'When the reset token was used (NULL if unused)';

COMMENT ON TABLE login_attempts IS 'Login attempts for security monitoring and rate limiting';
COMMENT ON COLUMN login_attempts.success IS 'Whether the login attempt was successful';
COMMENT ON COLUMN login_attempts.failure_reason IS 'Reason for login failure (invalid_credentials, account_locked, etc.)';

-- Create view for active sessions with user information
CREATE VIEW active_sessions AS
SELECT 
    s.id,
    s.uuid,
    s.user_id,
    u.username,
    u.email,
    CONCAT(u.first_name, ' ', u.last_name) as user_name,
    s.workspace_id,
    w.name as workspace_name,
    s.ip_address,
    s.user_agent,
    s.expires_at,
    s.created_at,
    s.updated_at,
    EXTRACT(EPOCH FROM (s.expires_at - CURRENT_TIMESTAMP)) as seconds_until_expiry
FROM sessions s
JOIN users u ON s.user_id = u.id
LEFT JOIN workspaces w ON s.workspace_id = w.id
WHERE s.is_active = true 
  AND s.expires_at > CURRENT_TIMESTAMP;

COMMENT ON VIEW active_sessions IS 'Currently active user sessions with user and workspace information';

-- Create view for recent audit activity
CREATE VIEW recent_audit_activity AS
SELECT 
    al.id,
    al.uuid,
    al.user_id,
    u.username,
    CONCAT(u.first_name, ' ', u.last_name) as user_name,
    al.workspace_id,
    w.name as workspace_name,
    al.action,
    al.resource_type,
    al.resource_id,
    al.ip_address,
    al.created_at,
    CASE 
        WHEN al.created_at > CURRENT_TIMESTAMP - INTERVAL '1 hour' THEN 'recent'
        WHEN al.created_at > CURRENT_TIMESTAMP - INTERVAL '1 day' THEN 'today'
        WHEN al.created_at > CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 'this_week'
        ELSE 'older'
    END as time_category
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
LEFT JOIN workspaces w ON al.workspace_id = w.id
ORDER BY al.created_at DESC;

COMMENT ON VIEW recent_audit_activity IS 'Recent audit activity with user and workspace information';

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Mark expired sessions as inactive
    UPDATE sessions 
    SET is_active = false, 
        updated_at = CURRENT_TIMESTAMP
    WHERE is_active = true 
      AND expires_at <= CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup action
    INSERT INTO audit_logs (action, resource_type, new_values, created_at)
    VALUES (
        'CLEANUP_SESSIONS',
        'session',
        jsonb_build_object('expired_sessions_count', deleted_count),
        CURRENT_TIMESTAMP
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_sessions() IS 'Mark expired sessions as inactive and return count of affected sessions';

-- Create function to clean up old audit logs
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(p_days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete audit logs older than specified days
    DELETE FROM audit_logs 
    WHERE created_at < CURRENT_TIMESTAMP - (p_days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup action
    INSERT INTO audit_logs (action, resource_type, new_values, created_at)
    VALUES (
        'CLEANUP_AUDIT_LOGS',
        'audit_log',
        jsonb_build_object(
            'deleted_logs_count', deleted_count,
            'days_kept', p_days_to_keep
        ),
        CURRENT_TIMESTAMP
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_audit_logs(INTEGER) IS 'Delete audit logs older than specified days (default 90)';

-- Create function to get user login statistics
CREATE OR REPLACE FUNCTION get_user_login_stats(p_user_id INTEGER, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    total_attempts INTEGER,
    successful_logins INTEGER,
    failed_attempts INTEGER,
    success_rate NUMERIC,
    last_login TIMESTAMP WITH TIME ZONE,
    last_failed_attempt TIMESTAMP WITH TIME ZONE,
    unique_ip_addresses BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH user_info AS (
        SELECT username, email FROM users WHERE id = p_user_id
    ),
    login_stats AS (
        SELECT 
            COUNT(*) as total_attempts,
            COUNT(CASE WHEN success = true THEN 1 END) as successful_logins,
            COUNT(CASE WHEN success = false THEN 1 END) as failed_attempts,
            MAX(CASE WHEN success = true THEN created_at END) as last_login,
            MAX(CASE WHEN success = false THEN created_at END) as last_failed_attempt,
            COUNT(DISTINCT ip_address) as unique_ip_addresses
        FROM login_attempts la
        JOIN user_info ui ON (la.username = ui.username OR la.email = ui.email)
        WHERE la.created_at >= CURRENT_TIMESTAMP - (p_days || ' days')::INTERVAL
    )
    SELECT 
        ls.total_attempts::INTEGER,
        ls.successful_logins::INTEGER,
        ls.failed_attempts::INTEGER,
        CASE 
            WHEN ls.total_attempts > 0 THEN 
                ROUND((ls.successful_logins::NUMERIC / ls.total_attempts::NUMERIC) * 100, 2)
            ELSE 0
        END as success_rate,
        ls.last_login,
        ls.last_failed_attempt,
        ls.unique_ip_addresses
    FROM login_stats ls;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_user_login_stats(INTEGER, INTEGER) IS 'Get login statistics for a user over specified days';

-- Create function to check for suspicious login activity
CREATE OR REPLACE FUNCTION check_suspicious_activity(p_ip_address INET, p_time_window INTEGER DEFAULT 60)
RETURNS TABLE (
    is_suspicious BOOLEAN,
    attempt_count INTEGER,
    failed_count INTEGER,
    unique_usernames INTEGER,
    first_attempt TIMESTAMP WITH TIME ZONE,
    last_attempt TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    WITH activity_stats AS (
        SELECT 
            COUNT(*) as attempt_count,
            COUNT(CASE WHEN success = false THEN 1 END) as failed_count,
            COUNT(DISTINCT COALESCE(username, email)) as unique_usernames,
            MIN(created_at) as first_attempt,
            MAX(created_at) as last_attempt
        FROM login_attempts
        WHERE ip_address = p_ip_address
          AND created_at >= CURRENT_TIMESTAMP - (p_time_window || ' minutes')::INTERVAL
    )
    SELECT 
        CASE 
            WHEN as_stats.failed_count >= 5 OR as_stats.unique_usernames >= 3 THEN true
            ELSE false
        END as is_suspicious,
        as_stats.attempt_count::INTEGER,
        as_stats.failed_count::INTEGER,
        as_stats.unique_usernames::INTEGER,
        as_stats.first_attempt,
        as_stats.last_attempt
    FROM activity_stats as_stats;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_suspicious_activity(INET, INTEGER) IS 'Check for suspicious login activity from an IP address';

-- Create a scheduled job function (to be called by cron or pg_cron)
CREATE OR REPLACE FUNCTION scheduled_maintenance()
RETURNS TEXT AS $$
DECLARE
    expired_sessions INTEGER;
    old_audit_logs INTEGER;
    old_password_resets INTEGER;
    result TEXT;
BEGIN
    -- Clean up expired sessions
    SELECT cleanup_expired_sessions() INTO expired_sessions;
    
    -- Clean up old audit logs (keep 90 days)
    SELECT cleanup_old_audit_logs(90) INTO old_audit_logs;
    
    -- Clean up old password reset tokens
    DELETE FROM password_resets 
    WHERE expires_at < CURRENT_TIMESTAMP OR used_at IS NOT NULL;
    GET DIAGNOSTICS old_password_resets = ROW_COUNT;
    
    -- Build result message
    result := format(
        'Maintenance completed: %s expired sessions, %s old audit logs, %s old password resets',
        expired_sessions, old_audit_logs, old_password_resets
    );
    
    -- Log the maintenance action
    INSERT INTO audit_logs (action, resource_type, new_values, created_at)
    VALUES (
        'SCHEDULED_MAINTENANCE',
        'system',
        jsonb_build_object(
            'expired_sessions', expired_sessions,
            'old_audit_logs', old_audit_logs,
            'old_password_resets', old_password_resets
        ),
        CURRENT_TIMESTAMP
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION scheduled_maintenance() IS 'Perform scheduled maintenance tasks (cleanup expired data)';
