/**
 * Oneteam Workspace Module
 * Handles workspace management, switching, and workspace-related operations
 */

window.Workspace = {
    /**
     * Current workspace data
     */
    currentWorkspace: null,
    
    /**
     * Available workspaces
     */
    workspaces: [],
    
    /**
     * Initialize workspace module
     */
    init: function() {
        this.bindEvents();
        this.loadWorkspaces();
        this.initializeDropdown();
    },
    
    /**
     * Initialize Bootstrap dropdown
     */
    initializeDropdown: function() {
        // Wait for DOM to be ready
        setTimeout(() => {
            const dropdownElement = document.getElementById('workspaceDropdown');
            if (dropdownElement) {
                console.log('Initializing Bootstrap dropdown for workspace');
                console.log('Bootstrap object available:', typeof bootstrap !== 'undefined');
                console.log('Bootstrap.Dropdown available:', typeof bootstrap.Dropdown !== 'undefined');
                
                // Remove any existing dropdown instance first
                let existingInstance = bootstrap.Dropdown.getInstance(dropdownElement);
                if (existingInstance) {
                    console.log('Disposing existing Bootstrap dropdown instance');
                    existingInstance.dispose();
                }
                
                // Create new Bootstrap dropdown instance
                console.log('Creating new Bootstrap dropdown instance');
                const dropdownInstance = new bootstrap.Dropdown(dropdownElement);
                
                // Store instance for later use
                this.dropdownInstance = dropdownInstance;
                
                // Add Bootstrap dropdown event listeners for debugging
                dropdownElement.addEventListener('show.bs.dropdown', () => {
                    console.log('Bootstrap dropdown show event fired');
                });
                
                dropdownElement.addEventListener('shown.bs.dropdown', () => {
                    console.log('Bootstrap dropdown shown event fired');
                });
                
                dropdownElement.addEventListener('hide.bs.dropdown', () => {
                    console.log('Bootstrap dropdown hide event fired');
                });
                
                console.log('Bootstrap dropdown initialized successfully');
                
            } else {
                console.error('Workspace dropdown element not found for initialization');
            }
        }, 100);
    },
    
    /**
     * Bind workspace-related events
     */
    bindEvents: function() {
        // Workspace selection from dropdown
        $(document).on('click', '.workspace-dropdown-item', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Workspace item clicked:', e.target);
            
            // Get workspace ID from the clicked element or its parent
            let workspaceId = $(e.target).data('workspace-id');
            if (!workspaceId) {
                workspaceId = $(e.target).closest('.workspace-dropdown-item').data('workspace-id');
            }
            
            console.log('Switching to workspace ID:', workspaceId);
            
            if (workspaceId) {
                this.switchWorkspace(parseInt(workspaceId));
            }
        });
        
        // Workspace settings button
        $(document).on('click', '#workspace-settings-btn', (e) => {
            e.preventDefault();
            this.showWorkspaceSettings();
        });
        
        // Create workspace button
        $(document).on('click', '#create-workspace-btn', (e) => {
            e.preventDefault();
            this.showCreateWorkspaceModal();
        });
    },
    
    /**
     * Load available workspaces from API
     */
    loadWorkspaces: function() {
        Utils.log('Loading workspaces...');
        
        return Utils.ajax({
            url: Utils.buildApiUrl('workspaces'),
            method: 'GET'
        })
        .then((response) => {
            if (response.success) {
                this.workspaces = response.data;
                this.updateNavbarWorkspaceDropdown();
                this.setCurrentWorkspace();
                Utils.log('Workspaces loaded:', this.workspaces);
            } else {
                Utils.error('Failed to load workspaces:', response.message);
                Utils.showAlert('Failed to load workspaces', 'error');
            }
        })
        .catch((error) => {
            Utils.error('Error loading workspaces:', error);
            Utils.showAlert('Error loading workspaces', 'error');
        });
    },
    
    /**
     * Update navbar workspace dropdown
     */
    updateNavbarWorkspaceDropdown: function() {
        const $dropdown = $('#workspace-dropdown-menu');
        console.log('Updating navbar dropdown, found element:', $dropdown.length);
        console.log('Workspaces to add:', this.workspaces);
        
        if ($dropdown.length === 0) {
            console.error('Workspace dropdown menu not found!');
            return;
        }
        
        // Clear existing items (keep header)
        $dropdown.find('.workspace-dropdown-item, .dropdown-divider').remove();
        
        // Add workspace items
        this.workspaces.forEach((workspace, index) => {
            if (index > 0) {
                $dropdown.append('<li><hr class="dropdown-divider"></li>');
            }
            
            const $item = $(`
                <li>
                    <a class="dropdown-item workspace-dropdown-item" href="#" data-workspace-id="${workspace.id}">
                        <i class="${workspace.icon} me-2" style="color: ${workspace.color}"></i>
                        <span class="workspace-name">${workspace.name}</span>
                        <small class="text-muted d-block">${workspace.description}</small>
                        <span class="badge bg-secondary ms-auto">${workspace.user_role}</span>
                    </a>
                </li>
            `);
            
            $dropdown.append($item);
        });
        
        console.log('Dropdown updated with', this.workspaces.length, 'workspaces');
    },
    
    /**
     * Render workspace list for selection screen
     */
    renderWorkspaceList: function() {
        const $workspaceList = $('#workspace-list');
        if ($workspaceList.length === 0) return;
        
        $workspaceList.empty();
        
        if (this.workspaces.length === 0) {
            $workspaceList.html(`
                <div class="col-12">
                    <div class="alert alert-info text-center">
                        <i class="fas fa-info-circle me-2"></i>
                        No workspaces available
                    </div>
                </div>
            `);
            return;
        }
        
        this.workspaces.forEach((workspace) => {
            const workspaceCard = $(`
                <div class="col-md-6">
                    <div class="workspace-card card h-100 cursor-pointer" data-workspace-id="${workspace.id}">
                        <div class="card-body text-center p-4">
                            <div class="workspace-icon mb-3">
                                <i class="${workspace.icon || 'fas fa-briefcase'} fa-2x text-primary"></i>
                            </div>
                            <h5 class="card-title mb-2">${workspace.name}</h5>
                            <p class="card-text text-muted small mb-3">${workspace.description || 'No description'}</p>
                            <div class="workspace-meta">
                                <span class="badge bg-${workspace.is_active ? 'success' : 'secondary'} me-1">
                                    ${workspace.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <span class="badge bg-primary">${workspace.user_role || 'Member'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `);
            
            $workspaceList.append(workspaceCard);
        });
        
        // Add click handlers for workspace cards
        $('.workspace-card').on('click', (e) => {
            const workspaceId = parseInt($(e.currentTarget).data('workspace-id'));
            this.selectWorkspace(workspaceId);
        });
    },
    
    /**
     * Select a workspace from the selection screen
     */
    selectWorkspace: function(workspaceId) {
        const workspace = this.workspaces.find(w => w.id === workspaceId);
        
        if (!workspace) {
            Utils.showAlert('Workspace not found', 'error');
            return;
        }
        
        // Show loading
        Utils.showLoading('Loading workspace...');
        
        // Set the workspace
        this.setCurrentWorkspace(workspaceId);
        
        // Hide workspace selection screen and show main app
        setTimeout(() => {
            Utils.hideLoading();
            
            // Initialize the main application
            if (window.App && typeof App.showMainApp === 'function') {
                App.showMainApp();
            }
            
            Utils.showAlert(`Welcome to ${workspace.name}!`, 'success');
        }, 500);
    },
    
    /**
     * Auto-select default workspace
     */
    autoSelectDefaultWorkspace: function() {
        if (this.workspaces.length === 0) return;
        
        // Find default workspace or use first one
        const defaultWorkspace = this.workspaces.find(w => w.is_default) || this.workspaces[0];
        this.setCurrentWorkspace(defaultWorkspace.id);
    },
    
    /**
     * Set current workspace
     */
    setCurrentWorkspace: function(workspaceId = null) {
        let workspace = null;
        
        if (workspaceId) {
            workspace = this.workspaces.find(w => w.id === workspaceId);
        } else {
            // Try to get from storage
            const storedWorkspace = Utils.getCurrentWorkspace();
            if (storedWorkspace) {
                workspace = this.workspaces.find(w => w.id === storedWorkspace.id);
            }
            
            // Fallback to first workspace or default
            if (!workspace && this.workspaces.length > 0) {
                workspace = this.workspaces.find(w => w.is_default) || this.workspaces[0];
            }
        }
        
        if (workspace) {
            this.currentWorkspace = workspace;
            Utils.setCurrentWorkspace(workspace);
            this.updateWorkspaceUI();
            this.loadWorkspaceData();
            Utils.log('Current workspace set:', workspace);
        }
    },
    
    /**
     * Switch to a different workspace
     */
    switchWorkspace: function(workspaceId) {
        const workspace = this.workspaces.find(w => w.id === workspaceId);
        
        if (!workspace) {
            Utils.showAlert('Workspace not found', 'error');
            return;
        }
        
        if (this.currentWorkspace && this.currentWorkspace.id === workspaceId) {
            return; // Already on this workspace
        }
        
        Utils.showLoading('Switching workspace...');
        
        // Simulate workspace switch delay
        setTimeout(() => {
            this.setCurrentWorkspace(workspaceId);
            
            // Close Bootstrap dropdown
            if (this.dropdownInstance) {
                console.log('Closing dropdown after workspace switch');
                this.dropdownInstance.hide();
            } else {
                console.log('No dropdown instance found to close');
            }
            
            // Reload menu for new workspace
            if (window.Menu) {
                Menu.loadMenu();
            }
            
            // Clear main content
            $('#content-area').empty().html('<div class="text-center p-5"><h4>Welcome to ' + workspace.name + '</h4><p class="text-muted">Select a menu item to get started.</p></div>');
            
            Utils.hideLoading();
            Utils.showAlert('Switched to ' + workspace.name, 'success');
        }, 500);
    },
    
    /**
     * Update workspace-related UI elements
     */
    updateWorkspaceUI: function() {
        if (!this.currentWorkspace) return;
        
        const workspace = this.currentWorkspace;
        
        // Update workspace name in navbar
        $('#current-workspace-name').text(workspace.name);
        
        // Update workspace icon in navbar
        if (workspace.icon) {
            $('#current-workspace-icon').removeClass().addClass(workspace.icon);
        }
        
        // Update workspace color/theme
        if (workspace.color) {
            this.applyWorkspaceTheme(workspace.color);
        }
        
        // Update page title
        document.title = `${workspace.name} - Oneteam`;
    },
    
    /**
     * Apply workspace theme/color
     */
    applyWorkspaceTheme: function(color) {
        // Update CSS custom properties for theming
        document.documentElement.style.setProperty('--workspace-primary', color);
        
        // Update navbar color
        // $('.navbar-brand').css('color', color);
        
        // Update active menu items color
        $('.nav-link.active').css('color', color);
    },
    
    /**
     * Load workspace-specific data
     */
    loadWorkspaceData: function() {
        if (!this.currentWorkspace) return;
        
        // Load workspace statistics, recent activity, etc.
        this.loadWorkspaceStats();
    },
    
    /**
     * Load workspace statistics
     */
    loadWorkspaceStats: function() {
        // This would typically load from an API endpoint
        // For now, we'll use mock data
        const stats = {
            users: 12,
            projects: 8,
            tasks: 45,
            completed: 32
        };
        
        // Update stats in UI if elements exist
        $('#workspace-users-count').text(stats.users);
        $('#workspace-projects-count').text(stats.projects);
        $('#workspace-tasks-count').text(stats.tasks);
        $('#workspace-completed-count').text(stats.completed);
    },
    
    /**
     * Show workspace settings modal
     */
    showWorkspaceSettings: function() {
        if (!this.currentWorkspace) return;
        
        // This would show a modal with workspace settings
        Utils.showAlert('Workspace settings feature coming soon!', 'info');
    },
    
    /**
     * Show create workspace modal
     */
    showCreateWorkspaceModal: function() {
        // This would show a modal to create a new workspace
        Utils.showAlert('Create workspace feature coming soon!', 'info');
    },
    
    /**
     * Update workspace color
     */
    updateWorkspaceColor: function(color) {
        if (!this.currentWorkspace) return;
        
        this.currentWorkspace.color = color;
        this.applyWorkspaceTheme(color);
        
        // Save to server (would be an API call)
        Utils.log('Workspace color updated:', color);
    },
    
    /**
     * Get current workspace
     */
    getCurrentWorkspace: function() {
        return this.currentWorkspace;
    },
    
    /**
     * Check if user has permission in current workspace
     */
    hasPermission: function(permission) {
        if (!this.currentWorkspace) return false;
        
        const userRole = this.currentWorkspace.user_role;
        
        // Simple role-based permissions
        const permissions = {
            'admin': ['view', 'edit', 'delete', 'manage', 'create'],
            'member': ['view', 'edit', 'create'],
            'viewer': ['view']
        };
        
        return permissions[userRole]?.includes(permission) || false;
    },
    
    /**
     * Get workspace members
     */
    getWorkspaceMembers: function(workspaceId = null) {
        const id = workspaceId || (this.currentWorkspace ? this.currentWorkspace.id : null);
        
        if (!id) return Promise.reject('No workspace ID provided');
        
        return Utils.ajax({
            url: Utils.buildApiUrl(`workspaces/${id}/members`),
            method: 'GET'
        });
    },
    
    /**
     * Invite user to workspace
     */
    inviteUser: function(email, role = 'member') {
        if (!this.currentWorkspace) return Promise.reject('No current workspace');
        
        return Utils.ajax({
            url: Utils.buildApiUrl(`workspaces/${this.currentWorkspace.id}/invite`),
            method: 'POST',
            data: JSON.stringify({
                email: email,
                role: role
            })
        });
    },
    
    /**
     * Remove user from workspace
     */
    removeUser: function(userId) {
        if (!this.currentWorkspace) return Promise.reject('No current workspace');
        
        return Utils.ajax({
            url: Utils.buildApiUrl(`workspaces/${this.currentWorkspace.id}/members/${userId}`),
            method: 'DELETE'
        });
    },
    
    /**
     * Update user role in workspace
     */
    updateUserRole: function(userId, role) {
        if (!this.currentWorkspace) return Promise.reject('No current workspace');
        
        return Utils.ajax({
            url: Utils.buildApiUrl(`workspaces/${this.currentWorkspace.id}/members/${userId}`),
            method: 'PUT',
            data: JSON.stringify({
                role: role
            })
        });
    }
};
