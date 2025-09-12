-- Create the script table for storing chat messages and SQL queries
CREATE TABLE script (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(20) NOT NULL CHECK (type IN ('chat_message', 'query')),
    author VARCHAR(255),
    query TEXT,
    response TEXT
);

-- Add indexes for better query performance
CREATE INDEX idx_script_type ON script(type);
CREATE INDEX idx_script_created_at ON script(created_at);
CREATE INDEX idx_script_author ON script(author);

-- Enable Row Level Security (RLS)
ALTER TABLE script ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view all script records" ON script
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Users can insert script records" ON script
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update their own script records" ON script
    FOR UPDATE TO authenticated
    USING (author = auth.email() OR author IS NULL);

CREATE POLICY "Users can delete their own script records" ON script
    FOR DELETE TO authenticated
    USING (author = auth.email() OR author IS NULL);