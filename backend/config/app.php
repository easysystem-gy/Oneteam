<?php

return [
    'name' => $_ENV['APP_NAME'] ?? 'Oneteam',
    'env' => $_ENV['APP_ENV'] ?? 'production',
    'debug' => filter_var($_ENV['APP_DEBUG'] ?? false, FILTER_VALIDATE_BOOLEAN),
    'url' => $_ENV['APP_URL'] ?? 'http://localhost',
    'timezone' => $_ENV['APP_TIMEZONE'] ?? 'UTC',
    
    'security' => [
        'jwt_secret' => $_ENV['JWT_SECRET'] ?? 'change-this-secret-key',
        'session_lifetime' => (int)($_ENV['SESSION_LIFETIME'] ?? 3600),
        'csrf_token_name' => $_ENV['CSRF_TOKEN_NAME'] ?? 'csrf_token',
        'password_hash_algo' => PASSWORD_ARGON2ID,
        'password_hash_options' => [
            'memory_cost' => 65536,
            'time_cost' => 4,
            'threads' => 3
        ],
    ],
    
    'api' => [
        'version' => $_ENV['API_VERSION'] ?? 'v1',
        'rate_limit' => (int)($_ENV['API_RATE_LIMIT'] ?? 100),
        'cors' => [
            'allowed_origins' => ['*'],
            'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With'],
            'max_age' => 86400,
        ],
    ],
    
    'logging' => [
        'level' => $_ENV['LOG_LEVEL'] ?? 'info',
        'file' => $_ENV['LOG_FILE'] ?? __DIR__ . '/../../logs/app.log',
        'max_files' => 30,
        'max_size' => 10485760, // 10MB
    ],
    
    'cache' => [
        'default' => 'file',
        'stores' => [
            'file' => [
                'driver' => 'file',
                'path' => __DIR__ . '/../../storage/cache',
            ],
        ],
    ],
    
    'session' => [
        'driver' => 'file',
        'lifetime' => (int)($_ENV['SESSION_LIFETIME'] ?? 3600),
        'path' => __DIR__ . '/../../storage/sessions',
        'cookie' => [
            'name' => 'oneteam_session',
            'secure' => !empty($_SERVER['HTTPS']),
            'httponly' => true,
            'samesite' => 'Lax',
        ],
    ],
];
