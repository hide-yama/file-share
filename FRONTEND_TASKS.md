# フロントエンド開発タスク

あなたはファイル共有サービスのフロントエンド開発を担当するエンジニアです。
以下の指示に従って開発を進めてください。

## 開発環境
- 作業ディレクトリ: `/Users/yamamotohideki/Desktop/アプリ開発/ファイルシェア/file-share-app`
- 開発サーバー: http://localhost:3001 （別ターミナルで起動済み）
- 技術スタック: Next.js 15.3.3, TypeScript, Tailwind CSS, lucide-react

## 本日のタスク

### タスク1: 共通ユーティリティ関数の作成
`/utils/format.ts` を作成し、以下の関数を実装してください：

```typescript
// ファイルサイズを人間が読みやすい形式に変換
// 例: 1024 → "1.00 KB", 1048576 → "1.00 MB"
export function formatFileSize(bytes: number): string

// 日付を日本語形式に変換  
// 例: new Date() → "2024年1月15日 14:30"
export function formatDate(date: Date): string

// 指定長のランダム英数字文字列を生成
export function generateRandomString(length: number): string

// ファイル名の安全性をチェック（危険な文字が含まれていないか）
export function validateFileName(name: string): boolean
```

### タスク2: 共通コンポーネントの作成
`/components/common/` ディレクトリに以下のコンポーネントを作成：

1. **LoadingSpinner.tsx**
   - サイズ可変（sm, md, lg）
   - 色はTailwindのtext-blue-600使用

2. **ErrorAlert.tsx**
   - エラーメッセージ表示
   - 閉じるボタン付き
   - アイコンはlucide-reactのAlertCircle使用

3. **FileIcon.tsx**
   - ファイルタイプに応じたアイコン表示
   - 画像: Image, 動画: Video, PDF: FileText, その他: File

### タスク3: ファイルアップロードUIの改善
`/app/upload/page.tsx` を更新：

1. ファイルサイズの合計を表示
2. 合計2GB超過時に警告メッセージ表示
3. 画像ファイルのプレビュー表示（サムネイル）
4. ファイルタイプ別のアイコン表示（FileIconコンポーネント使用）

### タスク4: モックAPIの作成
`/lib/mock-api.ts` を作成し、バックエンドAPIが完成するまでの仮実装：

```typescript
import { UploadRequest, UploadResponse, ProjectResponse } from '@/types/api';

export async function mockUpload(data: UploadRequest): Promise<UploadResponse> {
  // 2秒の遅延
  // ランダムなprojectId生成
  // 12桁のパスワード生成（generateRandomString使用）
  // QRコード用URL生成
  // 7日後の有効期限設定
}

export async function mockGetProject(projectId: string, password: string): Promise<ProjectResponse> {
  // プロジェクト情報を返す
  // ダミーのファイル一覧を含む
}
```

### タスク5: アップロード成功画面の作成
`/app/upload/success/page.tsx` を新規作成：
- QRコード表示（qrcodeライブラリ使用）
- パスワード表示（コピーボタン付き）
- 有効期限表示
- 共有用URLのコピー機能

## 実装の注意点

1. **型安全性**: 必ずTypeScriptの型を正しく使用
2. **エラーハンドリング**: try-catchで適切にエラーを処理
3. **レスポンシブ**: モバイル表示も考慮
4. **アクセシビリティ**: 適切なaria-labelを設定
5. **日本語UI**: すべてのテキストは日本語で

## 作業の進め方

1. まずタスク1のユーティリティ関数から実装
2. 各タスクが完了したら動作確認
3. エラーがあれば修正してから次のタスクへ
4. 不明な点があれば型定義（/types/api.ts）を確認

## 完了基準

- すべての関数・コンポーネントが正常に動作
- TypeScriptエラーがない
- 開発サーバーでの動作確認済み
- コンソールエラーがない

がんばってください！質問があれば遠慮なく聞いてください。