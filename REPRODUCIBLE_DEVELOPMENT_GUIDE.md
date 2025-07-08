# 再現可能な開発プロセスガイド - AGERUYO開発実績版

## 概要
このガイドは、AGERUYO（大容量ファイル共有サービス）の開発で実際に使用されたワークフローをベースに作成された、**再現可能な開発プロセス**です。

**開発哲学:**
- 📋 mdファイルによる段階的タスク管理
- 🔄 基本機能 → 応用機能 → UI/UXブラッシュアップの段階的開発
- 🤖 AIの解釈統一によるブレない開発進行
- 🌐 Git分岐戦略とVercel連携による継続的デプロイ

## 前提条件
- Node.js 18+
- npm または yarn
- Claude Code CLI
- Supabaseアカウント
- GitHubアカウント
- Vercelアカウント

---

# Phase 1: プロジェクト初期化とGit設定

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

【開発フロー】
1. 基本機能実装（MVP）
2. セキュリティ・認証機能
3. テスト・品質保証
4. UI/UXブラッシュアップ（デザインシステム）
5. 本番デプロイ・運用

【重要な方針】
- プロセス管理ファイルを毎回確認してから作業開始
- 最小単位での実装と検証を繰り返す
- 機能完成後にデザインをブラッシュアップする
- AIセッション開始時は必ずCLAUDE.mdを読み込み
- 作業完了時は進捗をファイルに反映
```

## Step 2: プロジェクト作成とGit初期化

### 1. Next.jsプロジェクト作成
```bash
npx create-next-app@latest project-name --typescript --tailwind --app --no-src-dir --import-alias "@/*" --eslint --turbopack

cd project-name

# Tailwind CSS v3への変更（v4は不安定）
npm uninstall tailwindcss @tailwindcss/postcss
npm install -D tailwindcss@^3.4.0 postcss@^8.4.0 autoprefixer@^10.4.0
```

### 2. 必要パッケージインストール
```bash
npm install @supabase/supabase-js qrcode react-dropzone lucide-react date-fns bcryptjs
npm install -D @types/qrcode @types/bcryptjs @playwright/test
```

### 3. Git初期化とブランチ戦略
```bash
# Git初期化
git init
git branch -m main

# .gitignoreファイル作成
echo "node_modules/
.next/
.env*.local
.vercel
*.log
.DS_Store
.claude/" > .gitignore

# 初期コミット
git add .
git commit -m "初期プロジェクト作成

- Next.js 15.3.3 with App Router
- TypeScript + Tailwind CSS設定
- 必要パッケージインストール完了

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# GitHubリポジトリ作成・接続
git remote add origin https://github.com/username/repository-name.git
git push -u origin main

# 開発ブランチ作成
git checkout -b develop
git push -u origin develop
```

### 4. ブランチ戦略
- **main**: 本番環境（Vercel Production）
- **develop**: 開発環境（Vercel Preview）
- **feature/xxx**: 機能開発ブランチ

---

# Phase 2: MCP設定とSupabase接続

## Step 3: Claude Code MCP設定

### MCPサーバー追加
```bash
# 1. Supabase MCPサーバー追加
claude mcp add supabase-server -s project -- npx @supabase/mcp-server

# 2. Playwright MCPサーバー追加
claude mcp add playwright-server -s project -- npx @playwright/mcp-server
```

### .mcp.json設定例
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

**重要**: MCP設定変更後は新しいターミナルでClaude Codeを再起動

## Step 4: Supabase設定

### 1. プロジェクト作成
1. https://supabase.com でプロジェクト作成
2. プロジェクトID、API設定を取得

### 2. 環境変数設定
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

### 3. データベースとストレージ設定
MCPコマンドまたは手動でテーブル・バケット作成

---

# Phase 3: 基本機能開発（MVP）

## Step 5: プロセス管理ファイル作成

### CLAUDE.mdテンプレート
```markdown
# プロジェクト名 - 現在の状況

## 完了事項
- [✅] Next.js プロジェクト作成完了
- [✅] Supabase設定完了

## 現在のフェーズ
Phase 3: 基本機能開発（MVP）

## 次のステップ
1. ファイルアップロード機能実装
2. ファイル共有機能実装
3. 基本的なUIコンポーネント作成

## 重要な注意事項
- デザインは後回し、機能優先
- セキュリティは基本的な対策のみ
- レスポンシブは最低限

## 環境変数・設定
- NEXT_PUBLIC_SUPABASE_URL=[設定済み]
- NEXT_PUBLIC_SUPABASE_ANON_KEY=[設定済み]
```

## Step 6: MVP機能実装

### 実装順序
1. **ファイルアップロード** (`/app/upload/page.tsx`)
2. **ファイル共有** (`/app/share/[id]/page.tsx`)
3. **基本API** (`/app/api/upload/route.ts`, `/app/api/download/[id]/route.ts`)
4. **共通コンポーネント** (`/components/common/`)
5. **ユーティリティ関数** (`/utils/`)

### 開発フロー
```bash
# 1. 機能ブランチ作成
git checkout -b feature/file-upload

# 2. 機能実装
# 基本的なHTML + 最小限のCSS

# 3. 動作確認
npm run dev

# 4. コミット
git add .
git commit -m "feat: ファイルアップロード機能実装"

# 5. developにマージ
git checkout develop
git merge feature/file-upload
git push origin develop
```

---

# Phase 4: セキュリティ・認証機能

## Step 7: セキュリティ実装

### 実装内容
- パスワード生成・認証
- ファイルサイズ制限
- ファイル形式制限
- 有効期限管理
- アクセスログ

### セキュリティテスト
```bash
# E2Eテスト実行
npm run test:e2e
```

---

# Phase 5: Vercel設定と継続的デプロイ

## Step 8: Vercel プロジェクト設定

### 1. Vercel新規プロジェクト作成
1. https://vercel.com にログイン
2. 「New Project」をクリック
3. GitHubリポジトリを選択

### 2. プロジェクト設定
```
Project Name: your-app-name
Framework Preset: Next.js
Root Directory: (プロジェクトのルートディレクトリ)
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 3. 環境変数設定
```
NEXT_PUBLIC_SUPABASE_URL=[your-value]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-value]
SUPABASE_SERVICE_ROLE_KEY=[your-value]
```

### 4. ブランチ設定
- **Production Branch**: `main`
- **Preview Branches**: `develop`, `feature/*`

### 5. 自動デプロイ設定
```bash
# mainブランチ -> 本番環境
git checkout main
git merge develop
git push origin main
# → Vercel本番デプロイが自動実行

# developブランチ -> プレビュー環境
git checkout develop
git push origin develop
# → Vercelプレビューデプロイが自動実行
```

---

# Phase 6: UI/UXブラッシュアップ

## Step 9: デザインシステム実装

### 機能完成後のデザイン改善フロー

#### 1. デザインシステム方針決定
```bash
# デザインブランチ作成
git checkout develop
git checkout -b feature/design-system
```

#### 2. 段階的デザイン実装
```markdown
## デザインブラッシュアップ順序

### Phase 6-1: デザインシステム基盤
- [ ] カラーパレット・グラデーション定義
- [ ] タイポグラフィシステム
- [ ] コンポーネントライブラリ（ボタン、カード等）
- [ ] アニメーション・トランジション

### Phase 6-2: ページ単位でのデザイン更新
- [ ] ホームページのモダン化
- [ ] アップロードページのUX改善
- [ ] 共有ページのビジュアル強化
- [ ] 成功ページのプレミアム感演出

### Phase 6-3: 細部の改善
- [ ] マイクロインタラクション
- [ ] ローディング状態の改善
- [ ] エラー状態のUX向上
- [ ] レスポンシブデザインの最適化
```

#### 3. 実際のブラッシュアップ例（AGERUYO実績）
```css
/* globals.css */
:root {
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

/* ガラスモーフィズム */
.glass {
  @apply bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl;
}

/* ブロブアニメーション */
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
```

#### 4. デザイン実装時の重要原則
```markdown
## デザイン実装の注意点

### ✅ 必須チェック項目
- [ ] 機能が壊れていないか確認
- [ ] レスポンシブデザインの動作確認
- [ ] アクセシビリティの保持
- [ ] パフォーマンスの劣化がないか

### 🎨 デザイン品質基準
- [ ] 一貫したデザインシステム
- [ ] 適切なコントラスト比
- [ ] 自然なアニメーション（60fps）
- [ ] ユーザビリティの向上

### 🔧 技術的配慮
- [ ] CSS-in-JSよりもTailwindを活用
- [ ] 重いアニメーションは避ける
- [ ] 必要に応じてスケルトンローディング
- [ ] モバイルファーストデザイン
```

---

# Phase 7: 品質保証とリリース

## Step 10: 最終チェックとデプロイ

### 1. 品質チェックリスト
```bash
# ビルドテスト
npm run build

# E2Eテスト
npm run test:e2e

# リンター
npm run lint
```

### 2. リリースフロー
```bash
# 1. develop -> main マージ
git checkout main
git merge develop

# 2. リリースタグ作成
git tag -a v1.0.0 -m "🎉 AGERUYO v1.0.0 リリース

主要機能:
- 大容量ファイル共有（最大2GB）
- セキュアパスワード保護
- モダンUI/UXデザイン
- レスポンシブ対応

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 3. 本番デプロイ
git push origin main --tags
```

### 3. リリース後の管理
```bash
# READMEにライブURL追加
git checkout develop
# README.md更新
git add README.md
git commit -m "docs: 本番環境URL追加"
git push origin develop
```

---

# 成功事例: AGERUYO開発実績

## 🎯 実際の開発結果

### ✅ 完成したサービス
- **ライブURL**: https://newsflow-jp.vercel.app
- **リポジトリ**: https://github.com/hide-yama/file-share
- **開発期間**: 1日（設計～デプロイまで）

### 🏆 実装できた機能
- ✅ 大容量ファイル共有（最大2GB）
- ✅ 12桁パスワード自動生成
- ✅ QRコード生成
- ✅ 7日間自動削除
- ✅ レスポンシブデザイン
- ✅ ガラスモーフィズムUI
- ✅ E2Eテスト（Playwright）
- ✅ 継続的デプロイ（Vercel）

### 📊 技術スタック実績
- **Frontend**: Next.js 15.3.3, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Storage, Auth)
- **Deploy**: Vercel (Production + Preview)
- **Testing**: Playwright E2E
- **CI/CD**: GitHub + Vercel自動デプロイ

---

# トラブルシューティング

## よくある問題と解決策

### 1. MCP接続失敗
```bash
# 解決策
claude mcp list  # 設定確認
# Claude Code再起動
```

### 2. Supabase接続エラー
```bash
# 環境変数確認
cat .env.local
# API設定確認
```

### 3. Vercelデプロイエラー
```bash
# ローカルビルド確認
npm run build
# 環境変数設定確認
```

### 4. Next.js 15互換性問題
```typescript
// APIルート型修正例
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  // ...
}
```

---

# 更新履歴

- **2024/XX/XX**: 初回作成
- **2025/06/13**: MCP設定手順追加・成功確認
- **2025/06/13**: AGERUYO開発実績反映
- **2025/06/13**: Git分岐戦略・Vercel設定追加
- **2025/06/13**: UI/UXブラッシュアップフロー追加
- **2025/06/13**: 実際の成功事例・技術スタック追加

---

# まとめ

このガイドは、**AGERUYO**の実際の開発プロセスをベースに作成された実践的なワークフローです。

**成功のポイント:**
1. 📋 **段階的開発**: 機能 → セキュリティ → デザインの順序
2. 🤖 **AI活用**: Claude Code + MCPによる効率化
3. 🔄 **継続的デプロイ**: Git + Vercel自動化
4. 🎨 **後付けデザイン**: 機能完成後のブラッシュアップ
5. 📊 **品質保証**: E2Eテスト + TypeScript

このプロセスに従うことで、**1日で本番環境まで完成**させることが可能です。