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
        
        // Submenu toggle - use custom implementation instead of Bootstrap data attributes
        $(document).on('click', '.submenu-trigger', (e) => {
            e.preventDefault();
            const $link = $(e.currentTarget);
            const $icon = $link.find('.submenu-toggle');
            const targetSelector = $link.attr('data-submenu-target');
            const $submenu = $(targetSelector);
            
            Utils.log('Submenu toggle clicked:', targetSelector);
            
            if ($submenu.length === 0) {
                Utils.log('Submenu target not found:', targetSelector);
                return;
            }
            
            // Toggle the submenu using Bootstrap Collapse API
            const isCurrentlyExpanded = $link.attr('aria-expanded') === 'true';
            const newExpandedState = !isCurrentlyExpanded;
            
            Utils.log('Current expanded state:', isCurrentlyExpanded, '-> New state:', newExpandedState);
            
            // Update aria-expanded attribute
            $link.attr('aria-expanded', newExpandedState);
            
            // Toggle submenu visibility with Bootstrap collapse
            if (newExpandedState) {
                // Expand submenu
                $submenu.addClass('show');
                $icon.addClass('rotate-90');
                Utils.log('Submenu expanded');
            } else {
                // Collapse submenu
                $submenu.removeClass('show');
                $icon.removeClass('rotate-90');
                Utils.log('Submenu collapsed');
            }
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
        
        // User dropdown toggle - use custom class instead of Bootstrap data attribute
        $(document).on('click', '.user-dropdown-trigger', (e) => {
            e.preventDefault();
            const $trigger = $(e.currentTarget);
            const targetSelector = $trigger.attr('data-dropdown-target');
            const $dropdown = $trigger.next(targetSelector);
            
            Utils.log('User dropdown toggle clicked:', $trigger.attr('id'));
            Utils.log('Target selector:', targetSelector);
            
            if ($dropdown.length === 0) {
                Utils.log('Dropdown menu not found for selector:', targetSelector);
                return;
            }
            
            // Close other dropdowns first
            $('.dropdown-menu.show').not($dropdown).removeClass('show');
            $('.user-dropdown-trigger').not($trigger).attr('aria-expanded', 'false');
            
            // Toggle current dropdown
            const isCurrentlyOpen = $dropdown.hasClass('show');
            Utils.log('Dropdown currently open:', isCurrentlyOpen);
            
            if (isCurrentlyOpen) {
                $dropdown.removeClass('show');
                $trigger.attr('aria-expanded', 'false');
                Utils.log('Dropdown closed');
            } else {
                $dropdown.addClass('show');
                $trigger.attr('aria-expanded', 'true');
                Utils.log('Dropdown opened');
            }
        });
        
        // Close dropdown when clicking outside
        $(document).on('click', (e) => {
            if (!$(e.target).closest('.dropdown').length) {
                $('.dropdown-menu.show').removeClass('show');
                $('.user-dropdown-trigger').attr('aria-expanded', 'false');
            }
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
                
                // Add profile menu item if not already present
                const hasProfile = this.menuItems.some(item => item.module_name === 'profile');
                if (!hasProfile) {
                    this.menuItems.push({
                        id: 'profile-menu',
                        uuid: 'profile-menu-uuid',
                        parent_id: null,
                        title: 'Profile',
                        icon: 'fas fa-user',
                        module_name: 'profile',
                        sort_order: 999,
                        level: 0,
                        has_children: false,
                        can_view: true,
                        can_edit: true,
                        can_delete: false
                    });
                }
                
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
        const rootItems = this.menuItems.filter(item => item.level === 0 || item.parent_id === null);
        const childItems = this.menuItems.filter(item => item.level > 0 && item.parent_id !== null);
        
        Utils.log('Rendering menu - Root items:', rootItems.length);
        Utils.log('Root items:', rootItems.map(item => ({ id: item.id, title: item.title, level: item.level, parent_id: item.parent_id })));
        Utils.log('Child items:', childItems.map(item => ({ id: item.id, title: item.title, parent_id: item.parent_id, level: item.level })));
        
        // Debug: Log all menu items with their hierarchy info
        console.log('=== MENU DEBUG INFO ===');
        this.menuItems.forEach(item => {
            console.log(`ID: ${item.id}, Title: "${item.title}", Parent: ${item.parent_id}, Level: ${item.level}`);
        });
        
        rootItems.forEach((item) => {
            // Find child items for this parent
            const children = childItems.filter(child => child.parent_id == item.id);
            
            if (children.length > 0) {
                // Create parent item with submenu toggle
                const $menuItem = this.createParentMenuItem(item, children);
                $menuContainer.append($menuItem);
            } else {
                // Create regular menu item
                const $menuItem = this.createMenuItem(item);
                $menuContainer.append($menuItem);
            }
        });
        
        // Initialize tooltips for collapsed sidebar
        this.initializeTooltips();
        
        // Initialize submenu toggles
        this.initializeSubmenuToggles();
    },
    
    /**
     * Create a menu item element
     */
    createMenuItem: function(item) {
        const hasChildren = this.menuItems.some(child => child.parent_id === item.id);
        const isClickable = item.module_name || item.url;
        
        Utils.log('Creating menu item:', item.title, 'hasChildren:', hasChildren, 'isClickable:', isClickable);
        
        let $menuItem;
        
        if (hasChildren) {
            // Parent item with submenu - use custom data attribute instead of Bootstrap's data-bs-toggle
            Utils.log('Creating parent menu item with children:', item.title, 'ID:', item.id);
            $menuItem = $(`
                <li class="nav-item">
                    <a class="nav-link collapsed submenu-trigger" href="#" 
                       data-submenu-target="#submenu-${item.id}"
                       aria-expanded="false" aria-controls="submenu-${item.id}" 
                       title="${item.title}">
                        <i class="${item.icon}"></i>
                        <span class="nav-text">${item.title}</span>
                        <i class="fas fa-chevron-right submenu-toggle ms-auto"></i>
                    </a>
                </li>
            `);
            
            // Debug: Check if the custom attribute was added correctly
            const $link = $menuItem.find('a');
            Utils.log('Created menu item HTML:', $menuItem[0].outerHTML);
            Utils.log('data-submenu-target attribute:', $link.attr('data-submenu-target'));
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
     * Create parent menu item with submenu
     */
    createParentMenuItem: function(item, children) {
        const $menuItem = $(`
            <li class="nav-item">
                <a class="nav-link submenu-toggle" href="#" 
                   data-bs-toggle="collapse" 
                   data-bs-target="#submenu-${item.id}"
                   aria-expanded="false"
                   aria-controls="submenu-${item.id}"
                   data-menu-id="${item.id}"
                   title="${item.title}">
                    <i class="${item.icon}"></i>
                    <span class="nav-text">${item.title}</span>
                    <i class="fas fa-chevron-down submenu-arrow ms-auto"></i>
                </a>
                <div class="collapse" id="submenu-${item.id}">
                    <ul class="nav flex-column ms-3 nav-submenu">
                        ${children.map(child => this.createChildMenuItemHTML(child)).join('')}
                    </ul>
                </div>
            </li>
        `);
        
        return $menuItem;
    },
    
    /**
     * Create child menu item HTML
     */
    createChildMenuItemHTML: function(item) {
        const target = item.target || '_self';
        const href = item.url || '#';
        
        return `
            <li class="nav-item">
                <a class="nav-link nav-link-child" href="${href}" target="${target}" 
                   data-module="${item.module_name || ''}" 
                   data-menu-id="${item.id}"
                   title="${item.title}">
                    <i class="${item.icon}"></i>
                    <span class="nav-text">${item.title}</span>
                </a>
            </li>
        `;
    },
    
    /**
     * Create submenu element (legacy - keeping for compatibility)
     */
    createSubmenu: function(parentId, children) {
        const $submenu = $(`
            <li class="nav-item">
                <div class="collapse" id="submenu-${parentId}">
                    <ul class="nav flex-column ms-3 nav-submenu"></ul>
                </div>
            </li>
        `);
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
            case 'profile':
                this.loadProfileModule();
                return; // Return early since profile loads asynchronously
            case 'menu-management':
                this.loadMenuManagementModule();
                return; // Return early since menu-management loads asynchronously
            case 'workspace-settings':
                this.loadWorkspaceSettingsModule();
                return; // Return early since workspace-settings loads asynchronously
            case 'general-settings':
                this.loadGeneralSettingsModule();
                return; // Return early since general-settings loads asynchronously
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
     * Initialize submenu toggles
     */
    initializeSubmenuToggles: function() {
        // Handle submenu toggle clicks
        $(document).off('click.submenu', '.submenu-toggle');
        $(document).on('click.submenu', '.submenu-toggle', function(e) {
            e.preventDefault();
            
            const $toggle = $(this);
            const $arrow = $toggle.find('.submenu-arrow');
            const targetId = $toggle.attr('data-bs-target');
            const $submenu = $(targetId);
            
            // Toggle the submenu
            $submenu.collapse('toggle');
            
            // Update arrow direction
            $submenu.on('show.bs.collapse', function() {
                $arrow.removeClass('fa-chevron-down').addClass('fa-chevron-up');
                $toggle.attr('aria-expanded', 'true');
            });
            
            $submenu.on('hide.bs.collapse', function() {
                $arrow.removeClass('fa-chevron-up').addClass('fa-chevron-down');
                $toggle.attr('aria-expanded', 'false');
            });
        });
        
        // Handle child menu item clicks
        $(document).off('click.childmenu', '.nav-link-child');
        $(document).on('click.childmenu', '.nav-link-child', function(e) {
            e.preventDefault();
            
            const $link = $(this);
            const moduleId = $link.data('module');
            const menuId = $link.data('menu-id');
            
            if (moduleId) {
                Menu.navigateToModule(moduleId, menuId);
            }
        });
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
    },
    
    /**
     * Load profile module
     */
    loadProfileModule: function() {
        const $mainContent = $('#content-area');
        
        // Show loading
        $mainContent.html(`
            <div class="text-center p-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Loading profile...</p>
            </div>
        `);
        
        // Load profile HTML
        $.get('frontend/modules/profile/profile.html')
            .done((html) => {
                $mainContent.html(html).addClass('fade-in');
                
                // Load profile JavaScript if not already loaded
                if (typeof Profile === 'undefined') {
                    $.getScript('frontend/modules/profile/profile.js')
                        .done(() => {
                            console.log('Profile module loaded successfully');
                        })
                        .fail((error) => {
                            console.error('Error loading profile script:', error);
                            Utils.showAlert('Error loading profile functionality', 'error');
                        });
                } else {
                    // Profile already loaded, just initialize
                    if (typeof Profile.init === 'function') {
                        Profile.init();
                    }
                }
            })
            .fail((error) => {
                console.error('Error loading profile HTML:', error);
                $mainContent.html(`
                    <div class="alert alert-danger m-4">
                        <h4><i class="fas fa-exclamation-triangle"></i> Error</h4>
                        <p>Failed to load profile module. Please try again.</p>
                        <button class="btn btn-primary" onclick="Menu.loadProfileModule()">Retry</button>
                    </div>
                `);
            });
    },
    
    /**
     * Load menu management module
     */
    loadMenuManagementModule: function() {
        const $mainContent = $('#content-area');
        
        // Show loading
        $mainContent.html(`
            <div class="text-center p-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Loading menu management...</p>
            </div>
        `);
        
        // Load menu management HTML
        $.get('frontend/modules/menu-management.html')
            .done((html) => {
                $mainContent.html(html).addClass('fade-in');
                
                // Load menu management JavaScript if not already loaded
                if (typeof MenuManagement === 'undefined') {
                    $.getScript('frontend/assets/js/menu-management.js')
                        .done(() => {
                            console.log('Menu Management module loaded successfully');
                            // Initialize the module
                            if (typeof MenuManagement.init === 'function') {
                                MenuManagement.init();
                            }
                        })
                        .fail((error) => {
                            console.error('Error loading menu management script:', error);
                            Utils.showAlert('Error loading menu management functionality', 'error');
                        });
                } else {
                    // Menu Management already loaded, just initialize
                    if (typeof MenuManagement.init === 'function') {
                        MenuManagement.init();
                    }
                }
            })
            .fail((error) => {
                console.error('Error loading menu management HTML:', error);
                $mainContent.html(`
                    <div class="alert alert-danger m-4">
                        <h4><i class="fas fa-exclamation-triangle"></i> Error</h4>
                        <p>Failed to load menu management module. Please try again.</p>
                        <button class="btn btn-primary" onclick="Menu.loadMenuManagementModule()">Retry</button>
                    </div>
                `);
            });
    },
    
    /**
     * Load workspace settings module
     */
    loadWorkspaceSettingsModule: function() {
        const $mainContent = $('#content-area');
        
        // Show loading
        $mainContent.html(`
            <div class="text-center p-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Loading workspace settings...</p>
            </div>
        `);
        
        // Load workspace settings HTML
        $.get('frontend/modules/workspace-settings.html')
            .done((html) => {
                $mainContent.html(html).addClass('fade-in');
                
                // Load workspace settings JavaScript if not already loaded
                if (typeof WorkspaceSettings === 'undefined') {
                    $.getScript('frontend/assets/js/workspace-settings.js')
                        .done(() => {
                            console.log('Workspace Settings module loaded successfully');
                            // Initialize the module
                            if (typeof WorkspaceSettings.init === 'function') {
                                WorkspaceSettings.init();
                            }
                        })
                        .fail((error) => {
                            console.error('Error loading workspace settings script:', error);
                            Utils.showAlert('Error loading workspace settings functionality', 'error');
                        });
                } else {
                    // Workspace Settings already loaded, just initialize
                    if (typeof WorkspaceSettings.init === 'function') {
                        WorkspaceSettings.init();
                    }
                }
            })
            .fail((error) => {
                console.error('Error loading workspace settings HTML:', error);
                $mainContent.html(`
                    <div class="alert alert-danger m-4">
                        <h4><i class="fas fa-exclamation-triangle"></i> Error</h4>
                        <p>Failed to load workspace settings module. Please try again.</p>
                        <button class="btn btn-primary" onclick="Menu.loadWorkspaceSettingsModule()">Retry</button>
                    </div>
                `);
            });
    },
    
    /**
     * Load general settings module
     */
    loadGeneralSettingsModule: function() {
        const $mainContent = $('#content-area');
        
        // Show loading
        $mainContent.html(`
            <div class="text-center p-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Loading general settings...</p>
            </div>
        `);
        
        // Load general settings HTML
        $.get('frontend/modules/general-settings.html')
            .done((html) => {
                $mainContent.html(html).addClass('fade-in');
                console.log('General Settings module loaded successfully');
            })
            .fail((error) => {
                console.error('Error loading general settings HTML:', error);
                $mainContent.html(`
                    <div class="alert alert-danger m-4">
                        <h4><i class="fas fa-exclamation-triangle"></i> Error</h4>
                        <p>Failed to load general settings module. Please try again.</p>
                        <button class="btn btn-primary" onclick="Menu.loadGeneralSettingsModule()">Retry</button>
                    </div>
                `);
            });
    }
};
