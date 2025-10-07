<?php

return [
    'default' => $_ENV['DB_TYPE'] ?? 'postgresql',
    
    'connections' => [
        'postgresql' => [
            'driver' => 'pgsql',
            'host' => $_ENV['DB_HOST'] ?? 'localhost',
            'port' => $_ENV['DB_PORT'] ?? '5432',
            'database' => $_ENV['DB_NAME'] ?? 'oneteam',
            'username' => $_ENV['DB_USERNAME'] ?? 'oneteam_user',
            'password' => $_ENV['DB_PASSWORD'] ?? '',
            'charset' => 'utf8',
            'prefix' => '',
            'schema' => 'public',
            'sslmode' => 'prefer',
        ],
        
        'mariadb' => [
            'driver' => 'mysql',
            'host' => $_ENV['DB_HOST'] ?? 'localhost',
            'port' => $_ENV['DB_PORT'] ?? '3306',
            'database' => $_ENV['DB_NAME'] ?? 'oneteam',
            'username' => $_ENV['DB_USERNAME'] ?? 'oneteam_user',
            'password' => $_ENV['DB_PASSWORD'] ?? '',
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'strict' => true,
            'engine' => null,
        ],
        
        'sqlserver' => [
            'driver' => 'sqlsrv',
            'host' => $_ENV['DB_HOST'] ?? 'localhost',
            'port' => $_ENV['DB_PORT'] ?? '1433',
            'database' => $_ENV['DB_NAME'] ?? 'oneteam',
            'username' => $_ENV['DB_USERNAME'] ?? 'oneteam_user',
            'password' => $_ENV['DB_PASSWORD'] ?? '',
            'charset' => 'utf8',
            'prefix' => '',
        ],
        
        'sqlite' => [
            'driver' => 'sqlite',
            'database' => $_ENV['DB_PATH'] ?? __DIR__ . '/../../database/oneteam.db',
            'prefix' => '',
            'foreign_key_constraints' => true,
        ],
    ],
    
    'migrations' => [
        'table' => 'migrations',
        'path' => __DIR__ . '/../../database/migrations',
    ],
    
    'seeds' => [
        'path' => __DIR__ . '/../../database/seeds',
    ],
];
