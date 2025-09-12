-- Create the script table with final schema (id, created_at, query, response, notice)
CREATE TABLE script (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    query TEXT,
    response TEXT,
    notice TEXT
);

-- Add indexes for better query performance
CREATE INDEX idx_script_created_at ON script(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE script ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view all script records" ON script
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Users can insert script records" ON script
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update script records" ON script
    FOR UPDATE TO authenticated
    USING (true);

CREATE POLICY "Users can delete script records" ON script
    FOR DELETE TO authenticated
    USING (true);

-- The table now has: id, created_at, query, response, notice
-- All matching the final schema requirements