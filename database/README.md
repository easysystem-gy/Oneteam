# Oneteam Database Setup

This directory contains database setup scripts and configuration for the Oneteam application.

## PostgreSQL Setup (Recommended)

### Prerequisites
- PostgreSQL 12+ installed and running
- Access to PostgreSQL superuser account (postgres)

### Quick Setup

1. **Create Database and User** (as postgres superuser):
```sql
CREATE DATABASE oneteam;
CREATE USER oneteam_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE oneteam TO oneteam_user;
```

2. **Run Setup Script**:
```bash
psql -U postgres -d oneteam -f postgresql_setup.sql
```

3. **Configure Environment**:
Copy `.env.example` to `.env` and update the database credentials:
```env
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=oneteam
DB_USERNAME=oneteam_user
DB_PASSWORD=your_secure_password
```

### Manual Setup

If you prefer to set up manually, connect to your PostgreSQL database and run:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE oneteam;
CREATE USER oneteam_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE oneteam TO oneteam_user;

# Connect to the oneteam database
\c oneteam

# Run the setup script
\i postgresql_setup.sql
```

### Default Credentials

The setup script creates a default admin user:
- **Username**: admin
- **Password**: admin123
- **Email**: admin@oneteam.local

**⚠️ Important**: Change the default password after first login!

### Database Schema

The setup creates the following tables:
- `workspaces` - Application workspaces
- `menu_items` - Dynamic menu structure
- `users` - User accounts
- `user_workspaces` - User-workspace relationships

### Testing the Connection

After setup, you can test the database connection using the included test page:
1. Open `test_menu.html` in your browser
2. Click "Test Menu API"
3. Verify that menu items are loaded successfully

## Alternative Database Support

Oneteam also supports:
- MariaDB/MySQL
- SQL Server
- SQLite (for development)

See the main README.md for configuration details for other databases.

## Troubleshooting

### Connection Issues
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check connection settings in `.env` file
- Ensure user has proper permissions
- Check PostgreSQL logs: `/var/log/postgresql/`

### Permission Issues
```sql
-- Grant additional permissions if needed
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO oneteam_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO oneteam_user;
```

### Reset Database
```sql
-- Drop and recreate database (WARNING: This deletes all data!)
DROP DATABASE IF EXISTS oneteam;
CREATE DATABASE oneteam;
-- Then run the setup script again
```
