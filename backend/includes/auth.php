<?php
/**
 * Authentication functions
 */

/**
 * Check if user is authenticated
 * For now, return true for testing purposes
 * TODO: Implement proper authentication
 */
function isAuthenticated() {
    // Start session if not already started
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    // For testing purposes, always return true
    // TODO: Check actual authentication status
    return true;
}

/**
 * Get current user ID
 */
function getCurrentUserId() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    return $_SESSION['user_id'] ?? 1; // Default to user ID 1 for testing
}

/**
 * Get current workspace ID
 */
function getCurrentWorkspaceId() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    return $_SESSION['current_workspace_id'] ?? 1; // Default to workspace ID 1 for testing
}

/**
 * Set current workspace
 */
function setCurrentWorkspace($workspaceId) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    $_SESSION['current_workspace_id'] = $workspaceId;
}
