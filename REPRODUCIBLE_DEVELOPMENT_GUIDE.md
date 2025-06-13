# 再現可能な開発プロセスガイド

## 概要
プロセス進捗管理によるWebアプリケーション開発の統一手順
- mdファイルによる段階的タスク管理
- 基本機能から順次アップグレード
- AIの解釈統一によるブレない開発進行

## 前提条件
- Node.js 18+
- npm または yarn
- Claude Code CLI
- Supabaseアカウント

---

# Phase 1: プロジェクト初期化

## Step 1: AIへの初期指示

### プロンプトテンプレート
```
あなたは優秀なプロジェクトマネージャー（PM）です。
以下の要件でWebアプリケーション開発プロジェクトを管理してください。

【プロジェクト要件】
[ここに要件定義書を貼り付け]

【開発体制】
プロセス管理ファイルによる段階的開発：
- CLAUDE.md: プロジェクト状況と次のステップ
- PROCESS_STATUS.md: 現在のフェーズと進捗
- TASK_CHECKLIST.md: 具体的なタスクリスト
- FEATURE_ROADMAP.md: 機能追加ロードマップ

【指示内容】
1. プロセス管理ファイルによる開発状況の可視化
2. 以下の管理ドキュメントを作成・更新：
   - CLAUDE.md（現在の状況と完了事項）
   - PROCESS_STATUS.md（フェーズ管理）
   - TASK_CHECKLIST.md（具体的タスク）
   - FEATURE_ROADMAP.md（機能拡張計画）
3. 基本機能→応用機能の段階的実装
4. 各段階で動作確認とテストを実行

【重要な方針】
- プロセス管理ファイルを毎回確認してから作業開始
- 最小単位での実装と検証を繰り返す
- 依存関係を明確にして順序立てて開発
- AIセッション開始時は必ずCLAUDE.mdを読み込み
- 作業完了時は進捗をファイルに反映

プロセス管理ファイルは、どのAIでも同じ解釈で作業を継続できるよう、
現在の状況・次のステップ・注意事項を明確に記載してください。
```

## Step 2: プロジェクト作成

### Next.jsプロジェクト作成（安定版設定）
```bash
npx create-next-app@latest project-name --typescript --tailwind --app --no-src-dir --import-alias "@/*" --eslint --turbopack

# Tailwind CSS v3への変更（v4は不安定）
cd project-name
npm uninstall tailwindcss @tailwindcss/postcss
npm install -D tailwindcss@^3.4.0 postcss@^8.4.0 autoprefixer@^10.4.0
```

### 必要パッケージインストール
```bash
npm install @supabase/supabase-js qrcode react-dropzone lucide-react date-fns
npm install -D @types/qrcode
```

### 設定ファイル作成
- `tailwind.config.js`
- `postcss.config.js`
- `.env.local`（テンプレート）

---

# Phase 2: MCP設定とSupabase接続

## Step 3: Claude Code MCP設定

### MCPサーバー追加（CLIコマンド方式）✅
```bash
# 1. Supabase MCPサーバー追加（データベース・ストレージ操作用）
claude mcp add supabase-server -s project -- npx @supabase/mcp-server

# 2. Playwright MCPサーバー追加（E2Eテスト自動化用）
claude mcp add playwright-server -s project -- npx @playwright/mcp-server
```

成功時の出力例：
```
Added stdio MCP server supabase-server with command: npx @supabase/mcp-server to project config
Added stdio MCP server playwright-server with command: npx @playwright/mcp-server to project config
```

### MCP設定確認
```bash
# Claude内で以下のコマンドで確認
/mcp
```

**重要**: MCP設定変更後は**必ず新しいターミナルでClaude Codeを再起動**してください。既存のセッションではMCPツールにアクセスできません。

.mcp.json設定例（自動生成）：
```json
{
  "mcpServers": {
    "supabase": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=YOUR_PROJECT_ID"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "YOUR_ACCESS_TOKEN"
      }
    },
    "playwright": {
      "type": "stdio", 
      "command": "npx",
      "args": ["-y", "@playwright/mcp-server"]
    }
  }
}
```

**重要**: Supabase Access Tokenが必要
- https://supabase.com/dashboard/account/tokens で取得

### MCP設定確認
```bash
# Claude内で以下のコマンドで確認
/mcp
```

**重要**: MCP設定変更後は**必ず新しいターミナルでClaude Codeを再起動**してください。既存のセッションではMCPツールにアクセスできません。

## Step 4: Supabase設定

### プロジェクト作成手順
1. https://supabase.com でプロジェクト作成
2. プロジェクトID取得
3. API設定から以下を取得：
   - Project URL
   - anon public key
   - service_role key

### 環境変数設定
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

### データベースとストレージ設定
- MCPサーバー経由で自動化
- または手動でSQL実行とバケット作成

---

# Phase 3: プロセス管理による段階的開発

## Step 5: プロセス管理ファイル作成

### CLAUDE.mdテンプレート
```markdown
# プロジェクト名 - 現在の状況

## 完了事項
- [✅] 項目1
- [✅] 項目2

## 現在のフェーズ
Phase X: [フェーズ名]

## 次のステップ
1. [具体的なタスク1]
2. [具体的なタスク2]

## 重要な注意事項
- [注意点1]
- [注意点2]

## 環境変数・設定
- KEY1=value1
- KEY2=value2
```

### 開発フロー
```bash
# 1. セッション開始時
cat CLAUDE.md # 現在の状況確認

# 2. 作業実行
# プロセス管理ファイルに従って実装

# 3. 作業完了時
# CLAUDE.mdとPROCESS_STATUS.mdを更新

# 4. 開発サーバー
npm run dev # 必要に応じて起動
```

---

# Phase 4: 統合テストとデプロイ

## Step 6: E2Eテスト実行（Playwright設定）✅

### Playwright手動セットアップ（MCPが利用できない場合）

#### 1. Playwrightインストール
```bash
# プロジェクトディレクトリで実行
npm install --save-dev @playwright/test
```

#### 2. 設定ファイル作成
```bash
# playwright.config.ts を作成
```

設定内容例：
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### 3. package.jsonにスクリプト追加
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

#### 4. テストディレクトリ作成
```bash
mkdir tests
```

#### 5. E2Eテストファイル作成
`tests/` ディレクトリにアプリケーションの主要フローをテストするファイルを作成

### 自動化テストシナリオ例
- 基本的なページ遷移とUI操作
- フォーム入力と送信処理
- 認証機能のテスト
- バリデーション機能の確認
- データ表示の検証

### テスト実行手順
```bash
# ブラウザインストール（初回のみ）
npx playwright install

# E2Eテスト実行
npm run test:e2e

# UIモードで実行（デバッグ用）
npm run test:e2e:ui
```

## Step 7: デプロイ設定
[Vercel設定手順]

---

# 成功の判定基準

- [ ] 基本機能（アップロード・ダウンロード）動作
- [ ] セキュリティ機能正常動作
- [ ] レスポンシブ対応確認
- [ ] エラーハンドリング確認

---

# トラブルシューティング

## よくある問題と解決策

### Tailwind CSS v4エラー
- v3への ダウングレード手順

### MCP接続失敗
- 設定ファイル確認
- パッケージ存在確認

### Supabase接続エラー
- 環境変数確認
- API設定確認

---

# 更新履歴

- 2024/XX/XX: 初回作成
- 2025/06/13: MCP設定手順追加・成功確認
- 2025/06/13: MCPでのSupabaseデータベース・ストレージ自動設定成功
- 2025/06/13: Playwright MCP追加でE2Eテスト自動化対応