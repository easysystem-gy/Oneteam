# Oneteam Application - Complete Technical Specification

## Executive Summary

**Oneteam** is a modern, enterprise-grade single-page web application designed for workspace-based team collaboration and management. Built with a robust PHP backend and dynamic JavaScript frontend, it provides a flexible, scalable platform for organizations requiring multi-tenant workspace management with role-based access control.

### Key Characteristics
- **Application Type**: Single-Page Application (SPA) with dynamic content loading
- **Target Users**: Teams, organizations, and enterprises requiring workspace management
- **Deployment**: Production-ready for IIS servers with multi-database support
- **Architecture**: Modern web application following MVC patterns and RESTful API design

---

## Technical Architecture

### Frontend Stack
- **HTML5/CSS3**: Modern semantic markup with responsive design
- **JavaScript Framework**: jQuery for DOM manipulation and AJAX
- **UI Framework**: Bootstrap for responsive grid system and components
- **Data Tables**: jEasyUI Framework for advanced table functionality and layouts
- **Architecture Pattern**: Single-Page Application with dynamic content injection

### Backend Stack
- **Language**: PHP 8.1+ with object-oriented programming
- **Database Layer**: PDO with database abstraction layer
- **API Design**: RESTful endpoints with JSON responses
- **Authentication**: Session-based with workspace isolation
- **Documentation**: Swagger/OpenAPI specification

### Database Support
**Primary Database**: PostgreSQL 12+
**Alternative Support**:
- MariaDB/MySQL 8.0+
- Microsoft SQL Server 2019+
- SQLite 3.x (development/testing)

### Server Environment
- **Web Server**: Microsoft IIS 10+ (primary target)
- **PHP Version**: 8.1 or higher
- **Extensions Required**: PDO, pdo_pgsql, pdo_mysql, pdo_sqlsrv, pdo_sqlite
- **Operating System**: Windows Server 2019+ (IIS deployment)

---

## Application Features

### Core Functionality

#### 1. Authentication System
- **Login Screen**: Secure user authentication with session management
- **User Profiles**: Individual user accounts with customizable profiles
- **Session Management**: Configurable session timeouts and security
- **Password Security**: Hashed passwords with configurable complexity requirements

#### 2. Workspace Management
- **Multi-Tenant Architecture**: Isolated workspaces for different teams/projects
- **Workspace Switching**: Users can belong to multiple workspaces
- **Role-Based Access**: Configurable permissions per workspace
- **Workspace Settings**: Customizable workspace configurations

#### 3. Dynamic Menu System
- **Database-Driven Menus**: Configurable menu structure stored in database
- **Hierarchical Structure**: Support for nested menu items and submenus
- **Collapsible Sidebar**: Space-efficient left navigation panel
- **Icon Integration**: FontAwesome icons for visual menu identification
- **Workspace Isolation**: Menu items filtered by current workspace

#### 4. Content Management
- **Dynamic Loading**: Content modules loaded via AJAX into center div
- **Module System**: Extensible architecture for adding new functionality
- **Content Caching**: Configurable caching for improved performance
- **Error Handling**: Graceful error handling with user-friendly messages

### Advanced Features

#### 5. User Management
- **User Administration**: Create, edit, and manage user accounts
- **Role Assignment**: Assign users to workspaces with specific roles
- **User Profiles**: Detailed user information and preferences
- **Activity Tracking**: User login and activity monitoring

#### 6. API Infrastructure
- **RESTful Design**: Standard HTTP methods and status codes
- **JSON Responses**: Consistent API response format
- **Error Handling**: Comprehensive error responses with proper HTTP codes
- **Documentation**: Swagger/OpenAPI documentation for all endpoints
- **Versioning**: API versioning support for backward compatibility

#### 7. Security Features
- **CSRF Protection**: Cross-site request forgery prevention
- **Input Validation**: Server-side validation for all user inputs
- **SQL Injection Prevention**: Parameterized queries throughout
- **Session Security**: Secure session configuration and management
- **Access Control**: Workspace-based permission system

---

## Database Architecture

### Core Tables

#### workspaces
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR(255)) - Workspace display name
- description (TEXT) - Workspace description
- is_active (BOOLEAN) - Active status
- created_at, updated_at (TIMESTAMP)
```

#### users
```sql
- id (SERIAL PRIMARY KEY)
- uuid (VARCHAR(255) UNIQUE) - Universal identifier
- username (VARCHAR(100) UNIQUE) - Login username
- email (VARCHAR(255) UNIQUE) - User email
- password_hash (VARCHAR(255)) - Hashed password
- first_name, last_name (VARCHAR(100)) - User names
- is_active (BOOLEAN) - Account status
- last_login (TIMESTAMP) - Last login tracking
- created_at, updated_at (TIMESTAMP)
```

#### menu_items
```sql
- id (SERIAL PRIMARY KEY)
- uuid (VARCHAR(255) UNIQUE) - Universal identifier
- workspace_id (INTEGER) - Workspace association
- parent_id (INTEGER) - Hierarchical structure
- title (VARCHAR(255)) - Menu display text
- icon (VARCHAR(100)) - FontAwesome icon class
- module_name (VARCHAR(255)) - Associated module
- sort_order (INTEGER) - Display ordering
- is_active (BOOLEAN) - Visibility status
- created_at, updated_at (TIMESTAMP)
```

#### user_workspaces
```sql
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER) - User reference
- workspace_id (INTEGER) - Workspace reference
- role (VARCHAR(50)) - User role in workspace
- is_active (BOOLEAN) - Membership status
- created_at (TIMESTAMP)
```

### Database Features
- **Foreign Key Constraints**: Referential integrity enforcement
- **Indexes**: Performance optimization for common queries
- **Cascading Deletes**: Proper cleanup of related records
- **Default Values**: Sensible defaults for all fields
- **UUID Support**: Universal identifiers for external integrations

---

## API Specification

### Authentication Endpoints
```
POST /api/auth/login - User authentication
POST /api/auth/logout - Session termination
GET /api/auth/profile - Current user profile
PUT /api/auth/profile - Update user profile
```

### Menu Management
```
GET /api/menu - Retrieve workspace menu items
POST /api/menu - Create new menu item
PUT /api/menu/{id} - Update menu item
DELETE /api/menu/{id} - Delete menu item
POST /api/menu/reorder - Reorder menu items
```

### User Management
```
GET /api/users - List workspace users
POST /api/users - Create new user
PUT /api/users/{id} - Update user
DELETE /api/users/{id} - Delete user
```

### Workspace Management
```
GET /api/workspaces - List user workspaces
POST /api/workspaces - Create workspace
PUT /api/workspaces/{id} - Update workspace
DELETE /api/workspaces/{id} - Delete workspace
POST /api/workspaces/{id}/select - Switch workspace
```

### Content Loading
```
GET /api/content/{module} - Load module content
POST /api/content/{module} - Save module content
POST /api/content/upload - File upload handling
```

---

## Frontend Architecture

### JavaScript Organization
```
frontend/assets/js/
├── config.js - Application configuration
├── utils.js - Utility functions and helpers
├── auth.js - Authentication handling
├── menu.js - Menu system management
├── content.js - Content loading and management
├── workspace.js - Workspace switching logic
└── app.js - Main application initialization
```

### CSS Structure
```
frontend/assets/css/
├── bootstrap.min.css - Bootstrap framework
├── jeasyui.css - jEasyUI components
├── fontawesome.css - Icon fonts
├── app.css - Application-specific styles
└── themes/ - Customizable themes
```

### Key JavaScript Components

#### Application Initialization
- **App.js**: Main application bootstrap and initialization
- **Config.js**: Centralized configuration management
- **Utils.js**: Common utility functions and AJAX helpers

#### Authentication System
- **Auth.js**: Login/logout handling and session management
- **Session Management**: Automatic session timeout and renewal
- **Security**: CSRF token handling and secure requests

#### Menu System
- **Menu.js**: Dynamic menu rendering and interaction
- **Hierarchical Display**: Nested menu support with expand/collapse
- **State Persistence**: Remember menu state across sessions

#### Content Management
- **Content.js**: Dynamic content loading and caching
- **Module System**: Pluggable content modules
- **Error Handling**: Graceful error display and recovery

---

## Configuration and Environment

### Environment Variables (.env)
```env
# Database Configuration
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=oneteam
DB_USERNAME=oneteam_user
DB_PASSWORD=secure_password

# Application Settings
APP_NAME=Oneteam
APP_VERSION=1.0.0
APP_DEBUG=false
APP_TIMEZONE=UTC

# Security Configuration
JWT_SECRET=your_jwt_secret_key
SESSION_LIFETIME=3600
CSRF_TOKEN_NAME=csrf_token

# IIS Configuration
IIS_SITE_NAME=Oneteam
IIS_APP_POOL=OneteamAppPool
IIS_PHP_VERSION=8.1
```

### IIS Configuration
- **Application Pool**: Dedicated pool for PHP applications
- **PHP Integration**: FastCGI configuration for optimal performance
- **URL Rewriting**: Clean URLs for API endpoints
- **Security Headers**: Proper security header configuration
- **Static File Handling**: Optimized delivery of CSS/JS/images

---

## Installation and Deployment

### Prerequisites
1. **Windows Server 2019+** with IIS 10+
2. **PHP 8.1+** with required extensions
3. **PostgreSQL 12+** database server
4. **Git** for source code management

### Installation Steps

#### 1. Database Setup
```sql
-- Create database and user
CREATE DATABASE oneteam;
CREATE USER oneteam_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE oneteam TO oneteam_user;

-- Run setup script
psql -U postgres -d oneteam -f database/postgresql_setup.sql
```

#### 2. Application Deployment
```bash
# Clone repository
git clone https://github.com/easysystem-gy/Oneteam.git
cd Oneteam

# Configure environment
copy .env.example .env
# Edit .env with your database credentials

# Set IIS permissions
icacls . /grant "IIS_IUSRS:(OI)(CI)F" /T
```

#### 3. IIS Configuration
- Create new website pointing to application root
- Configure PHP FastCGI handler
- Set up URL rewriting rules for API routes
- Configure security headers and SSL

### Default Credentials
- **Username**: admin
- **Password**: admin123
- **Email**: admin@oneteam.local

**⚠️ Important**: Change default credentials after first login!

---

## Development Guidelines

### Code Organization
- **MVC Pattern**: Clear separation of concerns
- **RESTful APIs**: Standard HTTP methods and status codes
- **Error Handling**: Consistent error responses
- **Input Validation**: Server-side validation for all inputs
- **Security**: CSRF protection and SQL injection prevention

### Extension Points
- **Module System**: Add new content modules in `modules/` directory
- **API Endpoints**: Extend API with new endpoints following existing patterns
- **Menu Items**: Database-driven menu system for easy customization
- **Themes**: CSS-based theming system for visual customization

### Testing
- **API Testing**: Use `test_menu.html` for API endpoint verification
- **Database Testing**: Included sample data for development
- **Error Testing**: Comprehensive error handling throughout application

---

## Security Considerations

### Authentication & Authorization
- **Session-based Authentication**: Secure session management
- **Role-based Access Control**: Workspace-level permissions
- **Password Security**: Hashed passwords with salt
- **Session Timeout**: Configurable session expiration

### Data Protection
- **SQL Injection Prevention**: Parameterized queries throughout
- **XSS Protection**: Input sanitization and output encoding
- **CSRF Protection**: Token-based request validation
- **Data Validation**: Server-side validation for all inputs

### Infrastructure Security
- **HTTPS Enforcement**: SSL/TLS configuration for production
- **Security Headers**: Proper HTTP security headers
- **File Permissions**: Restricted file system permissions
- **Database Security**: Dedicated database user with minimal privileges

---

## Performance Optimization

### Frontend Performance
- **Minified Assets**: Compressed CSS and JavaScript files
- **Caching Strategy**: Browser caching for static assets
- **AJAX Loading**: Dynamic content loading to reduce page size
- **Image Optimization**: Optimized images and icons

### Backend Performance
- **Database Indexing**: Optimized database queries with proper indexes
- **Connection Pooling**: Efficient database connection management
- **Caching**: Application-level caching for frequently accessed data
- **Query Optimization**: Efficient SQL queries and joins

### Server Performance
- **PHP OpCache**: Bytecode caching for improved performance
- **IIS Optimization**: Proper IIS configuration for PHP applications
- **Static File Handling**: Optimized delivery of static assets
- **Compression**: GZIP compression for text-based responses

---

## Maintenance and Monitoring

### Logging
- **Application Logs**: Comprehensive logging of application events
- **Error Logging**: Detailed error tracking and reporting
- **Access Logs**: User activity and API usage tracking
- **Performance Logs**: Response time and resource usage monitoring

### Backup Strategy
- **Database Backups**: Regular PostgreSQL database backups
- **File System Backups**: Application files and uploaded content
- **Configuration Backups**: Environment and server configuration
- **Recovery Procedures**: Documented disaster recovery processes

### Updates and Maintenance
- **Version Control**: Git-based version management
- **Database Migrations**: Structured database schema updates
- **Security Updates**: Regular security patch application
- **Performance Monitoring**: Ongoing performance optimization

---

## Future Extensibility

### Planned Enhancements
- **Mobile Responsive Design**: Enhanced mobile device support
- **Real-time Notifications**: WebSocket-based notifications
- **Advanced Reporting**: Business intelligence and analytics
- **API Integrations**: Third-party service integrations
- **Multi-language Support**: Internationalization framework

### Architecture Scalability
- **Microservices**: Potential migration to microservices architecture
- **Load Balancing**: Multi-server deployment support
- **Caching Layer**: Redis/Memcached integration
- **CDN Integration**: Content delivery network support
- **Container Deployment**: Docker containerization support

---

## Conclusion

Oneteam represents a comprehensive, enterprise-ready web application that demonstrates modern web development best practices. Its modular architecture, robust security features, and flexible deployment options make it suitable for a wide range of organizational needs.

The application serves as both a functional workspace management system and a reference implementation for building scalable, secure web applications using PHP, JavaScript, and PostgreSQL.

**Key Strengths**:
- Production-ready architecture and deployment
- Comprehensive security implementation
- Flexible multi-database support
- Extensible module system
- Thorough documentation and setup procedures

**Ideal Use Cases**:
- Team collaboration platforms
- Project management systems
- Multi-tenant SaaS applications
- Enterprise workspace management
- Custom business applications requiring user and workspace management

This specification provides the foundation for understanding, deploying, maintaining, and extending the Oneteam application in production environments.
