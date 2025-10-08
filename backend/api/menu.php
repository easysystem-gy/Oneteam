<?php
/**
 * Menu Management API
 * Handles CRUD operations for menu items
 */

require_once '../config/database.php';
require_once '../includes/auth.php';
require_once '../core/Database/DatabaseFactory.php';
require_once '../core/Database/DatabaseAdapterInterface.php';
require_once '../core/Database/BaseAdapter.php';
require_once '../core/Database/Adapters/PostgreSQLAdapter.php';
require_once '../core/Database/Adapters/MariaDBAdapter.php';
require_once '../core/Database/Adapters/SQLServerAdapter.php';
require_once '../core/Database/Adapters/SQLiteAdapter.php';

use Oneteam\Database\DatabaseFactory;

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check authentication
if (!isAuthenticated()) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

try {
    // For testing purposes, create a simple SQLite connection
    // TODO: Replace with proper database factory when database is configured
    $dbPath = __DIR__ . '/../database/oneteam.db';
    $dbDir = dirname($dbPath);
    
    // Create database directory if it doesn't exist
    if (!is_dir($dbDir)) {
        mkdir($dbDir, 0755, true);
    }
    
    // Create SQLite connection
    $conn = new PDO("sqlite:$dbPath");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create menu table if it doesn't exist
    $conn->exec("
        CREATE TABLE IF NOT EXISTS menu_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            workspace_id INTEGER NOT NULL DEFAULT 1,
            parent_id INTEGER NULL,
            title TEXT NOT NULL,
            icon TEXT DEFAULT 'fas fa-circle',
            module_name TEXT,
            sort_order INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES menu_items(id) ON DELETE CASCADE
        )
    ");
    
    // Insert some sample data if table is empty
    $count = $conn->query("SELECT COUNT(*) FROM menu_items")->fetchColumn();
    if ($count == 0) {
        $conn->exec("
            INSERT INTO menu_items (uuid, workspace_id, parent_id, title, icon, module_name, sort_order) VALUES
            ('dashboard-uuid', 1, NULL, 'Dashboard', 'fas fa-tachometer-alt', 'dashboard', 1),
            ('users-uuid', 1, NULL, 'User Management', 'fas fa-users', NULL, 2),
            ('users-list-uuid', 1, 2, 'Users List', 'fas fa-list', 'users/list', 1),
            ('reports-uuid', 1, NULL, 'Reports', 'fas fa-chart-bar', 'reports', 3),
            ('settings-uuid', 1, NULL, 'Settings', 'fas fa-cog', 'settings', 4)
        ");
    }
    
    switch ($method) {
        case 'GET':
            handleGet($conn, $_GET);
            break;
        case 'POST':
            handlePost($conn, $input);
            break;
        case 'PUT':
            handlePut($conn, $input);
            break;
        case 'DELETE':
            handleDelete($conn, $_GET);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}

/**
 * Handle GET requests - Retrieve menu items
 */
function handleGet($conn, $params) {
    $workspaceId = getCurrentWorkspaceId();
    
    if (!$workspaceId) {
        http_response_code(400);
        echo json_encode(['error' => 'No workspace selected']);
        return;
    }
    
    if (isset($params['id'])) {
        // Get single menu item
        $stmt = $conn->prepare("
            SELECT id, uuid, workspace_id, parent_id, title, icon, module_name, 
                   sort_order, is_active, created_at, updated_at
            FROM menu_items 
            WHERE id = ? AND workspace_id = ?
        ");
        $stmt->execute([$params['id'], $workspaceId]);
        $menuItem = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($menuItem) {
            echo json_encode($menuItem);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Menu item not found']);
        }
    } else {
        // Get all menu items for workspace
        $stmt = $conn->prepare("
            SELECT id, uuid, workspace_id, parent_id, title, icon, module_name, 
                   sort_order, is_active, created_at, updated_at
            FROM menu_items 
            WHERE workspace_id = ? 
            ORDER BY sort_order ASC, title ASC
        ");
        $stmt->execute([$workspaceId]);
        $menuItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Add level information to menu items
        $menuItemsWithLevels = addLevelsToMenuItems($menuItems);
        
        // Build hierarchical structure
        $hierarchicalMenu = buildMenuHierarchy($menuItemsWithLevels);
        
        echo json_encode([
            'success' => true,
            'data' => $menuItemsWithLevels,
            'menu_items' => $menuItemsWithLevels,
            'hierarchical' => $hierarchicalMenu
        ]);
    }
}

/**
 * Handle POST requests - Create new menu item
 */
function handlePost($conn, $input) {
    $workspaceId = getCurrentWorkspaceId();
    
    if (!$workspaceId) {
        http_response_code(400);
        echo json_encode(['error' => 'No workspace selected']);
        return;
    }
    
    // Validate required fields
    $required = ['title', 'icon'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Field '$field' is required"]);
            return;
        }
    }
    
    // Get next sort order
    $stmt = $conn->prepare("
        SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order 
        FROM menu_items 
        WHERE workspace_id = ? AND parent_id = ?
    ");
    $parentId = $input['parent_id'] ?? null;
    $stmt->execute([$workspaceId, $parentId]);
    $nextOrder = $stmt->fetchColumn();
    
    // Insert new menu item
    $stmt = $conn->prepare("
        INSERT INTO menu_items (workspace_id, parent_id, title, icon, url, module_name, sort_order, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $result = $stmt->execute([
        $workspaceId,
        $parentId,
        $input['title'],
        $input['icon'],
        $input['url'] ?? null,
        $input['module_name'] ?? null,
        $nextOrder,
        $input['is_active'] ?? true
    ]);
    
    if ($result) {
        $newId = $conn->lastInsertId();
        
        // Return the created menu item
        $stmt = $conn->prepare("
            SELECT id, workspace_id, parent_id, title, icon, url, module_name, 
                   sort_order, is_active, created_at, updated_at
            FROM menu_items 
            WHERE id = ?
        ");
        $stmt->execute([$newId]);
        $menuItem = $stmt->fetch(PDO::FETCH_ASSOC);
        
        http_response_code(201);
        echo json_encode($menuItem);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create menu item']);
    }
}

/**
 * Handle PUT requests - Update menu item
 */
function handlePut($conn, $input) {
    $workspaceId = getCurrentWorkspaceId();
    
    if (!$workspaceId || empty($input['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid request']);
        return;
    }
    
    // Check if menu item exists and belongs to workspace
    $stmt = $conn->prepare("
        SELECT id FROM menu_items 
        WHERE id = ? AND workspace_id = ?
    ");
    $stmt->execute([$input['id'], $workspaceId]);
    
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Menu item not found']);
        return;
    }
    
    // Update menu item
    $stmt = $conn->prepare("
        UPDATE menu_items 
        SET title = ?, icon = ?, url = ?, module_name = ?, 
            parent_id = ?, sort_order = ?, is_active = ?, updated_at = NOW()
        WHERE id = ? AND workspace_id = ?
    ");
    
    $result = $stmt->execute([
        $input['title'],
        $input['icon'],
        $input['url'] ?? null,
        $input['module_name'] ?? null,
        $input['parent_id'] ?? null,
        $input['sort_order'],
        $input['is_active'] ?? true,
        $input['id'],
        $workspaceId
    ]);
    
    if ($result) {
        // Return updated menu item
        $stmt = $conn->prepare("
            SELECT id, workspace_id, parent_id, title, icon, url, module_name, 
                   sort_order, is_active, created_at, updated_at
            FROM menu_items 
            WHERE id = ?
        ");
        $stmt->execute([$input['id']]);
        $menuItem = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode($menuItem);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update menu item']);
    }
}

/**
 * Handle DELETE requests - Delete menu item
 */
function handleDelete($conn, $params) {
    $workspaceId = getCurrentWorkspaceId();
    
    if (!$workspaceId || empty($params['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid request']);
        return;
    }
    
    // Check if menu item has children
    $stmt = $conn->prepare("
        SELECT COUNT(*) FROM menu_items 
        WHERE parent_id = ? AND workspace_id = ?
    ");
    $stmt->execute([$params['id'], $workspaceId]);
    $childCount = $stmt->fetchColumn();
    
    if ($childCount > 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Cannot delete menu item with children']);
        return;
    }
    
    // Delete menu item
    $stmt = $conn->prepare("
        DELETE FROM menu_items 
        WHERE id = ? AND workspace_id = ?
    ");
    
    $result = $stmt->execute([$params['id'], $workspaceId]);
    
    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Menu item deleted successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete menu item']);
    }
}

/**
 * Add level information to menu items
 */
function addLevelsToMenuItems($menuItems) {
    $itemsWithLevels = [];
    $itemsById = [];
    
    // Create lookup array
    foreach ($menuItems as $item) {
        $itemsById[$item['id']] = $item;
    }
    
    // Calculate levels
    foreach ($menuItems as $item) {
        $level = calculateItemLevel($item, $itemsById);
        $item['level'] = $level;
        $item['has_children'] = hasChildren($item['id'], $menuItems);
        $item['can_view'] = true; // Default permissions
        $item['can_edit'] = true;
        $item['can_delete'] = true;
        $itemsWithLevels[] = $item;
    }
    
    return $itemsWithLevels;
}

/**
 * Calculate the level of a menu item
 */
function calculateItemLevel($item, $itemsById, $level = 0) {
    if ($item['parent_id'] === null) {
        return 0;
    }
    
    if (isset($itemsById[$item['parent_id']])) {
        return calculateItemLevel($itemsById[$item['parent_id']], $itemsById, $level + 1);
    }
    
    return $level;
}

/**
 * Check if item has children
 */
function hasChildren($itemId, $menuItems) {
    foreach ($menuItems as $item) {
        if ($item['parent_id'] == $itemId) {
            return true;
        }
    }
    return false;
}

/**
 * Build hierarchical menu structure
 */
function buildMenuHierarchy($menuItems, $parentId = null) {
    $hierarchy = [];
    
    foreach ($menuItems as $item) {
        if ($item['parent_id'] == $parentId) {
            $item['children'] = buildMenuHierarchy($menuItems, $item['id']);
            $hierarchy[] = $item;
        }
    }
    
    return $hierarchy;
}

/**
 * Reorder menu items
 */
function reorderMenuItems($conn, $workspaceId, $items) {
    $conn->beginTransaction();
    
    try {
        foreach ($items as $index => $item) {
            $stmt = $conn->prepare("
                UPDATE menu_items 
                SET sort_order = ?, parent_id = ?
                WHERE id = ? AND workspace_id = ?
            ");
            $stmt->execute([
                $index + 1,
                $item['parent_id'] ?? null,
                $item['id'],
                $workspaceId
            ]);
        }
        
        $conn->commit();
        return true;
    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }
}
?>
