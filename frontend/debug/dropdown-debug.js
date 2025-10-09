/**
 * Dropdown Debug Script
 * Add this to the main application to debug dropdown issues
 */

(function() {
    'use strict';
    
    console.log('=== DROPDOWN DEBUG SCRIPT LOADED ===');
    
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM ready - starting dropdown debug');
        
        // Check Bootstrap availability
        console.log('Bootstrap available:', typeof bootstrap !== 'undefined');
        console.log('Bootstrap.Dropdown available:', typeof bootstrap !== 'undefined' && typeof bootstrap.Dropdown !== 'undefined');
        
        if (typeof bootstrap !== 'undefined' && bootstrap.Dropdown) {
            console.log('Bootstrap version:', bootstrap.Tooltip?.VERSION || 'Unknown');
        }
        
        // Wait a bit for the app to initialize
        setTimeout(function() {
            debugWorkspaceDropdown();
        }, 2000);
    });
    
    function debugWorkspaceDropdown() {
        console.log('=== WORKSPACE DROPDOWN DEBUG ===');
        
        const dropdownElement = document.getElementById('workspaceDropdown');
        const dropdownMenu = document.getElementById('workspace-dropdown-menu');
        
        if (!dropdownElement) {
            console.error('❌ Workspace dropdown element not found!');
            return;
        }
        
        console.log('✅ Workspace dropdown element found');
        console.log('- ID:', dropdownElement.id);
        console.log('- Classes:', dropdownElement.className);
        console.log('- data-bs-toggle:', dropdownElement.getAttribute('data-bs-toggle'));
        console.log('- aria-expanded:', dropdownElement.getAttribute('aria-expanded'));
        
        // Check computed styles
        const computedStyle = window.getComputedStyle(dropdownElement);
        console.log('- Display:', computedStyle.display);
        console.log('- Visibility:', computedStyle.visibility);
        console.log('- Pointer events:', computedStyle.pointerEvents);
        console.log('- Position:', computedStyle.position);
        console.log('- Z-index:', computedStyle.zIndex);
        
        if (!dropdownMenu) {
            console.error('❌ Workspace dropdown menu not found!');
            return;
        }
        
        console.log('✅ Workspace dropdown menu found');
        console.log('- ID:', dropdownMenu.id);
        console.log('- Classes:', dropdownMenu.className);
        
        const menuComputedStyle = window.getComputedStyle(dropdownMenu);
        console.log('- Menu Display:', menuComputedStyle.display);
        console.log('- Menu Visibility:', menuComputedStyle.visibility);
        console.log('- Menu Position:', menuComputedStyle.position);
        console.log('- Menu Z-index:', menuComputedStyle.zIndex);
        
        // Check Bootstrap instance
        const instance = bootstrap.Dropdown.getInstance(dropdownElement);
        console.log('Bootstrap instance exists:', instance !== null);
        
        if (!instance) {
            console.log('Creating Bootstrap dropdown instance...');
            try {
                const newInstance = new bootstrap.Dropdown(dropdownElement);
                console.log('✅ Bootstrap dropdown instance created successfully');
            } catch (error) {
                console.error('❌ Error creating Bootstrap dropdown instance:', error);
            }
        }
        
        // Add click event listener for debugging
        dropdownElement.addEventListener('click', function(e) {
            console.log('=== DROPDOWN CLICK EVENT ===');
            console.log('- Event target:', e.target);
            console.log('- Current target:', e.currentTarget);
            console.log('- Default prevented:', e.defaultPrevented);
            console.log('- Propagation stopped:', e.cancelBubble);
            console.log('- Event type:', e.type);
            console.log('- Event timestamp:', e.timeStamp);
            
            // Check if Bootstrap is handling the event
            setTimeout(function() {
                const isExpanded = dropdownElement.getAttribute('aria-expanded') === 'true';
                const menuHasShow = dropdownMenu.classList.contains('show');
                console.log('After click - aria-expanded:', isExpanded);
                console.log('After click - menu has show class:', menuHasShow);
                
                if (!isExpanded && !menuHasShow) {
                    console.error('❌ Dropdown did not open after click!');
                    
                    // Try manual toggle
                    console.log('Attempting manual toggle...');
                    const instance = bootstrap.Dropdown.getInstance(dropdownElement);
                    if (instance) {
                        try {
                            instance.toggle();
                            console.log('✅ Manual toggle called');
                        } catch (error) {
                            console.error('❌ Manual toggle failed:', error);
                        }
                    } else {
                        console.error('❌ No Bootstrap instance found for manual toggle');
                    }
                }
            }, 100);
        });
        
        // Add Bootstrap event listeners
        dropdownElement.addEventListener('show.bs.dropdown', function() {
            console.log('🎉 Bootstrap dropdown show event fired');
        });
        
        dropdownElement.addEventListener('shown.bs.dropdown', function() {
            console.log('🎉 Bootstrap dropdown shown event fired');
        });
        
        dropdownElement.addEventListener('hide.bs.dropdown', function() {
            console.log('🎉 Bootstrap dropdown hide event fired');
        });
        
        // Check for conflicting event listeners
        console.log('=== CHECKING FOR CONFLICTING EVENT LISTENERS ===');
        
        // Note: getEventListeners is only available in Chrome DevTools console
        // Check if there are any other click handlers on the document
        if (typeof getEventListeners !== 'undefined') {
            try {
                const documentClickHandlers = getEventListeners(document);
                if (documentClickHandlers && documentClickHandlers.click) {
                    console.log('Document click handlers found:', documentClickHandlers.click.length);
                }
                
                // Check if there are any other click handlers on the dropdown element
                const dropdownClickHandlers = getEventListeners(dropdownElement);
                if (dropdownClickHandlers && dropdownClickHandlers.click) {
                    console.log('Dropdown click handlers found:', dropdownClickHandlers.click.length);
                }
            } catch (error) {
                console.log('getEventListeners not available (normal in production)');
            }
        } else {
            console.log('getEventListeners not available - use Chrome DevTools console to check event listeners manually');
        }
        
        console.log('=== DROPDOWN DEBUG COMPLETE ===');
    }
    
    // Add a manual test function to the global scope
    window.testWorkspaceDropdown = function() {
        console.log('=== MANUAL DROPDOWN TEST ===');
        const dropdownElement = document.getElementById('workspaceDropdown');
        
        if (!dropdownElement) {
            console.error('❌ Dropdown element not found');
            return;
        }
        
        const instance = bootstrap.Dropdown.getInstance(dropdownElement) || new bootstrap.Dropdown(dropdownElement);
        
        try {
            instance.toggle();
            console.log('✅ Manual toggle successful');
        } catch (error) {
            console.error('❌ Manual toggle failed:', error);
        }
    };
    
})();
