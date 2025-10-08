<?php
/**
 * Simple test script to verify menu API functionality
 */

// Simulate a GET request to the menu API
$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET = [];

// Start output buffering to capture the API response
ob_start();

// Include the menu API
include 'backend/api/menu.php';

// Get the output
$output = ob_get_clean();

// Display the result
echo "Menu API Response:\n";
echo "==================\n";
echo $output;
echo "\n\n";

// Try to decode as JSON to verify format
$data = json_decode($output, true);
if ($data) {
    echo "JSON Structure:\n";
    echo "===============\n";
    echo "Success: " . ($data['success'] ? 'true' : 'false') . "\n";
    echo "Data count: " . (isset($data['data']) ? count($data['data']) : 'N/A') . "\n";
    echo "Menu items count: " . (isset($data['menu_items']) ? count($data['menu_items']) : 'N/A') . "\n";
    
    if (isset($data['data']) && is_array($data['data']) && count($data['data']) > 0) {
        echo "\nFirst menu item:\n";
        print_r($data['data'][0]);
    }
} else {
    echo "Failed to decode JSON response\n";
    echo "Raw output: " . $output . "\n";
}
