// Oneteam Main Application Controller
const App = {
    // Application state
    state: {
        initialized: false,
        currentUser: null,
        currentWorkspace: null,
        sidebarCollapsed: false,
        activeModule: null
    },

    // Initialize the application
    init: function() {
        console.log('Initializing Oneteam Application...');
        
        // Show loading screen
        this.showLoading();
        
        // Initialize components
        this.initializeComponents();
        
        // Check authentication status
        setTimeout(() => {
            this.checkAuthStatus();
        }, Config.ui.loadingDelay);
    },

    // Initialize application components
    initializeComponents: function() {
        // Initialize Auth module
        if (window.Auth) {
            Auth.init();
        }
        
        // Initialize event listeners
        this.initializeEventListeners();
        
        // Initialize responsive behavior
        this.initializeResponsive();
        
        // Initialize tooltips and popovers
        this.initializeBootstrapComponents();
        
        this.state.initialized = true;
        console.log('Application components initialized');
    },

    // Initialize event listeners
    initializeEventListeners: function() {
        // Login form submission
        $('#login-form').on('submit', (e) => {
            e.preventDefault();
            Auth.handleLogin();
        });

        // Window resize handler
        $(window).on('resize', () => {
            this.handleResize();
        });

        // Keyboard shortcuts
        $(document).on('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            this.handlePopState(e);
        });
    },

    // Initialize responsive behavior
    initializeResponsive: function() {
        this.handleResize();
    },

    // Initialize Bootstrap components
    initializeBootstrapComponents: function() {
        // Initialize tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });

        // Initialize popovers
        const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl);
        });
    },

    // Check authentication status
    checkAuthStatus: function() {
        const token = Utils.getToken();
        const user = Utils.getCurrentUser();
        
        if (token && user) {
            // Validate token with server
            Auth.validateToken(token)
                .then((response) => {
                    if (response.success) {
                        this.state.currentUser = user;
                        this.checkWorkspaceStatus();
                    } else {
                        this.showLogin();
                    }
                })
                .catch(() => {
                    this.showLogin();
                });
        } else {
            this.showLogin();
        }
    },

    // Check workspace status
    checkWorkspaceStatus: function() {
        const workspace = Workspace.getCurrentWorkspace();
        
        if (workspace) {
            this.state.currentWorkspace = workspace;
            this.showMainApp();
        } else {
            this.showWorkspaceSelection();
        }
    },

    // Show loading screen
    showLoading: function() {
        $('#loading-screen').removeClass('d-none');
        $('#login-screen').addClass('d-none');
        $('#workspace-screen').addClass('d-none');
        $('#main-app').addClass('d-none');
    },

    // Show login screen
    showLogin: function() {
        $('#loading-screen').addClass('d-none');
        $('#login-screen').removeClass('d-none').addClass('fade-in');
        $('#workspace-screen').addClass('d-none');
        $('#main-app').addClass('d-none');
        
        // Focus on username field
        setTimeout(() => {
            $('#username').focus();
        }, 100);
    },

    // Show workspace selection screen
    showWorkspaceSelection: function() {
        $('#loading-screen').addClass('d-none');
        $('#login-screen').addClass('d-none');
        $('#workspace-screen').removeClass('d-none').addClass('fade-in');
        $('#main-app').addClass('d-none');
        
        // Load workspaces
        Workspace.loadWorkspaces();
    },

    // Show main application
    showMainApp: function() {
        $('#loading-screen').addClass('d-none');
        $('#login-screen').addClass('d-none');
        $('#workspace-screen').addClass('d-none');
        $('#main-app').removeClass('d-none').addClass('fade-in');
        
        // Initialize main app components
        this.initializeMainApp();
    },

    // Initialize main application components
    initializeMainApp: function() {
        // Update user info
        this.updateUserInfo();
        
        // Update workspace info
        this.updateWorkspaceInfo();
        
        // Load menu
        Menu.loadMenu();
        
        // Restore sidebar state
        this.restoreSidebarState();
        
        console.log('Main application initialized');
    },

    // Update user information in UI
    updateUserInfo: function() {
        if (this.state.currentUser) {
            $('#current-user-name').text(this.state.currentUser.name || this.state.currentUser.username);
        }
    },

    // Update workspace information in UI
    updateWorkspaceInfo: function() {
        if (this.state.currentWorkspace) {
            $('#current-workspace-name').text(this.state.currentWorkspace.name);
        }
    },

    // Toggle sidebar
    toggleSidebar: function() {
        const sidebar = $('#sidebar');
        const isCollapsed = sidebar.hasClass('collapsed');
        
        if (isCollapsed) {
            sidebar.removeClass('collapsed');
            this.state.sidebarCollapsed = false;
        } else {
            sidebar.addClass('collapsed');
            this.state.sidebarCollapsed = true;
        }
        
        // Save state
        localStorage.setItem('oneteam_sidebar_collapsed', this.state.sidebarCollapsed);
    },

    // Restore sidebar state
    restoreSidebarState: function() {
        const collapsed = localStorage.getItem('oneteam_sidebar_collapsed') === 'true';
        
        if (collapsed) {
            $('#sidebar').addClass('collapsed');
            this.state.sidebarCollapsed = true;
        }
    },

    // Handle window resize
    handleResize: function() {
        const width = $(window).width();
        
        if (width <= Config.ui.sidebarBreakpoint) {
            // Mobile view
            $('#sidebar').addClass('mobile');
        } else {
            // Desktop view
            $('#sidebar').removeClass('mobile show');
        }
    },

    // Handle keyboard shortcuts
    handleKeyboardShortcuts: function(e) {
        // Ctrl/Cmd + B: Toggle sidebar
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            this.toggleSidebar();
        }
        
        // Escape: Close modals/dropdowns
        if (e.key === 'Escape') {
            $('.modal').modal('hide');
            $('.dropdown-menu').removeClass('show');
        }
    },

    // Handle browser navigation
    handlePopState: function(e) {
        if (e.state && e.state.module) {
            this.loadModule(e.state.module, false);
        }
    },

    // Load a module
    loadModule: function(moduleId, pushState = true) {
        console.log('Loading module:', moduleId);
        
        // Update active menu item
        Menu.setActiveItem(moduleId);
        
        // Load module content
        this.loadModuleContent(moduleId);
        
        // Update browser history
        if (pushState) {
            history.pushState({ module: moduleId }, '', `#${moduleId}`);
        }
        
        this.state.activeModule = moduleId;
    },

    // Load module content
    loadModuleContent: function(moduleId) {
        const contentArea = $('#content-area');
        
        // Show loading
        contentArea.html(`
            <div class="text-center p-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Loading module...</p>
            </div>
        `);
        
        // Load content via API
        Utils.apiCall('GET', Config.endpoints.content.load.replace('{module}', moduleId))
            .then((response) => {
                if (response.success && response.data.html) {
                    contentArea.html(response.data.html).addClass('fade-in');
                    
                    // Execute any scripts in the loaded content
                    this.executeModuleScripts(contentArea);
                } else {
                    this.showModuleError('Failed to load module content');
                }
            })
            .catch((error) => {
                console.error('Error loading module:', error);
                this.showModuleError('Error loading module');
            });
    },

    // Execute scripts in loaded module content
    executeModuleScripts: function(container) {
        const scripts = container.find('script');
        scripts.each(function() {
            const script = $(this);
            if (script.attr('src')) {
                // External script
                $.getScript(script.attr('src'));
            } else {
                // Inline script
                eval(script.html());
            }
        });
    },

    // Show module error
    showModuleError: function(message) {
        $('#content-area').html(`
            <div class="text-center p-5">
                <i class="fas fa-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
                <h4 class="mt-3">Module Error</h4>
                <p class="text-muted">${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    <i class="fas fa-refresh me-2"></i>Reload Page
                </button>
            </div>
        `);
    },

    // Show user profile
    showProfile: function() {
        // Implementation for user profile modal/page
        console.log('Show user profile');
    },

    // Show settings
    showSettings: function() {
        // Implementation for settings modal/page
        console.log('Show settings');
    },

    // Show notification
    showNotification: function(message, type = 'info', duration = null) {
        const alertClass = `alert-${type}`;
        const icon = this.getNotificationIcon(type);
        const timeout = duration || Config.ui.toastDuration;
        
        const notification = $(`
            <div class="alert ${alertClass} alert-dismissible fade show position-fixed" 
                 style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
                <i class="${icon} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);
        
        $('body').append(notification);
        
        // Auto-dismiss after timeout
        setTimeout(() => {
            notification.alert('close');
        }, timeout);
    },

    // Get notification icon based on type
    getNotificationIcon: function(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        return icons[type] || icons.info;
    },

    // Logout user
    logout: function() {
        Auth.handleLogout();
    }
};

// Make App globally available
window.App = App;
