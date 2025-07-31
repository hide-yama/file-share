# Supabase セットアップ手順

## 1. Supabaseプロジェクト作成

1. [Supabase](https://supabase.com)にアクセス
2. 新しいプロジェクトを作成
3. プロジェクト名: `file-share-app`
4. データベースパスワードを設定

## 2. 環境変数設定

`.env.local`ファイルに以下の値を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 3. データベーステーブル作成

Supabaseコンソールの「SQL Editor」で`schema.sql`の内容を実行

## 4. ストレージバケット作成

### 4.1 バケット作成
Supabaseコンソールの「Storage」で以下を実行：

```sql
insert into storage.buckets (id, name, public) values ('project-files', 'project-files', false);
```

### 4.2 ストレージポリシー設定
Supabaseコンソールの「Storage」→「Policies」で以下を実行：

```sql
-- アップロード許可
CREATE POLICY "Allow public uploads" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'project-files');

-- ダウンロード許可
CREATE POLICY "Allow public downloads" ON storage.objects 
FOR SELECT USING (bucket_id = 'project-files');

-- 削除許可
CREATE POLICY "Allow public deletes" ON storage.objects 
FOR DELETE USING (bucket_id = 'project-files');
```

## 5. Edge Function（オプション）

期限切れファイルの自動削除用Edge Functionを設定する場合：

```sql
-- 期限切れプロジェクト削除実行
SELECT delete_expired_projects();
```

## 6. 設定確認

- [ ] 環境変数が正しく設定されている
- [ ] データベーステーブルが作成されている
- [ ] ストレージバケットが作成されている
- [ ] ストレージポリシーが設定されている

## セキュリティ注意事項

- パスワード認証はアプリケーション層で実装
- ファイルアクセスにはプロジェクトIDとパスワードが必要
- 自動期限切れ削除を定期実行すること
- IP制限やレート制限を必要に応じて設定