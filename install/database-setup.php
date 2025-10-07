<?php
/**
 * Oneteam Database Setup Script
 * 
 * This script sets up the database for the Oneteam application.
 * It reads the configuration from .env file and runs the appropriate migrations.
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;
use Oneteam\Database\DatabaseFactory;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Load database configuration
$dbConfig = require __DIR__ . '/../backend/config/database.php';

echo "=== Oneteam Database Setup ===\n";
echo "Database Type: " . $dbConfig['default'] . "\n";
echo "Host: " . $dbConfig['connections'][$dbConfig['default']]['host'] ?? 'N/A' . "\n";
echo "Database: " . $dbConfig['connections'][$dbConfig['default']]['database'] ?? $dbConfig['connections'][$dbConfig['default']]['database'] ?? 'SQLite' . "\n\n";

try {
    // Initialize database factory
    DatabaseFactory::setConfig($dbConfig);
    $db = DatabaseFactory::create();
    
    echo "✓ Database connection established\n";
    
    // Get migration files
    $migrationPath = __DIR__ . '/../database/migrations';
    $migrationFiles = glob($migrationPath . '/*.sql');
    sort($migrationFiles);
    
    if (empty($migrationFiles)) {
        echo "❌ No migration files found in {$migrationPath}\n";
        exit(1);
    }
    
    echo "Found " . count($migrationFiles) . " migration files\n\n";
    
    // Create migrations table if it doesn't exist
    createMigrationsTable($db);
    
    // Run migrations
    foreach ($migrationFiles as $migrationFile) {
        $filename = basename($migrationFile);
        
        // Check if migration already ran
        if (migrationExists($db, $filename)) {
            echo "⏭️  Skipping {$filename} (already applied)\n";
            continue;
        }
        
        echo "🔄 Running migration: {$filename}\n";
        
        // Read and execute migration
        $sql = file_get_contents($migrationFile);
        
        if (empty($sql)) {
            echo "⚠️  Warning: {$filename} is empty\n";
            continue;
        }
        
        // Split SQL into individual statements
        $statements = explode(';', $sql);
        
        $db->beginTransaction();
        
        try {
            foreach ($statements as $statement) {
                $statement = trim($statement);
                
                // Skip empty statements and comments
                if (empty($statement) || strpos($statement, '--') === 0) {
                    continue;
                }
                
                // Execute statement
                $db->execute($statement);
            }
            
            // Record migration
            recordMigration($db, $filename);
            
            $db->commit();
            echo "✅ Migration {$filename} completed successfully\n";
            
        } catch (Exception $e) {
            $db->rollback();
            echo "❌ Migration {$filename} failed: " . $e->getMessage() . "\n";
            throw $e;
        }
    }
    
    echo "\n🎉 Database setup completed successfully!\n";
    echo "\nDefault login credentials:\n";
    echo "Username: admin\n";
    echo "Password: admin123\n";
    echo "\n⚠️  Please change the default password after first login!\n";
    
} catch (Exception $e) {
    echo "\n❌ Database setup failed: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}

/**
 * Create migrations table to track applied migrations
 */
function createMigrationsTable($db) {
    $sql = "CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT UNIQUE NOT NULL,
        applied_at TEXT DEFAULT CURRENT_TIMESTAMP
    )";
    
    try {
        $db->execute($sql);
        echo "✓ Migrations table ready\n";
    } catch (Exception $e) {
        echo "❌ Failed to create migrations table: " . $e->getMessage() . "\n";
        throw $e;
    }
}

/**
 * Check if a migration has already been applied
 */
function migrationExists($db, $filename) {
    $result = $db->queryOne("SELECT COUNT(*) as count FROM migrations WHERE filename = ?", [$filename]);
    return $result && $result['count'] > 0;
}

/**
 * Record that a migration has been applied
 */
function recordMigration($db, $filename) {
    $db->execute("INSERT INTO migrations (filename, applied_at) VALUES (?, datetime('now'))", [$filename]);
}

/**
 * Generate a secure password hash for the default admin user
 */
function generatePasswordHash($password) {
    return password_hash($password, PASSWORD_ARGON2ID, [
        'memory_cost' => 65536,
        'time_cost' => 4,
        'threads' => 3
    ]);
}
