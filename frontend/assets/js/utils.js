/**
 * Oneteam Utilities
 * Common utility functions used throughout the application
 */

window.Utils = {
    /**
     * Make AJAX requests with proper error handling
     */
    ajax: function(options) {
        const defaults = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            timeout: Config.api.timeout
        };
        
        const settings = Object.assign({}, defaults, options);
        
        // Add authentication token if available
        const token = this.getToken();
        if (token) {
            settings.headers['Authorization'] = 'Bearer ' + token;
        }
        
        return $.ajax(settings);
    },
    
    /**
     * Storage utilities
     */
    storage: {
        set: function(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Storage set error:', e);
                return false;
            }
        },
        
        get: function(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('Storage get error:', e);
                return defaultValue;
            }
        },
        
        remove: function(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.error('Storage remove error:', e);
                return false;
            }
        },
        
        clear: function() {
            try {
                localStorage.clear();
                return true;
            } catch (e) {
                console.error('Storage clear error:', e);
                return false;
            }
        }
    },
    
    /**
     * Token management
     */
    getToken: function() {
        return this.storage.get(Config.storage.token);
    },
    
    setToken: function(token) {
        return this.storage.set(Config.storage.token, token);
    },
    
    removeToken: function() {
        return this.storage.remove(Config.storage.token);
    },
    
    /**
     * User management
     */
    getCurrentUser: function() {
        return this.storage.get(Config.storage.user);
    },
    
    setCurrentUser: function(user) {
        return this.storage.set(Config.storage.user, user);
    },
    
    removeCurrentUser: function() {
        return this.storage.remove(Config.storage.user);
    },
    
    /**
     * Workspace management
     */
    getCurrentWorkspace: function() {
        return this.storage.get(Config.storage.workspace);
    },
    
    setCurrentWorkspace: function(workspace) {
        return this.storage.set(Config.storage.workspace, workspace);
    },
    
    /**
     * Format utilities
     */
    formatDate: function(date, format = null) {
        if (!date) return '';
        
        const d = new Date(date);
        const fmt = format || Config.ui.dateFormat;
        
        // Simple date formatting
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        return fmt.replace('YYYY', year)
                  .replace('MM', month)
                  .replace('DD', day);
    },
    
    formatTime: function(date, format = null) {
        if (!date) return '';
        
        const d = new Date(date);
        const fmt = format || Config.ui.timeFormat;
        
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        
        return fmt.replace('HH', hours)
                  .replace('mm', minutes)
                  .replace('ss', seconds);
    },
    
    /**
     * Validation utilities
     */
    validate: {
        email: function(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },
        
        required: function(value) {
            return value !== null && value !== undefined && value !== '';
        },
        
        minLength: function(value, min) {
            return value && value.length >= min;
        },
        
        maxLength: function(value, max) {
            return !value || value.length <= max;
        }
    },
    
    /**
     * UI utilities
     */
    showLoading: function(message = 'Loading...') {
        $('#loading-screen .loading-content h4').text(message);
        $('#loading-screen').removeClass('d-none');
    },
    
    hideLoading: function() {
        $('#loading-screen').addClass('d-none');
    },
    
    showAlert: function(message, type = 'info', title = null) {
        // Simple alert implementation
        const alertClass = {
            'success': 'alert-success',
            'error': 'alert-danger',
            'warning': 'alert-warning',
            'info': 'alert-info'
        }[type] || 'alert-info';
        
        const alertHtml = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                ${title ? '<strong>' + title + '</strong><br>' : ''}
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        // Add to alerts container or create one
        let alertContainer = $('#alerts-container');
        if (alertContainer.length === 0) {
            alertContainer = $('<div id="alerts-container" class="position-fixed top-0 end-0 p-3" style="z-index: 9999;"></div>');
            $('body').append(alertContainer);
        }
        
        alertContainer.append(alertHtml);
        
        // Auto-remove after 5 seconds
        setTimeout(function() {
            alertContainer.find('.alert').first().alert('close');
        }, 5000);
    },
    
    /**
     * Debug utilities
     */
    log: function(message, data = null) {
        if (Config.app.debug) {
            console.log('[Oneteam]', message, data || '');
        }
    },
    
    error: function(message, error = null) {
        console.error('[Oneteam Error]', message, error || '');
    },
    
    /**
     * URL utilities
     */
    buildApiUrl: function(endpoint) {
        return Config.api.baseUrl + '/' + endpoint.replace(/^\//, '');
    },
    
    /**
     * Object utilities
     */
    deepClone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    isEmpty: function(obj) {
        if (obj === null || obj === undefined) return true;
        if (typeof obj === 'string') return obj.trim() === '';
        if (Array.isArray(obj)) return obj.length === 0;
        if (typeof obj === 'object') return Object.keys(obj).length === 0;
        return false;
    }
};
