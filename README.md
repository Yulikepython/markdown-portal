# markdown-portal

このリポジトリは、Markdown ドキュメントの作成・編集・閲覧を行うためのポータルアプリケーションです。  
フロントエンドとバックエンドを別ディレクトリで管理しています。

---

## 1. アプリケーションの目的・概要

1. **Markdown ドキュメントの作成・編集・公開**
   - React (フロントエンド) を使用し、Markdown エディタでドキュメントを作成・編集。
   - 仕上がったコンテンツを DynamoDB に保存し、必要に応じて公開（誰でも閲覧できる状態）に設定できます。

2. **ユーザー認証と権限制御**
   - ログインしていないユーザーには編集権限を与えず、特定のユーザーのみが自分のドキュメントを編集できるようにしています。
   - Amazon Cognito (User Pool) と JWT (ID トークン) を使った認証を導入。ローカル開発時はモック認証でスキップ可能です。

3. **サーバーレス構成**
   - バックエンドは AWS Lambda + API Gateway + DynamoDB。
   - フロントエンドは Vite + React で開発し、本番運用時は S3/CloudFront あるいは Amplify Hosting を想定。

---

## 2. 環境ごとの立ち上げ手順

### 2.1 ローカル環境（ローカル開発モード）

#### 2.1.1 前提
- Node.js (推奨: v18 以降)
- Docker (推奨: Docker Desktop 最新)

#### 2.1.2 フロントエンドの起動 (モック認証)
1. **依存パッケージのインストール**
   ```bash
   cd markdown-portal/frontend
   npm install
   ```
2. **ローカルサーバーの起動**
   ```bash
   npm run dev:offline
   ```
   - `VITE_API_STAGE=local` が指定され、モック認証が有効になります。
   - ブラウザで `http://localhost:5173` (ポート番号は環境による) にアクセスするとアプリが確認できます。

#### 2.1.3 バックエンドの起動 (Serverless Offline + DynamoDB Local)
1. **DynamoDB Local を起動**
   ```bash
   docker run -p 8888:8000 amazon/dynamodb-local
   ```
   > または、AWS公式の jar ファイルをダウンロードして `java -jar DynamoDBLocal.jar -sharedDb -port 8888` でも OK  
   > `http://localhost:8888` でローカル DynamoDB が起動します。
2. **依存パッケージのインストール**
   ```bash
   cd markdown-portal/backend
   npm install
   ```
3. **ローカルテーブル作成＋サンプルデータ投入**
   ```bash
   npm run build
   npm run create-local-tables
   ```
   - `dist/scripts/createLocalTables.js` が実行され、テーブルが作られます。
4. **Serverless Offline 起動**
   ```bash
   npm run start:offline
   ```
   - `serverless offline --stage local` が実行され、`http://localhost:3000/local/api/...` でバックエンド API にアクセス可能です。

#### 2.1.4 動作確認コマンド例
- ローカル DynamoDB でテーブル確認
  ```bash
  aws dynamodb list-tables --endpoint-url http://localhost:8888
  ```
- ドキュメント一覧取得 (GET)
  ```bash
  curl http://localhost:3000/local/api/docs
  ```
  > モック認証の場合は強制的に `userId = local-user-1234` として認識するようになっています。

---

### 2.2 開発用ステージ（dev 環境）での起動

#### 2.2.1 前提
- AWS アカウントにデプロイするための IAM 権限 (DynamoDB / Lambda / API Gateway など)
- `serverless` CLI のインストール (グローバル推奨)

#### 2.2.2 フロントエンド (dev 用ビルド・デプロイ例)
1. **dev 用ビルド**
   ```bash
   cd markdown-portal/frontend
   npm install
   npm run build
   ```
   - `.env` や `VITE_API_STAGE=dev` 等の設定を行う場合は、`--mode develop` などを使ってもよいです。
2. **成果物を S3 へアップロード (例)**
   ```bash
   aws s3 sync dist s3://<your-dev-bucket> --delete
   ```
   > CloudFront や Amplify Hosting を使う場合は、AWS CLI ではなくそれぞれの方法でデプロイします。

#### 2.2.3 バックエンド (dev デプロイ)
1. **デプロイ設定の確認**
   - `serverless.yml` で `stage: dev` が指定されるようにします (または `--stage dev` オプション)。
2. **デプロイ実行**
   ```bash
   cd markdown-portal/backend
   npm install
   npx serverless deploy --stage dev
   ```
   - 成功すると API エンドポイントが発行されます。API Gateway の URL をフロントエンドで参照するように設定してください。

---

### 2.3 本番ステージ（prod 環境）でのデプロイ

1. **フロントエンド**
   ```bash
   cd markdown-portal/frontend
   npm run build
   # 例えば S3 へのアップロード
   aws s3 sync dist s3://<your-prod-bucket> --delete
   ```
   - CloudFront のキャッシュを無効化する場合、`aws cloudfront create-invalidation` などの手順を追加します。

2. **バックエンド**
   ```bash
   cd markdown-portal/backend
   npx serverless deploy --stage prod
   ```
   - デプロイ後、API Gateway の本番 URL が更新されます。フロントエンドから参照しているエンドポイントを間違えないよう注意してください。

---

## 3. テスト方法

### 3.1 フロントエンドテスト
- **ユニットテスト / コンポーネントテスト**:
  ```bash
  cd markdown-portal/frontend
  npm run test
  ```
   - React Testing Library や Vitest / Jest を想定
- **E2E テスト** (任意): Cypress などを導入し、テスト環境 (dev) へデプロイした上でテストを行う。

### 3.2 バックエンドテスト
- **単体テスト**: Jest などで service 層や controller のテストを実施
  ```bash
  cd markdown-portal/backend
  npm run test
  ```
- **統合テスト**: Serverless Offline で起動し、API を実際に呼んでテスト (supertest など)

---

## 4. 開発上の注意点

1. **Cognito 認証**
   - オフライン時はモック認証を使い `userId = local-user-1234` 固定で動作します。
   - 本番環境では JWT を検証し、ユーザーごとのデータにしかアクセスできないようにします。

2. **DynamoDB スキーマ**
   - パーティションキー: `userId`、ソートキー: `slug`
   - 公開ドキュメント検索用に GSI (SlugIndex) を設定

3. **Git フロー**
   - **feature ブランチ** → ローカル DynamoDB
   - **develop ブランチ** → dev ステージ (AWS)
   - **main ブランチ** → prod ステージ (AWS)

4. **デプロイ前に注意すること**
   - `serverless.yml` 内の `stage` や `DYNAMO_TABLE_NAME` が正しいかどうか
   - Cognito User Pool ID やクライアント ID などが環境変数で適切に指定されているか (Amplify 設定含む)

5. **セキュリティ**
   - 認証が必要なエンドポイントは JWT 検証 (Auth Middleware) を必ず通すこと
   - 非公開データは `isPublic=false` の場合、所有ユーザーのみ編集可能とする

---

.envファイルについて（frontend）
VITE_API_STAGE

local → ローカル開発モード (http://localhost:3000/local/api などに向く)
dev → 開発ステージ (https://{devのAPI Gateway}/dev/api など)
prod → 本番 (https://{本番API Gateway}/prod/api など)
REACT_APP_USE_MOCK_AUTH

true の場合、フロントエンドでオフライン用のモック認証が動く。ローカルで簡易ログイン状態をエミュレートするためのもの。
VITE_COGNITO_DOMAIN

Cognito のドメイン (例: myapp.auth.ap-northeast-1.amazoncognito.com の myapp 部分) を指定することが多い。
Amplify設定では domain: "${domainPrefix}.auth.${region}.amazoncognito.com" となるため、その domainPrefix が VITE_COGNITO_DOMAIN。
VITE_COGNITO_CLIENT_ID / VITO_COGNITO_USER_POOL_ID

Cognito ユーザープールの「クライアントID」や「ユーザープールID」。
例: VITE_COGNITO_CLIENT_ID=abcd1234efgh5678ijkl
例: VITO_COGNITO_USER_POOL_ID=ap-northeast-1_xxxxxxxx
VITE_COGNITO_REGION

Cognito を作成した AWS リージョン (例: ap-northeast-1)
VITE_SIGNIN_URL と VITE_SIGNOUT_URL

Cognito 認証成功後 / ログアウト後に戻ってくる URL。Amplify の OAuth 設定で redirectSignIn / redirectSignOut に指定されます。
例: ローカル開発なら http://localhost:5173/
本番なら https://example.com/

## 5. 今後の課題・TODO

1. **フロントエンドのデザイン**
   - 現状、最低限の UI/UX。Bootstrap や Material-UI, Chakra UI など導入の検討
2. **コラボレーション機能**
   - 複数ユーザーで同一ドキュメントを共同編集するためのロック機能、またはリアルタイム編集検討
3. **サーチ機能**
   - タイトル・本文を全文検索するために、Elasticsearch / OpenSearch 連携 or DynamoDB Streams + Lambda などの構成を検討
4. **監査ログ・バージョン管理**
   - 過去バージョンの参照、差分の確認、ロールバックなど
5. **CI/CD の高度化**
   - GitHub Actions で Pull Request ごとに一時環境を自動構築する、など

---

## 6. まとめ

- **ローカル開発**: Docker で DynamoDB Local、Serverless Offline、モック認証を用意し、素早い実装とテストが可能。
- **本番運用**: Cognito + DynamoDB + Lambda + API Gateway + (S3/CloudFront or Amplify) でサーバーレス構成を実現。
- **デプロイフロー**: Git ブランチ (feature → develop → main) と対になる環境 (local → dev → prod) を想定。

> 何か不明点や追加機能のリクエストがあれば、Issue や Pull Request で検討していきましょう。

以上が本プロジェクトの概要と環境別の立ち上げ手順です。  