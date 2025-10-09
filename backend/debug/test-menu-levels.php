<?php
/**
 * Debug script to test menu API level values
 * This script tests if the menu API returns correct level values from the database
 */

// Set up the environment
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SESSION['current_workspace_id'] = 1; // Set default workspace

// Capture output from the menu API
ob_start();
include '../api/menu.php';
$output = ob_get_clean();

// Parse the JSON response
$response = json_decode($output, true);

echo "=== MENU API LEVEL TEST ===\n\n";

if ($response && isset($response['menu_items'])) {
    echo "✅ API Response received successfully\n";
    echo "📊 Total menu items: " . count($response['menu_items']) . "\n\n";
    
    echo "📋 Menu Items with Level Values:\n";
    echo str_repeat("-", 80) . "\n";
    printf("%-5s %-20s %-15s %-10s %-10s\n", "ID", "Title", "Parent ID", "Level", "Status");
    echo str_repeat("-", 80) . "\n";
    
    foreach ($response['menu_items'] as $item) {
        $parentId = $item['parent_id'] ? $item['parent_id'] : 'NULL';
        $level = isset($item['level']) ? $item['level'] : 'MISSING';
        $status = ($level === 0 && $item['parent_id'] === null) ? '✅ Parent' : 
                 ($level > 0 && $item['parent_id'] !== null) ? '✅ Child' : '❌ Wrong';
        
        printf("%-5s %-20s %-15s %-10s %-10s\n", 
            $item['id'], 
            substr($item['title'], 0, 18), 
            $parentId, 
            $level,
            $status
        );
    }
    
    echo str_repeat("-", 80) . "\n\n";
    
    // Check for issues
    $issues = [];
    foreach ($response['menu_items'] as $item) {
        if (!isset($item['level'])) {
            $issues[] = "Item '{$item['title']}' missing level property";
        } elseif ($item['parent_id'] === null && $item['level'] != 0) {
            $issues[] = "Parent item '{$item['title']}' has level {$item['level']} (should be 0)";
        } elseif ($item['parent_id'] !== null && $item['level'] == 0) {
            $issues[] = "Child item '{$item['title']}' has level 0 (should be > 0)";
        }
    }
    
    if (empty($issues)) {
        echo "🎉 SUCCESS: All menu items have correct level values!\n";
        echo "✅ Parent items (no parent_id) have level = 0\n";
        echo "✅ Child items (with parent_id) have level > 0\n";
    } else {
        echo "❌ ISSUES FOUND:\n";
        foreach ($issues as $issue) {
            echo "  • $issue\n";
        }
    }
    
    // Show hierarchical structure
    echo "\n📊 Hierarchical Structure:\n";
    echo str_repeat("-", 50) . "\n";
    
    $parentItems = array_filter($response['menu_items'], function($item) {
        return $item['parent_id'] === null;
    });
    
    foreach ($parentItems as $parent) {
        echo "📁 {$parent['title']} (Level {$parent['level']})\n";
        
        $children = array_filter($response['menu_items'], function($item) use ($parent) {
            return $item['parent_id'] == $parent['id'];
        });
        
        foreach ($children as $child) {
            echo "  └── {$child['title']} (Level {$child['level']})\n";
        }
    }
    
} else {
    echo "❌ ERROR: Failed to get valid response from menu API\n";
    echo "Raw output: $output\n";
}

echo "\n=== END TEST ===\n";
?>
