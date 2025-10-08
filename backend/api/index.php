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

// Debug logging (remove in production)
error_log("API Debug - Request URI: " . $requestUri);
error_log("API Debug - Parsed path: " . $path);
error_log("API Debug - Endpoint: " . $endpoint);
error_log("API Debug - Action: " . $action);

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
        
    case 'profile':
        handleProfile($action, $method, $input);
        break;
        
    case 'docs':
        // Serve Swagger UI HTML as fallback if .htaccess doesn't work
        header('Content-Type: text/html; charset=utf-8');
        if (file_exists(__DIR__ . '/docs.html')) {
            readfile(__DIR__ . '/docs.html');
        } else {
            echo '<h1>Swagger Documentation</h1><p>docs.html file not found</p>';
        }
        exit();
        break;
        
    case 'openapi.json':
        header('Content-Type: application/json');
        if (file_exists(__DIR__ . '/openapi.json')) {
            readfile(__DIR__ . '/openapi.json');
        } else {
            include 'openapi.php';
        }
        exit();
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
            'is_default' => true,
            'user_role' => 'admin',
            'created_at' => '2024-01-01T00:00:00Z',
            'updated_at' => '2024-01-01T00:00:00Z'
        ],
        [
            'id' => 2,
            'uuid' => 'workspace-uuid-789012',
            'name' => 'Development Team',
            'description' => 'Workspace for development projects and tasks',
            'color' => '#198754',
            'icon' => 'fas fa-code',
            'is_active' => true,
            'is_default' => false,
            'user_role' => 'developer',
            'created_at' => '2024-01-15T00:00:00Z',
            'updated_at' => '2024-01-15T00:00:00Z'
        ],
        [
            'id' => 3,
            'uuid' => 'workspace-uuid-345678',
            'name' => 'Marketing Hub',
            'description' => 'Marketing campaigns and content management',
            'color' => '#dc3545',
            'icon' => 'fas fa-bullhorn',
            'is_active' => true,
            'is_default' => false,
            'user_role' => 'member',
            'created_at' => '2024-02-01T00:00:00Z',
            'updated_at' => '2024-02-01T00:00:00Z'
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

/**
 * Handle profile endpoints
 */
function handleProfile($action, $method, $input) {
    // Simple authentication check (in real app, validate JWT token)
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) || !str_contains($authHeader, 'demo-jwt-token')) {
        errorResponse('Unauthorized', 401);
    }
    
    switch ($action) {
        case '':
        case 'view':
            // GET /api/profile - Get current user profile
            if ($method !== 'GET') {
                errorResponse('Method not allowed', 405);
            }
            
            // Demo profile data (in real app, fetch from database)
            $profile = [
                'id' => 1,
                'uuid' => 'admin-uuid-123456',
                'username' => 'admin',
                'email' => 'admin@oneteam.local',
                'first_name' => 'System',
                'last_name' => 'Administrator',
                'phone' => '+1-555-0123',
                'bio' => 'System administrator with full access to all features.',
                'avatar' => '/api/uploads/avatars/admin.jpg',
                'timezone' => 'UTC',
                'language' => 'en',
                'theme' => 'light',
                'date_format' => 'Y-m-d',
                'time_format' => 'H:i:s',
                'notifications_email' => true,
                'notifications_browser' => true,
                'two_factor_enabled' => false,
                'email_verified' => true,
                'is_active' => true,
                'is_admin' => true,
                'last_login' => '2024-10-08 08:00:00',
                'created_at' => '2024-01-01 00:00:00',
                'updated_at' => '2024-10-08 08:00:00'
            ];
            
            jsonResponse([
                'success' => true,
                'data' => $profile
            ]);
            break;
            
        case 'update':
            // PUT /api/profile/update - Update user profile
            if ($method !== 'PUT') {
                errorResponse('Method not allowed', 405);
            }
            
            // Validate input
            $allowedFields = [
                'first_name', 'last_name', 'phone', 'bio', 'timezone', 
                'language', 'theme', 'date_format', 'time_format',
                'notifications_email', 'notifications_browser'
            ];
            
            $updateData = [];
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    $updateData[$field] = $input[$field];
                }
            }
            
            if (empty($updateData)) {
                errorResponse('No valid fields to update', 400);
            }
            
            // Validate specific fields
            if (isset($updateData['phone']) && !empty($updateData['phone'])) {
                if (!preg_match('/^[\+]?[0-9\-\(\)\s]+$/', $updateData['phone'])) {
                    errorResponse('Invalid phone number format', 400);
                }
            }
            
            if (isset($updateData['timezone'])) {
                $validTimezones = timezone_identifiers_list();
                if (!in_array($updateData['timezone'], $validTimezones)) {
                    errorResponse('Invalid timezone', 400);
                }
            }
            
            if (isset($updateData['language'])) {
                $validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja'];
                if (!in_array($updateData['language'], $validLanguages)) {
                    errorResponse('Invalid language', 400);
                }
            }
            
            if (isset($updateData['theme'])) {
                $validThemes = ['light', 'dark', 'auto'];
                if (!in_array($updateData['theme'], $validThemes)) {
                    errorResponse('Invalid theme', 400);
                }
            }
            
            // In real app, update database here
            // For demo, just return success with updated data
            $updatedProfile = [
                'id' => 1,
                'uuid' => 'admin-uuid-123456',
                'username' => 'admin',
                'email' => 'admin@oneteam.local',
                'first_name' => $updateData['first_name'] ?? 'System',
                'last_name' => $updateData['last_name'] ?? 'Administrator',
                'phone' => $updateData['phone'] ?? '+1-555-0123',
                'bio' => $updateData['bio'] ?? 'System administrator with full access to all features.',
                'avatar' => '/api/uploads/avatars/admin.jpg',
                'timezone' => $updateData['timezone'] ?? 'UTC',
                'language' => $updateData['language'] ?? 'en',
                'theme' => $updateData['theme'] ?? 'light',
                'date_format' => $updateData['date_format'] ?? 'Y-m-d',
                'time_format' => $updateData['time_format'] ?? 'H:i:s',
                'notifications_email' => $updateData['notifications_email'] ?? true,
                'notifications_browser' => $updateData['notifications_browser'] ?? true,
                'two_factor_enabled' => false,
                'email_verified' => true,
                'is_active' => true,
                'is_admin' => true,
                'updated_at' => date('Y-m-d H:i:s')
            ];
            
            jsonResponse([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => $updatedProfile
            ]);
            break;
            
        case 'avatar':
            // POST /api/profile/avatar - Upload avatar
            if ($method !== 'POST') {
                errorResponse('Method not allowed', 405);
            }
            
            if (!isset($_FILES['avatar'])) {
                errorResponse('No avatar file provided', 400);
            }
            
            $file = $_FILES['avatar'];
            
            // Validate file
            if ($file['error'] !== UPLOAD_ERR_OK) {
                errorResponse('File upload error', 400);
            }
            
            // Check file size (max 5MB)
            if ($file['size'] > 5 * 1024 * 1024) {
                errorResponse('File too large. Maximum size is 5MB', 400);
            }
            
            // Check file type
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);
            
            if (!in_array($mimeType, $allowedTypes)) {
                errorResponse('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed', 400);
            }
            
            // Create upload directory if it doesn't exist
            $uploadDir = __DIR__ . '/uploads/avatars/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            // Generate unique filename
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = 'avatar_' . time() . '_' . uniqid() . '.' . $extension;
            $filepath = $uploadDir . $filename;
            
            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                errorResponse('Failed to save uploaded file', 500);
            }
            
            // In real app, update database with new avatar path
            $avatarUrl = '/api/uploads/avatars/' . $filename;
            
            jsonResponse([
                'success' => true,
                'message' => 'Avatar uploaded successfully',
                'data' => [
                    'avatar' => $avatarUrl,
                    'filename' => $filename
                ]
            ]);
            break;
            
        case 'password':
            // PUT /api/profile/password - Change password
            if ($method !== 'PUT') {
                errorResponse('Method not allowed', 405);
            }
            
            $currentPassword = $input['current_password'] ?? '';
            $newPassword = $input['new_password'] ?? '';
            $confirmPassword = $input['confirm_password'] ?? '';
            
            if (empty($currentPassword) || empty($newPassword) || empty($confirmPassword)) {
                errorResponse('All password fields are required', 400);
            }
            
            if ($newPassword !== $confirmPassword) {
                errorResponse('New password and confirmation do not match', 400);
            }
            
            // Validate password strength
            if (strlen($newPassword) < 8) {
                errorResponse('Password must be at least 8 characters long', 400);
            }
            
            if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/', $newPassword)) {
                errorResponse('Password must contain at least one lowercase letter, one uppercase letter, and one number', 400);
            }
            
            // In real app, verify current password against database
            if ($currentPassword !== 'admin123') {
                errorResponse('Current password is incorrect', 400);
            }
            
            // In real app, hash and save new password to database
            // For demo, just return success
            jsonResponse([
                'success' => true,
                'message' => 'Password changed successfully'
            ]);
            break;
            
        case 'preferences':
            // GET/PUT /api/profile/preferences - Get/Update user preferences
            if ($method === 'GET') {
                $preferences = [
                    'timezone' => 'UTC',
                    'language' => 'en',
                    'theme' => 'light',
                    'date_format' => 'Y-m-d',
                    'time_format' => 'H:i:s',
                    'notifications_email' => true,
                    'notifications_browser' => true,
                    'two_factor_enabled' => false
                ];
                
                jsonResponse([
                    'success' => true,
                    'data' => $preferences
                ]);
            } elseif ($method === 'PUT') {
                // Update preferences (similar to profile update but only preferences)
                $allowedPrefs = [
                    'timezone', 'language', 'theme', 'date_format', 'time_format',
                    'notifications_email', 'notifications_browser'
                ];
                
                $updateData = [];
                foreach ($allowedPrefs as $pref) {
                    if (isset($input[$pref])) {
                        $updateData[$pref] = $input[$pref];
                    }
                }
                
                if (empty($updateData)) {
                    errorResponse('No valid preferences to update', 400);
                }
                
                // In real app, update database
                jsonResponse([
                    'success' => true,
                    'message' => 'Preferences updated successfully',
                    'data' => $updateData
                ]);
            } else {
                errorResponse('Method not allowed', 405);
            }
            break;
            
        default:
            errorResponse('Profile action not found', 404);
    }
}
