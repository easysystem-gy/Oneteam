<?php
/**
 * Workspace Management API
 * Handles workspace CRUD operations, user assignments, and settings
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load environment variables
require_once __DIR__ . '/../config/database.php';

try {
    $conn = getDatabaseConnection();
    
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($method) {
        case 'GET':
            handleGet($conn);
            break;
        case 'POST':
            handlePost($conn, $input);
            break;
        case 'PUT':
            handlePut($conn, $input);
            break;
        case 'DELETE':
            handleDelete($conn, $input);
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
 * Handle GET requests - List workspaces or get specific workspace
 */
function handleGet($conn) {
    $workspaceId = $_GET['id'] ?? null;
    $action = $_GET['action'] ?? 'list';
    
    if ($workspaceId) {
        // Get specific workspace
        getWorkspace($conn, $workspaceId);
    } elseif ($action === 'users') {
        // Get workspace users
        $wsId = $_GET['workspace_id'] ?? null;
        if ($wsId) {
            getWorkspaceUsers($conn, $wsId);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Workspace ID required']);
        }
    } elseif ($action === 'current') {
        // Get current workspace info
        getCurrentWorkspace($conn);
    } else {
        // List all workspaces
        listWorkspaces($conn);
    }
}

/**
 * Handle POST requests - Create workspace or assign user
 */
function handlePost($conn, $input) {
    $action = $input['action'] ?? 'create';
    
    if ($action === 'create') {
        createWorkspace($conn, $input);
    } elseif ($action === 'assign_user') {
        assignUserToWorkspace($conn, $input);
    } elseif ($action === 'switch') {
        switchWorkspace($conn, $input);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
    }
}

/**
 * Handle PUT requests - Update workspace
 */
function handlePut($conn, $input) {
    $workspaceId = $input['id'] ?? null;
    
    if (!$workspaceId) {
        http_response_code(400);
        echo json_encode(['error' => 'Workspace ID required']);
        return;
    }
    
    updateWorkspace($conn, $workspaceId, $input);
}

/**
 * Handle DELETE requests - Delete workspace or remove user
 */
function handleDelete($conn, $input) {
    $action = $input['action'] ?? 'delete';
    
    if ($action === 'delete') {
        $workspaceId = $input['id'] ?? null;
        if ($workspaceId) {
            deleteWorkspace($conn, $workspaceId);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Workspace ID required']);
        }
    } elseif ($action === 'remove_user') {
        removeUserFromWorkspace($conn, $input);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
    }
}

/**
 * List all workspaces
 */
function listWorkspaces($conn) {
    $stmt = $conn->prepare("
        SELECT w.*, 
               COUNT(uw.user_id) as user_count,
               COUNT(mi.id) as menu_items_count
        FROM workspaces w
        LEFT JOIN user_workspaces uw ON w.id = uw.workspace_id AND uw.is_active = TRUE
        LEFT JOIN menu_items mi ON w.id = mi.workspace_id AND mi.is_active = TRUE
        WHERE w.is_active = TRUE
        GROUP BY w.id, w.name, w.description, w.is_active, w.created_at, w.updated_at
        ORDER BY w.name ASC
    ");
    $stmt->execute();
    $workspaces = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $workspaces
    ]);
}

/**
 * Get specific workspace
 */
function getWorkspace($conn, $workspaceId) {
    $stmt = $conn->prepare("
        SELECT w.*, 
               COUNT(DISTINCT uw.user_id) as user_count,
               COUNT(DISTINCT mi.id) as menu_items_count
        FROM workspaces w
        LEFT JOIN user_workspaces uw ON w.id = uw.workspace_id AND uw.is_active = TRUE
        LEFT JOIN menu_items mi ON w.id = mi.workspace_id AND mi.is_active = TRUE
        WHERE w.id = ? AND w.is_active = TRUE
        GROUP BY w.id, w.name, w.description, w.is_active, w.created_at, w.updated_at
    ");
    $stmt->execute([$workspaceId]);
    $workspace = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($workspace) {
        echo json_encode([
            'success' => true,
            'data' => $workspace
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Workspace not found']);
    }
}

/**
 * Get current workspace info
 */
function getCurrentWorkspace($conn) {
    // For now, return default workspace (ID = 1)
    // In a real application, this would come from session
    $workspaceId = 1;
    
    $stmt = $conn->prepare("
        SELECT w.*, 
               COUNT(DISTINCT uw.user_id) as user_count,
               COUNT(DISTINCT mi.id) as menu_items_count
        FROM workspaces w
        LEFT JOIN user_workspaces uw ON w.id = uw.workspace_id AND uw.is_active = TRUE
        LEFT JOIN menu_items mi ON w.id = mi.workspace_id AND mi.is_active = TRUE
        WHERE w.id = ? AND w.is_active = TRUE
        GROUP BY w.id, w.name, w.description, w.is_active, w.created_at, w.updated_at
    ");
    $stmt->execute([$workspaceId]);
    $workspace = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($workspace) {
        echo json_encode([
            'success' => true,
            'data' => $workspace
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Current workspace not found']);
    }
}

/**
 * Get workspace users
 */
function getWorkspaceUsers($conn, $workspaceId) {
    $stmt = $conn->prepare("
        SELECT u.id, u.uuid, u.username, u.email, u.first_name, u.last_name,
               u.is_active as user_active, u.last_login,
               uw.role, uw.is_active as assignment_active, uw.created_at as assigned_at
        FROM users u
        INNER JOIN user_workspaces uw ON u.id = uw.user_id
        WHERE uw.workspace_id = ? AND uw.is_active = TRUE
        ORDER BY u.first_name ASC, u.last_name ASC
    ");
    $stmt->execute([$workspaceId]);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $users
    ]);
}

/**
 * Create new workspace
 */
function createWorkspace($conn, $input) {
    // Validate required fields
    $required = ['name'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Field '$field' is required"]);
            return;
        }
    }
    
    // Check if workspace name already exists
    $stmt = $conn->prepare("SELECT id FROM workspaces WHERE name = ? AND is_active = TRUE");
    $stmt->execute([$input['name']]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Workspace name already exists']);
        return;
    }
    
    try {
        $conn->beginTransaction();
        
        // Insert workspace
        $stmt = $conn->prepare("
            INSERT INTO workspaces (name, description, is_active, created_at, updated_at)
            VALUES (?, ?, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ");
        $stmt->execute([
            $input['name'],
            $input['description'] ?? null
        ]);
        
        $workspaceId = $conn->lastInsertId();
        
        // Create default menu items for the workspace
        createDefaultMenuItems($conn, $workspaceId);
        
        $conn->commit();
        
        // Return the created workspace
        getWorkspace($conn, $workspaceId);
        
    } catch (Exception $e) {
        $conn->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create workspace: ' . $e->getMessage()]);
    }
}

/**
 * Update workspace
 */
function updateWorkspace($conn, $workspaceId, $input) {
    // Check if workspace exists
    $stmt = $conn->prepare("SELECT id FROM workspaces WHERE id = ? AND is_active = TRUE");
    $stmt->execute([$workspaceId]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Workspace not found']);
        return;
    }
    
    // Check if new name conflicts with existing workspace
    if (!empty($input['name'])) {
        $stmt = $conn->prepare("SELECT id FROM workspaces WHERE name = ? AND id != ? AND is_active = TRUE");
        $stmt->execute([$input['name'], $workspaceId]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'Workspace name already exists']);
            return;
        }
    }
    
    try {
        $stmt = $conn->prepare("
            UPDATE workspaces 
            SET name = COALESCE(?, name),
                description = COALESCE(?, description),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ");
        $stmt->execute([
            $input['name'] ?? null,
            $input['description'] ?? null,
            $workspaceId
        ]);
        
        // Return updated workspace
        getWorkspace($conn, $workspaceId);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update workspace: ' . $e->getMessage()]);
    }
}

/**
 * Delete workspace (soft delete)
 */
function deleteWorkspace($conn, $workspaceId) {
    // Check if workspace exists
    $stmt = $conn->prepare("SELECT id FROM workspaces WHERE id = ? AND is_active = TRUE");
    $stmt->execute([$workspaceId]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Workspace not found']);
        return;
    }
    
    // Prevent deletion of default workspace
    if ($workspaceId == 1) {
        http_response_code(400);
        echo json_encode(['error' => 'Cannot delete default workspace']);
        return;
    }
    
    try {
        $conn->beginTransaction();
        
        // Soft delete workspace
        $stmt = $conn->prepare("
            UPDATE workspaces 
            SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ");
        $stmt->execute([$workspaceId]);
        
        // Deactivate user assignments
        $stmt = $conn->prepare("
            UPDATE user_workspaces 
            SET is_active = FALSE
            WHERE workspace_id = ?
        ");
        $stmt->execute([$workspaceId]);
        
        // Deactivate menu items
        $stmt = $conn->prepare("
            UPDATE menu_items 
            SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
            WHERE workspace_id = ?
        ");
        $stmt->execute([$workspaceId]);
        
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Workspace deleted successfully'
        ]);
        
    } catch (Exception $e) {
        $conn->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete workspace: ' . $e->getMessage()]);
    }
}

/**
 * Assign user to workspace
 */
function assignUserToWorkspace($conn, $input) {
    $required = ['user_id', 'workspace_id'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Field '$field' is required"]);
            return;
        }
    }
    
    // Check if user exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE id = ? AND is_active = TRUE");
    $stmt->execute([$input['user_id']]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        return;
    }
    
    // Check if workspace exists
    $stmt = $conn->prepare("SELECT id FROM workspaces WHERE id = ? AND is_active = TRUE");
    $stmt->execute([$input['workspace_id']]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Workspace not found']);
        return;
    }
    
    // Check if assignment already exists
    $stmt = $conn->prepare("
        SELECT id FROM user_workspaces 
        WHERE user_id = ? AND workspace_id = ?
    ");
    $stmt->execute([$input['user_id'], $input['workspace_id']]);
    $existing = $stmt->fetch();
    
    try {
        if ($existing) {
            // Reactivate existing assignment
            $stmt = $conn->prepare("
                UPDATE user_workspaces 
                SET is_active = TRUE, role = ?
                WHERE user_id = ? AND workspace_id = ?
            ");
            $stmt->execute([
                $input['role'] ?? 'user',
                $input['user_id'],
                $input['workspace_id']
            ]);
        } else {
            // Create new assignment
            $stmt = $conn->prepare("
                INSERT INTO user_workspaces (user_id, workspace_id, role, is_active, created_at)
                VALUES (?, ?, ?, TRUE, CURRENT_TIMESTAMP)
            ");
            $stmt->execute([
                $input['user_id'],
                $input['workspace_id'],
                $input['role'] ?? 'user'
            ]);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'User assigned to workspace successfully'
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to assign user: ' . $e->getMessage()]);
    }
}

/**
 * Remove user from workspace
 */
function removeUserFromWorkspace($conn, $input) {
    $required = ['user_id', 'workspace_id'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Field '$field' is required"]);
            return;
        }
    }
    
    try {
        $stmt = $conn->prepare("
            UPDATE user_workspaces 
            SET is_active = FALSE
            WHERE user_id = ? AND workspace_id = ?
        ");
        $stmt->execute([$input['user_id'], $input['workspace_id']]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'User removed from workspace successfully'
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'User assignment not found']);
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to remove user: ' . $e->getMessage()]);
    }
}

/**
 * Switch current workspace
 */
function switchWorkspace($conn, $input) {
    $workspaceId = $input['workspace_id'] ?? null;
    
    if (!$workspaceId) {
        http_response_code(400);
        echo json_encode(['error' => 'Workspace ID required']);
        return;
    }
    
    // Check if workspace exists
    $stmt = $conn->prepare("SELECT id FROM workspaces WHERE id = ? AND is_active = TRUE");
    $stmt->execute([$workspaceId]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Workspace not found']);
        return;
    }
    
    // In a real application, this would update the session
    // For now, just return success
    echo json_encode([
        'success' => true,
        'message' => 'Workspace switched successfully',
        'workspace_id' => $workspaceId
    ]);
}

/**
 * Create default menu items for new workspace
 */
function createDefaultMenuItems($conn, $workspaceId) {
    $defaultMenuItems = [
        [
            'uuid' => 'dashboard-' . $workspaceId,
            'title' => 'Dashboard',
            'icon' => 'fas fa-tachometer-alt',
            'module_name' => 'dashboard',
            'sort_order' => 1,
            'parent_id' => null
        ],
        [
            'uuid' => 'users-' . $workspaceId,
            'title' => 'User Management',
            'icon' => 'fas fa-users',
            'module_name' => null,
            'sort_order' => 2,
            'parent_id' => null
        ],
        [
            'uuid' => 'settings-' . $workspaceId,
            'title' => 'Settings',
            'icon' => 'fas fa-cog',
            'module_name' => 'settings',
            'sort_order' => 3,
            'parent_id' => null
        ]
    ];
    
    foreach ($defaultMenuItems as $item) {
        $stmt = $conn->prepare("
            INSERT INTO menu_items (uuid, workspace_id, parent_id, title, icon, module_name, sort_order, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ");
        $stmt->execute([
            $item['uuid'],
            $workspaceId,
            $item['parent_id'],
            $item['title'],
            $item['icon'],
            $item['module_name'],
            $item['sort_order']
        ]);
    }
}
?>
