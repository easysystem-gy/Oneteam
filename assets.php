<?php
/**
 * Static Asset Server for Oneteam
 * 
 * This file serves static assets (CSS, JS, images) with proper MIME types
 * when the web server configuration doesn't handle them correctly.
 */

// Get the requested file path
$requestUri = $_SERVER['REQUEST_URI'];
$parsedUrl = parse_url($requestUri);
$path = $parsedUrl['path'];

// Remove leading slash and decode URL
$path = ltrim($path, '/');
$path = urldecode($path);

// Security: prevent directory traversal
if (strpos($path, '..') !== false || strpos($path, '\\') !== false) {
    http_response_code(403);
    exit('Access denied');
}

// Define allowed asset paths
$allowedPaths = [
    'frontend/assets/',
    'assets/'
];

$isAllowed = false;
foreach ($allowedPaths as $allowedPath) {
    if (strpos($path, $allowedPath) === 0) {
        $isAllowed = true;
        break;
    }
}

if (!$isAllowed) {
    http_response_code(404);
    exit('Not found');
}

// Check if file exists
if (!file_exists($path)) {
    http_response_code(404);
    exit('File not found');
}

// Get file extension
$extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

// Define MIME types
$mimeTypes = [
    'css' => 'text/css',
    'js' => 'application/javascript',
    'json' => 'application/json',
    'png' => 'image/png',
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'gif' => 'image/gif',
    'svg' => 'image/svg+xml',
    'ico' => 'image/x-icon',
    'woff' => 'font/woff',
    'woff2' => 'font/woff2',
    'ttf' => 'font/ttf',
    'eot' => 'application/vnd.ms-fontobject'
];

// Set appropriate MIME type
if (isset($mimeTypes[$extension])) {
    header('Content-Type: ' . $mimeTypes[$extension]);
} else {
    header('Content-Type: application/octet-stream');
}

// Set cache headers for static assets
$cacheTime = 3600 * 24 * 30; // 30 days
header('Cache-Control: public, max-age=' . $cacheTime);
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + $cacheTime) . ' GMT');

// Set content length
header('Content-Length: ' . filesize($path));

// Output the file
readfile($path);
exit;
