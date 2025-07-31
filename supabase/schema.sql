-- データベース初期化スクリプト

-- プロジェクトテーブル
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  total_size BIGINT DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- ファイルテーブル
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size BIGINT NOT NULL,
  type TEXT,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- アクセスログテーブル
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent TEXT
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_projects_expires_at ON projects(expires_at);
CREATE INDEX IF NOT EXISTS idx_projects_is_deleted ON projects(is_deleted);
CREATE INDEX IF NOT EXISTS idx_files_project_id ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_project_id ON access_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_accessed_at ON access_logs(accessed_at);

-- Row Level Security (RLS) 設定
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー: 認証不要でアクセス可能（パスワード認証はアプリケーション層で実装）
-- プロジェクト
CREATE POLICY "Allow public access to projects" ON projects FOR ALL USING (true);

-- ファイル
CREATE POLICY "Allow public access to files" ON files FOR ALL USING (true);

-- アクセスログ
CREATE POLICY "Allow public access to access_logs" ON access_logs FOR ALL USING (true);

-- 自動削除用のファンクション
CREATE OR REPLACE FUNCTION delete_expired_projects()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- 期限切れプロジェクトを削除
  WITH deleted AS (
    DELETE FROM projects 
    WHERE expires_at < CURRENT_TIMESTAMP AND is_deleted = FALSE
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ストレージバケット作成（手動で実行）
-- Supabaseコンソールで以下を実行：
-- insert into storage.buckets (id, name, public) values ('project-files', 'project-files', false);

-- バケットポリシー設定（手動で実行）
-- Supabaseコンソールで以下を実行：
/*
-- 認証不要でアップロード・ダウンロード可能
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-files');
CREATE POLICY "Allow public downloads" ON storage.objects FOR SELECT USING (bucket_id = 'project-files');
CREATE POLICY "Allow public deletes" ON storage.objects FOR DELETE USING (bucket_id = 'project-files');
*/