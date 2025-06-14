# バックエンド開発タスク

あなたはファイル共有サービスのバックエンド開発を担当するエンジニアです。
以下の指示に従って開発を進めてください。

## 開発環境
- 作業ディレクトリ: `/Users/yamamotohideki/Desktop/アプリ開発/ファイルシェア/file-share-app`
- 技術スタック: Next.js API Routes, Supabase, TypeScript
- 環境変数: `.env.local` （Supabase接続情報を設定必要）

## 本日のタスク

### タスク1: Supabase初期設定
1. Supabaseプロジェクトを作成（https://supabase.com）
2. プロジェクトのURL、Anon Key、Service Role Keyを取得
3. `.env.local` に以下を設定：
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. `/lib/supabase.ts` を作成：
   ```typescript
   import { createClient } from '@supabase/supabase-js';

   // クライアントサイド用
   export const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   );

   // サーバーサイド用（より高い権限）
   export const supabaseAdmin = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!
   );
   ```

### タスク2: データベース設計・作成
SupabaseのSQL Editorで以下のテーブルを作成：

```sql
-- UUID拡張を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- プロジェクトテーブル
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(12) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  total_size BIGINT DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- ファイルテーブル
CREATE TABLE files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  size BIGINT NOT NULL,
  type VARCHAR(100),
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- アクセスログテーブル
CREATE TABLE access_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- インデックス作成
CREATE INDEX idx_projects_expires_at ON projects(expires_at);
CREATE INDEX idx_projects_password ON projects(password);
CREATE INDEX idx_files_project_id ON files(project_id);
```

### タスク3: ストレージバケット設定
Supabase Dashboardで：
1. Storageセクションへ移動
2. 新しいバケット「project-files」を作成
3. Public accessは無効（セキュリティのため）

### タスク4: ユーティリティ関数の作成

`/utils/password.ts`:
```typescript
// 12桁の英数字パスワードを生成
export function generatePassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
```

`/utils/security.ts`:
```typescript
// 危険なファイル拡張子のチェック
const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.scr', '.vbs', '.js', '.jar',
  '.com', '.pif', '.app', '.gadget', '.msi', '.msp', '.hta'
];

export function isFileAllowed(filename: string): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return !BLOCKED_EXTENSIONS.includes(ext);
}

// ファイルサイズ制限チェック（1GB）
export function isFileSizeAllowed(size: number): boolean {
  return size <= 1024 * 1024 * 1024; // 1GB
}
```

### タスク5: ファイルアップロードAPI実装

`/app/api/upload/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generatePassword } from '@/utils/password';
import { isFileAllowed, isFileSizeAllowed } from '@/utils/security';

export async function POST(request: NextRequest) {
  try {
    // 1. FormDataからファイルとプロジェクト名を取得
    // 2. セキュリティチェック（ファイル名、サイズ）
    // 3. プロジェクトレコード作成（パスワード生成、7日後の有効期限）
    // 4. Supabase Storageにファイルアップロード
    // 5. filesテーブルにレコード作成
    // 6. QRコードURL生成
    // 7. レスポンス返却
  } catch (error) {
    // エラーハンドリング
  }
}
```

### タスク6: プロジェクト取得・認証API

`/app/api/projects/[id]/route.ts`:
```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // パスワード認証
  // プロジェクト情報とファイル一覧を返却
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // ファイルダウンロード用の署名付きURL生成
}
```

### タスク7: 自動削除機能（Edge Function）

`/supabase/functions/cleanup-expired/index.ts`:
```typescript
// 有効期限切れプロジェクトの自動削除
// Supabase Scheduled Functionsで1日1回実行
```

## セキュリティ要件

1. **ファイル検証**
   - 拡張子チェック
   - MIMEタイプ検証
   - ファイルサイズ制限

2. **アクセス制御**
   - パスワード認証必須
   - 有効期限チェック
   - Rate limiting（同一IPからの大量リクエスト防止）

3. **データ保護**
   - Service Role Keyはサーバーサイドのみ
   - 署名付きURLは期限付き（1時間）

## エラーハンドリング

すべてのAPIで統一されたエラーレスポンス：
```typescript
{
  success: false,
  error: "エラーメッセージ（日本語）"
}
```

## テスト方法

1. cURLやPostmanでAPIテスト
2. フロントエンドと連携してE2Eテスト
3. Supabase Dashboardでデータ確認

## 作業の進め方

1. Supabaseプロジェクト作成から開始
2. データベース・ストレージ設定
3. 基本的なアップロードAPIから実装
4. 動作確認しながら段階的に機能追加

頑張ってください！不明点があれば質問してください。