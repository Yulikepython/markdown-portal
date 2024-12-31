# プロジェクト仕様書

## 1. システム構成概要

1. **フロントエンド**
   - React や Vue 等の SPA (Single Page Application) など、静的サイトで構築。
   - **ホスティング**: S3 + CloudFront もしくは Amplify Hosting
   - **認証**: Amazon Cognito (User Pool + Identity Pool)
   - **CI/CD**: GitHub Actions でビルド → S3 へデプロイ（または Amplify Hosting へデプロイ）

2. **バックエンド**
   - **API**: AWS Lambda + API Gateway (HTTP API / REST API)
   - **DB**: Amazon DynamoDB
   - **認証連携**: API Gateway と Cognito Authorizer (JWT) を組み合わせる、または Lambda 側でトークンを検証する。
   - **CI/CD**: GitHub Actions でデプロイ（Serverless Framework や AWS CDK などを利用して IaC を実装する想定）

### 1.1 システム全体図（イメージ）

```
┌──────────┐       ┌─────────┐
│  ユーザー  │ →→→  │ CloudFront │
└──────────┘       └─────────┘
          ↓ (S3 から静的ファイル配信)
         ┌─────────┐
         │   S3    │
         └─────────┘
                 ↓
   ┌───────────────┐       ┌────────────┐
   │ Cognito        │ ←→→→ │ DynamoDB    │
   │ (User Pool等)  │       └────────────┘
   └───────────────┘
               ↓ (IDトークン付与)
         ┌───────────────────┐
         │ API Gateway       │
         └───────────────────┘
               ↓
         ┌───────────────────┐
         │ Lambda (Node.js)  │
         └───────────────────┘
```

---

## 2. Git ブランチ戦略と DynamoDB の運用方針

### 2.1 概要

- 本プロジェクトでは、Git のブランチと DynamoDB の環境を対応させることで、**開発状況**と**データベースの利用環境**を整合的に管理します。
- 大きく分けて **feature**, **develop**, **main** の 3 つのブランチを使用し、それぞれに対応した DynamoDB の環境を利用する方針です。

### 2.2 Git ブランチと DynamoDB 環境の対応

1. **feature ブランチ**
   - **目的**: 新機能の開発や大きめの修正を行う際の作業ブランチ
   - **使用する DynamoDB**: **ローカル環境 (Local DynamoDB)**
      - **理由**: 開発途中の機能をすぐに試しやすく、テストデータの作成・破棄も自由に行えるため。
      - **推奨セットアップ**:
         - Docker で DynamoDB Local を起動し、Serverless Offline と連携
         - `serverless.yml` などで `IS_OFFLINE = true` を設定して接続先をローカルに切り替え

2. **develop ブランチ**
   - **目的**: 統合テスト用のブランチ。feature ブランチからのマージを受けて機能を結合し、安定化を図る。
   - **使用する DynamoDB**: **開発用 (dev) DynamoDB（AWS上のdevステージ）**
      - **理由**: 本番と同様のリソースを使用しつつ、安定化のためのテストができる環境が必要。
      - **推奨セットアップ**:
         - `serverless.yml` の `stage` を `dev` に設定
         - AWS 上の `DocumentsTable-dev` (例) と連携させる
         - IAM ロールやネットワーク設定を実本番に近い構成に

3. **main ブランチ**
   - **目的**: 本番リリース用のブランチ。常に安定した状態が保たれていることを前提とし、本番環境へデプロイする。
   - **使用する DynamoDB**: **本番 (prod) DynamoDB（AWS上のprodステージ）**
      - **理由**: リリース後の本番サービスが参照・更新するデータを管理。
      - **推奨セットアップ**:
         - `serverless.yml` の `stage` を `prod` に設定
         - AWS 上の `DocumentsTable-prod` (例) と連携させる
         - IAM ロールは本番用の最低限の権限を厳格に設定

### 2.3 運用フロー例

1. **feature ブランチで開発**
   - ローカル PC 上で `feature/xxx` ブランチを作成
   - Docker 等で DynamoDB Local を起動し、ローカル環境で自由にデータを操作
   - 実装・テスト完了後、`develop` ブランチに Pull Request を作成してレビューを依頼

2. **develop ブランチで統合テスト**
   - `feature` ブランチからの変更を `develop` にマージし、AWS 上の devステージ（`DocumentsTable-dev` など）で動作確認
   - インテグレーションテストや結合テストを行い、バグがあれば修正

3. **main ブランチで本番デプロイ**
   - `develop` で安定した成果物を `main` ブランチにマージ
   - AWS 上の prodステージ（`DocumentsTable-prod`）に対してデプロイを行い、本番環境を更新
   - リリース後は `main` ブランチからタグを切るなどして、リリースバージョンを管理

### 2.4 変更管理と注意点

1. **環境変数の設定**
   - `serverless.yml` や `.env` ファイルで `stage` や `IS_OFFLINE` を適切に制御
   - feature ブランチでは `IS_OFFLINE = true`、develop や main では `IS_OFFLINE = false` かつ `stage` = `dev` or `prod` を設定

2. **DynamoDB テーブル命名規則**
   - 本番用: `DocumentsTable-prod`
   - 開発用: `DocumentsTable-dev`
   - ローカル用: 名前の衝突を防ぐため、ローカルでの `serverless.yml` では `DocumentsTable-local` などにするか、DynamoDB Local をインメモリで動作させる

3. **IAM 権限の管理**
   - develop 用の AWS リソース: ログインユーザーや IAM ロールで、開発チームが容易にテスト・確認できる権限を付与
   - main 用の AWS リソース: セキュリティを最優先した最小権限のみを付与

4. **データ整合性の確保**
   - feature → develop → main というブランチフローで機能が順次反映
   - develop や main でのデータは、要件によっては手動でクリアや移行を行う必要がある場合がある。自動化スクリプトの導入も検討

### 2.5 メリット・デメリット

- **メリット**:
   - 各ブランチごとに独立した DynamoDB 環境を使用できるため、テストデータや本番データが混在しない
   - feature ブランチではローカル環境を使用するので、開発スピードが向上し、検証も簡単
   - develop で実本番に近い環境で検証でき、 main へのマージで本番環境にデプロイする明確なプロセスが確立する

- **デメリット**:
   - ブランチごとに異なる AWS リソース・環境変数の管理が必要となり、設定が煩雑になる
   - feature ブランチが多数存在すると、ローカル環境の設定・起動に時間がかかることがある
   - develop や main ブランチのテーブルのデータをどう管理するか（クリアするか、テストデータを残すか）チームで方針を決める必要がある

### 2.6 まとめ・運用指針

- **feature** ブランチ = **ローカル環境 (Local DynamoDB)**  
  → 自由に開発・テスト

- **develop** ブランチ = **devステージ (AWS上の開発 DynamoDB)**  
  → 統合テスト・チーム内検証

- **main** ブランチ = **prodステージ (AWS上の本番 DynamoDB)**  
  → 本番デプロイ・運用データ

この運用を行うことで、**開発途中の機能が本番データに影響を与えるリスクを回避**しつつ、本番に近い環境での検証を行いやすくなります。ブランチとデータベース環境の対応関係を明確にすることで、**開発フロー全体の可視性と安全性を高める**ことができます。

---

## 3. バックエンド仕様

1. **使用サービス**:
   - Amazon DynamoDB
   - AWS Lambda
   - Amazon API Gateway
   - Amazon Cognito

2. **API 仕様 (例)**
   - **POST /items**: DynamoDB にデータを登録
   - **GET /items/{id}**: DynamoDB からデータを取得
   - **DELETE /items/{id}**: DynamoDB のデータを削除
   - **JWT 認証**: Cognito User Pool でサインインしたユーザーに発行される ID トークン or Access トークンを API Gateway でバリデーション。

3. **DynamoDB テーブル**
   - テーブル名: `items` (例)
   - パーティションキー: `id` (string)
   - ソートキーが必要なら適宜追加。

4. **Cognito**
   - **User Pool**: ユーザーの認証基盤。ユーザーID/パスワードまたはSNS連携ログイン(任意)。
   - **Identity Pool**: ユーザーに対して IAM ロールを割り当てる場合に使用。
   - **Authorizer**: API Gateway の認証方法として User Pool Authorizer を利用。

---

## 4. フロントエンド仕様

1. **使用サービス**:
   - S3 + CloudFront または Amplify Hosting
   - Cognito (ユーザー登録・ログイン)
   - バックエンド連携: API Gateway のエンドポイントを JavaScript (fetch / axios) などで呼び出し。

2. **ビルド方法 (例: React)**
   - `npm install`
   - `npm run build` でビルド成果物 (dist / build フォルダ) を生成。
   - GitHub Actions のワークフローで、この成果物を S3 / Amplify にアップロード。

3. **Amplify Hosting を使う場合**
   - GitHub リポジトリ連携でプッシュや PR 時に自動ビルド & デプロイ可能。
   - Cognito や DynamoDB を含めたバックエンドも Amplify CLI で一括管理する方法もあるが、本仕様では「Lambda + API Gateway + DynamoDB」を別途デプロイとして想定。

---

## 5. CI/CD (GitHub Actions) 例

### 5.1 フロントエンド向け GitHub Actions サンプル

> **ファイル例**: `.github/workflows/frontend.yml`

```yaml
name: Frontend CI/CD

on:
  push:
    branches: [ "main", "develop" ]
  pull_request:

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20.x]  # Node.js バージョン
    steps:
      - name: Check out repository
        uses: actions/checkout@v3

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install Dependencies
        run: npm ci

      - name: Run Tests
        run: npm run test:coverage

      - name: Build
        run: npm run build

      - name: Archive production artifact
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: build-artifact
          path: build  # or dist などビルドフォルダ名

  deploy-staging:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - name: Download artifact
        uses: actions/download-artifact@v3
        with:
          name: build-artifact
          path: build

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-1  # 適宜リージョンを指定

      - name: Deploy to S3 (Staging)
        run: |
          aws s3 sync build/ s3://${{ secrets.AWS_S3_BUCKET_STAGING }}/ \
            --delete \
            --cache-control "no-cache,no-store,must-revalidate"

  deploy-production:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Download artifact
        uses: actions/download-artifact@v3
        with:
          name: build-artifact
          path: build

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-1

      - name: Backup current S3 (Production)
        run: |
          aws s3 sync s3://${{ secrets.AWS_S3_BUCKET_PROD }}/ s3://${{ secrets.AWS_S3_BUCKET_PROD }}-backup/deployment-$(date +%Y%m%d_%H%M%S)/

      - name: Deploy static assets to S3 (Production)
        run: |
          aws s3 sync build/ s3://${{ secrets.AWS_S3_BUCKET_PROD }}/ \
            --delete \
            --cache-control "max-age=31536000" \
            --exclude "*.html" \
            --exclude "sitemap.xml" \
            --exclude "robots.txt"
      
      - name: Deploy HTML & config files to S3 (Production)
        run: |
          aws s3 sync build/ s3://${{ secrets.AWS_S3_BUCKET_PROD }}/ \
            --exclude "*" \
            --include "*.html" \
            --include "sitemap.xml" \
            --include "robots.txt" \
            --cache-control "no-cache,no-store,must-revalidate"
```

### 5.2 バックエンド向け GitHub Actions サンプル

> **ファイル例**: `.github/workflows/backend.yml`

```yaml
name: Backend CI/CD

on:
  push:
    branches: [ "main", "develop" ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v3

      - name: Use Node.js 20
        uses: actions/setup-node@v3
        with:
          node-version: 20.x

      - name: Install Dependencies
        run: npm ci

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-1

      - name: Serverless Deploy
        run: |
          # stage はブランチ名や環境変数から渡すなどプロジェクトに合わせて実装してください
          npx serverless deploy --stage ${{ github.ref_name }}
```

---

## 6. Cognito 認証について

1. **User Pool**
   - ユーザーの登録やログインを提供。フロントエンドで Cognito Hosted UI を使うか、Amplify の Auth ライブラリを使ってサインイン画面を実装。
   - ログイン成功後、ID トークン or Access トークンが取得できる。

2. **API との連携**
   - フロントエンドで取得したトークンを `Authorization` ヘッダなどに付与して API Gateway を呼び出す。
   - API Gateway 側で **Cognito Authorizer** を設定しておけば、トークンを自動で検証して認可を制御できる。

3. **認可パターン**
   - シンプルに「ログインしていればアクセス可」とする場合: Cognito User Pool Authorizer で保護。
   - ユーザー毎のテーブルアクセス制御を細かく行いたい場合: Cognito Identity Pool を使った IAM ポリシー連携や Lambda での認可ロジックを実装。

---

## 7. 運用上の考慮点

1. **環境の分割**
   - **ステージング**: `develop` ブランチ → `AWS_S3_BUCKET_STAGING` / デモ環境用 Lambda(API) / DynamoDB テーブル（dev）
   - **本番**: `main` ブランチ → `AWS_S3_BUCKET_PROD` / 本番環境用 Lambda(API) / DynamoDB テーブル（prod）
   - Cognito もステージング用・本番用で User Pool を分けるか、1つの User Pool でステージングを兼用するかは要検討。

2. **データベースのマイグレーション**
   - DynamoDB はスキーマレスなので RDB のようなテーブル構造変更は比較的少ないが、GSIs (Global Secondary Index) を追加したりする場合がある。 IaC で一元管理しておくと便利。

3. **ロールバック戦略**
   - フロントの S3 配信は、`aws s3 sync` 前にバックアップを取っているので、簡易的なロールバックが可能。
   - バックエンドの Lambda/API 変更は Serverless Framework / AWS CDK のバージョニングやリビジョン管理を利用すると安心。

4. **セキュリティ**
   - Cognito で認証しただけでは DynamoDB への直接アクセスはできない。通常は Lambda 経由で操作。
   - Cognito Identity Pool を用いて、ユーザー毎に DynamoDB へ直接 PutItem / GetItem を可能にする方法もあるが、権限管理が煩雑なので注意。

---

## 8. ローカル開発 (DynamoDB Local + Docker + Serverless Offline)

**feature ブランチ**での開発を想定し、**ローカル DynamoDB + Serverless Offline** を使用してバックエンドをテストする例を示します。

### 8.1 Docker での DynamoDB Local 起動

```bash
# 例: ポート 8888 をコンテナの 8000 にマッピング
docker run -p 8888:8000 amazon/dynamodb-local
```

- これにより `http://localhost:8888` で DynamoDB Local にアクセスできるようになります。

### 8.2 `serverless.yml` 設定例（`LOCAL_DYNAMO_ENDPOINT` の導入）

```yaml
service: markdown-portal-backend
org: itcmedia

provider:
  name: aws
  runtime: nodejs18.x
  region: ap-northeast-1
  stage: dev
  environment:
    DYNAMO_TABLE_NAME: "DocumentsTable"
    IS_OFFLINE: ${self:custom.isOffline}
    LOCAL_DYNAMO_ENDPOINT: "http://localhost:8888"   # ← ローカルDynamoDBのエンドポイント指定

functions:
  docsHandler:
    handler: dist/index.handler
    events:
      - http:
          path: api/docs
          method: get
      # ... 他のエンドポイント設定など

plugins:
  - serverless-offline

custom:
  isOfflineMap:
    dev: 'true'
    default: 'false'
  isOffline: ${self:custom.isOfflineMap.${self:provider.stage}, 'false'}
```

### 8.3 DynamoDBClient でエンドポイントを切り替え

```ts
// 例: src/services/document.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const isOffline: boolean = process.env.IS_OFFLINE === 'true';
const dynamoClient = new DynamoDBClient({
  region: "ap-northeast-1",
  endpoint: isOffline ? process.env.LOCAL_DYNAMO_ENDPOINT : undefined,
});
```

### 8.4 テーブル作成スクリプト + デフォルトデータ挿入

#### 1) `src/scripts/createLocalTables.ts` の例

```ts
import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import * as fs from 'fs';
import * as path from 'path';
import { documents } from '../models/document'; // デフォルトデータ(サンプル)
import { Document } from '../types/document';

const isOffline: boolean = process.env.IS_OFFLINE === 'true';
const tableDefinitionPath = path.resolve(__dirname, '../../dynamodb-table-definition.json');
const tableDefinition = JSON.parse(fs.readFileSync(tableDefinitionPath, 'utf-8'));

const dynamoClient = new DynamoDBClient({
  region: "ap-northeast-1",
  endpoint: isOffline ? process.env.LOCAL_DYNAMO_ENDPOINT : undefined,
});

async function createTable() {
  try {
    const describeCommand = new DescribeTableCommand({ TableName: tableDefinition.TableName });
    await dynamoClient.send(describeCommand);
    console.log(`Table "${tableDefinition.TableName}" already exists.`);
  } catch (error: any) {
    if (error.name === "ResourceNotFoundException") {
      try {
        const createCommand = new CreateTableCommand(tableDefinition);
        const result = await dynamoClient.send(createCommand);
        console.log("Table created successfully:", result.TableDescription?.TableName);
      } catch (createError) {
        console.error("Error creating table:", createError);
      }
    } else {
      console.error("Error describing table:", error);
    }
  }
}

// すでに同一 (userId, slug) が存在するなら上書きしない例
async function putIfNotExists(doc: Document) {
  try {
    const params = {
      TableName: tableDefinition.TableName,
      Item: {
        userId: { S: doc.userId },
        slug: { S: doc.slug },
        content: { S: doc.content },
        isPublic: { BOOL: doc.isPublic },
      },
      ConditionExpression: "attribute_not_exists(userId) AND attribute_not_exists(slug)",
    };
    await dynamoClient.send(new PutItemCommand(params));
    console.log(`Inserted doc slug=${doc.slug} userId=${doc.userId}`);
  } catch (err: any) {
    if (err.name === "ConditionalCheckFailedException") {
      console.log(`Doc already exists. Skipping: slug=${doc.slug}, userId=${doc.userId}`);
    } else {
      console.error("Error putting doc:", err);
    }
  }
}

async function insertDefaultDocuments() {
  for (const doc of documents) {
    await putIfNotExists(doc);
  }
}

async function main() {
  await createTable();
  await insertDefaultDocuments();
}

main();
```

#### 2) `models/document.ts` (例)

```ts
// サンプルデータ
export const documents: Document[] = [
  {
    id: "1",
    content: "This is the first document.",
    userId: "user1",
    isPublic: false,
    slug: "052bb610-7dc3-4220-af0a-cb13ad04e42c"
  },
  // ... 他のサンプル
];
```

### 8.5 npm scripts で実行しやすく

```jsonc
// package.json (一部抜粋)
{
  "scripts": {
    "build": "tsc",
    "create-local-tables": "IS_OFFLINE=true node dist/scripts/createLocalTables.js",
    "start": "npm run build && npm run create-local-tables && serverless offline",
    ...
  }
}
```

### 8.6 ローカル起動手順

1. **Docker で DynamoDB Local を起動**
   ```bash
   docker run -p 8888:8000 amazon/dynamodb-local
   ```
2. **バックエンドを起動**
   ```bash
   npm install
   npm run start
   ```
   - `npm run build` → TypeScript ビルド
   - `npm run create-local-tables` → テーブル作成 & サンプルデータ投入
   - `serverless offline` → `http://localhost:3000/dev/...` で API を利用可能

3. **動作確認**
   ```bash
   # 例: ドキュメント一覧
   curl http://localhost:3000/dev/api/docs
   ```

---

## 9. まとめ

- **サーバーレス構成**: フロント (S3/Amplify) + Cognito 認証 + API Gateway + Lambda + DynamoDB
- **Git ブランチ戦略と DynamoDB**:
   - **feature** ブランチ → **ローカル (DynamoDB Local)**
   - **develop** ブランチ → **AWS 開発環境 (dev)**
   - **main** ブランチ → **AWS 本番環境 (prod)**
- **CI/CD (GitHub Actions)**:
   - フロント: テスト → ビルド → S3 同期 (Staging / Production)
   - バックエンド: IaC (Serverless Framework / CDK / Terraform) で構成 → デプロイ
- **認証**: Cognito User Pool + API Gateway の Authorizer で JWT 検証
- **データストア**: DynamoDB (パーティションキー、ソートキー、インデックスなどのスキーマ設計を必要に応じて実施)