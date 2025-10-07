# PostgreSQL Database Migrations for Oneteam

This directory contains PostgreSQL-specific database migrations that take full advantage of PostgreSQL's advanced features including UUID generation, JSONB support, recursive CTEs, stored functions, and triggers.

## 🚀 Quick Setup

### Prerequisites
- PostgreSQL 12+ (recommended: PostgreSQL 14+)
- PHP 7.4+ with `pdo_pgsql` extension
- Composer dependencies installed

### Installation

1. **Configure Environment**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your PostgreSQL settings:
   ```env
   DB_TYPE=postgresql
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=oneteam
   DB_USERNAME=oneteam_user
   DB_PASSWORD=your_secure_password
   DB_SSLMODE=prefer
   ```

2. **Create Database and User**:
   ```sql
   -- Connect as superuser (postgres)
   CREATE DATABASE oneteam;
   CREATE USER oneteam_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE oneteam TO oneteam_user;
   
   -- Connect to the oneteam database
   \c oneteam
   GRANT ALL ON SCHEMA public TO oneteam_user;
   GRANT CREATE ON SCHEMA public TO oneteam_user;
   ```

3. **Run PostgreSQL-Specific Setup**:
   ```bash
   php install/postgresql-setup.php
   ```

## 📁 Migration Files

### 001_create_users_table.sql
**PostgreSQL Features Used:**
- ✅ **UUID Extension**: `uuid-ossp` extension for UUID generation
- ✅ **SERIAL Primary Keys**: Auto-incrementing integer IDs
- ✅ **Timestamp with Time Zone**: Proper timezone handling
- ✅ **Triggers**: Automatic `updated_at` timestamp updates
- ✅ **Check Constraints**: Data validation at database level
- ✅ **Regex Validation**: Email format validation using PostgreSQL regex
- ✅ **Comments**: Comprehensive table and column documentation
- ✅ **Views**: `user_info` view excluding sensitive data

**Key Features:**
- Automatic UUID generation for external references
- Email format validation with regex
- Username length validation (minimum 3 characters)
- Automatic timestamp updates on row changes
- Secure password hash storage (Argon2ID)

### 002_create_workspaces_table.sql
**PostgreSQL Features Used:**
- ✅ **JSONB Storage**: Native JSON support for settings and permissions
- ✅ **GIN Indexes**: Optimized JSON querying with GIN indexes
- ✅ **Foreign Key Constraints**: Referential integrity with CASCADE options
- ✅ **Unique Constraints**: Prevent duplicate user-workspace relationships
- ✅ **Partial Indexes**: Unique index for default workspace per user
- ✅ **Aggregate Views**: Workspace statistics with user counts
- ✅ **Stored Functions**: `get_user_workspaces()` function

**Key Features:**
- JSONB storage for flexible workspace settings
- Role-based access control (admin, member, viewer)
- One default workspace per user constraint
- Comprehensive workspace statistics view
- Efficient JSON querying with GIN indexes

### 003_create_menu_items_table.sql
**PostgreSQL Features Used:**
- ✅ **Recursive CTEs**: Hierarchical menu structure with `menu_hierarchy` view
- ✅ **Self-Referencing Foreign Keys**: Parent-child menu relationships
- ✅ **JSONB Permissions**: Flexible permission storage
- ✅ **Complex Functions**: `get_user_menu()` with role-based filtering
- ✅ **Array Operations**: Path tracking in hierarchical queries
- ✅ **Multiple Permission Tables**: Role-based and user-specific permissions
- ✅ **Constraint Checks**: Prevent circular references

**Key Features:**
- Unlimited menu hierarchy depth with recursive queries
- Role-based and user-specific permission overrides
- Efficient menu rendering with single function call
- Drag-and-drop reordering support
- Comprehensive permission system

### 004_create_sessions_table.sql
**PostgreSQL Features Used:**
- ✅ **INET Data Type**: Native IP address storage and operations
- ✅ **Advanced Functions**: Login statistics and security monitoring
- ✅ **Time Intervals**: Flexible time-based queries
- ✅ **Audit Logging**: Comprehensive action tracking with JSONB
- ✅ **Security Functions**: Suspicious activity detection
- ✅ **Maintenance Functions**: Automated cleanup procedures
- ✅ **Statistical Views**: Login attempt analysis

**Key Features:**
- JWT token hash storage for session validation
- Comprehensive audit trail with before/after values
- Automated session cleanup and maintenance
- Security monitoring and suspicious activity detection
- Password reset token management
- Login attempt tracking and analysis

## 🔧 PostgreSQL-Specific Features

### UUID Support
```sql
-- Automatic UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
uuid UUID DEFAULT uuid_generate_v4()
```

### JSONB Storage and Indexing
```sql
-- JSONB columns with GIN indexes for fast querying
settings JSONB,
CREATE INDEX idx_workspaces_settings_gin ON workspaces USING GIN (settings);

-- Query examples
SELECT * FROM workspaces WHERE settings @> '{"theme": "dark"}';
SELECT * FROM workspaces WHERE settings ? 'features';
```

### Recursive Queries
```sql
-- Hierarchical menu structure
WITH RECURSIVE menu_tree AS (
    SELECT *, 0 as level FROM menu_items WHERE parent_id IS NULL
    UNION ALL
    SELECT mi.*, mt.level + 1 FROM menu_items mi
    JOIN menu_tree mt ON mi.parent_id = mt.id
)
SELECT * FROM menu_tree ORDER BY level, sort_order;
```

### Stored Functions
```sql
-- Get user workspaces with permissions
SELECT * FROM get_user_workspaces(1);

-- Get user menu with role filtering
SELECT * FROM get_user_menu(1, 1);

-- Security monitoring
SELECT * FROM check_suspicious_activity('192.168.1.100'::INET);
```

### Automatic Triggers
```sql
-- Automatic updated_at timestamp
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## 📊 Database Views

### user_info
Secure user information view excluding password hashes:
```sql
SELECT * FROM user_info WHERE is_active = true;
```

### workspace_stats
Workspace information with user statistics:
```sql
SELECT name, user_count, admin_count FROM workspace_stats;
```

### menu_hierarchy
Hierarchical menu structure with levels and paths:
```sql
SELECT title, level, full_path FROM menu_hierarchy ORDER BY path;
```

### active_sessions
Currently active user sessions:
```sql
SELECT username, ip_address, expires_at FROM active_sessions;
```

## 🛠️ Maintenance Functions

### Session Cleanup
```sql
-- Clean up expired sessions
SELECT cleanup_expired_sessions();
```

### Audit Log Cleanup
```sql
-- Clean up old audit logs (keep 90 days)
SELECT cleanup_old_audit_logs(90);
```

### Scheduled Maintenance
```sql
-- Run all maintenance tasks
SELECT scheduled_maintenance();
```

### User Statistics
```sql
-- Get user login statistics for last 30 days
SELECT * FROM get_user_login_stats(1, 30);
```

## 🔐 Security Features

### Password Security
- Argon2ID password hashing with configurable parameters
- Secure password reset token management
- Login attempt tracking and rate limiting

### Session Management
- JWT token hash validation
- IP address and user agent tracking
- Automatic session expiration
- Suspicious activity detection

### Audit Trail
- Comprehensive action logging with before/after values
- User and session tracking
- IP address and timestamp recording
- Automated cleanup of old audit data

## 📈 Performance Optimizations

### Indexes
- **B-tree indexes** on frequently queried columns
- **GIN indexes** on JSONB columns for fast JSON queries
- **Partial indexes** for conditional uniqueness
- **Composite indexes** for multi-column queries

### Query Optimization
- **Recursive CTEs** for hierarchical data
- **Window functions** for analytics
- **Aggregate functions** for statistics
- **Prepared statements** for security and performance

## 🔧 Administration

### Useful PostgreSQL Commands

```sql
-- View all tables
\dt

-- View table structure
\d users

-- View indexes
\di

-- View functions
\df

-- View views
\dv

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- View active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = current_database();
```

### Backup and Restore

```bash
# Backup database
pg_dump -h localhost -U oneteam_user -d oneteam > oneteam_backup.sql

# Restore database
psql -h localhost -U oneteam_user -d oneteam < oneteam_backup.sql

# Backup with compression
pg_dump -h localhost -U oneteam_user -d oneteam | gzip > oneteam_backup.sql.gz

# Restore from compressed backup
gunzip -c oneteam_backup.sql.gz | psql -h localhost -U oneteam_user -d oneteam
```

## 🚨 Troubleshooting

### Common Issues

1. **UUID Extension Not Available**:
   ```sql
   -- Install uuid-ossp extension
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

2. **Permission Denied**:
   ```sql
   -- Grant necessary permissions
   GRANT ALL ON SCHEMA public TO oneteam_user;
   GRANT CREATE ON SCHEMA public TO oneteam_user;
   ```

3. **Connection Issues**:
   - Check `pg_hba.conf` for authentication settings
   - Verify `postgresql.conf` for connection settings
   - Ensure PostgreSQL service is running

4. **Performance Issues**:
   - Run `ANALYZE` to update table statistics
   - Check query plans with `EXPLAIN ANALYZE`
   - Consider adding indexes for slow queries

### Monitoring

```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check table statistics
SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del
FROM pg_stat_user_tables;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL JSON Functions](https://www.postgresql.org/docs/current/functions-json.html)
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)

---

**Note**: These migrations are specifically optimized for PostgreSQL and take advantage of its advanced features. For other database systems, use the generic migrations in the parent directory.
