<?php

/**
 * Oneteam API OpenAPI 3.0 Specification
 * 
 * This file generates the OpenAPI specification for the Oneteam API
 */

$openapi = [
    'openapi' => '3.0.3',
    'info' => [
        'title' => 'Oneteam API',
        'description' => 'Modern one-page web application API for team management and collaboration. Built with PHP backend and PostgreSQL database.',
        'version' => '1.0.0',
        'contact' => [
            'name' => 'Oneteam Development Team',
            'email' => 'dev@oneteam.local'
        ],
        'license' => [
            'name' => 'MIT',
            'url' => 'https://opensource.org/licenses/MIT'
        ]
    ],
    'servers' => [
        [
            'url' => '/api',
            'description' => 'Development server'
        ]
    ],
    'tags' => [
        [
            'name' => 'Authentication',
            'description' => 'User authentication and session management'
        ],
        [
            'name' => 'Workspaces',
            'description' => 'Workspace management and configuration'
        ],
        [
            'name' => 'Menu',
            'description' => 'Dynamic menu system and navigation'
        ],
        [
            'name' => 'Users',
            'description' => 'User management and profiles'
        ],
        [
            'name' => 'Tasks',
            'description' => 'Task management and tracking'
        ]
    ],
    'paths' => [
        '/auth/login' => [
            'post' => [
                'tags' => ['Authentication'],
                'summary' => 'User login',
                'description' => 'Authenticate user with username and password',
                'operationId' => 'loginUser',
                'requestBody' => [
                    'required' => true,
                    'content' => [
                        'application/json' => [
                            'schema' => [
                                'type' => 'object',
                                'required' => ['username', 'password'],
                                'properties' => [
                                    'username' => [
                                        'type' => 'string',
                                        'example' => 'admin',
                                        'description' => 'User login username'
                                    ],
                                    'password' => [
                                        'type' => 'string',
                                        'format' => 'password',
                                        'example' => 'admin123',
                                        'description' => 'User password'
                                    ]
                                ]
                            ]
                        ]
                    ]
                ],
                'responses' => [
                    '200' => [
                        'description' => 'Login successful',
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'allOf' => [
                                        ['$ref' => '#/components/schemas/ApiResponse'],
                                        [
                                            'type' => 'object',
                                            'properties' => [
                                                'data' => [
                                                    'type' => 'object',
                                                    'properties' => [
                                                        'token' => [
                                                            'type' => 'string',
                                                            'description' => 'JWT authentication token'
                                                        ],
                                                        'user' => ['$ref' => '#/components/schemas/User'],
                                                        'expires_at' => [
                                                            'type' => 'string',
                                                            'format' => 'date-time',
                                                            'description' => 'Token expiration time'
                                                        ]
                                                    ]
                                                ]
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ],
                    '401' => [
                        'description' => 'Invalid credentials',
                        'content' => [
                            'application/json' => [
                                'schema' => ['$ref' => '#/components/schemas/ErrorResponse']
                            ]
                        ]
                    ]
                ]
            ]
        ],
        '/auth/logout' => [
            'post' => [
                'tags' => ['Authentication'],
                'summary' => 'User logout',
                'description' => 'Logout current user and invalidate session',
                'operationId' => 'logoutUser',
                'security' => [
                    ['bearerAuth' => []]
                ],
                'responses' => [
                    '200' => [
                        'description' => 'Logout successful',
                        'content' => [
                            'application/json' => [
                                'schema' => ['$ref' => '#/components/schemas/ApiResponse']
                            ]
                        ]
                    ]
                ]
            ]
        ],
        '/auth/profile' => [
            'get' => [
                'tags' => ['Authentication'],
                'summary' => 'Get user profile',
                'description' => 'Get current user profile and workspace information',
                'operationId' => 'getUserProfile',
                'security' => [
                    ['bearerAuth' => []]
                ],
                'responses' => [
                    '200' => [
                        'description' => 'User profile retrieved successfully',
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'allOf' => [
                                        ['$ref' => '#/components/schemas/ApiResponse'],
                                        [
                                            'type' => 'object',
                                            'properties' => [
                                                'data' => [
                                                    'type' => 'object',
                                                    'properties' => [
                                                        'token' => [
                                                            'type' => 'string',
                                                            'description' => 'Refreshed JWT token'
                                                        ],
                                                        'user' => ['$ref' => '#/components/schemas/User'],
                                                        'workspace' => ['$ref' => '#/components/schemas/Workspace']
                                                    ]
                                                ]
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ],
        '/workspaces' => [
            'get' => [
                'tags' => ['Workspaces'],
                'summary' => 'List workspaces',
                'description' => 'Get list of workspaces accessible to current user',
                'operationId' => 'listWorkspaces',
                'security' => [
                    ['bearerAuth' => []]
                ],
                'responses' => [
                    '200' => [
                        'description' => 'Workspaces retrieved successfully',
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'allOf' => [
                                        ['$ref' => '#/components/schemas/ApiResponse'],
                                        [
                                            'type' => 'object',
                                            'properties' => [
                                                'data' => [
                                                    'type' => 'array',
                                                    'items' => ['$ref' => '#/components/schemas/Workspace']
                                                ]
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ],
        '/menu' => [
            'get' => [
                'tags' => ['Menu'],
                'summary' => 'Get menu structure',
                'description' => 'Get hierarchical menu structure for current workspace',
                'operationId' => 'getMenu',
                'security' => [
                    ['bearerAuth' => []]
                ],
                'parameters' => [
                    [
                        'name' => 'workspace_id',
                        'in' => 'query',
                        'description' => 'Workspace ID to get menu for',
                        'required' => false,
                        'schema' => [
                            'type' => 'integer',
                            'example' => 1
                        ]
                    ]
                ],
                'responses' => [
                    '200' => [
                        'description' => 'Menu structure retrieved successfully',
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'allOf' => [
                                        ['$ref' => '#/components/schemas/ApiResponse'],
                                        [
                                            'type' => 'object',
                                            'properties' => [
                                                'data' => [
                                                    'type' => 'array',
                                                    'items' => ['$ref' => '#/components/schemas/MenuItem']
                                                ]
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ],
        '/users' => [
            'get' => [
                'tags' => ['Users'],
                'summary' => 'List users',
                'description' => 'Get list of users (not implemented yet)',
                'operationId' => 'listUsers',
                'security' => [
                    ['bearerAuth' => []]
                ],
                'responses' => [
                    '501' => [
                        'description' => 'Not implemented',
                        'content' => [
                            'application/json' => [
                                'schema' => ['$ref' => '#/components/schemas/ErrorResponse']
                            ]
                        ]
                    ]
                ]
            ]
        ],
        '/tasks' => [
            'get' => [
                'tags' => ['Tasks'],
                'summary' => 'Get all tasks',
                'description' => 'Retrieve a list of all tasks',
                'responses' => [
                    '200' => [
                        'description' => 'List of tasks retrieved successfully',
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'type' => 'object',
                                    'properties' => [
                                        'success' => ['type' => 'boolean'],
                                        'data' => [
                                            'type' => 'array',
                                            'items' => ['$ref' => '#/components/schemas/Task']
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ],
        '/tasks/create' => [
            'post' => [
                'tags' => ['Tasks'],
                'summary' => 'Create a new task',
                'description' => 'Create a new task with title and description',
                'requestBody' => [
                    'required' => true,
                    'content' => [
                        'application/json' => [
                            'schema' => [
                                'type' => 'object',
                                'required' => ['title'],
                                'properties' => [
                                    'title' => [
                                        'type' => 'string',
                                        'description' => 'Task title'
                                    ],
                                    'description' => [
                                        'type' => 'string',
                                        'description' => 'Task description'
                                    ]
                                ]
                            ]
                        ]
                    ]
                ],
                'responses' => [
                    '200' => [
                        'description' => 'Task created successfully',
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'type' => 'object',
                                    'properties' => [
                                        'success' => ['type' => 'boolean'],
                                        'message' => ['type' => 'string'],
                                        'data' => ['$ref' => '#/components/schemas/Task']
                                    ]
                                ]
                            ]
                        ]
                    ],
                    '400' => [
                        'description' => 'Bad request - missing required fields'
                    ]
                ]
            ]
        ],
        '/tasks/{id}' => [
            'get' => [
                'tags' => ['Tasks'],
                'summary' => 'Get specific task',
                'description' => 'Retrieve a specific task by ID',
                'parameters' => [
                    [
                        'name' => 'id',
                        'in' => 'path',
                        'required' => true,
                        'schema' => ['type' => 'integer'],
                        'description' => 'Task ID'
                    ]
                ],
                'responses' => [
                    '200' => [
                        'description' => 'Task retrieved successfully',
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'type' => 'object',
                                    'properties' => [
                                        'success' => ['type' => 'boolean'],
                                        'data' => ['$ref' => '#/components/schemas/Task']
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ],
            'put' => [
                'tags' => ['Tasks'],
                'summary' => 'Update task',
                'description' => 'Update an existing task',
                'parameters' => [
                    [
                        'name' => 'id',
                        'in' => 'path',
                        'required' => true,
                        'schema' => ['type' => 'integer'],
                        'description' => 'Task ID'
                    ]
                ],
                'requestBody' => [
                    'required' => true,
                    'content' => [
                        'application/json' => [
                            'schema' => ['$ref' => '#/components/schemas/TaskUpdate']
                        ]
                    ]
                ],
                'responses' => [
                    '200' => [
                        'description' => 'Task updated successfully'
                    ]
                ]
            ],
            'delete' => [
                'tags' => ['Tasks'],
                'summary' => 'Delete task',
                'description' => 'Delete a specific task',
                'parameters' => [
                    [
                        'name' => 'id',
                        'in' => 'path',
                        'required' => true,
                        'schema' => ['type' => 'integer'],
                        'description' => 'Task ID'
                    ]
                ],
                'responses' => [
                    '200' => [
                        'description' => 'Task deleted successfully'
                    ]
                ]
            ]
        ]
    ],
    'components' => [
        'securitySchemes' => [
            'bearerAuth' => [
                'type' => 'http',
                'scheme' => 'bearer',
                'bearerFormat' => 'JWT',
                'description' => 'JWT token obtained from login endpoint'
            ]
        ],
        'schemas' => [
            'ApiResponse' => [
                'type' => 'object',
                'required' => ['success'],
                'properties' => [
                    'success' => [
                        'type' => 'boolean',
                        'description' => 'Indicates if the request was successful'
                    ],
                    'message' => [
                        'type' => 'string',
                        'description' => 'Human-readable message'
                    ]
                ]
            ],
            'ErrorResponse' => [
                'type' => 'object',
                'required' => ['success', 'message'],
                'properties' => [
                    'success' => [
                        'type' => 'boolean',
                        'example' => false,
                        'description' => 'Always false for error responses'
                    ],
                    'message' => [
                        'type' => 'string',
                        'description' => 'Error message describing what went wrong'
                    ]
                ]
            ],
            'User' => [
                'type' => 'object',
                'required' => ['id', 'username', 'email'],
                'properties' => [
                    'id' => [
                        'type' => 'integer',
                        'example' => 1,
                        'description' => 'Unique user identifier'
                    ],
                    'username' => [
                        'type' => 'string',
                        'example' => 'admin',
                        'description' => 'User login username'
                    ],
                    'email' => [
                        'type' => 'string',
                        'format' => 'email',
                        'example' => 'admin@oneteam.local',
                        'description' => 'User email address'
                    ],
                    'first_name' => [
                        'type' => 'string',
                        'example' => 'System',
                        'description' => 'User first name'
                    ],
                    'last_name' => [
                        'type' => 'string',
                        'example' => 'Administrator',
                        'description' => 'User last name'
                    ],
                    'is_admin' => [
                        'type' => 'boolean',
                        'example' => true,
                        'description' => 'Whether user has admin privileges'
                    ]
                ]
            ],
            'Workspace' => [
                'type' => 'object',
                'required' => ['id', 'uuid', 'name'],
                'properties' => [
                    'id' => [
                        'type' => 'integer',
                        'example' => 1,
                        'description' => 'Unique workspace identifier'
                    ],
                    'uuid' => [
                        'type' => 'string',
                        'format' => 'uuid',
                        'example' => 'workspace-uuid-123456',
                        'description' => 'Workspace UUID'
                    ],
                    'name' => [
                        'type' => 'string',
                        'example' => 'Default Workspace',
                        'description' => 'Workspace display name'
                    ],
                    'description' => [
                        'type' => 'string',
                        'example' => 'Default workspace for all users',
                        'description' => 'Workspace description'
                    ],
                    'color' => [
                        'type' => 'string',
                        'example' => '#0d6efd',
                        'description' => 'Workspace theme color'
                    ],
                    'icon' => [
                        'type' => 'string',
                        'example' => 'fas fa-home',
                        'description' => 'FontAwesome icon class'
                    ],
                    'is_active' => [
                        'type' => 'boolean',
                        'example' => true,
                        'description' => 'Whether workspace is active'
                    ],
                    'user_role' => [
                        'type' => 'string',
                        'enum' => ['admin', 'member', 'viewer'],
                        'example' => 'admin',
                        'description' => 'User role in this workspace'
                    ],
                    'created_at' => [
                        'type' => 'string',
                        'format' => 'date-time',
                        'example' => '2024-01-01T00:00:00Z',
                        'description' => 'Workspace creation timestamp'
                    ],
                    'updated_at' => [
                        'type' => 'string',
                        'format' => 'date-time',
                        'example' => '2024-01-01T00:00:00Z',
                        'description' => 'Workspace last update timestamp'
                    ]
                ]
            ],
            'MenuItem' => [
                'type' => 'object',
                'required' => ['id', 'uuid', 'title'],
                'properties' => [
                    'id' => [
                        'type' => 'integer',
                        'example' => 1,
                        'description' => 'Unique menu item identifier'
                    ],
                    'uuid' => [
                        'type' => 'string',
                        'format' => 'uuid',
                        'example' => 'menu-uuid-1',
                        'description' => 'Menu item UUID'
                    ],
                    'parent_id' => [
                        'type' => 'integer',
                        'nullable' => true,
                        'example' => null,
                        'description' => 'Parent menu item ID (null for top-level items)'
                    ],
                    'title' => [
                        'type' => 'string',
                        'example' => 'Dashboard',
                        'description' => 'Menu item display title'
                    ],
                    'icon' => [
                        'type' => 'string',
                        'example' => 'fas fa-tachometer-alt',
                        'description' => 'FontAwesome icon class'
                    ],
                    'module_name' => [
                        'type' => 'string',
                        'nullable' => true,
                        'example' => 'dashboard',
                        'description' => 'Module to load when clicked (null for parent items)'
                    ],
                    'sort_order' => [
                        'type' => 'integer',
                        'example' => 1,
                        'description' => 'Display order within parent'
                    ],
                    'level' => [
                        'type' => 'integer',
                        'example' => 0,
                        'description' => 'Nesting level (0 = top level)'
                    ],
                    'has_children' => [
                        'type' => 'boolean',
                        'example' => false,
                        'description' => 'Whether this item has child items'
                    ],
                    'can_view' => [
                        'type' => 'boolean',
                        'example' => true,
                        'description' => 'Whether user can view this item'
                    ],
                    'can_edit' => [
                        'type' => 'boolean',
                        'example' => true,
                        'description' => 'Whether user can edit this item'
                    ],
                    'can_delete' => [
                        'type' => 'boolean',
                        'example' => false,
                        'description' => 'Whether user can delete this item'
                    ]
                ]
            ]
        ],
        'Task' => [
            'type' => 'object',
            'properties' => [
                'id' => [
                    'type' => 'integer',
                    'description' => 'Task ID'
                ],
                'title' => [
                    'type' => 'string',
                    'description' => 'Task title'
                ],
                'description' => [
                    'type' => 'string',
                    'description' => 'Task description'
                ],
                'status' => [
                    'type' => 'string',
                    'enum' => ['pending', 'in_progress', 'completed'],
                    'description' => 'Task status'
                ],
                'created_at' => [
                    'type' => 'string',
                    'format' => 'date-time',
                    'description' => 'Creation timestamp'
                ]
            ]
        ],
        'TaskUpdate' => [
            'type' => 'object',
            'properties' => [
                'title' => [
                    'type' => 'string',
                    'description' => 'Task title'
                ],
                'description' => [
                    'type' => 'string',
                    'description' => 'Task description'
                ],
                'status' => [
                    'type' => 'string',
                    'enum' => ['pending', 'in_progress', 'completed'],
                    'description' => 'Task status'
                ]
            ]
        ]
    ]
];

// Output the OpenAPI specification as JSON
echo json_encode($openapi, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
