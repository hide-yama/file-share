-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(12) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  total_size BIGINT DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Files table
CREATE TABLE files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  size BIGINT NOT NULL,
  type VARCHAR(100),
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Access logs table
CREATE TABLE access_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- Indexes for performance
CREATE INDEX idx_projects_expires_at ON projects(expires_at);
CREATE INDEX idx_projects_password ON projects(password);
CREATE INDEX idx_projects_is_deleted ON projects(is_deleted);
CREATE INDEX idx_files_project_id ON files(project_id);
CREATE INDEX idx_access_logs_project_id ON access_logs(project_id);
CREATE INDEX idx_access_logs_accessed_at ON access_logs(accessed_at);

-- Row Level Security (RLS) policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies (すべてのアクセスはサーバーサイドのService Role Keyを通して行う)
CREATE POLICY "Service role can access all projects" ON projects
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all files" ON files
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all access_logs" ON access_logs
  FOR ALL USING (auth.role() = 'service_role');