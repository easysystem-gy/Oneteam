/**
 * Custom Dropdown Component
 * Replaces Bootstrap dropdown functionality with pure JavaScript
 */

class CustomDropdown {
    constructor(triggerElement, menuElement, options = {}) {
        this.trigger = triggerElement;
        this.menu = menuElement;
        this.isOpen = false;
        this.options = {
            closeOnClickOutside: true,
            closeOnEscape: true,
            closeOnItemClick: true,
            ...options
        };
        
        this.init();
    }
    
    init() {
        // Add necessary attributes
        this.trigger.setAttribute('aria-expanded', 'false');
        this.trigger.setAttribute('aria-haspopup', 'true');
        this.menu.setAttribute('aria-hidden', 'true');
        
        // Bind events
        this.bindEvents();
        
        console.log('Custom dropdown initialized for:', this.trigger.id);
    }
    
    bindEvents() {
        // Toggle on trigger click
        this.trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggle();
        });
        
        // Close on escape key
        if (this.options.closeOnEscape) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });
        }
        
        // Close on click outside
        if (this.options.closeOnClickOutside) {
            document.addEventListener('click', (e) => {
                if (this.isOpen && !this.trigger.contains(e.target) && !this.menu.contains(e.target)) {
                    this.close();
                }
            });
        }
        
        // Close on item click (optional)
        if (this.options.closeOnItemClick) {
            this.menu.addEventListener('click', (e) => {
                if (e.target.classList.contains('dropdown-item')) {
                    // Small delay to allow the click handler to execute
                    setTimeout(() => {
                        this.close();
                    }, 100);
                }
            });
        }
        
        // Prevent menu clicks from bubbling up
        this.menu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        if (this.isOpen) return;
        
        // Close other open dropdowns
        CustomDropdown.closeAll(this);
        
        this.isOpen = true;
        this.trigger.setAttribute('aria-expanded', 'true');
        this.trigger.classList.add('show');
        this.menu.setAttribute('aria-hidden', 'false');
        this.menu.classList.add('show');
        
        // Position the menu
        this.positionMenu();
        
        // Trigger custom event
        this.trigger.dispatchEvent(new CustomEvent('dropdown:show', {
            detail: { dropdown: this }
        }));
        
        console.log('Dropdown opened:', this.trigger.id);
    }
    
    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        this.trigger.setAttribute('aria-expanded', 'false');
        this.trigger.classList.remove('show');
        this.menu.setAttribute('aria-hidden', 'true');
        this.menu.classList.remove('show');
        
        // Trigger custom event
        this.trigger.dispatchEvent(new CustomEvent('dropdown:hide', {
            detail: { dropdown: this }
        }));
        
        console.log('Dropdown closed:', this.trigger.id);
    }
    
    positionMenu() {
        // Basic positioning - can be enhanced with more sophisticated logic
        const triggerRect = this.trigger.getBoundingClientRect();
        const menuRect = this.menu.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Reset positioning
        this.menu.style.top = '';
        this.menu.style.bottom = '';
        this.menu.style.left = '';
        this.menu.style.right = '';
        
        // Check if menu should open upward
        const spaceBelow = viewportHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;
        
        if (spaceBelow < menuRect.height && spaceAbove > spaceBelow) {
            // Open upward
            this.menu.classList.add('dropup');
        } else {
            // Open downward (default)
            this.menu.classList.remove('dropup');
        }
        
        // Handle horizontal positioning for right-aligned menus
        if (this.menu.classList.contains('dropdown-menu-end')) {
            const spaceRight = viewportWidth - triggerRect.right;
            if (spaceRight < menuRect.width) {
                // Adjust positioning if needed
                this.menu.style.right = '0';
            }
        }
    }
    
    // Static method to close all dropdowns except the specified one
    static closeAll(except = null) {
        CustomDropdown.instances.forEach(dropdown => {
            if (dropdown !== except && dropdown.isOpen) {
                dropdown.close();
            }
        });
    }
    
    // Static method to initialize all dropdowns on the page
    static initializeAll() {
        // Clear existing instances
        CustomDropdown.instances = [];
        
        // Find all dropdown triggers
        const triggers = document.querySelectorAll('[data-custom-dropdown]');
        
        triggers.forEach(trigger => {
            const menuId = trigger.getAttribute('data-custom-dropdown');
            const menu = document.getElementById(menuId);
            
            if (menu) {
                const options = {};
                
                // Parse options from data attributes
                if (trigger.hasAttribute('data-close-on-item-click')) {
                    options.closeOnItemClick = trigger.getAttribute('data-close-on-item-click') === 'true';
                }
                
                const dropdown = new CustomDropdown(trigger, menu, options);
                CustomDropdown.instances.push(dropdown);
            } else {
                console.warn('Dropdown menu not found for trigger:', trigger.id);
            }
        });
        
        console.log('Initialized', CustomDropdown.instances.length, 'custom dropdowns');
    }
}

// Static property to track all dropdown instances
CustomDropdown.instances = [];

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', CustomDropdown.initializeAll);
} else {
    CustomDropdown.initializeAll();
}

// Export for use in other modules
window.CustomDropdown = CustomDropdown;
