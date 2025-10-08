<?php
/**
 * Menu Management Debug Script
 * This script helps diagnose why Menu Management isn't appearing
 */

require_once '../config/database.php';
require_once '../includes/auth.php';

// Set content type to JSON for easy reading
header('Content-Type: application/json');

$debug = [];

try {
    // Check database connection
    $db = new Database();
    $conn = $db->getConnection();
    $debug['database_connection'] = 'OK';
    
    // Check if menu_items table exists
    try {
        $stmt = $conn->query("SELECT COUNT(*) FROM menu_items");
        $debug['menu_items_table'] = 'EXISTS';
        $debug['total_menu_items'] = $stmt->fetchColumn();
    } catch (Exception $e) {
        $debug['menu_items_table'] = 'MISSING - ' . $e->getMessage();
    }
    
    // Check if Menu Management item exists
    try {
        $stmt = $conn->prepare("SELECT * FROM menu_items WHERE title = 'Menu Management'");
        $stmt->execute();
        $menuItem = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($menuItem) {
            $debug['menu_management_item'] = 'EXISTS';
            $debug['menu_management_data'] = $menuItem;
        } else {
            $debug['menu_management_item'] = 'MISSING';
        }
    } catch (Exception $e) {
        $debug['menu_management_item'] = 'ERROR - ' . $e->getMessage();
    }
    
    // Check System menu
    try {
        $stmt = $conn->prepare("SELECT * FROM menu_items WHERE title = 'System'");
        $stmt->execute();
        $systemMenu = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($systemMenu) {
            $debug['system_menu'] = 'EXISTS';
            $debug['system_menu_id'] = $systemMenu['id'];
            
            // Check children of System menu
            $stmt = $conn->prepare("SELECT * FROM menu_items WHERE parent_id = ?");
            $stmt->execute([$systemMenu['id']]);
            $systemChildren = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $debug['system_menu_children'] = $systemChildren;
        } else {
            $debug['system_menu'] = 'MISSING';
        }
    } catch (Exception $e) {
        $debug['system_menu'] = 'ERROR - ' . $e->getMessage();
    }
    
    // Check all menu items for current workspace
    try {
        $workspaceId = $_SESSION['current_workspace_id'] ?? 1;
        $debug['current_workspace_id'] = $workspaceId;
        
        $stmt = $conn->prepare("SELECT id, title, parent_id, module_name, is_active FROM menu_items WHERE workspace_id = ? ORDER BY sort_order");
        $stmt->execute([$workspaceId]);
        $allMenuItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $debug['all_menu_items'] = $allMenuItems;
    } catch (Exception $e) {
        $debug['all_menu_items'] = 'ERROR - ' . $e->getMessage();
    }
    
    // Check authentication status
    $debug['authenticated'] = isAuthenticated();
    $debug['session_data'] = [
        'user_id' => $_SESSION['user_id'] ?? 'NOT SET',
        'current_workspace_id' => $_SESSION['current_workspace_id'] ?? 'NOT SET',
        'user_role' => $_SESSION['user_role'] ?? 'NOT SET'
    ];
    
    // Check file existence
    $debug['files_exist'] = [
        'menu_api' => file_exists('../api/menu.php'),
        'menu_management_js' => file_exists('../assets/js/menu-management.js'),
        'menu_management_html' => file_exists('../modules/menu-management.html'),
        'migration_file_sqlite' => file_exists('../../database/migrations/005_add_menu_management.sql'),
        'migration_file_postgresql' => file_exists('../../database/migrations/postgresql/005_add_menu_management.sql')
    ];
    
    // Check permissions table
    try {
        $stmt = $conn->prepare("
            SELECT mp.*, mi.title 
            FROM menu_permissions mp 
            JOIN menu_items mi ON mp.menu_item_id = mi.id 
            WHERE mi.title = 'Menu Management'
        ");
        $stmt->execute();
        $permissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $debug['menu_management_permissions'] = $permissions;
    } catch (Exception $e) {
        $debug['menu_management_permissions'] = 'ERROR - ' . $e->getMessage();
    }
    
} catch (Exception $e) {
    $debug['error'] = $e->getMessage();
}

// Output debug information
echo json_encode($debug, JSON_PRETTY_PRINT);
?>
