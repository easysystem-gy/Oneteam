<?php
/**
 * Migration Runner Script
 * This script runs the menu management migration
 */

require_once '../config/database.php';

// Set content type to JSON for easy reading
header('Content-Type: application/json');

$result = [];

try {
    // Check database connection
    $db = new Database();
    $conn = $db->getConnection();
    $result['database_connection'] = 'OK';
    
    // Read the migration file (try PostgreSQL version first, then fallback to SQLite)
    $migrationFile = '../../database/migrations/postgresql/005_add_menu_management.sql';
    if (!file_exists($migrationFile)) {
        $migrationFile = '../../database/migrations/005_add_menu_management.sql';
    }
    
    if (!file_exists($migrationFile)) {
        throw new Exception("Migration file not found: $migrationFile");
    }
    
    $migrationSQL = file_get_contents($migrationFile);
    $result['migration_file_loaded'] = 'OK';
    $result['migration_file_size'] = strlen($migrationSQL) . ' bytes';
    
    // Split the SQL into individual statements
    $statements = array_filter(
        array_map('trim', explode(';', $migrationSQL)),
        function($stmt) {
            return !empty($stmt) && !preg_match('/^\s*--/', $stmt);
        }
    );
    
    $result['sql_statements_count'] = count($statements);
    $result['executed_statements'] = [];
    
    // Execute each statement
    $conn->beginTransaction();
    
    foreach ($statements as $index => $statement) {
        try {
            $stmt = $conn->prepare($statement);
            $stmt->execute();
            $result['executed_statements'][] = [
                'index' => $index + 1,
                'status' => 'SUCCESS',
                'statement' => substr($statement, 0, 100) . (strlen($statement) > 100 ? '...' : '')
            ];
        } catch (Exception $e) {
            $result['executed_statements'][] = [
                'index' => $index + 1,
                'status' => 'ERROR',
                'error' => $e->getMessage(),
                'statement' => substr($statement, 0, 100) . (strlen($statement) > 100 ? '...' : '')
            ];
            
            // If it's a "already exists" error, continue, otherwise rollback
            if (strpos($e->getMessage(), 'already exists') === false && 
                strpos($e->getMessage(), 'UNIQUE constraint failed') === false) {
                $conn->rollback();
                throw $e;
            }
        }
    }
    
    $conn->commit();
    $result['migration_status'] = 'COMPLETED';
    
    // Verify the menu item was created
    $stmt = $conn->prepare("SELECT * FROM menu_items WHERE title = 'Menu Management'");
    $stmt->execute();
    $menuItem = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($menuItem) {
        $result['menu_item_created'] = 'YES';
        $result['menu_item_data'] = $menuItem;
    } else {
        $result['menu_item_created'] = 'NO';
    }
    
    // Check permissions
    $stmt = $conn->prepare("
        SELECT mp.*, mi.title 
        FROM menu_permissions mp 
        JOIN menu_items mi ON mp.menu_item_id = mi.id 
        WHERE mi.title = 'Menu Management'
    ");
    $stmt->execute();
    $permissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $result['permissions_created'] = count($permissions) > 0 ? 'YES' : 'NO';
    $result['permissions_data'] = $permissions;
    
} catch (Exception $e) {
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollback();
    }
    $result['error'] = $e->getMessage();
    $result['migration_status'] = 'FAILED';
}

// Output result
echo json_encode($result, JSON_PRETTY_PRINT);
?>
