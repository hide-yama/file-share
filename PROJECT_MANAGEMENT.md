# ファイル共有サービス開発プロジェクト管理

## プロジェクト概要
セキュアなファイル共有サービスの開発。パスワード保護とQRコードによる簡単な共有機能を提供。

## 現在の状況
- ✅ プロジェクト初期設定完了
- ✅ 基本的な3画面（ホーム、アップロード、ダウンロード）実装済み
- 🚧 機能実装フェーズ

## チーム構成と役割

### ターミナル1: フロントエンド開発
### ターミナル2: バックエンド開発  
### ターミナル3: プロジェクト管理（PM）
### ターミナル4: 開発サーバー（npm run dev --prefix file-share-app）

---

# フロントエンド開発者への指示書

## 環境情報
- プロジェクトパス: `/Users/yamamotohideki/Desktop/アプリ開発/ファイルシェア/file-share-app`
- 開発サーバー: http://localhost:3001
- 使用技術: Next.js 15.3.3, TypeScript, Tailwind CSS

## 現在のタスク優先順位

### 1. 共通ユーティリティ関数の作成
**ファイル**: `/utils/format.ts`
```typescript
// 実装する関数:
// - formatFileSize(bytes: number): string - ファイルサイズを人間が読みやすい形式に変換
// - formatDate(date: Date): string - 日付を「YYYY年MM月DD日 HH:mm」形式に
// - generateRandomString(length: number): string - ランダム文字列生成
// - validateFileName(name: string): boolean - ファイル名の安全性チェック
```

### 2. ファイルアップロードUI改善
**対象ファイル**: `/app/upload/page.tsx`
- ファイルサイズの合計表示
- 2GB超過時の警告表示
- アップロード前のファイルプレビュー（画像のみ）
- ファイルタイプのアイコン表示

### 3. 共通コンポーネント作成
**ディレクトリ**: `/components/common/`
- `LoadingSpinner.tsx` - ローディング表示
- `ErrorAlert.tsx` - エラー表示
- `FileIcon.tsx` - ファイルタイプ別アイコン

### 4. QRコード表示コンポーネント
**ファイル**: `/components/QRCodeDisplay.tsx`
```typescript
interface Props {
  data: string;
  password: string;
  size?: number;
}
```

## API仕様（モック対応）
バックエンドAPIが準備できるまで、以下のモックデータを使用：

```typescript
// /lib/mock-api.ts を作成
export const mockUpload = async (data: UploadRequest): Promise<UploadResponse> => {
  // 2秒の遅延をシミュレート
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    projectId: 'mock-' + Date.now(),
    password: generateRandomString(12),
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent('mock-data'),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
};
```

## 注意事項
- APIの型定義は `/types/api.ts` を参照
- スタイリングはTailwind CSSを使用
- アイコンは lucide-react を使用
- 日本語UIで統一

---

# バックエンド開発者への指示書

## 環境情報
- プロジェクトパス: `/Users/yamamotohideki/Desktop/アプリ開発/ファイルシェア/file-share-app`
- Supabase接続情報: `.env.local` に記載（要設定）
- 使用技術: Next.js API Routes, Supabase

## 現在のタスク優先順位

### 1. Supabase初期設定
**ファイル**: `/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// サーバーサイド用（Service Role Key使用）
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### 2. データベーステーブル設計
Supabaseダッシュボードで以下のテーブルを作成：

```sql
-- projects テーブル
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(12) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  total_size BIGINT DEFAULT 0
);

-- files テーブル
CREATE TABLE files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  size BIGINT NOT NULL,
  type VARCHAR(100),
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- access_logs テーブル
CREATE TABLE access_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- インデックス
CREATE INDEX idx_projects_expires_at ON projects(expires_at);
CREATE INDEX idx_files_project_id ON files(project_id);
```

### 3. パスワード生成ユーティリティ
**ファイル**: `/utils/password.ts`
```typescript
export function generatePassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
```

### 4. ファイルアップロードAPI
**ファイル**: `/app/api/upload/route.ts`
- マルチパートフォームデータの処理
- Supabase Storageへのアップロード
- ファイルサイズ制限（1GB/ファイル、2GB/プロジェクト）
- 危険なファイル拡張子のブロック

### 5. 認証・ダウンロードAPI
**ファイル**: `/app/api/projects/[id]/route.ts`
- パスワード検証
- ファイル一覧取得
- ダウンロードURL生成

## セキュリティ要件
```typescript
// 禁止拡張子リスト
const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.scr', '.vbs', '.js', '.jar',
  '.com', '.pif', '.app', '.gadget', '.msi', '.msp', '.hta'
];

// MIMEタイプチェック
const ALLOWED_MIME_TYPES = [
  'image/*',
  'video/*',
  'application/pdf',
  'text/*',
  // デザインファイル
  'application/postscript', // .ai, .eps
  'image/vnd.adobe.photoshop', // .psd
  // など
];
```

## API仕様
型定義は `/types/api.ts` を参照

---

# 進捗管理表

## 完了タスク
- [x] プロジェクト初期設定
- [x] 基本レイアウト実装
- [x] ルーティング設定

## 進行中タスク
| タスクID | 担当 | タスク内容 | 進捗 |
|---------|------|----------|------|
| FE-1 | フロント | ユーティリティ関数 | 0% |
| BE-1 | バック | Supabase設定 | 0% |

## 依存関係
```
BE-1 (Supabase設定) → BE-2 (DB設計) → BE-3 (Upload API)
                                    ↓
FE-3 (QRコード) ← FE-1 (ユーティリティ) → FE-4 (ファイル一覧)
```

## 次回マイルストーン
**目標**: ローカルでファイルアップロード・ダウンロードの一連の流れを動作させる
**期限**: 本日中

---

# チーム間連携事項

## フロント→バック
- APIのモック実装を先行して作成
- エラーレスポンスの形式を統一

## バック→フロント  
- API実装完了時に通知
- エンドポイントURLの共有

## 共通
- 型定義は `/types/` 配下で管理
- エラーメッセージは日本語で統一