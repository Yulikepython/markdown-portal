# markdown-portal

本リポジトリは、Markdown ドキュメントの作成・編集・公開を行うための **フロントエンド + バックエンド** プロジェクトです。  
- **フロントエンド**: Vite + React をベースに、Markdownエディタや認証機能、UI等を提供  
- **バックエンド**: AWS Lambda (Node.js) + API Gateway + DynamoDB のサーバーレス構成

---

## 1. 主な機能と特徴

1. **Markdown ドキュメントの作成・編集・公開**  
   - React (フロントエンド) による WYSIWYG ベースの Markdown エディタを提供  
   - 作成した Markdown は DynamoDB に保存され、必要に応じて「公開」(任意URLで誰でも閲覧可) に設定できます。

2. **ユーザー認証と権限制御**  
   - ログインしていないユーザーには編集権限を与えず、ログイン済みユーザーが自分のドキュメントを管理可能。  
   - Amazon Cognito (User Pool) と JWT (IDトークン) を利用し、バックエンド側で検証・制御。  
   - ローカル開発時は「モック認証」(userId固定) で手軽に動作確認ができます。

3. **サーバーレス構成**  
   - バックエンドは AWS Lambda + API Gateway + DynamoDB + (Cognito)。  
   - Serverless Framework を用いたデプロイフローを想定し、S3/CloudFront や Amplify Hosting 上でフロントエンドを提供できます。

4. **ローカル開発が容易**  
   - Docker 上の DynamoDB Local + serverless-offline + モック認証で完結するため、AWSリソースを消費せずに開発・テストが可能です。

---

## 2. セットアップ手順

### 2.1 ローカル環境（オフラインモード）

#### (1) 前提
- Node.js (推奨: v18 以降)
- Docker (推奨: Docker Desktop 最新)  
  → `amazon/dynamodb-local` イメージを使用

#### (2) フロントエンドの起動

```bash
cd markdown-portal/frontend
npm install
npm run dev:offline
```

- `VITE_API_STAGE=local` が指定され、モック認証が有効になります。
- ブラウザで `http://localhost:5173` にアクセスするとアプリを確認できます。

#### (3) バックエンドの起動 (Serverless Offline + DynamoDB Local)

1. **DynamoDB Local** を起動:
   ```bash
   docker run -p 8888:8000 amazon/dynamodb-local
   ```
2. **依存パッケージのインストール & ビルド**:
   ```bash
   cd markdown-portal/backend
   npm install
   npm run build
   ```
3. **テーブル作成 + サンプルデータ投入**:
   ```bash
   npm run create-local-tables
   ```
   - `dist/scripts/createLocalTables.js` により DynamoDB テーブルが作成されます。
4. **Serverless Offline 起動**:
   ```bash
   npm run start:offline
   ```
   - `serverless offline --stage local` により、`http://localhost:3000/local/api/...` でAPIが利用可能です。

#### (4) 動作確認

```bash
# テーブル一覧を確認
aws dynamodb list-tables --endpoint-url http://localhost:8888

# ドキュメント一覧を取得 (GET)
curl http://localhost:3000/local/api/docs
```

- ローカル認証では `userId=local-user-1234` として扱われます。

---

### 2.2 開発ステージ (dev) へのデプロイ

#### (1) 前提
- AWS アカウントに対して DynamoDB / Lambda / API Gateway 等のIAM権限を所持
- `serverless` CLI (グローバルインストール推奨)
- `.env.dev` 等のステージ別設定を用意

#### (2) フロントエンド (dev) のビルド & デプロイ

```bash
cd markdown-portal/frontend
npm install
npm run build  # --mode develop等を使う場合も可

# 出力された dist/ フォルダを S3 にアップロードする例:
aws s3 sync dist s3://<YOUR-S3-BUCKET-FOR-DEV> --delete
```

- CloudFront などを使う場合は、Invalidation 等が別途必要です。

#### (3) バックエンド (dev) デプロイ

```bash
cd markdown-portal/backend
npm install
npx serverless deploy --stage dev
```

- デプロイ成功後に出力される API Endpoint を、フロントエンド `.env.dev` 等で設定します。

---

### 2.3 本番ステージ (prod) へのデプロイ

#### (1) フロントエンド
```bash
cd markdown-portal/frontend
npm install
npm run build:prod
aws s3 sync dist s3://<YOUR-PROD-BUCKET> --delete
# または Amplify Hosting, CloudFront等でホスティング
```

#### (2) バックエンド
```bash
cd markdown-portal/backend
npx serverless deploy --stage prod
```

- デプロイ後に本番用の API Endpoint が有効となり、フロントエンドから利用可能です。

---

## 3. テスト方法

### 3.1 フロントエンドテスト

- React Testing Library + Vitest / Jest 等を使用
  ```bash
  cd markdown-portal/frontend
  npm run test
  ```

### 3.2 バックエンドテスト

- Jest によるユニット/統合テスト
  ```bash
  cd markdown-portal/backend
  npm run test
  ```
- Serverless Offline 環境で `supertest` や `curl` などを使い、実際にAPIを呼ぶテストも可能です。

---

## 4. 環境変数 (.env) について

フロントエンド側では `VITE_` プレフィックス付き変数が中心です:

- **VITE_API_STAGE**
   - `local` → ローカル開発モード (例: `http://localhost:3000/local/api`)
   - `dev` → 開発ステージ (API Gatewayの `/dev/api`)
   - `prod` → 本番ステージ (API Gatewayの `/prod/api`)

- **REACT_APP_USE_MOCK_AUTH**
   - `"true"` の場合、オフライン用のモック認証が有効となり、ローカル環境で手軽にログイン状態を再現できます。

- **VITE_COGNITO_DOMAIN / VITE_COGNITO_CLIENT_ID / VITE_COGNITO_USER_POOL_ID / VITE_COGNITO_REGION**
   - Cognito User Pool 関連の設定 (ドメイン, クライアントID, ユーザープールID, リージョン等)

- **VITE_SIGNIN_URL / VITE_SIGNOUT_URL**
   - Cognito 認証後のリダイレクト先URL (サインイン / サインアウト時)

---

## 5. 開発フロー上の注意点

1. **Gitブランチとステージ**
   - feature ブランチ → ローカルDynamoDB で動作確認
   - develop ブランチ → devステージ (AWS) へ随時デプロイ
   - main ブランチ → prodステージ (AWS) へ本番デプロイ

2. **デプロイ時の確認事項**
   - `serverless.yml` の `stage` / `DYNAMO_TABLE_NAME` や `.env.*` の設定
   - Cognito リソース (User Pool ID / Client ID) が正しいか
   - Amplify / S3 / CloudFront の設定見直し

3. **セキュリティ**
   - JWT トークン検証を必ずバックエンドで実行し、所有者以外はドキュメントを操作できないよう制御
   - 公開しないドキュメント (`isPublic=false`) は認証必須として扱う

---

## 6. 個人情報の取扱いポリシー

当プロジェクトでは、以下の個人情報を収集・保持する場合があります。

- **ユーザーID**: 内部的なユーザー識別・権限管理
- **メールアドレス**: ログイン通知やパスワードリセットなどで必要な連絡手段

### 6.1 個人情報の削除

- **6カ月以上ログインがない場合**  
  管理者は、データ保持ポリシーに基づき、6カ月以上ログイン実績のないアカウントを **事前通知なし** で削除できるものとします。
   - 削除には、ユーザーID・メールアドレス・作成したドキュメントを含む関連データがすべて含まれます。

### 6.2 問い合わせ窓口

個人情報の取扱いや削除ポリシーに関して、疑問・要望などありましたら、リポジトリの Issue もしくは管理者宛にご連絡ください。

---

## 7. まとめ

- **ローカル開発**: Docker上の DynamoDB Local + serverless-offline + モック認証を利用し、素早い開発・テストが可能
- **本番運用**: Cognito + DynamoDB + Lambda + API Gateway + (S3/CloudFront / Amplify) を組み合わせたサーバーレス構成
- **デプロイフロー**: Git ブランチを (local → dev → prod) の各ステージと対応させ、CI/CD を構築して運用

以上が当プロジェクトの概要と環境別の立ち上げ手順です。ご質問や不明点などあれば、Issue や Pull Request を通じてお寄せください。