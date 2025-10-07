-- PostgreSQL Migration: Create users table
-- This migration creates the users table with PostgreSQL-specific features

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    is_admin BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_uuid ON users(uuid);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add constraints
ALTER TABLE users ADD CONSTRAINT chk_users_username_length 
    CHECK (char_length(username) >= 3);

ALTER TABLE users ADD CONSTRAINT chk_users_email_format 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add comments for documentation
COMMENT ON TABLE users IS 'User accounts for the Oneteam application';
COMMENT ON COLUMN users.id IS 'Primary key - auto-incrementing integer';
COMMENT ON COLUMN users.uuid IS 'Unique identifier for external references';
COMMENT ON COLUMN users.username IS 'Unique username for login (3-50 characters)';
COMMENT ON COLUMN users.email IS 'User email address (must be valid format)';
COMMENT ON COLUMN users.password_hash IS 'Argon2ID hashed password';
COMMENT ON COLUMN users.first_name IS 'User first name';
COMMENT ON COLUMN users.last_name IS 'User last name';
COMMENT ON COLUMN users.is_active IS 'Whether the user account is active';
COMMENT ON COLUMN users.is_admin IS 'Whether the user has admin privileges';
COMMENT ON COLUMN users.last_login IS 'Timestamp of last successful login';
COMMENT ON COLUMN users.created_at IS 'Account creation timestamp';
COMMENT ON COLUMN users.updated_at IS 'Last update timestamp (auto-updated)';

-- Insert default admin user
-- Note: Password hash for 'admin123' using Argon2ID
INSERT INTO users (
    uuid, 
    username, 
    email, 
    password_hash, 
    first_name, 
    last_name, 
    is_active, 
    is_admin,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(),
    'admin',
    'admin@oneteam.local',
    '$argon2id$v=19$m=65536,t=4,p=3$c29tZXNhbHQ$YourHashedPasswordHere',
    'System',
    'Administrator',
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Create a view for user display information (excluding sensitive data)
CREATE VIEW user_info AS
SELECT 
    id,
    uuid,
    username,
    email,
    first_name,
    last_name,
    CONCAT(first_name, ' ', last_name) as full_name,
    is_active,
    is_admin,
    last_login,
    created_at,
    updated_at
FROM users;

COMMENT ON VIEW user_info IS 'User information view excluding sensitive data like password hashes';
