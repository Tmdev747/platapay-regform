-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  location JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  additional_info TEXT,
  user_id UUID REFERENCES auth.users(id)
);

-- Create agent_drafts table
CREATE TABLE IF NOT EXISTS agent_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  business_name TEXT,
  business_type TEXT,
  latitude FLOAT,
  longitude FLOAT,
  additional_info TEXT
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  display_name TEXT,
  role TEXT,
  voice_settings JSONB
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  conversation_id UUID REFERENCES conversations(id) NOT NULL,
  content TEXT NOT NULL,
  role TEXT NOT NULL
);

-- Create commands table
CREATE TABLE IF NOT EXISTS commands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  pattern TEXT NOT NULL
);

-- Create helper tables for setup
CREATE TABLE IF NOT EXISTS _schema_setup (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  table_name TEXT NOT NULL,
  sql TEXT NOT NULL,
  executed BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS _setup_functions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sql TEXT NOT NULL
);

-- Create helper functions
CREATE OR REPLACE FUNCTION exec_sql(sql_string text)
RETURNS void AS $$
BEGIN
  EXECUTE sql_string;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_uuid_extension()
RETURNS void AS $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
