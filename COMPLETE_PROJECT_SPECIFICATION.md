# Oneteam Application - Complete Project Specification

## Project Overview

Create a modern one-page web application called **Oneteam** - a team management and collaboration platform with the following technical stack:

### Technology Stack
- **Frontend**: JavaScript with jQuery Ajax, Bootstrap 5, jEasyUI Framework for tables and layouts
- **Backend**: PHP 8+ with object-oriented architecture
- **Database**: PostgreSQL (primary) with abstract layer supporting MariaDB, SQL Server, SQLite
- **Web Server**: IIS (Internet Information Services)
- **API Documentation**: Swagger/OpenAPI 3.0.3 with interactive UI
- **Authentication**: JWT-based session management

## Application Architecture

### Frontend Architecture
- **Single Page Application (SPA)** design
- **Responsive layout** using Bootstrap 5 grid system
- **Left collapsible sidebar menu** for navigation
- **Central content area** (div with id="main-content") for dynamic module rendering
- **jQuery Ajax** for all API communications
- **jEasyUI DataGrid** for data tables and forms

### Backend Architecture
- **RESTful API** with clean endpoint structure
- **Database abstraction layer** supporting multiple database systems
- **Modular PHP architecture** with separate handlers for each feature
- **Comprehensive error handling** and logging
- **Security middleware** for authentication and authorization

### Database Architecture
- **Multi-database support** through adapter pattern
- **PostgreSQL as primary database** with optimized queries
- **Database migration system** for schema management
- **Configurable connection parameters** via environment variables

## Core Features & Modules

### 1. Authentication System
- **Login screen** as application entry point
- **JWT token-based authentication**
- **Session management** with configurable expiration
- **Demo credentials**: username: `admin`, password: `admin123`

### 2. Workspace Management
- **Multiple workspace support** (profiles/environments)
- **Workspace switching** functionality
- **Role-based access** per workspace (admin, developer, member)
- **Workspace customization** (colors, icons, descriptions)

### 3. Dynamic Menu System
- **Database-driven menu structure**
- **Hierarchical menu support** (parent-child relationships)
- **Configurable menu items** with icons and URLs
- **Collapsible sidebar navigation**
- **Menu management interface** for administrators

### 4. User Profile Management
- **Detailed user profiles** with personal information
- **Avatar upload functionality**
- **Preference management** (theme, language, timezone)
- **Password change functionality**
- **Notification settings**

### 5. Task Management System
- **CRUD operations** for tasks
- **Task status tracking** (pending, in_progress, completed)
- **Task assignment** and categorization
- **Interactive task interface** using jEasyUI

### 6. User Administration
- **User management interface** (admin only)
- **Role assignment** and permissions
- **User activity monitoring**

## Detailed Technical Requirements

### Frontend Implementation

#### HTML Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Oneteam - Team Collaboration Platform</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- jEasyUI CSS -->
    <link rel="stylesheet" type="text/css" href="https://www.jeasyui.com/easyui/themes/default/easyui.css">
    <link rel="stylesheet" type="text/css" href="https://www.jeasyui.com/easyui/themes/icon.css">
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <!-- Collapsible Sidebar -->
            <nav id="sidebar" class="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
                <div class="position-sticky pt-3">
                    <div id="menu-container">
                        <!-- Dynamic menu will be loaded here -->
                    </div>
                </div>
            </nav>
            
            <!-- Main Content Area -->
            <main id="main-content" class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                <!-- Dynamic content will be loaded here -->
            </main>
        </div>
    </div>
    
    <!-- JavaScript Libraries -->
    <script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://www.jeasyui.com/easyui/jquery.easyui.min.js"></script>
    <script src="assets/js/app.js"></script>
</body>
</html>
```

#### JavaScript Application Structure
```javascript
// assets/js/app.js
class OneteamApp {
    constructor() {
        this.apiBase = '/api';
        this.token = localStorage.getItem('auth_token');
        this.currentWorkspace = null;
        this.init();
    }
    
    init() {
        this.setupAjaxDefaults();
        this.loadMenu();
        this.setupEventHandlers();
    }
    
    setupAjaxDefaults() {
        $.ajaxSetup({
            beforeSend: (xhr) => {
                if (this.token) {
                    xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
                }
            }
        });
    }
    
    loadMenu() {
        // Load dynamic menu from API
    }
    
    loadModule(moduleName, params = {}) {
        // Load module content into main-content div
    }
    
    // Additional methods for authentication, API calls, etc.
}

// Initialize application
$(document).ready(() => {
    window.app = new OneteamApp();
});
```

### Backend Implementation

#### Directory Structure
```
backend/
├── api/
│   ├── index.php              # Main API router
│   ├── auth.php               # Authentication endpoints
│   ├── workspaces.php         # Workspace management
│   ├── menu.php               # Menu system API
│   ├── profile.php            # User profile management
│   ├── tasks.php              # Task management
│   ├── users.php              # User administration
│   ├── docs.html              # Swagger UI interface
│   ├── openapi.json           # Complete API specification
│   └── openapi.php            # PHP-generated API spec
├── config/
│   ├── database.php           # Database configuration
│   ├── app.php                # Application settings
│   └── .env                   # Environment variables
├── core/
│   ├── Database/
│   │   ├── DatabaseFactory.php
│   │   ├── DatabaseAdapterInterface.php
│   │   ├── BaseAdapter.php
│   │   └── Adapters/
│   │       ├── PostgreSQLAdapter.php
│   │       ├── MariaDBAdapter.php
│   │       ├── SQLServerAdapter.php
│   │       └── SQLiteAdapter.php
│   ├── Auth/
│   │   ├── JWTHandler.php
│   │   └── AuthMiddleware.php
│   └── Utils/
│       ├── Logger.php
│       └── Validator.php
├── includes/
│   ├── auth.php               # Authentication helpers
│   ├── functions.php          # Common functions
│   └── constants.php          # Application constants
└── migrations/
    ├── 001_create_users_table.sql
    ├── 002_create_workspaces_table.sql
    ├── 003_create_menu_items_table.sql
    └── 004_create_tasks_table.sql
```

#### Main API Router (backend/api/index.php)
```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the request path and method
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$path = preg_replace('#^/api/#', '', $path);
$path = trim($path, '/');

$segments = explode('/', $path);
$endpoint = $segments[0] ?? '';
$action = $segments[1] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?? [];

// Response helpers
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}

function errorResponse($message, $status = 400) {
    jsonResponse([
        'success' => false,
        'message' => $message
    ], $status);
}

// Route to appropriate handlers
switch ($endpoint) {
    case 'auth':
        handleAuth($action, $method, $input);
        break;
    case 'profile':
        handleProfile($action, $method, $input);
        break;
    case 'workspaces':
        handleWorkspaces($action, $method, $input);
        break;
    case 'menu':
        handleMenu($action, $method, $input);
        break;
    case 'users':
        handleUsers($action, $method, $input);
        break;
    case 'tasks':
        handleTasks($action, $method, $input);
        break;
    case 'docs':
        // Serve Swagger UI
        header('Content-Type: text/html');
        readfile(__DIR__ . '/docs.html');
        exit();
    case 'openapi.json':
        // Serve OpenAPI specification
        header('Content-Type: application/json');
        readfile(__DIR__ . '/openapi.json');
        exit();
    default:
        errorResponse('Endpoint not found', 404);
}

// Include handler functions
require_once 'handlers/auth.php';
require_once 'handlers/profile.php';
require_once 'handlers/workspaces.php';
require_once 'handlers/menu.php';
require_once 'handlers/users.php';
require_once 'handlers/tasks.php';
?>
```

#### Database Abstraction Layer
```php
<?php
// backend/core/Database/DatabaseFactory.php
namespace Oneteam\Database;

class DatabaseFactory {
    public static function create($config) {
        $driver = $config['driver'] ?? 'pgsql';
        
        switch ($driver) {
            case 'pgsql':
                return new Adapters\PostgreSQLAdapter($config);
            case 'mysql':
                return new Adapters\MariaDBAdapter($config);
            case 'sqlsrv':
                return new Adapters\SQLServerAdapter($config);
            case 'sqlite':
                return new Adapters\SQLiteAdapter($config);
            default:
                throw new \Exception("Unsupported database driver: $driver");
        }
    }
}
?>
```

### Database Schema

#### PostgreSQL Schema (migrations/001_create_users_table.sql)
```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    bio TEXT,
    avatar VARCHAR(255),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    theme VARCHAR(20) DEFAULT 'light',
    date_format VARCHAR(20) DEFAULT 'Y-m-d',
    time_format VARCHAR(20) DEFAULT 'H:i:s',
    notifications_email BOOLEAN DEFAULT true,
    notifications_browser BOOLEAN DEFAULT true,
    two_factor_enabled BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_admin BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workspaces table
CREATE TABLE workspaces (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#0d6efd',
    icon VARCHAR(50) DEFAULT 'fas fa-home',
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu items table
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    url VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    level INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
    assigned_to INTEGER REFERENCES users(id),
    created_by INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User workspace relationships
CREATE TABLE user_workspaces (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'developer', 'member')),
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, workspace_id)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_menu_items_workspace ON menu_items(workspace_id);
CREATE INDEX idx_menu_items_parent ON menu_items(parent_id);
CREATE INDEX idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_user_workspaces_user ON user_workspaces(user_id);
CREATE INDEX idx_user_workspaces_workspace ON user_workspaces(workspace_id);
```

### API Endpoints Specification

#### Complete OpenAPI 3.0.3 Specification
The API should include all these endpoints with full Swagger documentation:

**Authentication Endpoints:**
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get auth profile with workspace

**Profile Management:**
- `GET /api/profile` - Get detailed user profile
- `PUT /api/profile/update` - Update profile information
- `POST /api/profile/avatar` - Upload avatar image
- `PUT /api/profile/password` - Change password
- `PUT /api/profile/preferences` - Update user preferences

**Workspace Management:**
- `GET /api/workspaces` - List user workspaces
- `POST /api/workspaces` - Create new workspace
- `PUT /api/workspaces` - Update workspace
- `DELETE /api/workspaces` - Delete workspace

**Menu System:**
- `GET /api/menu` - Get hierarchical menu structure
- `POST /api/menu` - Create menu item
- `PUT /api/menu` - Update menu item
- `DELETE /api/menu` - Delete menu item

**Task Management:**
- `GET /api/tasks` - List tasks
- `POST /api/tasks/create` - Create new task
- `GET /api/tasks/{id}` - Get specific task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

**User Administration:**
- `GET /api/users` - List all users (admin only)

### Swagger/OpenAPI Documentation

#### Swagger UI Setup (backend/api/docs.html)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Oneteam API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin:0; background: #fafafa; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/api/openapi.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>
```

### IIS Configuration

#### web.config for IIS
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="API Routes" stopProcessing="true">
                    <match url="^api/(.*)$" />
                    <conditions>
                        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
                        <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
                    </conditions>
                    <action type="Rewrite" url="backend/api/index.php" />
                </rule>
                <rule name="Frontend Routes" stopProcessing="true">
                    <match url="^(.*)$" />
                    <conditions>
                        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
                        <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
                    </conditions>
                    <action type="Rewrite" url="index.html" />
                </rule>
            </rules>
        </rewrite>
        <defaultDocument>
            <files>
                <clear />
                <add value="index.html" />
            </files>
        </defaultDocument>
    </system.webServer>
</configuration>
```

### Environment Configuration

#### .env file template
```env
# Database Configuration
DB_DRIVER=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=oneteam
DB_USERNAME=oneteam_user
DB_PASSWORD=secure_password

# Application Settings
APP_NAME=Oneteam
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRATION=3600

# File Upload Settings
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=jpg,jpeg,png,gif,pdf,doc,docx

# Email Configuration (optional)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=noreply@oneteam.local
MAIL_PASSWORD=mail_password
```

### Installation & Setup Instructions

#### README.md
```markdown
# Oneteam - Team Collaboration Platform

## Installation Requirements

- **Web Server**: IIS 10+ with URL Rewrite module
- **PHP**: 8.0+ with extensions: pdo, pdo_pgsql, pdo_mysql, openssl, json
- **Database**: PostgreSQL 12+ (primary) or MariaDB 10.4+
- **Node.js**: 16+ (for development tools, optional)

## Installation Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url> oneteam
   cd oneteam
   ```

2. **Configure Database**
   - Create PostgreSQL database: `oneteam`
   - Create user with full permissions
   - Run migrations in order from `backend/migrations/`

3. **Environment Setup**
   ```bash
   cp backend/config/.env.example backend/config/.env
   # Edit .env with your database credentials
   ```

4. **IIS Configuration**
   - Create new IIS site pointing to project root
   - Ensure URL Rewrite module is installed
   - Copy web.config to site root

5. **File Permissions**
   - Grant IIS_IUSRS write access to `uploads/` directory
   - Ensure PHP can read all backend files

6. **Test Installation**
   - Visit: `http://localhost/api/docs` for API documentation
   - Login with: username `admin`, password `admin123`

## Development

- **API Documentation**: Available at `/api/docs`
- **Database Migrations**: Located in `backend/migrations/`
- **Frontend Assets**: Located in `assets/`
- **Backend API**: Located in `backend/api/`

## Features

- ✅ Single Page Application with dynamic content loading
- ✅ JWT-based authentication system
- ✅ Multi-workspace support with role-based access
- ✅ Dynamic database-driven menu system
- ✅ Comprehensive user profile management
- ✅ Task management with status tracking
- ✅ Complete REST API with Swagger documentation
- ✅ Multi-database support (PostgreSQL, MariaDB, SQL Server, SQLite)
- ✅ Responsive Bootstrap 5 interface
- ✅ jEasyUI integration for advanced components
```

## Implementation Priority

1. **Phase 1**: Core Infrastructure
   - Database abstraction layer
   - Authentication system
   - Basic API structure
   - Frontend framework setup

2. **Phase 2**: Core Features
   - User authentication and profiles
   - Workspace management
   - Dynamic menu system
   - Basic task management

3. **Phase 3**: Advanced Features
   - Complete Swagger documentation
   - File upload functionality
   - Advanced user management
   - Performance optimization

4. **Phase 4**: Polish & Production
   - Error handling and logging
   - Security hardening
   - Performance testing
   - Documentation completion

## Success Criteria

- ✅ Complete single-page application with collapsible menu
- ✅ Full REST API with interactive Swagger documentation
- ✅ Multi-database support with PostgreSQL as primary
- ✅ JWT authentication with workspace switching
- ✅ Responsive design working on desktop and mobile
- ✅ All CRUD operations functional for all entities
- ✅ IIS deployment ready with proper configuration
- ✅ Comprehensive installation documentation

This specification provides everything needed to recreate the Oneteam application from scratch with all features and functionality intact.
