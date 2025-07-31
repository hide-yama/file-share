# バックエンドセットアップ手順

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスしてアカウント作成
2. 新しいプロジェクトを作成
3. プロジェクトの設定画面で以下の情報を取得：
   - Project URL
   - Project API keys > anon public
   - Project API keys > service_role (シークレット)

## 2. 環境変数の設定

`.env.local`ファイルを作成し、以下を設定：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin API Key
ADMIN_API_KEY=your_secure_random_admin_key
```

## 3. データベースの設定

Supabase Dashboard > SQL Editorで以下のSQLを実行：

```sql
-- supabase/migrations/001_initial_schema.sql の内容をコピー&ペースト
```

## 4. ストレージバケットの作成

1. Supabase Dashboard > Storage
2. 「New bucket」をクリック
3. Bucket name: `project-files`
4. Public bucket: **無効**（セキュリティのため）
5. 「Create bucket」をクリック

## 5. 依存関係のインストール

```bash
npm install
```

## 6. 開発サーバーの起動

```bash
npm run dev
```

## 7. 自動削除機能の設定（オプション）

### Edge Functionをデプロイ

```bash
# Supabase CLIをインストール
npm install -g supabase

# Supabaseにログイン
supabase login

# プロジェクトにリンク
supabase link --project-ref YOUR_PROJECT_REF

# Edge Functionをデプロイ
supabase functions deploy cleanup-expired
```

### Cron Jobの設定

Supabase Dashboard > Database > Cron Jobs で以下を設定：

```sql
-- 毎日午前2時に実行
SELECT cron.schedule(
  'cleanup-expired-projects',
  '0 2 * * *',
  'SELECT net.http_post(
    url := ''https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-expired'',
    headers := jsonb_build_object(
      ''Content-Type'', ''application/json'',
      ''Authorization'', ''Bearer YOUR_SERVICE_ROLE_KEY''
    )
  );'
);
```

## API エンドポイント

### ファイルアップロード
- `POST /api/upload`
- FormData: `projectName`, `files[]`

### プロジェクト認証・取得
- `POST /api/projects/[id]`
- Body: `{ "password": "xxx" }`

### ファイルダウンロード
- `GET /api/download/[id]?file=filename&password=xxx`

### 管理者用清掃
- `GET /api/admin/cleanup` - 清掃対象の確認
- `POST /api/admin/cleanup` - 清掃実行
- Header: `Authorization: Bearer YOUR_ADMIN_API_KEY`

## セキュリティ設定

### 許可されないファイル拡張子
- 実行可能ファイル: `.exe`, `.bat`, `.cmd`, `.scr`, `.vbs`, `.js`, `.jar`
- システムファイル: `.com`, `.pif`, `.app`, `.gadget`, `.msi`, `.msp`, `.hta`

### ファイルサイズ制限
- 単体ファイル: 1GB
- プロジェクト合計: 2GB

### その他のセキュリティ機能
- パスワード認証必須
- ファイル名のサニタイズ
- MIMEタイプ検証
- 有効期限チェック
- アクセスログ記録

## トラブルシューティング

### よくあるエラー

1. **Supabase connection error**
   - 環境変数が正しく設定されているか確認
   - プロジェクトURLとAPIキーが正しいか確認

2. **Storage upload error**
   - `project-files` バケットが作成されているか確認
   - バケットの権限設定を確認

3. **Database error**
   - スキーマが正しく作成されているか確認
   - RLSポリシーが設定されているか確認

### ログの確認方法

- Next.js: コンソールログを確認
- Supabase: Dashboard > Logs セクション
- Edge Functions: Dashboard > Functions > Logs

## 運用時の注意事項

1. **定期的なバックアップ**: Supabase Dashboardから手動バックアップ
2. **ログの監視**: アクセスログとエラーログを定期的に確認
3. **容量の監視**: ストレージ使用量を定期的に確認
4. **セキュリティ更新**: 依存関係の定期的な更新