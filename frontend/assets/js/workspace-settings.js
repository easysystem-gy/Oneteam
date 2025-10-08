/**
 * Workspace Settings Module
 * Handles workspace management, user assignments, and settings
 */

const WorkspaceSettings = {
    currentWorkspace: null,
    workspaces: [],
    users: [],
    workspaceUsers: [],
    editingWorkspace: null,
    deletingWorkspaceId: null,

    /**
     * Initialize the workspace settings module
     */
    init: function() {
        console.log('Initializing Workspace Settings...');
        this.loadCurrentWorkspace();
        this.loadAllWorkspaces();
        this.loadWorkspaceUsers();
        this.loadAllUsers();
    },

    /**
     * Load current workspace information
     */
    loadCurrentWorkspace: function() {
        fetch('/backend/api/workspaces.php?action=current')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.currentWorkspace = data.data;
                    this.renderCurrentWorkspace();
                } else {
                    console.error('Failed to load current workspace:', data.error);
                    this.showError('Failed to load current workspace information');
                }
            })
            .catch(error => {
                console.error('Error loading current workspace:', error);
                this.showError('Error loading current workspace information');
            });
    },

    /**
     * Load all workspaces
     */
    loadAllWorkspaces: function() {
        fetch('/backend/api/workspaces.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.workspaces = data.data;
                    this.renderWorkspacesList();
                } else {
                    console.error('Failed to load workspaces:', data.error);
                    this.showError('Failed to load workspaces');
                }
            })
            .catch(error => {
                console.error('Error loading workspaces:', error);
                this.showError('Error loading workspaces');
            });
    },

    /**
     * Load workspace users
     */
    loadWorkspaceUsers: function() {
        const workspaceId = this.currentWorkspace?.id || 1;
        
        fetch(`/backend/api/workspaces.php?action=users&workspace_id=${workspaceId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.workspaceUsers = data.data;
                    this.renderWorkspaceUsers();
                } else {
                    console.error('Failed to load workspace users:', data.error);
                    this.showError('Failed to load workspace users');
                }
            })
            .catch(error => {
                console.error('Error loading workspace users:', error);
                this.showError('Error loading workspace users');
            });
    },

    /**
     * Load all users for assignment dropdown
     */
    loadAllUsers: function() {
        // This would typically call a users API endpoint
        // For now, we'll simulate with sample data
        this.users = [
            { id: 1, username: 'admin', email: 'admin@oneteam.local', first_name: 'Admin', last_name: 'User' },
            { id: 2, username: 'john.doe', email: 'john.doe@oneteam.local', first_name: 'John', last_name: 'Doe' },
            { id: 3, username: 'jane.smith', email: 'jane.smith@oneteam.local', first_name: 'Jane', last_name: 'Smith' }
        ];
        this.populateUserDropdown();
    },

    /**
     * Render current workspace information
     */
    renderCurrentWorkspace: function() {
        const container = document.getElementById('current-workspace-info');
        if (!this.currentWorkspace) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h5>No Current Workspace</h5>
                    <p>Unable to load current workspace information.</p>
                </div>
            `;
            return;
        }

        const workspace = this.currentWorkspace;
        container.innerHTML = `
            <div class="workspace-card current">
                <div class="workspace-name">
                    <i class="fas fa-star text-warning me-2"></i>
                    ${workspace.name}
                </div>
                <div class="workspace-description">
                    ${workspace.description || 'No description provided'}
                </div>
                <div class="workspace-stats">
                    <div class="stat-item">
                        <i class="fas fa-users"></i>
                        <span>${workspace.user_count} users</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-list"></i>
                        <span>${workspace.menu_items_count} menu items</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-calendar"></i>
                        <span>Created ${this.formatDate(workspace.created_at)}</span>
                    </div>
                </div>
                <div class="workspace-actions">
                    <button class="btn btn-sm btn-outline-primary" onclick="WorkspaceSettings.editWorkspace(${workspace.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="WorkspaceSettings.manageMenus(${workspace.id})">
                        <i class="fas fa-bars"></i> Manage Menus
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Render workspaces list
     */
    renderWorkspacesList: function() {
        const container = document.getElementById('workspaces-list');
        
        if (!this.workspaces || this.workspaces.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-building"></i>
                    <h5>No Workspaces</h5>
                    <p>Create your first workspace to get started.</p>
                    <button class="btn btn-primary" onclick="WorkspaceSettings.showCreateModal()">
                        <i class="fas fa-plus"></i> Create Workspace
                    </button>
                </div>
            `;
            return;
        }

        const currentId = this.currentWorkspace?.id;
        let html = '';

        this.workspaces.forEach(workspace => {
            const isCurrent = workspace.id == currentId;
            html += `
                <div class="workspace-card ${isCurrent ? 'current' : ''}">
                    <div class="workspace-name">
                        ${isCurrent ? '<i class="fas fa-star text-warning me-2"></i>' : ''}
                        ${workspace.name}
                    </div>
                    <div class="workspace-description">
                        ${workspace.description || 'No description provided'}
                    </div>
                    <div class="workspace-stats">
                        <div class="stat-item">
                            <i class="fas fa-users"></i>
                            <span>${workspace.user_count} users</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-list"></i>
                            <span>${workspace.menu_items_count} menu items</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-calendar"></i>
                            <span>Created ${this.formatDate(workspace.created_at)}</span>
                        </div>
                    </div>
                    <div class="workspace-actions">
                        ${!isCurrent ? `
                            <button class="btn btn-sm btn-success" onclick="WorkspaceSettings.switchWorkspace(${workspace.id})">
                                <i class="fas fa-exchange-alt"></i> Switch
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-outline-primary" onclick="WorkspaceSettings.editWorkspace(${workspace.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-info" onclick="WorkspaceSettings.viewUsers(${workspace.id})">
                            <i class="fas fa-users"></i> Users
                        </button>
                        ${workspace.id != 1 ? `
                            <button class="btn btn-sm btn-outline-danger" onclick="WorkspaceSettings.deleteWorkspace(${workspace.id})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    /**
     * Render workspace users
     */
    renderWorkspaceUsers: function() {
        const container = document.getElementById('workspace-users-list');
        
        if (!this.workspaceUsers || this.workspaceUsers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h5>No Users Assigned</h5>
                    <p>Assign users to this workspace to get started.</p>
                    <button class="btn btn-primary" onclick="WorkspaceSettings.showAssignUserModal()">
                        <i class="fas fa-user-plus"></i> Assign User
                    </button>
                </div>
            `;
            return;
        }

        let html = '<div class="user-list">';
        
        this.workspaceUsers.forEach(user => {
            const initials = this.getInitials(user.first_name, user.last_name);
            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
            
            html += `
                <div class="user-item">
                    <div class="user-info">
                        <div class="user-avatar">${initials}</div>
                        <div class="user-details">
                            <div class="user-name">${fullName}</div>
                            <div class="user-email">${user.email}</div>
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <span class="user-role ${user.role}">${user.role}</span>
                        <button class="btn btn-sm btn-outline-danger" onclick="WorkspaceSettings.removeUser(${user.id})" title="Remove from workspace">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    },

    /**
     * Show create workspace modal
     */
    showCreateModal: function() {
        this.editingWorkspace = null;
        document.getElementById('workspaceModalTitle').textContent = 'Create Workspace';
        document.getElementById('workspaceName').value = '';
        document.getElementById('workspaceDescription').value = '';
        document.querySelector('.save-btn-text').textContent = 'Create Workspace';
        
        const modal = new bootstrap.Modal(document.getElementById('workspaceModal'));
        modal.show();
    },

    /**
     * Edit workspace
     */
    editWorkspace: function(workspaceId) {
        const workspace = this.workspaces.find(w => w.id == workspaceId);
        if (!workspace) return;

        this.editingWorkspace = workspace;
        document.getElementById('workspaceModalTitle').textContent = 'Edit Workspace';
        document.getElementById('workspaceName').value = workspace.name;
        document.getElementById('workspaceDescription').value = workspace.description || '';
        document.querySelector('.save-btn-text').textContent = 'Update Workspace';
        
        const modal = new bootstrap.Modal(document.getElementById('workspaceModal'));
        modal.show();
    },

    /**
     * Save workspace (create or update)
     */
    saveWorkspace: function() {
        const name = document.getElementById('workspaceName').value.trim();
        const description = document.getElementById('workspaceDescription').value.trim();

        if (!name) {
            this.showError('Workspace name is required');
            return;
        }

        // Show loading state
        document.querySelector('.save-btn-text').classList.add('d-none');
        document.querySelector('.save-btn-spinner').classList.remove('d-none');

        const isEdit = this.editingWorkspace !== null;
        const url = '/backend/api/workspaces.php';
        const method = isEdit ? 'PUT' : 'POST';
        const data = {
            name: name,
            description: description
        };

        if (isEdit) {
            data.id = this.editingWorkspace.id;
        }

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showSuccess(isEdit ? 'Workspace updated successfully' : 'Workspace created successfully');
                bootstrap.Modal.getInstance(document.getElementById('workspaceModal')).hide();
                this.loadAllWorkspaces();
                if (isEdit && this.editingWorkspace.id == this.currentWorkspace?.id) {
                    this.loadCurrentWorkspace();
                }
            } else {
                this.showError(data.error || 'Failed to save workspace');
            }
        })
        .catch(error => {
            console.error('Error saving workspace:', error);
            this.showError('Error saving workspace');
        })
        .finally(() => {
            // Reset loading state
            document.querySelector('.save-btn-text').classList.remove('d-none');
            document.querySelector('.save-btn-spinner').classList.add('d-none');
        });
    },

    /**
     * Delete workspace
     */
    deleteWorkspace: function(workspaceId) {
        this.deletingWorkspaceId = workspaceId;
        const modal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
        modal.show();
    },

    /**
     * Confirm workspace deletion
     */
    confirmDelete: function() {
        if (!this.deletingWorkspaceId) return;

        fetch('/backend/api/workspaces.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'delete',
                id: this.deletingWorkspaceId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showSuccess('Workspace deleted successfully');
                bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal')).hide();
                this.loadAllWorkspaces();
            } else {
                this.showError(data.error || 'Failed to delete workspace');
            }
        })
        .catch(error => {
            console.error('Error deleting workspace:', error);
            this.showError('Error deleting workspace');
        })
        .finally(() => {
            this.deletingWorkspaceId = null;
        });
    },

    /**
     * Switch to workspace
     */
    switchWorkspace: function(workspaceId) {
        fetch('/backend/api/workspaces.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'switch',
                workspace_id: workspaceId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showSuccess('Workspace switched successfully');
                // Reload the page to refresh all workspace-dependent data
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                this.showError(data.error || 'Failed to switch workspace');
            }
        })
        .catch(error => {
            console.error('Error switching workspace:', error);
            this.showError('Error switching workspace');
        });
    },

    /**
     * Show assign user modal
     */
    showAssignUserModal: function() {
        this.populateUserDropdown();
        this.populateWorkspaceDropdown();
        
        // Reset form
        document.getElementById('selectUser').value = '';
        document.getElementById('selectWorkspace').value = this.currentWorkspace?.id || '';
        document.getElementById('selectRole').value = 'user';
        
        const modal = new bootstrap.Modal(document.getElementById('assignUserModal'));
        modal.show();
    },

    /**
     * Populate user dropdown
     */
    populateUserDropdown: function() {
        const select = document.getElementById('selectUser');
        select.innerHTML = '<option value="">Select a user...</option>';
        
        this.users.forEach(user => {
            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
            select.innerHTML += `<option value="${user.id}">${fullName} (${user.email})</option>`;
        });
    },

    /**
     * Populate workspace dropdown
     */
    populateWorkspaceDropdown: function() {
        const select = document.getElementById('selectWorkspace');
        select.innerHTML = '<option value="">Select workspace...</option>';
        
        this.workspaces.forEach(workspace => {
            select.innerHTML += `<option value="${workspace.id}">${workspace.name}</option>`;
        });
    },

    /**
     * Assign user to workspace
     */
    assignUser: function() {
        const userId = document.getElementById('selectUser').value;
        const workspaceId = document.getElementById('selectWorkspace').value;
        const role = document.getElementById('selectRole').value;

        if (!userId || !workspaceId || !role) {
            this.showError('Please fill in all fields');
            return;
        }

        // Show loading state
        document.querySelector('.assign-btn-text').classList.add('d-none');
        document.querySelector('.assign-btn-spinner').classList.remove('d-none');

        fetch('/backend/api/workspaces.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'assign_user',
                user_id: parseInt(userId),
                workspace_id: parseInt(workspaceId),
                role: role
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showSuccess('User assigned successfully');
                bootstrap.Modal.getInstance(document.getElementById('assignUserModal')).hide();
                this.loadWorkspaceUsers();
            } else {
                this.showError(data.error || 'Failed to assign user');
            }
        })
        .catch(error => {
            console.error('Error assigning user:', error);
            this.showError('Error assigning user');
        })
        .finally(() => {
            // Reset loading state
            document.querySelector('.assign-btn-text').classList.remove('d-none');
            document.querySelector('.assign-btn-spinner').classList.add('d-none');
        });
    },

    /**
     * Remove user from workspace
     */
    removeUser: function(userId) {
        if (!confirm('Are you sure you want to remove this user from the workspace?')) {
            return;
        }

        const workspaceId = this.currentWorkspace?.id || 1;

        fetch('/backend/api/workspaces.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'remove_user',
                user_id: userId,
                workspace_id: workspaceId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showSuccess('User removed successfully');
                this.loadWorkspaceUsers();
            } else {
                this.showError(data.error || 'Failed to remove user');
            }
        })
        .catch(error => {
            console.error('Error removing user:', error);
            this.showError('Error removing user');
        });
    },

    /**
     * View users for a specific workspace
     */
    viewUsers: function(workspaceId) {
        // This could open a modal or navigate to a detailed view
        console.log('View users for workspace:', workspaceId);
        this.showInfo('Feature coming soon: View workspace users');
    },

    /**
     * Manage menus for workspace
     */
    manageMenus: function(workspaceId) {
        // This could navigate to menu management
        console.log('Manage menus for workspace:', workspaceId);
        this.showInfo('Feature coming soon: Menu management');
    },

    /**
     * Utility functions
     */
    formatDate: function(dateString) {
        return new Date(dateString).toLocaleDateString();
    },

    getInitials: function(firstName, lastName) {
        const first = (firstName || '').charAt(0).toUpperCase();
        const last = (lastName || '').charAt(0).toUpperCase();
        return first + last || '?';
    },

    showSuccess: function(message) {
        // You could integrate with a toast library here
        alert('Success: ' + message);
    },

    showError: function(message) {
        // You could integrate with a toast library here
        alert('Error: ' + message);
    },

    showInfo: function(message) {
        // You could integrate with a toast library here
        alert('Info: ' + message);
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    WorkspaceSettings.init();
});
