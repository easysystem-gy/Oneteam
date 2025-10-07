# Oneteam - Modern One Page Web Application

Oneteam is a modern, responsive one-page web application built with PHP backend and JavaScript frontend. It features a configurable menu system, multiple workspace support, and a database abstraction layer that supports PostgreSQL, MariaDB, SQL Server, and SQLite.

## 🚀 Features

- **Single Page Application (SPA)** - Modern, responsive interface
- **Multi-Database Support** - PostgreSQL, MariaDB, SQL Server, SQLite
- **Workspace Management** - Multiple profiles/workspaces per user
- **Configurable Menu System** - Database-driven navigation
- **Role-Based Access Control** - Admin, Member, Viewer roles
- **RESTful API** - Complete API with Swagger documentation
- **Responsive Design** - Bootstrap 5 with custom styling
- **Modern UI Components** - jEasyUI integration for tables and layouts
- **IIS Compatible** - Optimized for Windows IIS deployment

## 📋 Requirements

### Server Requirements
- **Web Server**: IIS 8.0+ (recommended) or Apache 2.4+
- **PHP**: 7.4 or higher
- **Database**: One of the following:
  - PostgreSQL 12+
  - MariaDB 10.4+ / MySQL 8.0+
  - SQL Server 2017+
  - SQLite 3.25+

### PHP Extensions
- `pdo` - Database abstraction
- `pdo_pgsql` - PostgreSQL support (if using PostgreSQL)
- `pdo_mysql` - MariaDB/MySQL support (if using MariaDB/MySQL)
- `pdo_sqlsrv` - SQL Server support (if using SQL Server)
- `pdo_sqlite` - SQLite support (if using SQLite)
- `json` - JSON handling
- `mbstring` - Multi-byte string support
- `openssl` - Encryption support

### Client Requirements
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript enabled

## 📦 Installation

### Step 1: Download and Extract

1. Download the latest release or clone the repository:
```bash
git clone https://github.com/easysystem-gy/Oneteam.git
cd Oneteam
```

2. Install PHP dependencies:
```bash
composer install
```

### Step 2: Database Setup

#### Option A: PostgreSQL (Recommended)
1. Create a database and user:
```sql
CREATE DATABASE oneteam;
CREATE USER oneteam_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE oneteam TO oneteam_user;
```

2. Configure environment:
```bash
cp .env.example .env
```

Edit `.env`:
```env
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=oneteam
DB_USERNAME=oneteam_user
DB_PASSWORD=your_secure_password
```

#### Option B: MariaDB/MySQL
1. Create database and user:
```sql
CREATE DATABASE oneteam CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'oneteam_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON oneteam.* TO 'oneteam_user'@'localhost';
FLUSH PRIVILEGES;
```

2. Configure environment:
```env
DB_TYPE=mariadb
DB_HOST=localhost
DB_PORT=3306
DB_NAME=oneteam
DB_USERNAME=oneteam_user
DB_PASSWORD=your_secure_password
```

#### Option C: SQL Server
1. Create database and login:
```sql
CREATE DATABASE oneteam;
CREATE LOGIN oneteam_user WITH PASSWORD = 'your_secure_password';
USE oneteam;
CREATE USER oneteam_user FOR LOGIN oneteam_user;
ALTER ROLE db_owner ADD MEMBER oneteam_user;
```

2. Configure environment:
```env
DB_TYPE=sqlserver
DB_HOST=localhost
DB_PORT=1433
DB_NAME=oneteam
DB_USERNAME=oneteam_user
DB_PASSWORD=your_secure_password
```

#### Option D: SQLite (Development Only)
```env
DB_TYPE=sqlite
DB_PATH=database/oneteam.db
```

### Step 3: Run Database Migrations

Execute the database setup script:
```bash
php install/database-setup.php
```

Or run migrations manually based on your database type:
- PostgreSQL: Use the PostgreSQL sections in migration files
- MariaDB/MySQL: Use the MariaDB sections in migration files
- SQL Server: Use the SQL Server sections in migration files
- SQLite: Use the SQLite sections (default in files)

### Step 4: Web Server Configuration

#### IIS Configuration (Recommended)

1. **Install PHP on IIS**:
   - Download PHP from https://windows.php.net/download/
   - Extract to `C:\PHP`
   - Install PHP Manager for IIS
   - Configure PHP in IIS Manager

2. **Create IIS Site**:
   - Open IIS Manager
   - Right-click "Sites" → "Add Website"
   - Site name: `Oneteam`
   - Physical path: Point to your Oneteam directory
   - Port: 80 (or your preferred port)

3. **Configure URL Rewriting**:
   - Install URL Rewrite Module for IIS
   - The included `web.config` file handles URL rewriting automatically

4. **Set Permissions**:
   - Grant IIS_IUSRS read/write access to:
     - `storage/` directory
     - `logs/` directory
     - `database/` directory (if using SQLite)

#### Apache Configuration (Alternative)

1. **Virtual Host Configuration**:
```apache
<VirtualHost *:80>
    ServerName oneteam.local
    DocumentRoot /path/to/oneteam
    
    <Directory /path/to/oneteam>
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/oneteam_error.log
    CustomLog ${APACHE_LOG_DIR}/oneteam_access.log combined
</VirtualHost>
```

2. **Enable Required Modules**:
```bash
sudo a2enmod rewrite
sudo a2enmod headers
sudo systemctl restart apache2
```

### Step 5: Security Configuration

1. **Generate JWT Secret**:
```bash
# Generate a secure random key
openssl rand -base64 32
```

2. **Update Environment**:
```env
JWT_SECRET=your_generated_jwt_secret_here
APP_ENV=production
APP_DEBUG=false
```

3. **Set File Permissions** (Linux/Unix):
```bash
chmod 755 frontend/
chmod 755 backend/
chmod 777 storage/
chmod 777 logs/
chmod 600 .env
```

### Step 6: Verify Installation

1. **Access the Application**:
   - Open your web browser
   - Navigate to your configured URL (e.g., `http://localhost` or `http://oneteam.local`)

2. **Default Login Credentials**:
   - Username: `admin`
   - Password: `admin123`
   - **⚠️ Change these credentials immediately after first login!**

3. **Test API Documentation**:
   - Visit `/docs/api/` for Swagger API documentation

## 🔧 Configuration

### Application Settings

Edit `.env` file for application configuration:

```env
# Application
APP_NAME=Oneteam
APP_ENV=production
APP_DEBUG=false
APP_URL=http://your-domain.com

# Security
JWT_SECRET=your-jwt-secret-key
SESSION_LIFETIME=3600
CSRF_TOKEN_NAME=csrf_token

# API
API_VERSION=v1
API_RATE_LIMIT=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

### Database Configuration

The application supports multiple database types. Configure your preferred database in the `.env` file:

```env
# PostgreSQL
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432

# MariaDB/MySQL
DB_TYPE=mariadb
DB_HOST=localhost
DB_PORT=3306

# SQL Server
DB_TYPE=sqlserver
DB_HOST=localhost
DB_PORT=1433

# SQLite
DB_TYPE=sqlite
DB_PATH=database/oneteam.db
```

## 📚 Usage

### User Management

1. **Creating Users**:
   - Navigate to User Management → Create User
   - Fill in user details and assign roles
   - Users can be assigned to multiple workspaces

2. **Managing Workspaces**:
   - Navigate to Workspaces → Create Workspace
   - Configure workspace settings and permissions
   - Assign users to workspaces with appropriate roles

3. **Menu Configuration**:
   - Menu items are stored in the database
   - Administrators can modify menu structure
   - Role-based menu visibility

### API Usage

The application provides a RESTful API documented with Swagger:

- **API Base URL**: `/api/v1/`
- **Authentication**: JWT tokens
- **Documentation**: `/docs/api/`

Example API calls:

```javascript
// Login
POST /api/v1/auth/login
{
    "username": "admin",
    "password": "admin123"
}

// Get user workspaces
GET /api/v1/workspaces
Authorization: Bearer your-jwt-token

// Load menu for workspace
GET /api/v1/menu?workspace_id=1
Authorization: Bearer your-jwt-token
```

## 🛠️ Development

### Project Structure

```
Oneteam/
├── backend/                 # PHP backend
│   ├── api/                # API endpoints
│   ├── config/             # Configuration files
│   └── core/               # Core classes
│       ├── Auth/           # Authentication
│       ├── Database/       # Database abstraction
│       └── Menu/           # Menu management
├── frontend/               # Frontend assets
│   ├── assets/
│   │   ├── css/           # Stylesheets
│   │   └── js/            # JavaScript files
│   └── index.html         # Main application file
├── database/              # Database files
│   ├── migrations/        # Database migrations
│   └── seeds/            # Seed data
├── docs/                 # Documentation
├── install/              # Installation scripts
├── logs/                 # Application logs
├── storage/              # File storage
└── tests/                # Test files
```

### Adding New Modules

1. **Create Module Content**:
   - Add HTML content in `frontend/components/`
   - Create corresponding API endpoints in `backend/api/`

2. **Add Menu Item**:
   - Insert menu item in `menu_items` table
   - Set appropriate permissions in `menu_permissions`

3. **Register Module**:
   - Update menu configuration
   - Add routing in API

### Database Migrations

Create new migrations in `database/migrations/`:

```sql
-- 004_create_new_table.sql
CREATE TABLE new_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

Run migrations:
```bash
php install/database-setup.php
```

## 🔒 Security

### Security Features

- **Password Hashing**: Argon2ID algorithm
- **JWT Authentication**: Secure token-based authentication
- **CSRF Protection**: Cross-site request forgery protection
- **SQL Injection Prevention**: Prepared statements
- **XSS Protection**: Input sanitization and output encoding
- **Secure Headers**: Security headers in web.config/.htaccess

### Security Best Practices

1. **Change Default Credentials**: Immediately after installation
2. **Use HTTPS**: In production environments
3. **Regular Updates**: Keep dependencies updated
4. **Database Security**: Use strong passwords and limit privileges
5. **File Permissions**: Set appropriate file system permissions
6. **Environment Variables**: Keep sensitive data in .env file

## 📊 Monitoring and Logging

### Application Logs

Logs are stored in `logs/app.log` and include:
- Authentication attempts
- API requests
- Database queries (in debug mode)
- Error messages

### Log Configuration

Configure logging in `.env`:
```env
LOG_LEVEL=info          # debug, info, warning, error
LOG_FILE=logs/app.log
```

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**:
   ```env
   APP_ENV=production
   APP_DEBUG=false
   ```

2. **Database Optimization**:
   - Enable connection pooling
   - Configure appropriate indexes
   - Regular maintenance tasks

3. **Web Server Optimization**:
   - Enable compression (gzip)
   - Configure caching headers
   - Set up SSL/TLS certificates

4. **Security Hardening**:
   - Remove development files
   - Set restrictive file permissions
   - Configure firewall rules

### Performance Optimization

1. **Frontend Optimization**:
   - Minify CSS and JavaScript
   - Enable browser caching
   - Use CDN for static assets

2. **Backend Optimization**:
   - Enable OPcache
   - Configure database connection pooling
   - Implement application-level caching

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   - Check database credentials in `.env`
   - Verify database server is running
   - Check PHP database extensions

2. **Permission Denied Errors**:
   - Check file permissions on storage/ and logs/
   - Verify web server user has appropriate access

3. **API Endpoints Not Working**:
   - Check URL rewriting configuration
   - Verify .htaccess or web.config is working
   - Check PHP error logs

4. **Login Issues**:
   - Verify database migrations ran successfully
   - Check default user was created
   - Verify JWT secret is configured

### Debug Mode

Enable debug mode for development:
```env
APP_ENV=development
APP_DEBUG=true
LOG_LEVEL=debug
```

## 📞 Support

### Getting Help

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs on GitHub Issues
- **API Documentation**: Visit `/docs/api/` for API reference

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Bootstrap** - Frontend framework
- **jQuery** - JavaScript library
- **jEasyUI** - UI components
- **Font Awesome** - Icons
- **Composer** - PHP dependency management

---

**Oneteam** - Building better teams, one workspace at a time. 🚀
