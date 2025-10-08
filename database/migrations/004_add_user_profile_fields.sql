-- Add user profile fields
-- This migration adds additional profile fields to the users table

-- PostgreSQL version
-- ALTER TABLE users ADD COLUMN phone VARCHAR(20);
-- ALTER TABLE users ADD COLUMN avatar VARCHAR(255);
-- ALTER TABLE users ADD COLUMN bio TEXT;
-- ALTER TABLE users ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC';
-- ALTER TABLE users ADD COLUMN language VARCHAR(10) DEFAULT 'en';
-- ALTER TABLE users ADD COLUMN theme VARCHAR(20) DEFAULT 'light';
-- ALTER TABLE users ADD COLUMN date_format VARCHAR(20) DEFAULT 'Y-m-d';
-- ALTER TABLE users ADD COLUMN time_format VARCHAR(20) DEFAULT 'H:i:s';
-- ALTER TABLE users ADD COLUMN notifications_email BOOLEAN DEFAULT true;
-- ALTER TABLE users ADD COLUMN notifications_browser BOOLEAN DEFAULT true;
-- ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false;
-- ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(32);
-- ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
-- ALTER TABLE users ADD COLUMN email_verification_token VARCHAR(64);
-- ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(64);
-- ALTER TABLE users ADD COLUMN password_reset_expires TIMESTAMP;

-- MariaDB/MySQL version
-- ALTER TABLE users ADD COLUMN phone VARCHAR(20);
-- ALTER TABLE users ADD COLUMN avatar VARCHAR(255);
-- ALTER TABLE users ADD COLUMN bio TEXT;
-- ALTER TABLE users ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC';
-- ALTER TABLE users ADD COLUMN language VARCHAR(10) DEFAULT 'en';
-- ALTER TABLE users ADD COLUMN theme VARCHAR(20) DEFAULT 'light';
-- ALTER TABLE users ADD COLUMN date_format VARCHAR(20) DEFAULT 'Y-m-d';
-- ALTER TABLE users ADD COLUMN time_format VARCHAR(20) DEFAULT 'H:i:s';
-- ALTER TABLE users ADD COLUMN notifications_email TINYINT(1) DEFAULT 1;
-- ALTER TABLE users ADD COLUMN notifications_browser TINYINT(1) DEFAULT 1;
-- ALTER TABLE users ADD COLUMN two_factor_enabled TINYINT(1) DEFAULT 0;
-- ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(32);
-- ALTER TABLE users ADD COLUMN email_verified TINYINT(1) DEFAULT 0;
-- ALTER TABLE users ADD COLUMN email_verification_token VARCHAR(64);
-- ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(64);
-- ALTER TABLE users ADD COLUMN password_reset_expires DATETIME;

-- SQL Server version
-- ALTER TABLE users ADD phone NVARCHAR(20);
-- ALTER TABLE users ADD avatar NVARCHAR(255);
-- ALTER TABLE users ADD bio NTEXT;
-- ALTER TABLE users ADD timezone NVARCHAR(50) DEFAULT 'UTC';
-- ALTER TABLE users ADD language NVARCHAR(10) DEFAULT 'en';
-- ALTER TABLE users ADD theme NVARCHAR(20) DEFAULT 'light';
-- ALTER TABLE users ADD date_format NVARCHAR(20) DEFAULT 'Y-m-d';
-- ALTER TABLE users ADD time_format NVARCHAR(20) DEFAULT 'H:i:s';
-- ALTER TABLE users ADD notifications_email BIT DEFAULT 1;
-- ALTER TABLE users ADD notifications_browser BIT DEFAULT 1;
-- ALTER TABLE users ADD two_factor_enabled BIT DEFAULT 0;
-- ALTER TABLE users ADD two_factor_secret NVARCHAR(32);
-- ALTER TABLE users ADD email_verified BIT DEFAULT 0;
-- ALTER TABLE users ADD email_verification_token NVARCHAR(64);
-- ALTER TABLE users ADD password_reset_token NVARCHAR(64);
-- ALTER TABLE users ADD password_reset_expires DATETIME2;

-- SQLite version
ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN avatar TEXT;
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT 'UTC';
ALTER TABLE users ADD COLUMN language TEXT DEFAULT 'en';
ALTER TABLE users ADD COLUMN theme TEXT DEFAULT 'light';
ALTER TABLE users ADD COLUMN date_format TEXT DEFAULT 'Y-m-d';
ALTER TABLE users ADD COLUMN time_format TEXT DEFAULT 'H:i:s';
ALTER TABLE users ADD COLUMN notifications_email INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN notifications_browser INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN two_factor_enabled INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN two_factor_secret TEXT;
ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN email_verification_token TEXT;
ALTER TABLE users ADD COLUMN password_reset_token TEXT;
ALTER TABLE users ADD COLUMN password_reset_expires TEXT;

-- Create indexes for new fields
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email_verified ON users(email_verified);
CREATE INDEX idx_users_two_factor ON users(two_factor_enabled);
CREATE INDEX idx_users_password_reset_token ON users(password_reset_token);
CREATE INDEX idx_users_email_verification_token ON users(email_verification_token);
