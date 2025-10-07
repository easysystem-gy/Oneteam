<?php
/**
 * Oneteam API Entry Point
 * 
 * This file handles all API requests for the Oneteam application
 */

// Enable CORS for development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the request path
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Remove /api/ prefix and backend/api/ prefix
$path = preg_replace('#^/api/#', '', $path);
$path = preg_replace('#^backend/api/#', '', $path);
$path = trim($path, '/');

// Split path into segments
$segments = explode('/', $path);
$endpoint = $segments[0] ?? '';
$action = $segments[1] ?? '';

// Get request method and data
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?? [];

// Simple response helper
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}

// Basic error handler
function errorResponse($message, $status = 400) {
    jsonResponse([
        'success' => false,
        'message' => $message
    ], $status);
}

// Handle different endpoints
switch ($endpoint) {
    case 'auth':
        handleAuth($action, $method, $input);
        break;
        
    case 'workspaces':
        handleWorkspaces($action, $method, $input);
        break;
        
    case 'menu':
        handleMenu($action, $method, $input);
        break;
        
    case 'users':
        handleUsers($action, $method, $input);
        break;
        
    default:
        errorResponse('Endpoint not found', 404);
}

/**
 * Handle authentication endpoints
 */
function handleAuth($action, $method, $input) {
    switch ($action) {
        case 'login':
            if ($method !== 'POST') {
                errorResponse('Method not allowed', 405);
            }
            
            $username = $input['username'] ?? '';
            $password = $input['password'] ?? '';
            
            // Simple demo authentication
            if ($username === 'admin' && $password === 'admin123') {
                jsonResponse([
                    'success' => true,
                    'message' => 'Login successful',
                    'data' => [
                        'token' => 'demo-jwt-token-' . time(),
                        'user' => [
                            'id' => 1,
                            'username' => 'admin',
                            'email' => 'admin@oneteam.local',
                            'first_name' => 'System',
                            'last_name' => 'Administrator',
                            'is_admin' => true
                        ],
                        'expires_at' => date('c', time() + 3600)
                    ]
                ]);
            } else {
                errorResponse('Invalid credentials', 401);
            }
            break;
            
        case 'logout':
            jsonResponse([
                'success' => true,
                'message' => 'Logout successful'
            ]);
            break;
            
        case 'profile':
            // Demo user profile
            jsonResponse([
                'success' => true,
                'data' => [
                    'token' => 'demo-jwt-token-' . time(),
                    'user' => [
                        'id' => 1,
                        'username' => 'admin',
                        'email' => 'admin@oneteam.local',
                        'first_name' => 'System',
                        'last_name' => 'Administrator',
                        'is_admin' => true
                    ],
                    'workspace' => [
                        'id' => 1,
                        'uuid' => 'workspace-uuid-123456',
                        'name' => 'Default Workspace',
                        'description' => 'Default workspace for all users',
                        'color' => '#0d6efd',
                        'icon' => 'fas fa-home',
                        'is_active' => true,
                        'created_at' => '2024-01-01 00:00:00',
                        'updated_at' => '2024-01-01 00:00:00'
                    ]
                ]
            ]);
            break;
            
        default:
            errorResponse('Auth action not found', 404);
    }
}

/**
 * Handle workspace endpoints
 */
function handleWorkspaces($action, $method, $input) {
    // Demo workspaces data
    $workspaces = [
        [
            'id' => 1,
            'uuid' => 'workspace-uuid-123456',
            'name' => 'Default Workspace',
            'description' => 'Default workspace for all users',
            'color' => '#0d6efd',
            'icon' => 'fas fa-home',
            'is_active' => true,
            'user_role' => 'admin'
        ]
    ];
    
    if (empty($action)) {
        // List workspaces
        jsonResponse([
            'success' => true,
            'data' => $workspaces
        ]);
    } else {
        errorResponse('Workspace action not implemented', 501);
    }
}

/**
 * Handle menu endpoints
 */
function handleMenu($action, $method, $input) {
    // Demo menu data
    $menu = [
        [
            'id' => 1,
            'uuid' => 'menu-uuid-1',
            'parent_id' => null,
            'title' => 'Dashboard',
            'icon' => 'fas fa-tachometer-alt',
            'module_name' => 'dashboard',
            'sort_order' => 1,
            'level' => 0,
            'has_children' => false,
            'can_view' => true,
            'can_edit' => true,
            'can_delete' => false
        ],
        [
            'id' => 2,
            'uuid' => 'menu-uuid-2',
            'parent_id' => null,
            'title' => 'User Management',
            'icon' => 'fas fa-users',
            'module_name' => null,
            'sort_order' => 2,
            'level' => 0,
            'has_children' => true,
            'can_view' => true,
            'can_edit' => true,
            'can_delete' => false
        ],
        [
            'id' => 6,
            'uuid' => 'menu-uuid-6',
            'parent_id' => 2,
            'title' => 'Users List',
            'icon' => 'fas fa-list',
            'module_name' => 'users/list',
            'sort_order' => 1,
            'level' => 1,
            'has_children' => false,
            'can_view' => true,
            'can_edit' => false,
            'can_delete' => false
        ],
        [
            'id' => 5,
            'uuid' => 'menu-uuid-5',
            'parent_id' => null,
            'title' => 'Reports',
            'icon' => 'fas fa-chart-bar',
            'module_name' => 'reports',
            'sort_order' => 5,
            'level' => 0,
            'has_children' => false,
            'can_view' => true,
            'can_edit' => false,
            'can_delete' => false
        ]
    ];
    
    jsonResponse([
        'success' => true,
        'data' => $menu
    ]);
}

/**
 * Handle user endpoints
 */
function handleUsers($action, $method, $input) {
    errorResponse('Users endpoint not implemented', 501);
}
