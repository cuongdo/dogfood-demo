-- Add the 'added' column to the script table
-- This column stores a list of strings indicating TableGroups and Tables to be added
ALTER TABLE script ADD COLUMN added TEXT[];