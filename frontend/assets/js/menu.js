/**
 * Oneteam Menu Module
 * Handles dynamic menu loading, navigation, and menu-related operations
 */

window.Menu = {
    /**
     * Menu items data
     */
    menuItems: [],
    
    /**
     * Current active menu item
     */
    activeMenuItem: null,
    
    /**
     * Initialize menu module
     */
    init: function() {
        this.bindEvents();
        this.loadMenu();
    },
    
    /**
     * Bind menu-related events
     */
    bindEvents: function() {
        // Menu item click
        $(document).on('click', '.nav-link[data-module]', (e) => {
            e.preventDefault();
            const $link = $(e.currentTarget);
            const moduleId = $link.data('module');
            const menuId = $link.data('menu-id');
            
            this.navigateToModule(moduleId, menuId);
        });
        
        // Submenu toggle
        $(document).on('click', '.nav-link[data-bs-toggle="collapse"]', (e) => {
            const $link = $(e.currentTarget);
            const $icon = $link.find('.submenu-toggle');
            
            // Toggle icon rotation
            setTimeout(() => {
                const isExpanded = $link.attr('aria-expanded') === 'true';
                $icon.toggleClass('rotate-90', isExpanded);
            }, 10);
        });
        
        // Menu toggle button (mobile)
        $(document).on('click', '#menu-toggle', (e) => {
            e.preventDefault();
            this.toggleSidebar();
        });
        
        // Sidebar collapse/expand
        $(document).on('click', '#sidebar-collapse', (e) => {
            e.preventDefault();
            this.toggleSidebarCollapse();
        });
    },
    
    /**
     * Load menu from API
     */
    loadMenu: function() {
        Utils.log('Loading menu...');
        
        const workspaceId = Workspace.getCurrentWorkspace()?.id || 1;
        
        return Utils.ajax({
            url: Utils.buildApiUrl('menu'),
            method: 'GET',
            data: {
                workspace_id: workspaceId
            }
        })
        .then((response) => {
            if (response.success) {
                this.menuItems = response.data;
                this.renderMenu();
                Utils.log('Menu loaded:', this.menuItems);
            } else {
                Utils.error('Failed to load menu:', response.message);
                Utils.showAlert('Failed to load menu', 'error');
            }
        })
        .catch((error) => {
            Utils.error('Error loading menu:', error);
            Utils.showAlert('Error loading menu', 'error');
        });
    },
    
    /**
     * Render menu in sidebar
     */
    renderMenu: function() {
        const $menuContainer = $('#main-menu');
        if ($menuContainer.length === 0) return;
        
        $menuContainer.empty();
        
        // Group menu items by level
        const rootItems = this.menuItems.filter(item => item.level === 0);
        const childItems = this.menuItems.filter(item => item.level > 0);
        
        rootItems.forEach((item) => {
            const $menuItem = this.createMenuItem(item);
            
            // Find child items
            const children = childItems.filter(child => child.parent_id === item.id);
            if (children.length > 0) {
                const $submenu = this.createSubmenu(item.id, children);
                $menuItem.append($submenu);
            }
            
            $menuContainer.append($menuItem);
        });
        
        // Initialize tooltips for collapsed sidebar
        this.initializeTooltips();
    },
    
    /**
     * Create a menu item element
     */
    createMenuItem: function(item) {
        const hasChildren = this.menuItems.some(child => child.parent_id === item.id);
        const isClickable = item.module_name || item.url;
        
        let $menuItem;
        
        if (hasChildren) {
            // Parent item with submenu
            $menuItem = $(`
                <li class="nav-item">
                    <a class="nav-link collapsed" href="#submenu-${item.id}" data-bs-toggle="collapse" 
                       aria-expanded="false" aria-controls="submenu-${item.id}" 
                       title="${item.title}">
                        <i class="${item.icon}"></i>
                        <span class="nav-text">${item.title}</span>
                        <i class="fas fa-chevron-right submenu-toggle ms-auto"></i>
                    </a>
                </li>
            `);
        } else if (isClickable) {
            // Clickable menu item
            const target = item.target || '_self';
            const href = item.url || '#';
            
            $menuItem = $(`
                <li class="nav-item">
                    <a class="nav-link" href="${href}" target="${target}" 
                       data-module="${item.module_name || ''}" 
                       data-menu-id="${item.id}"
                       title="${item.title}">
                        <i class="${item.icon}"></i>
                        <span class="nav-text">${item.title}</span>
                    </a>
                </li>
            `);
        } else {
            // Non-clickable item (header/separator)
            $menuItem = $(`
                <li class="nav-item">
                    <span class="nav-link disabled" title="${item.title}">
                        <i class="${item.icon}"></i>
                        <span class="nav-text">${item.title}</span>
                    </span>
                </li>
            `);
        }
        
        return $menuItem;
    },
    
    /**
     * Create submenu element
     */
    createSubmenu: function(parentId, children) {
        const $submenu = $(`<div class="collapse" id="submenu-${parentId}"><ul class="nav flex-column ms-3"></ul></div>`);
        const $submenuList = $submenu.find('ul');
        
        children.forEach((child) => {
            const $childItem = this.createMenuItem(child);
            $childItem.find('.nav-link').addClass('nav-link-child');
            $submenuList.append($childItem);
        });
        
        return $submenu;
    },
    
    /**
     * Navigate to a module
     */
    navigateToModule: function(moduleId, menuId) {
        if (!moduleId) return;
        
        Utils.log('Navigating to module:', moduleId);
        
        // Update active menu item
        this.setActiveMenuItem(menuId);
        
        // Load module content
        this.loadModuleContent(moduleId);
    },
    
    /**
     * Set active menu item
     */
    setActiveMenuItem: function(menuId) {
        // Remove active class from all menu items
        $('.nav-link').removeClass('active');
        
        // Add active class to current item
        $(`.nav-link[data-menu-id="${menuId}"]`).addClass('active');
        
        // Store active menu item
        this.activeMenuItem = this.menuItems.find(item => item.id === menuId);
        
        // Update breadcrumb
        this.updateBreadcrumb();
    },
    
    /**
     * Load module content
     */
    loadModuleContent: function(moduleId) {
        const $mainContent = $('#content-area');
        
        // Show loading
        $mainContent.html(`
            <div class="text-center p-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <h4 class="mt-3">Loading ${moduleId}...</h4>
            </div>
        `);
        
        // Simulate module loading
        setTimeout(() => {
            this.renderModuleContent(moduleId);
        }, 500);
    },
    
    /**
     * Render module content
     */
    renderModuleContent: function(moduleId) {
        const $mainContent = $('#content-area');
        
        // Generate content based on module
        let content = '';
        
        switch (moduleId) {
            case 'dashboard':
                content = this.getDashboardContent();
                break;
            case 'users/list':
                content = this.getUsersListContent();
                break;
            case 'users/create':
                content = this.getCreateUserContent();
                break;
            case 'workspaces/list':
                content = this.getWorkspacesListContent();
                break;
            case 'reports':
                content = this.getReportsContent();
                break;
            default:
                content = this.getDefaultModuleContent(moduleId);
        }
        
        $mainContent.html(content);
        
        // Initialize any components in the loaded content
        this.initializeModuleComponents();
    },
    
    /**
     * Get dashboard content
     */
    getDashboardContent: function() {
        return `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <h1 class="h3 mb-4">Dashboard</h1>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-3">
                        <div class="card text-white bg-primary">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h4 class="card-title">Users</h4>
                                        <h2 class="mb-0">12</h2>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="fas fa-users fa-2x"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-white bg-success">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h4 class="card-title">Projects</h4>
                                        <h2 class="mb-0">8</h2>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="fas fa-project-diagram fa-2x"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-white bg-warning">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h4 class="card-title">Tasks</h4>
                                        <h2 class="mb-0">45</h2>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="fas fa-tasks fa-2x"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-white bg-info">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h4 class="card-title">Reports</h4>
                                        <h2 class="mb-0">23</h2>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="fas fa-chart-bar fa-2x"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row mt-4">
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">Recent Activity</h5>
                            </div>
                            <div class="card-body">
                                <p class="text-muted">Recent activity will be displayed here...</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">Quick Actions</h5>
                            </div>
                            <div class="card-body">
                                <div class="d-grid gap-2">
                                    <button class="btn btn-primary" type="button">Create User</button>
                                    <button class="btn btn-success" type="button">New Project</button>
                                    <button class="btn btn-info" type="button">Generate Report</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Get users list content
     */
    getUsersListContent: function() {
        return `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <h1 class="h3 mb-4">Users Management</h1>
                        <div class="card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h5 class="card-title mb-0">All Users</h5>
                                <button class="btn btn-primary">Add New User</button>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>System Administrator</td>
                                                <td>admin@oneteam.local</td>
                                                <td><span class="badge bg-danger">Admin</span></td>
                                                <td><span class="badge bg-success">Active</span></td>
                                                <td>
                                                    <button class="btn btn-sm btn-outline-primary">Edit</button>
                                                    <button class="btn btn-sm btn-outline-danger">Delete</button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Get default module content
     */
    getDefaultModuleContent: function(moduleId) {
        return `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <h1 class="h3 mb-4">${moduleId.replace(/[/_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h1>
                        <div class="card">
                            <div class="card-body">
                                <p class="text-muted">This module (${moduleId}) is under development.</p>
                                <p>Content will be available soon!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Update breadcrumb navigation
     */
    updateBreadcrumb: function() {
        const $breadcrumb = $('#breadcrumb');
        if ($breadcrumb.length === 0 || !this.activeMenuItem) return;
        
        $breadcrumb.empty();
        
        // Add home
        $breadcrumb.append('<li class="breadcrumb-item"><a href="#" data-module="dashboard">Home</a></li>');
        
        // Add current item
        $breadcrumb.append(`<li class="breadcrumb-item active">${this.activeMenuItem.title}</li>`);
    },
    
    /**
     * Toggle sidebar visibility (mobile)
     */
    toggleSidebar: function() {
        $('#sidebar').toggleClass('show');
    },
    
    /**
     * Toggle sidebar collapse/expand
     */
    toggleSidebarCollapse: function() {
        $('body').toggleClass('sidebar-collapsed');
        
        // Update tooltips
        setTimeout(() => {
            this.initializeTooltips();
        }, 300);
    },
    
    /**
     * Initialize tooltips for collapsed sidebar
     */
    initializeTooltips: function() {
        // Destroy existing tooltips
        $('.nav-link[data-bs-toggle="tooltip"]').tooltip('dispose');
        
        // Initialize new tooltips if sidebar is collapsed
        if ($('body').hasClass('sidebar-collapsed')) {
            $('.nav-link').each(function() {
                $(this).attr('data-bs-toggle', 'tooltip')
                       .attr('data-bs-placement', 'right');
            });
            
            $('.nav-link[data-bs-toggle="tooltip"]').tooltip();
        } else {
            $('.nav-link').removeAttr('data-bs-toggle data-bs-placement');
        }
    },
    
    /**
     * Initialize module-specific components
     */
    initializeModuleComponents: function() {
        // Initialize any jQuery plugins, event handlers, etc.
        // This would be called after loading module content
    },
    
    /**
     * Get create user content
     */
    getCreateUserContent: function() {
        return `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <h1 class="h3 mb-4">Create New User</h1>
                        <div class="card">
                            <div class="card-body">
                                <form>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">First Name</label>
                                                <input type="text" class="form-control" required>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">Last Name</label>
                                                <input type="text" class="form-control" required>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Email</label>
                                        <input type="email" class="form-control" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Role</label>
                                        <select class="form-select">
                                            <option value="viewer">Viewer</option>
                                            <option value="member">Member</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <button type="submit" class="btn btn-primary">Create User</button>
                                    <button type="button" class="btn btn-secondary ms-2">Cancel</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Get workspaces list content
     */
    getWorkspacesListContent: function() {
        return `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <h1 class="h3 mb-4">Workspaces</h1>
                        <div class="card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h5 class="card-title mb-0">All Workspaces</h5>
                                <button class="btn btn-primary">Create Workspace</button>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="card border-primary">
                                            <div class="card-body">
                                                <h5 class="card-title">Default Workspace</h5>
                                                <p class="card-text">Default workspace for all users</p>
                                                <span class="badge bg-success">Active</span>
                                                <span class="badge bg-primary ms-1">Admin</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Get reports content
     */
    getReportsContent: function() {
        return `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <h1 class="h3 mb-4">Reports</h1>
                        <div class="card">
                            <div class="card-body">
                                <p class="text-muted">Reports and analytics will be available here.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};
