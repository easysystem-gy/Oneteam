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
    },
    
    /**
     * Bind workspace-related events
     */
    bindEvents: function() {
        // Workspace selector change
        $(document).on('change', '#workspace-selector', (e) => {
            const workspaceId = parseInt($(e.target).val());
            this.switchWorkspace(workspaceId);
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
        
        // Workspace color picker
        $(document).on('change', '#workspace-color', (e) => {
            this.updateWorkspaceColor($(e.target).val());
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
                this.updateWorkspaceSelector();
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
     * Update workspace selector dropdown
     */
    updateWorkspaceSelector: function() {
        const $selector = $('#workspace-selector');
        if ($selector.length === 0) return;
        
        $selector.empty();
        
        this.workspaces.forEach((workspace) => {
            const option = $('<option></option>')
                .attr('value', workspace.id)
                .text(workspace.name)
                .data('workspace', workspace);
            
            $selector.append(option);
        });
        
        // Select current workspace
        if (this.currentWorkspace) {
            $selector.val(this.currentWorkspace.id);
        }
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
        
        // Update workspace name in header
        $('#current-workspace-name').text(workspace.name);
        
        // Update workspace color/theme
        if (workspace.color) {
            this.applyWorkspaceTheme(workspace.color);
        }
        
        // Update workspace icon
        if (workspace.icon) {
            $('#workspace-icon').removeClass().addClass(workspace.icon);
        }
        
        // Update workspace selector
        $('#workspace-selector').val(workspace.id);
        
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
        $('.navbar-brand').css('color', color);
        
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
