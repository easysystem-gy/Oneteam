/**
 * Oneteam Authentication Module
 * Handles user authentication, login, logout, and session management
 */

window.Auth = {
    /**
     * Initialize authentication module
     */
    init: function() {
        this.bindEvents();
        // Note: checkAuthStatus is handled by the main App module
    },
    
    /**
     * Bind authentication-related events
     */
    bindEvents: function() {
        // Login form submission
        $(document).on('submit', '#login-form', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        // Logout button click
        $(document).on('click', '#logout-btn', (e) => {
            e.preventDefault();
            this.handleLogout();
        });
        
        // Remember me checkbox
        $(document).on('change', '#remember-me', (e) => {
            // Handle remember me functionality if needed
        });
    },
    
    /**
     * Check current authentication status
     */
    checkAuthStatus: function() {
        const token = Utils.getToken();
        const user = Utils.getCurrentUser();
        
        if (token && user) {
            // Validate token with server
            this.validateToken(token)
                .then(() => {
                    this.showMainApp();
                })
                .catch(() => {
                    this.showLoginScreen();
                });
        } else {
            this.showLoginScreen();
        }
    },
    
    /**
     * Handle login form submission
     */
    handleLogin: function() {
        const username = $('#username').val().trim();
        const password = $('#password').val();
        const rememberMe = $('#remember-me').is(':checked');
        
        // Validate form
        if (!username || !password) {
            Utils.showAlert('Please enter both username and password', 'error');
            return;
        }
        
        // Show loading
        const $submitBtn = $('#login-form button[type="submit"]');
        const originalText = $submitBtn.text();
        $submitBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Signing in...');
        
        // Make login request
        this.login(username, password, rememberMe)
            .then((response) => {
                if (response.success) {
                    // Store authentication data
                    Utils.setToken(response.data.token);
                    Utils.setCurrentUser(response.data.user);
                    
                    // Store workspace data if provided
                    if (response.data.workspace) {
                        Utils.setCurrentWorkspace(response.data.workspace);
                    }
                    
                    // Show success message
                    Utils.showAlert('Login successful! Welcome back.', 'success');
                    
                    // Redirect to main app
                    setTimeout(() => {
                        this.showMainApp();
                    }, 1000);
                } else {
                    Utils.showAlert(response.message || 'Login failed', 'error');
                }
            })
            .catch((error) => {
                Utils.error('Login error:', error);
                const message = error.responseJSON?.message || 'Login failed. Please try again.';
                Utils.showAlert(message, 'error');
            })
            .finally(() => {
                // Reset button
                $submitBtn.prop('disabled', false).text(originalText);
            });
    },
    
    /**
     * Handle logout
     */
    handleLogout: function() {
        // Show confirmation
        if (!confirm('Are you sure you want to logout?')) {
            return;
        }
        
        // Make logout request
        this.logout()
            .then(() => {
                this.clearAuthData();
                Utils.showAlert('You have been logged out successfully', 'info');
                this.showLoginScreen();
            })
            .catch((error) => {
                Utils.error('Logout error:', error);
                // Clear data anyway
                this.clearAuthData();
                this.showLoginScreen();
            });
    },
    
    /**
     * Make login API request
     */
    login: function(username, password, rememberMe = false) {
        return Utils.ajax({
            url: Utils.buildApiUrl('auth/login'),
            method: 'POST',
            data: JSON.stringify({
                username: username,
                password: password,
                remember_me: rememberMe
            })
        });
    },
    
    /**
     * Make logout API request
     */
    logout: function() {
        return Utils.ajax({
            url: Utils.buildApiUrl('auth/logout'),
            method: 'POST'
        });
    },
    
    /**
     * Validate token with server
     */
    validateToken: function(token) {
        return Utils.ajax({
            url: Utils.buildApiUrl('auth/profile'),
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
    },
    
    /**
     * Clear authentication data
     */
    clearAuthData: function() {
        Utils.removeToken();
        Utils.removeCurrentUser();
        Utils.storage.remove(Config.auth.workspaceKey);
        // Note: preferences key not defined in config, using direct string
        Utils.storage.remove('oneteam_preferences');
    },
    
    /**
     * Show login screen
     */
    showLoginScreen: function() {
        Utils.hideLoading();
        $('#main-app').addClass('d-none');
        $('#login-screen').removeClass('d-none');
        
        // Focus on username field
        setTimeout(() => {
            $('#username').focus();
        }, 100);
        
        // Clear form
        $('#login-form')[0].reset();
    },
    
    /**
     * Show main application
     */
    showMainApp: function() {
        Utils.hideLoading();
        $('#login-screen').addClass('d-none');
        $('#main-app').removeClass('d-none');
        
        // Initialize other modules
        if (window.Workspace) {
            Workspace.init();
        }
        
        if (window.Menu) {
            Menu.init();
        }
        
        // Update user info in UI
        this.updateUserInfo();
    },
    
    /**
     * Update user information in the UI
     */
    updateUserInfo: function() {
        const user = Utils.getCurrentUser();
        if (user) {
            // Update user name in header
            $('#user-name').text(user.first_name + ' ' + user.last_name);
            $('#user-email').text(user.email);
            $('#user-avatar').attr('title', user.username);
            
            // Update user dropdown
            $('.user-info .user-name').text(user.first_name + ' ' + user.last_name);
            $('.user-info .user-email').text(user.email);
        }
    },
    
    /**
     * Check if user is authenticated
     */
    isAuthenticated: function() {
        return !!(Utils.getToken() && Utils.getCurrentUser());
    },
    
    /**
     * Get current user
     */
    getCurrentUser: function() {
        return Utils.getCurrentUser();
    },
    
    /**
     * Check if current user has admin privileges
     */
    isAdmin: function() {
        const user = this.getCurrentUser();
        return user && user.is_admin === true;
    },
    
    /**
     * Refresh authentication token
     */
    refreshToken: function() {
        return Utils.ajax({
            url: Utils.buildApiUrl('auth/refresh'),
            method: 'POST'
        }).then((response) => {
            if (response.success && response.data.token) {
                Utils.setToken(response.data.token);
                return response.data.token;
            }
            throw new Error('Token refresh failed');
        });
    },
    
    /**
     * Handle authentication errors (401, 403)
     */
    handleAuthError: function(error) {
        if (error.status === 401) {
            // Unauthorized - token expired or invalid
            Utils.showAlert('Your session has expired. Please login again.', 'warning');
            this.clearAuthData();
            this.showLoginScreen();
        } else if (error.status === 403) {
            // Forbidden - insufficient permissions
            Utils.showAlert('You do not have permission to perform this action.', 'error');
        }
    }
};

// Global AJAX error handler for authentication
$(document).ajaxError(function(event, xhr, settings) {
    if (xhr.status === 401 || xhr.status === 403) {
        Auth.handleAuthError(xhr);
    }
});
