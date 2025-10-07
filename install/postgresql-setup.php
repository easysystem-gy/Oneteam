<?php
/**
 * PostgreSQL-Specific Database Setup Script for Oneteam
 * 
 * This script sets up the PostgreSQL database with all PostgreSQL-specific features
 * including UUID extensions, JSONB support, triggers, and stored functions.
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// PostgreSQL connection configuration
$config = [
    'host' => $_ENV['DB_HOST'] ?? 'localhost',
    'port' => $_ENV['DB_PORT'] ?? '5432',
    'database' => $_ENV['DB_NAME'] ?? 'oneteam',
    'username' => $_ENV['DB_USERNAME'] ?? 'oneteam_user',
    'password' => $_ENV['DB_PASSWORD'] ?? '',
    'charset' => 'utf8',
    'sslmode' => $_ENV['DB_SSLMODE'] ?? 'prefer'
];

echo "=== Oneteam PostgreSQL Database Setup ===\n";
echo "Host: {$config['host']}:{$config['port']}\n";
echo "Database: {$config['database']}\n";
echo "Username: {$config['username']}\n\n";

try {
    // Build DSN
    $dsn = "pgsql:host={$config['host']};port={$config['port']};dbname={$config['database']};sslmode={$config['sslmode']}";
    
    // Create PDO connection
    $pdo = new PDO($dsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    
    echo "✓ PostgreSQL connection established\n";
    
    // Check PostgreSQL version
    $version = $pdo->query("SELECT version()")->fetchColumn();
    echo "✓ PostgreSQL Version: " . substr($version, 0, strpos($version, ' on')) . "\n";
    
    // Get migration files
    $migrationPath = __DIR__ . '/../database/migrations/postgresql';
    $migrationFiles = glob($migrationPath . '/*.sql');
    sort($migrationFiles);
    
    if (empty($migrationFiles)) {
        echo "❌ No PostgreSQL migration files found in {$migrationPath}\n";
        exit(1);
    }
    
    echo "Found " . count($migrationFiles) . " PostgreSQL migration files\n\n";
    
    // Create migrations table if it doesn't exist
    createMigrationsTable($pdo);
    
    // Run migrations
    foreach ($migrationFiles as $migrationFile) {
        $filename = basename($migrationFile);
        
        // Check if migration already ran
        if (migrationExists($pdo, $filename)) {
            echo "⏭️  Skipping {$filename} (already applied)\n";
            continue;
        }
        
        echo "🔄 Running PostgreSQL migration: {$filename}\n";
        
        // Read and execute migration
        $sql = file_get_contents($migrationFile);
        
        if (empty($sql)) {
            echo "⚠️  Warning: {$filename} is empty\n";
            continue;
        }
        
        $pdo->beginTransaction();
        
        try {
            // Execute the entire migration as one transaction
            $pdo->exec($sql);
            
            // Record migration
            recordMigration($pdo, $filename);
            
            $pdo->commit();
            echo "✅ PostgreSQL migration {$filename} completed successfully\n";
            
        } catch (Exception $e) {
            $pdo->rollback();
            echo "❌ PostgreSQL migration {$filename} failed: " . $e->getMessage() . "\n";
            throw $e;
        }
    }
    
    // Generate a proper password hash for the admin user
    $adminPassword = 'admin123';
    $passwordHash = password_hash($adminPassword, PASSWORD_ARGON2ID, [
        'memory_cost' => 65536,
        'time_cost' => 4,
        'threads' => 3
    ]);
    
    // Update admin user password with proper hash
    echo "\n🔐 Updating admin user password hash...\n";
    $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE username = 'admin'");
    $stmt->execute([$passwordHash]);
    echo "✅ Admin user password hash updated\n";
    
    // Verify database setup
    echo "\n🔍 Verifying database setup...\n";
    verifyDatabaseSetup($pdo);
    
    echo "\n🎉 PostgreSQL database setup completed successfully!\n";
    echo "\n📊 Database Statistics:\n";
    showDatabaseStats($pdo);
    
    echo "\n🔑 Default login credentials:\n";
    echo "Username: admin\n";
    echo "Password: {$adminPassword}\n";
    echo "\n⚠️  Please change the default password after first login!\n";
    
    echo "\n📚 Useful PostgreSQL Commands:\n";
    echo "- View all tables: \\dt\n";
    echo "- View table structure: \\d table_name\n";
    echo "- View functions: \\df\n";
    echo "- View views: \\dv\n";
    echo "- Connect to database: psql -h {$config['host']} -U {$config['username']} -d {$config['database']}\n";
    
} catch (Exception $e) {
    echo "\n❌ PostgreSQL database setup failed: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}

/**
 * Create migrations table to track applied migrations
 */
function createMigrationsTable($pdo) {
    $sql = "CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )";
    
    try {
        $pdo->exec($sql);
        echo "✓ Migrations table ready\n";
    } catch (Exception $e) {
        echo "❌ Failed to create migrations table: " . $e->getMessage() . "\n";
        throw $e;
    }
}

/**
 * Check if a migration has already been applied
 */
function migrationExists($pdo, $filename) {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM migrations WHERE filename = ?");
    $stmt->execute([$filename]);
    return $stmt->fetchColumn() > 0;
}

/**
 * Record that a migration has been applied
 */
function recordMigration($pdo, $filename) {
    $stmt = $pdo->prepare("INSERT INTO migrations (filename, applied_at) VALUES (?, CURRENT_TIMESTAMP)");
    $stmt->execute([$filename]);
}

/**
 * Verify database setup by checking key tables and functions
 */
function verifyDatabaseSetup($pdo) {
    $checks = [
        'Tables' => [
            'users' => 'SELECT COUNT(*) FROM users',
            'workspaces' => 'SELECT COUNT(*) FROM workspaces',
            'user_workspaces' => 'SELECT COUNT(*) FROM user_workspaces',
            'menu_items' => 'SELECT COUNT(*) FROM menu_items',
            'menu_permissions' => 'SELECT COUNT(*) FROM menu_permissions',
            'sessions' => 'SELECT COUNT(*) FROM sessions',
            'audit_logs' => 'SELECT COUNT(*) FROM audit_logs'
        ],
        'Views' => [
            'user_info' => 'SELECT COUNT(*) FROM user_info',
            'workspace_stats' => 'SELECT COUNT(*) FROM workspace_stats',
            'menu_hierarchy' => 'SELECT COUNT(*) FROM menu_hierarchy',
            'active_sessions' => 'SELECT COUNT(*) FROM active_sessions'
        ],
        'Functions' => [
            'get_user_workspaces' => "SELECT get_user_workspaces(1)",
            'get_user_menu' => "SELECT get_user_menu(1, 1)",
            'cleanup_expired_sessions' => "SELECT 'cleanup_expired_sessions'::regproc",
            'scheduled_maintenance' => "SELECT 'scheduled_maintenance'::regproc"
        ]
    ];
    
    foreach ($checks as $category => $items) {
        echo "  {$category}:\n";
        foreach ($items as $name => $query) {
            try {
                if ($category === 'Functions' && strpos($query, '::regproc') !== false) {
                    // Just check if function exists
                    $pdo->query($query);
                    echo "    ✓ {$name}\n";
                } else {
                    $result = $pdo->query($query)->fetchColumn();
                    echo "    ✓ {$name} ({$result} records)\n";
                }
            } catch (Exception $e) {
                echo "    ❌ {$name} - Error: " . $e->getMessage() . "\n";
            }
        }
    }
}

/**
 * Show database statistics
 */
function showDatabaseStats($pdo) {
    try {
        // Get table sizes
        $sizeQuery = "
            SELECT 
                schemaname,
                tablename,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
                pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY size_bytes DESC
        ";
        
        $tables = $pdo->query($sizeQuery)->fetchAll();
        
        echo "Table sizes:\n";
        foreach ($tables as $table) {
            echo "  - {$table['tablename']}: {$table['size']}\n";
        }
        
        // Get database size
        $dbSizeQuery = "SELECT pg_size_pretty(pg_database_size(current_database())) as db_size";
        $dbSize = $pdo->query($dbSizeQuery)->fetchColumn();
        echo "Total database size: {$dbSize}\n";
        
        // Get connection info
        $connQuery = "SELECT count(*) as connections FROM pg_stat_activity WHERE datname = current_database()";
        $connections = $pdo->query($connQuery)->fetchColumn();
        echo "Active connections: {$connections}\n";
        
    } catch (Exception $e) {
        echo "Could not retrieve database statistics: " . $e->getMessage() . "\n";
    }
}
