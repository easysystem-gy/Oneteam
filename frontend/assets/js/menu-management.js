/**
 * Menu Management Module
 * Handles CRUD operations for menu items
 */

const MenuManagement = {
    currentMenuItems: [],
    selectedMenuItem: null,
    currentView: 'table', // 'table' or 'tree'
    
    /**
     * Initialize the menu management module
     */
    init: function() {
        console.log('Initializing Menu Management module');
        this.bindEvents();
        this.loadMenuItems();
    },
    
    /**
     * Bind event handlers
     */
    bindEvents: function() {
        // Add new menu item button
        $(document).on('click', '#add-menu-item-btn', (e) => {
            e.preventDefault();
            this.showAddMenuItemModal();
        });
        
        // Refresh menu button
        $(document).on('click', '#refresh-menu-btn', (e) => {
            e.preventDefault();
            this.loadMenuItems();
        });
        
        // View toggle buttons
        $(document).on('click', '#view-tree-btn', (e) => {
            e.preventDefault();
            this.switchToTreeView();
        });
        
        $(document).on('click', '#view-table-btn', (e) => {
            e.preventDefault();
            this.switchToTableView();
        });
        
        // Edit menu item
        $(document).on('click', '.edit-menu-item', (e) => {
            e.preventDefault();
            const menuId = $(e.target).closest('.edit-menu-item').data('menu-id');
            this.editMenuItem(menuId);
        });
        
        // Delete menu item
        $(document).on('click', '.delete-menu-item', (e) => {
            e.preventDefault();
            const menuId = $(e.target).closest('.delete-menu-item').data('menu-id');
            this.deleteMenuItem(menuId);
        });
        
        // Toggle menu item active status
        $(document).on('change', '.menu-item-active-toggle', (e) => {
            const menuId = $(e.target).data('menu-id');
            const isActive = $(e.target).is(':checked');
            this.toggleMenuItemStatus(menuId, isActive);
        });
        
        // Save menu item form
        $(document).on('click', '#save-menu-item-btn', (e) => {
            e.preventDefault();
            this.saveMenuItem();
        });
        
        // Cancel menu item form
        $(document).on('click', '#cancel-menu-item-btn', (e) => {
            e.preventDefault();
            this.hideMenuItemModal();
        });
        
        // Drag and drop for reordering (if using sortable)
        this.initializeSortable();
    },
    
    /**
     * Load menu items from server
     */
    loadMenuItems: function() {
        console.log('Loading menu items...');
        
        $.ajax({
            url: '../backend/api/menu.php',
            method: 'GET',
            dataType: 'json',
            success: (response) => {
                console.log('Menu items loaded:', response);
                this.currentMenuItems = response.menu_items || [];
                this.updateStatistics();
                this.renderMenuItems(response.hierarchical || []);
            },
            error: (xhr, status, error) => {
                console.error('Error loading menu items:', error);
                this.showError('Failed to load menu items: ' + error);
            }
        });
    },
    
    /**
     * Render menu items in the management interface
     */
    renderMenuItems: function(hierarchicalItems) {
        const container = $('#menu-items-container');
        if (!container.length) {
            console.error('Menu items container not found');
            return;
        }
        
        let html = '';
        
        if (hierarchicalItems.length === 0) {
            html = `
                <div class="text-center py-5">
                    <i class="fas fa-bars fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No menu items found</h5>
                    <p class="text-muted">Click "Add Menu Item" to create your first menu item.</p>
                </div>
            `;
        } else {
            html = '<div class="menu-items-list" id="sortable-menu-items">';
            html += this.renderMenuItemsRecursive(hierarchicalItems, 0);
            html += '</div>';
        }
        
        container.html(html);
        this.initializeSortable();
    },
    
    /**
     * Recursively render menu items with hierarchy
     */
    renderMenuItemsRecursive: function(items, level) {
        let html = '';
        
        items.forEach(item => {
            const indent = level * 20;
            const statusBadge = item.is_active ? 
                '<span class="badge bg-success">Active</span>' : 
                '<span class="badge bg-secondary">Inactive</span>';
            
            html += `
                <div class="menu-item-row card mb-2" data-menu-id="${item.id}" style="margin-left: ${indent}px;">
                    <div class="card-body py-2">
                        <div class="row align-items-center">
                            <div class="col-md-1">
                                <i class="fas fa-grip-vertical text-muted drag-handle"></i>
                            </div>
                            <div class="col-md-1">
                                <i class="${item.icon} fa-lg"></i>
                            </div>
                            <div class="col-md-3">
                                <strong>${item.title}</strong>
                                ${item.url ? `<br><small class="text-muted">${item.url}</small>` : ''}
                                ${item.module_name ? `<br><small class="text-info">Module: ${item.module_name}</small>` : ''}
                            </div>
                            <div class="col-md-2">
                                <span class="badge bg-light text-dark">Order: ${item.sort_order}</span>
                            </div>
                            <div class="col-md-2">
                                ${statusBadge}
                            </div>
                            <div class="col-md-1">
                                <div class="form-check form-switch">
                                    <input class="form-check-input menu-item-active-toggle" 
                                           type="checkbox" 
                                           data-menu-id="${item.id}"
                                           ${item.is_active ? 'checked' : ''}>
                                </div>
                            </div>
                            <div class="col-md-2">
                                <div class="btn-group btn-group-sm">
                                    <button class="btn btn-outline-primary edit-menu-item" 
                                            data-menu-id="${item.id}" 
                                            title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-outline-danger delete-menu-item" 
                                            data-menu-id="${item.id}" 
                                            title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Render children if any
            if (item.children && item.children.length > 0) {
                html += this.renderMenuItemsRecursive(item.children, level + 1);
            }
        });
        
        return html;
    },
    
    /**
     * Show add menu item modal
     */
    showAddMenuItemModal: function() {
        this.selectedMenuItem = null;
        this.populateMenuItemForm();
        $('#menu-item-modal').modal('show');
        $('#menu-item-modal-title').text('Add Menu Item');
    },
    
    /**
     * Edit menu item
     */
    editMenuItem: function(menuId) {
        const menuItem = this.currentMenuItems.find(item => item.id == menuId);
        if (!menuItem) {
            this.showError('Menu item not found');
            return;
        }
        
        this.selectedMenuItem = menuItem;
        this.populateMenuItemForm(menuItem);
        $('#menu-item-modal').modal('show');
        $('#menu-item-modal-title').text('Edit Menu Item');
    },
    
    /**
     * Populate menu item form
     */
    populateMenuItemForm: function(menuItem = null) {
        // Clear form
        $('#menu-item-form')[0].reset();
        
        // Populate parent dropdown
        this.populateParentDropdown(menuItem?.id);
        
        if (menuItem) {
            $('#menu-item-title').val(menuItem.title);
            $('#menu-item-icon').val(menuItem.icon);
            $('#menu-item-url').val(menuItem.url || '');
            $('#menu-item-module').val(menuItem.module_name || '');
            $('#menu-item-parent').val(menuItem.parent_id || '');
            $('#menu-item-sort-order').val(menuItem.sort_order);
            $('#menu-item-active').prop('checked', menuItem.is_active);
        }
    },
    
    /**
     * Populate parent dropdown (excluding current item and its children)
     */
    populateParentDropdown: function(excludeId = null) {
        const parentSelect = $('#menu-item-parent');
        parentSelect.empty();
        parentSelect.append('<option value="">-- No Parent (Top Level) --</option>');
        
        // Get items that can be parents (excluding current item and its descendants)
        const availableParents = this.currentMenuItems.filter(item => {
            if (excludeId && (item.id == excludeId)) {
                return false;
            }
            // TODO: Also exclude descendants of current item
            return true;
        });
        
        availableParents.forEach(item => {
            parentSelect.append(`<option value="${item.id}">${item.title}</option>`);
        });
    },
    
    /**
     * Save menu item (create or update)
     */
    saveMenuItem: function() {
        const formData = {
            title: $('#menu-item-title').val().trim(),
            icon: $('#menu-item-icon').val().trim(),
            url: $('#menu-item-url').val().trim() || null,
            module_name: $('#menu-item-module').val().trim() || null,
            parent_id: $('#menu-item-parent').val() || null,
            sort_order: parseInt($('#menu-item-sort-order').val()) || 1,
            is_active: $('#menu-item-active').is(':checked')
        };
        
        // Validate required fields
        if (!formData.title || !formData.icon) {
            this.showError('Title and Icon are required fields');
            return;
        }
        
        const isEdit = this.selectedMenuItem !== null;
        const url = '../backend/api/menu.php';
        const method = isEdit ? 'PUT' : 'POST';
        
        if (isEdit) {
            formData.id = this.selectedMenuItem.id;
        }
        
        console.log('Saving menu item:', formData);
        
        $.ajax({
            url: url,
            method: method,
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: (response) => {
                console.log('Menu item saved:', response);
                this.hideMenuItemModal();
                this.loadMenuItems(); // Reload the list
                this.showSuccess(isEdit ? 'Menu item updated successfully' : 'Menu item created successfully');
                
                // Reload the sidebar menu
                if (window.MenuManager && typeof window.MenuManager.loadMenu === 'function') {
                    window.MenuManager.loadMenu();
                }
            },
            error: (xhr, status, error) => {
                console.error('Error saving menu item:', error);
                let errorMessage = 'Failed to save menu item';
                if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMessage += ': ' + xhr.responseJSON.error;
                }
                this.showError(errorMessage);
            }
        });
    },
    
    /**
     * Delete menu item
     */
    deleteMenuItem: function(menuId) {
        const menuItem = this.currentMenuItems.find(item => item.id == menuId);
        if (!menuItem) {
            this.showError('Menu item not found');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete "${menuItem.title}"?`)) {
            return;
        }
        
        console.log('Deleting menu item:', menuId);
        
        $.ajax({
            url: `../backend/api/menu.php?id=${menuId}`,
            method: 'DELETE',
            success: (response) => {
                console.log('Menu item deleted:', response);
                this.loadMenuItems(); // Reload the list
                this.showSuccess('Menu item deleted successfully');
                
                // Reload the sidebar menu
                if (window.MenuManager && typeof window.MenuManager.loadMenu === 'function') {
                    window.MenuManager.loadMenu();
                }
            },
            error: (xhr, status, error) => {
                console.error('Error deleting menu item:', error);
                let errorMessage = 'Failed to delete menu item';
                if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMessage += ': ' + xhr.responseJSON.error;
                }
                this.showError(errorMessage);
            }
        });
    },
    
    /**
     * Toggle menu item active status
     */
    toggleMenuItemStatus: function(menuId, isActive) {
        const menuItem = this.currentMenuItems.find(item => item.id == menuId);
        if (!menuItem) {
            this.showError('Menu item not found');
            return;
        }
        
        const updateData = {
            id: menuId,
            title: menuItem.title,
            icon: menuItem.icon,
            url: menuItem.url,
            module_name: menuItem.module_name,
            parent_id: menuItem.parent_id,
            sort_order: menuItem.sort_order,
            is_active: isActive
        };
        
        $.ajax({
            url: '../backend/api/menu.php',
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(updateData),
            success: (response) => {
                console.log('Menu item status updated:', response);
                this.loadMenuItems(); // Reload the list
                
                // Reload the sidebar menu
                if (window.MenuManager && typeof window.MenuManager.loadMenu === 'function') {
                    window.MenuManager.loadMenu();
                }
            },
            error: (xhr, status, error) => {
                console.error('Error updating menu item status:', error);
                this.showError('Failed to update menu item status');
                // Revert the checkbox
                $(`.menu-item-active-toggle[data-menu-id="${menuId}"]`).prop('checked', !isActive);
            }
        });
    },
    
    /**
     * Hide menu item modal
     */
    hideMenuItemModal: function() {
        $('#menu-item-modal').modal('hide');
        this.selectedMenuItem = null;
    },
    
    /**
     * Initialize sortable for drag and drop reordering
     */
    initializeSortable: function() {
        if (typeof $.fn.sortable !== 'undefined') {
            $('#sortable-menu-items').sortable({
                handle: '.drag-handle',
                placeholder: 'sortable-placeholder',
                update: (event, ui) => {
                    this.handleMenuReorder();
                }
            });
        }
    },
    
    /**
     * Handle menu reordering
     */
    handleMenuReorder: function() {
        const newOrder = [];
        $('#sortable-menu-items .menu-item-row').each((index, element) => {
            const menuId = $(element).data('menu-id');
            newOrder.push({
                id: menuId,
                sort_order: index + 1
            });
        });
        
        console.log('New menu order:', newOrder);
        // TODO: Send reorder request to server
    },
    
    /**
     * Show success message
     */
    showSuccess: function(message) {
        // You can customize this to use your preferred notification system
        if (typeof toastr !== 'undefined') {
            toastr.success(message);
        } else {
            alert('Success: ' + message);
        }
    },
    
    /**
     * Show error message
     */
    showError: function(message) {
        // You can customize this to use your preferred notification system
        if (typeof toastr !== 'undefined') {
            toastr.error(message);
        } else {
            alert('Error: ' + message);
        }
    },
    
    /**
     * Update statistics cards
     */
    updateStatistics: function() {
        const totalItems = this.currentMenuItems.length;
        const activeItems = this.currentMenuItems.filter(item => item.is_active).length;
        const parentItems = this.currentMenuItems.filter(item => !item.parent_id).length;
        const childItems = this.currentMenuItems.filter(item => item.parent_id).length;
        
        $('#total-items-count').text(totalItems);
        $('#active-items-count').text(activeItems);
        $('#parent-items-count').text(parentItems);
        $('#child-items-count').text(childItems);
    },
    
    /**
     * Switch to tree view
     */
    switchToTreeView: function() {
        $('#view-tree-btn').addClass('active');
        $('#view-table-btn').removeClass('active');
        this.currentView = 'tree';
        this.renderMenuItems(this.buildHierarchy(this.currentMenuItems));
    },
    
    /**
     * Switch to table view
     */
    switchToTableView: function() {
        $('#view-table-btn').addClass('active');
        $('#view-tree-btn').removeClass('active');
        this.currentView = 'table';
        this.renderMenuItemsTable();
    },
    
    /**
     * Build hierarchy from flat menu items
     */
    buildHierarchy: function(items, parentId = null) {
        const hierarchy = [];
        
        items.forEach(item => {
            if (item.parent_id == parentId) {
                const children = this.buildHierarchy(items, item.id);
                if (children.length > 0) {
                    item.children = children;
                }
                hierarchy.push(item);
            }
        });
        
        return hierarchy;
    },
    
    /**
     * Render menu items in table view
     */
    renderMenuItemsTable: function() {
        const container = $('#menu-items-container');
        if (!container.length) {
            console.error('Menu items container not found');
            return;
        }
        
        if (this.currentMenuItems.length === 0) {
            container.html(`
                <div class="text-center py-5">
                    <i class="fas fa-bars fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No menu items found</h5>
                    <p class="text-muted">Click "Add Menu Item" to create your first menu item.</p>
                </div>
            `);
            return;
        }
        
        let html = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="table-light">
                        <tr>
                            <th width="50"><i class="fas fa-grip-vertical"></i></th>
                            <th width="50">Icon</th>
                            <th>Title</th>
                            <th>Module/URL</th>
                            <th width="100">Parent</th>
                            <th width="80">Order</th>
                            <th width="100">Status</th>
                            <th width="80">Active</th>
                            <th width="120">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="sortable-menu-items">
        `;
        
        // Sort items by sort_order
        const sortedItems = [...this.currentMenuItems].sort((a, b) => a.sort_order - b.sort_order);
        
        sortedItems.forEach(item => {
            const parentItem = this.currentMenuItems.find(p => p.id == item.parent_id);
            const parentName = parentItem ? parentItem.title : '-';
            const statusBadge = item.is_active ? 
                '<span class="badge bg-success">Active</span>' : 
                '<span class="badge bg-secondary">Inactive</span>';
            
            html += `
                <tr class="menu-item-row" data-menu-id="${item.id}">
                    <td><i class="fas fa-grip-vertical text-muted drag-handle" style="cursor: move;"></i></td>
                    <td><i class="${item.icon} fa-lg"></i></td>
                    <td>
                        <strong>${item.title}</strong>
                        ${item.level > 0 ? '<small class="text-muted ms-2">(Child)</small>' : ''}
                    </td>
                    <td>
                        ${item.module_name ? `<span class="badge bg-info">${item.module_name}</span>` : ''}
                        ${item.url ? `<br><small class="text-muted">${item.url}</small>` : ''}
                    </td>
                    <td><small>${parentName}</small></td>
                    <td><span class="badge bg-light text-dark">${item.sort_order}</span></td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="form-check form-switch">
                            <input class="form-check-input menu-item-active-toggle" 
                                   type="checkbox" 
                                   data-menu-id="${item.id}"
                                   ${item.is_active ? 'checked' : ''}>
                        </div>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary edit-menu-item" 
                                    data-menu-id="${item.id}" 
                                    title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-danger delete-menu-item" 
                                    data-menu-id="${item.id}" 
                                    title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        container.html(html);
        this.initializeSortable();
    }
};

// Auto-initialize when DOM is ready
$(document).ready(function() {
    // Only initialize if we're on the menu management page
    if ($('#menu-items-container').length > 0) {
        MenuManagement.init();
    }
});

// Export for global access
window.MenuManagement = MenuManagement;
