-- Create users table
-- This migration creates the users table for storing user account information

-- PostgreSQL version
-- CREATE TABLE users (
--     id SERIAL PRIMARY KEY,
--     uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
--     username VARCHAR(50) UNIQUE NOT NULL,
--     email VARCHAR(255) UNIQUE NOT NULL,
--     password_hash VARCHAR(255) NOT NULL,
--     first_name VARCHAR(100),
--     last_name VARCHAR(100),
--     is_active BOOLEAN DEFAULT true,
--     is_admin BOOLEAN DEFAULT false,
--     last_login TIMESTAMP,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- MariaDB/MySQL version
-- CREATE TABLE users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     uuid CHAR(36) UNIQUE NOT NULL,
--     username VARCHAR(50) UNIQUE NOT NULL,
--     email VARCHAR(255) UNIQUE NOT NULL,
--     password_hash VARCHAR(255) NOT NULL,
--     first_name VARCHAR(100),
--     last_name VARCHAR(100),
--     is_active TINYINT(1) DEFAULT 1,
--     is_admin TINYINT(1) DEFAULT 0,
--     last_login DATETIME,
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SQL Server version
-- CREATE TABLE users (
--     id INT IDENTITY(1,1) PRIMARY KEY,
--     uuid UNIQUEIDENTIFIER DEFAULT NEWID() UNIQUE NOT NULL,
--     username NVARCHAR(50) UNIQUE NOT NULL,
--     email NVARCHAR(255) UNIQUE NOT NULL,
--     password_hash NVARCHAR(255) NOT NULL,
--     first_name NVARCHAR(100),
--     last_name NVARCHAR(100),
--     is_active BIT DEFAULT 1,
--     is_admin BIT DEFAULT 0,
--     last_login DATETIME2,
--     created_at DATETIME2 DEFAULT GETDATE(),
--     updated_at DATETIME2 DEFAULT GETDATE()
-- );

-- SQLite version
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    is_active INTEGER DEFAULT 1,
    is_admin INTEGER DEFAULT 0,
    last_login TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_uuid ON users(uuid);
CREATE INDEX idx_users_active ON users(is_active);

-- Insert default admin user (password: admin123)
INSERT INTO users (uuid, username, email, password_hash, first_name, last_name, is_active, is_admin, created_at, updated_at)
VALUES (
    'admin-uuid-' || substr(hex(randomblob(16)), 1, 32),
    'admin',
    'admin@oneteam.local',
    '$argon2id$v=19$m=65536,t=4,p=3$c29tZXNhbHQ$hash_placeholder',
    'System',
    'Administrator',
    1,
    1,
    datetime('now'),
    datetime('now')
);
