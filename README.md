# NewsFlow - 大容量ファイル共有サービス

![NewsFlow](https://img.shields.io/badge/NewsFlow-大容量ファイル共有-purple?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat-square&logo=vercel)

**NewsFlow**は、美しいモダンUIと強力なセキュリティ機能を備えた次世代の大容量ファイル共有サービスです。

## 🌐 ライブデモ

**本番環境**: [https://newsflow-jp.vercel.app](https://newsflow-jp.vercel.app)

> 💡 実際のサービスをお試しいただけます！

## ✨ 主な機能

### 🚀 コア機能
- **大容量ファイル対応**: 最大2GBまでのファイルアップロード
- **セキュア共有**: 12桁自動生成パスワードによる保護
- **自動期限管理**: 7日後の自動削除機能
- **QRコード生成**: モバイルデバイスでの簡単アクセス
- **累積ファイル選択**: 複数回のファイル選択で追加可能
- **リアルタイムプレビュー**: 画像ファイルの即座プレビュー

### 🎨 モダンUI/UX
- **ガラスモーフィズム**: 半透明でモダンなデザイン
- **グラデーション背景**: 美しいカラートランジション
- **フローティングアニメーション**: 滑らかなCSS animations
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応
- **ダークモード対応**: システム設定に連動

### 🔒 セキュリティ機能
- **エンドツーエンド暗号化**: ファイル転送の完全保護
- **アクセス制御**: パスワードベース認証
- **有効期限管理**: 自動削除による情報漏洩防止
- **ファイル形式制限**: 悪意のあるファイルの排除
- **IPアドレス記録**: アクセスログの管理

## 🛠️ 技術スタック

### フロントエンド
- **Framework**: Next.js 15.3.3 (App Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Form Handling**: Native HTML5 + React

### バックエンド
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **Edge Functions**: Supabase Edge Functions
- **API**: Next.js API Routes

### DevOps & Testing
- **Testing**: Playwright (E2E)
- **Linting**: ESLint + TypeScript ESLint
- **Build Tool**: Next.js Turbopack
- **Package Manager**: npm
- **Version Control**: Git

## 🚀 セットアップ

### 必要要件
- Node.js 18.17以上
- npm 9.0以上
- Supabaseプロジェクト

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd ageruyo
```

### 2. 依存関係のインストール
```bash
cd file-share-app
npm install
```

### 3. 環境変数の設定
`.env.local`ファイルを作成:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Supabaseセットアップ
```bash
# データベーステーブル作成
npx supabase db push

# ストレージバケット作成
# Supabase管理画面で 'project-files' バケットを作成し、publicに設定
```

### 5. 開発サーバー起動
```bash
npm run dev
```

アプリケーションは `http://localhost:3000` で利用可能になります。

## 📁 プロジェクト構造

```
file-share-app/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── upload/               # ファイルアップロードAPI
│   │   ├── download/             # ファイルダウンロードAPI
│   │   ├── projects/             # プロジェクト管理API
│   │   └── admin/                # 管理機能API
│   ├── upload/                   # アップロードページ
│   │   └── success/              # アップロード完了ページ
│   ├── share/[id]/               # ファイル共有ページ
│   ├── globals.css               # グローバルスタイル
│   ├── layout.tsx                # ルートレイアウト
│   └── page.tsx                  # ホームページ
├── components/                   # Reactコンポーネント
│   ├── Header.tsx                # ヘッダーコンポーネント
│   └── common/                   # 共通コンポーネント
├── lib/                          # ライブラリとユーティリティ
│   └── supabase.ts              # Supabase設定
├── utils/                        # ユーティリティ関数
│   ├── security.ts              # セキュリティ関数
│   ├── password.ts              # パスワード生成
│   └── format.ts                # フォーマット関数
├── types/                        # TypeScript型定義
├── supabase/                     # Supabaseスキーマとマイグレーション
│   ├── migrations/               # データベースマイグレーション
│   ├── functions/                # Edge Functions
│   └── schema.sql               # データベーススキーマ
└── tests/                        # E2Eテスト
```

## 🧪 テスト

### E2Eテストの実行
```bash
# テスト実行
npm run test:e2e

# テストUI起動
npm run test:e2e:ui
```

### テストシナリオ
- ✅ ファイルアップロード機能
- ✅ パスワード認証機能  
- ✅ ファイルダウンロード機能
- ✅ 共有URL生成機能
- ✅ エラーハンドリング

## 🔧 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm run start

# リンター実行
npm run lint

# E2Eテスト実行
npm run test:e2e
```

## 📊 データベーススキーマ

### projects テーブル
| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | プロジェクトID |
| name | VARCHAR | プロジェクト名 |
| password | VARCHAR | アクセスパスワード |
| created_at | TIMESTAMP | 作成日時 |
| expires_at | TIMESTAMP | 有効期限 |
| total_size | BIGINT | 合計ファイルサイズ |
| is_deleted | BOOLEAN | 削除フラグ |

### files テーブル
| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | ファイルID |
| project_id | UUID | プロジェクトID |
| name | VARCHAR | ファイル名 |
| size | BIGINT | ファイルサイズ |
| type | VARCHAR | MIMEタイプ |
| storage_path | VARCHAR | ストレージパス |
| created_at | TIMESTAMP | 作成日時 |

### access_logs テーブル
| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | ログID |
| project_id | UUID | プロジェクトID |
| ip_address | VARCHAR | IPアドレス |
| user_agent | TEXT | ユーザーエージェント |
| accessed_at | TIMESTAMP | アクセス日時 |

## 🔒 セキュリティ考慮事項

### ファイルアップロード
- **サイズ制限**: 1GB/ファイル、2GB/プロジェクト
- **形式制限**: 実行可能ファイルの排除
- **ファイル名サニタイゼーション**: 特殊文字の処理

### アクセス制御
- **パスワード認証**: 12桁英数字自動生成
- **有効期限**: 7日間の自動削除
- **アクセスログ**: IP・ユーザーエージェント記録

### データ保護
- **暗号化**: Supabaseによる保存時暗号化
- **HTTPS通信**: 転送時の暗号化
- **CORS設定**: 適切なオリジン制限

## 🌐 デプロイ

### Vercelデプロイ
```bash
# Vercel CLIインストール
npm i -g vercel

# デプロイ
vercel --prod
```

### 環境変数設定
Vercelダッシュボードで以下を設定:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 🤝 コントリビューション

1. フォークを作成
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. Pull Requestを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 👨‍💻 開発者

**開発**: Claude Code AI Assistant  
**企画**: ユーザー様

## 📞 サポート

問題や質問がございましたら、[Issues](https://github.com/hide-yama/file-share/issues)でお知らせください。

---

<div align="center">

**NewsFlow** - 次世代の大容量ファイル共有体験

[![GitHub stars](https://img.shields.io/github/stars/hide-yama/file-share?style=social)](https://github.com/hide-yama/file-share/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/hide-yama/file-share?style=social)](https://github.com/hide-yama/file-share/network)
[![Vercel Deploy](https://img.shields.io/badge/Deploy-Live-brightgreen?style=social&logo=vercel)](https://newsflow-jp.vercel.app)

</div>