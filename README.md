# Markdownドキュメント管理プラットフォーム 仕様書（Vite版）

## 1. システム概要

本システムは、Markdown形式の文書（以下「MD文書」）をWeb上で管理・保存・検索・公開するアプリケーションです。  
**Vite** を利用してフロントエンドを構築し、高速な開発体験と将来の拡張性を重視します。

---

## 2. アーキテクチャ / インフラ構成

### 2.1 全体構成

- **フロントエンド**:
    - Vite + React + TypeScript
    - Markdown入力・プレビュー、認証フロー、文書管理（CRUD）を実装
    - APIと連携して動作

- **バックエンド**:
    - AWS Lambda + API Gateway + Node.js
    - 認証連携 (AWS Cognito)
    - データベース (AWS RDSまたはDynamoDB)

- **認証**:
    - AWS Cognitoを利用してメール+パスワード認証を実装
    - 将来的にGoogle OAuth連携可能

- **ホスティング / デプロイ**:
    - フロント: Viteでビルド後、S3 + CloudFront または Amplify Hosting でホスティング
    - バックエンド: Serverless Framework または AWS CDK でLambda + API Gatewayにデプロイ

---

## 3. 機能要件

### 3.1 Markdown入力・プレビュー (ゲスト可)
- **概要**: 認証なしでMarkdownをリアルタイムプレビュー
- **要件**:
    - 左ペイン：Markdown入力（`textarea`）
    - 右ペイン：HTMLプレビュー（`react-markdown` or `@mui/markdown` など）

### 3.2 Markdown文書の保存・CRUD (認証ユーザ)
- **概要**: 認証済みユーザのみ保存可能
- **要件**:
    - タイトル自動抽出（最初のH1タグを利用）
    - 文書の新規作成、編集、削除が可能
    - 一覧表示と検索が可能

### 3.3 個別URLアクセス
- **概要**: 各文書に固有のURLを割り当て、プレビュー可能
- **要件**:
    - `/docs/:id` 形式でアクセス
    - 非公開/公開の切り替え機能は将来的に追加

### 3.4 認証 (AWS Cognito)
- **概要**: ユーザ登録、ログイン、ログアウト
- **要件**:
    - メール+パスワードで認証
    - Amplify SDKを利用してトークン取得・保持
    - バックエンドでトークン検証しアクセスを制限

---

## 4. API仕様

### エンドポイント一覧

| メソッド | パス               | 概要                             | 認証 | リクエスト例 / パラメータ |
|:--------|:-------------------|:---------------------------------|:---:|:--------------------------|
| GET     | /api/health        | ヘルスチェック                   |  -  | -                        |
| GET     | /api/docs          | 文書一覧 + 検索                  |  ○  | `?keyword=xxx`           |
| POST    | /api/docs          | 新規文書作成                     |  ○  | `{ "content":"### Title..." }` |
| GET     | /api/docs/:id      | 文書取得                         |  ○  | URLパラメータ `:id`       |
| PUT     | /api/docs/:id      | 文書更新                         |  ○  | `{ "content":"..." }`     |
| DELETE  | /api/docs/:id      | 文書削除                         |  ○  | URLパラメータ `:id`       |

---

## 5. データベース設計

### テーブル設計 (例: RDS)

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    cognito_sub VARCHAR(255) UNIQUE NOT NULL, -- CognitoのサブID
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. ファイルツリー構成

```
markdown-portal/
├── backend/
│   ├── package.json
│   ├── serverless.yml
│   └── src/
│       ├── index.ts
│       ├── handlers/
│       │   └── docsHandler.ts
│       └── lib/
│           └── db.ts
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── App.tsx
│       ├── components/
│       │   └── MarkdownEditor.tsx
│       ├── pages/
│       │   ├── HomePage.tsx
│       │   ├── DocsListPage.tsx
│       │   └── DocsDetailPage.tsx
│       ├── services/
│       │   └── apiClient.ts
│       └── styles/
│           └── App.css
└── README.md
```

---

## 7. 開発手順（Viteを利用）

### 7.1 フロントエンドセットアップ

1. **ViteでReactプロジェクトを作成**
   ```bash
   npm create vite@latest frontend -- --template react-ts
   cd frontend
   npm install
   ```

2. **必要なライブラリを追加**
   ```bash
   npm install react-router-dom axios @types/react-router-dom react-markdown
   ```

3. **開発サーバ起動**
   ```bash
   npm run dev
   ```

4. **初期構成の確認**
    - `App.tsx` にMarkdown入力+プレビュー機能を実装
    - `src/pages` に各画面のルーティング設計を配置

---

### 7.2 バックエンドセットアップ

1. **Serverless Frameworkでプロジェクト作成**
   ```bash
   mkdir backend
   cd backend
   npm init -y
   npm install serverless serverless-http express
   ```

2. **`serverless.yml` 設定**
    - Lambdaエンドポイントを `/api/docs` 系に設定
    - Cognito Authorizerを追加

3. **APIエンドポイント実装**
    - `src/handlers/docsHandler.ts` に各CRUD操作を実装
    - DB接続ロジックは `src/lib/db.ts` に分離

4. **ローカル開発サーバ起動**
   ```bash
   npx serverless offline
   ```

---

### 7.3 フロントエンドとバックエンドの連携

1. **API呼び出しクライアントを作成**
    - `src/services/apiClient.ts` にAxiosを用いたAPI呼び出しを実装
   ```typescript
   import axios from "axios";
   const apiClient = axios.create({
       baseURL: "http://localhost:3000/api",
       headers: { "Content-Type": "application/json" }
   });
   export default apiClient;
   ```

2. **CRUD操作のテスト**
    - 文書作成・取得・一覧・削除のエンドポイントが正しく動作するか確認

---

## 8. テスト・デプロイ

### テスト
1. ローカルでの結合テストを実施
    - フロントエンド→バックエンド→DBが一貫して動作するか
2. APIの負荷テスト
    - 小規模トラフィックで安定動作を確認

### デプロイ
1. **バックエンドデプロイ**
   ```bash
   npx serverless deploy
   ```
2. **フロントエンドビルド・ホスティング**
   ```bash
   cd frontend
   npm run build
   aws s3 sync dist/ s3://your-s3-bucket
   ```

---

## 9. まとめ

- **Vite採用**によりフロントエンドのセットアップ・開発体験が向上
- **AWS Serverless構成**で柔軟かつスケーラブルなバックエンドを構築
- **今後の拡張性**を考慮したディレクトリ構成と開発手順を提案

Viteを利用した開発は、高速なフィードバックサイクルを提供し、チームの生産性を向上させると同時に、将来的な要件にも柔軟に対応可能な設計となっています。