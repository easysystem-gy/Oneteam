// Oneteam Application Configuration
const Config = {
    // API Configuration
    api: {
        baseUrl: '/api',
        version: 'v1',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000
    },
    
    // Authentication Configuration
    auth: {
        tokenKey: 'oneteam_token',
        userKey: 'oneteam_user',
        workspaceKey: 'oneteam_workspace',
        sessionTimeout: 3600000, // 1 hour in milliseconds
        rememberMeDuration: 2592000000 // 30 days in milliseconds
    },
    
    // UI Configuration
    ui: {
        animationDuration: 300,
        toastDuration: 5000,
        loadingDelay: 500,
        sidebarBreakpoint: 768,
        tablePageSize: 25,
        maxFileSize: 10485760, // 10MB
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx']
    },
    
    // Application Settings
    app: {
        name: 'Oneteam',
        version: '1.0.0',
        debug: false,
        locale: 'en',
        timezone: 'UTC',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm:ss',
        datetimeFormat: 'YYYY-MM-DD HH:mm:ss'
    },
    
    // Menu Configuration
    menu: {
        defaultIcon: 'fas fa-circle',
        expandedKey: 'oneteam_menu_expanded',
        activeKey: 'oneteam_menu_active'
    },
    
    // Cache Configuration
    cache: {
        enabled: true,
        duration: 300000, // 5 minutes
        maxSize: 100,
        keys: {
            menu: 'oneteam_cache_menu',
            user: 'oneteam_cache_user',
            workspace: 'oneteam_cache_workspace'
        }
    },
    
    // Error Messages
    messages: {
        errors: {
            network: 'Network error. Please check your connection and try again.',
            unauthorized: 'Your session has expired. Please log in again.',
            forbidden: 'You do not have permission to perform this action.',
            notFound: 'The requested resource was not found.',
            serverError: 'Server error. Please try again later.',
            validation: 'Please check your input and try again.',
            timeout: 'Request timed out. Please try again.',
            unknown: 'An unexpected error occurred. Please try again.'
        },
        success: {
            login: 'Successfully logged in!',
            logout: 'Successfully logged out!',
            save: 'Changes saved successfully!',
            delete: 'Item deleted successfully!',
            update: 'Item updated successfully!',
            create: 'Item created successfully!'
        },
        info: {
            loading: 'Loading...',
            saving: 'Saving...',
            deleting: 'Deleting...',
            processing: 'Processing...'
        }
    },
    
    // API Endpoints
    endpoints: {
        auth: {
            login: '/auth/login',
            logout: '/auth/logout',
            refresh: '/auth/refresh',
            profile: '/auth/profile'
        },
        users: {
            list: '/users',
            create: '/users',
            update: '/users/{id}',
            delete: '/users/{id}',
            profile: '/users/profile'
        },
        workspaces: {
            list: '/workspaces',
            create: '/workspaces',
            update: '/workspaces/{id}',
            delete: '/workspaces/{id}',
            select: '/workspaces/{id}/select'
        },
        menu: {
            list: '/menu',
            create: '/menu',
            update: '/menu/{id}',
            delete: '/menu/{id}',
            reorder: '/menu/reorder'
        },
        content: {
            load: '/content/{module}',
            save: '/content/{module}',
            upload: '/content/upload'
        }
    },
    
    // HTTP Status Codes
    httpStatus: {
        OK: 200,
        CREATED: 201,
        NO_CONTENT: 204,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        METHOD_NOT_ALLOWED: 405,
        CONFLICT: 409,
        UNPROCESSABLE_ENTITY: 422,
        INTERNAL_SERVER_ERROR: 500,
        BAD_GATEWAY: 502,
        SERVICE_UNAVAILABLE: 503,
        GATEWAY_TIMEOUT: 504
    },
    
    // Validation Rules
    validation: {
        username: {
            minLength: 3,
            maxLength: 50,
            pattern: /^[a-zA-Z0-9_-]+$/
        },
        password: {
            minLength: 8,
            maxLength: 128,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: false
        },
        email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        }
    }
};

// Freeze configuration to prevent modifications
Object.freeze(Config);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Config;
}
