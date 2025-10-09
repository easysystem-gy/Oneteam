-- Migration: Add level column to menu_items table
-- This migration adds a level column to store the menu hierarchy level
-- instead of computing it at runtime

-- Add level column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' AND column_name = 'level'
    ) THEN
        ALTER TABLE menu_items ADD COLUMN level INTEGER DEFAULT 0;
    END IF;
END $$;

-- Update existing records to set correct level values
-- First, set all parent items (parent_id IS NULL) to level 0
UPDATE menu_items SET level = 0 WHERE parent_id IS NULL;

-- Then, set all child items to level 1 (assuming max 2 levels for now)
UPDATE menu_items SET level = 1 WHERE parent_id IS NOT NULL;

-- For deeper hierarchies, you can extend this with recursive updates
-- This recursive CTE would handle unlimited levels:
WITH RECURSIVE menu_levels AS (
    -- Base case: root items (no parent)
    SELECT id, parent_id, 0 as level
    FROM menu_items 
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- Recursive case: child items
    SELECT m.id, m.parent_id, ml.level + 1
    FROM menu_items m
    INNER JOIN menu_levels ml ON m.parent_id = ml.id
)
UPDATE menu_items 
SET level = menu_levels.level
FROM menu_levels
WHERE menu_items.id = menu_levels.id;

-- Create index on level column for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_level ON menu_items(level);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_menu_items_workspace_level ON menu_items(workspace_id, level);
