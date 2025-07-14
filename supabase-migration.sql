-- LeadsFlow Database Schema for Supabase
-- Run this SQL in your Supabase SQL editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'caller')),
    status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    avatar TEXT,
    login_status VARCHAR(10) CHECK (login_status IN ('online', 'offline')),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    approved_by VARCHAR(255)
);

-- Create leads table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    school VARCHAR(255) NOT NULL,
    locality VARCHAR(255) NOT NULL,
    district VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    campaigns TEXT[],
    custom_fields JSONB,
    imported_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Create assignments table
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    assigned_time TIMESTAMP WITH TIME ZONE NOT NULL,
    disposition VARCHAR(20) CHECK (disposition IN ('New', 'Interested', 'Not Interested', 'Follow-up', 'Callback', 'Not Reachable')),
    disposition_time TIMESTAMP WITH TIME ZONE,
    sub_disposition VARCHAR(50) CHECK (sub_disposition IN ('Ringing', 'Switched Off', 'Call Back Later', 'Not Answering', 'Wrong Number', 'Language Barrier', 'High Price', 'Not Interested Now', 'Will Join Later', 'Admission Done')),
    sub_disposition_time TIMESTAMP WITH TIME ZONE,
    remark TEXT,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    schedule_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create login_activity table
CREATE TABLE login_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    activity VARCHAR(10) NOT NULL CHECK (activity IN ('login', 'logout')),
    ip_address INET,
    device TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_campaigns ON leads USING GIN(campaigns);

CREATE INDEX idx_assignments_lead_id ON assignments(lead_id);
CREATE INDEX idx_assignments_user_id ON assignments(user_id);
CREATE INDEX idx_assignments_assigned_time ON assignments(assigned_time);
CREATE INDEX idx_assignments_disposition ON assignments(disposition);

CREATE INDEX idx_login_activity_user_id ON login_activity(user_id);
CREATE INDEX idx_login_activity_timestamp ON login_activity(timestamp);

-- Set up Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_activity ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin' 
            AND status = 'active'
        )
    );

-- Admins can insert/update users
CREATE POLICY "Admins can manage users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin' 
            AND status = 'active'
        )
    );

-- All authenticated users can read leads
CREATE POLICY "Authenticated users can read leads" ON leads
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can manage leads
CREATE POLICY "Admins can manage leads" ON leads
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin' 
            AND status = 'active'
        )
    );

-- All authenticated users can read assignments
CREATE POLICY "Authenticated users can read assignments" ON assignments
    FOR SELECT USING (auth.role() = 'authenticated');

-- Users can create assignments for leads assigned to them
CREATE POLICY "Users can create assignments" ON assignments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND status = 'active'
        )
    );

-- Admins can manage all assignments
CREATE POLICY "Admins can manage assignments" ON assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin' 
            AND status = 'active'
        )
    );

-- Admins can read login activity
CREATE POLICY "Admins can read login activity" ON login_activity
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin' 
            AND status = 'active'
        )
    );

-- Create a function to sync auth.users with our users table
CREATE OR REPLACE FUNCTION sync_user_to_users_table()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Insert new user into users table if not exists
        INSERT INTO users (id, email, name, role, status)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
            COALESCE(NEW.raw_user_meta_data->>'role', 'caller'),
            'pending'
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync auth.users with users table
CREATE TRIGGER sync_user_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_to_users_table();

-- Insert a default admin user (you'll need to create this user in Supabase Auth first)
-- Replace with your actual admin email
INSERT INTO users (
    id, 
    email, 
    name, 
    role, 
    status, 
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- Replace with actual UUID from auth.users
    'admin@example.com',
    'System Admin',
    'admin',
    'active',
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    status = 'active';

-- Create sample data (optional)
INSERT INTO leads (name, phone, gender, school, locality, district, campaigns) VALUES
    ('John Doe', '+1234567890', 'Male', 'Example High School', 'Downtown', 'Metro District', ARRAY['Summer Fest 2024']),
    ('Jane Smith', '+1234567891', 'Female', 'Sample College', 'Uptown', 'North District', ARRAY['Diwali Dhamaka']),
    ('Bob Johnson', '+1234567892', 'Male', 'Test University', 'Midtown', 'Central District', ARRAY['New Year Special']);

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;