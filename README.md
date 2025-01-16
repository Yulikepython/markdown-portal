# markdown-portal

本リポジトリは、Markdown ドキュメントの作成・編集・公開を行うための **フロントエンド + バックエンド** プロジェクトです。

- **フロントエンド**: Vite + React をベースに、Markdownエディタや認証機能、UI等を提供
- **バックエンド**: AWS Lambda (Node.js) + API Gateway + DynamoDB のサーバーレス構成

## 主な特徴

- **Markdown ドキュメントの作成・編集・公開**  
  React (フロントエンド) による WYSIWYG ベースの Markdown エディタを提供。  
  作成した Markdown は DynamoDB に保存し、必要に応じて「公開」(URL で誰でも閲覧) に設定できます。

- **ユーザー認証と権限制御**  
  ログインしていないユーザーには編集権限を与えず、ログイン済みユーザーが自分のドキュメントを管理可能。  
  Amazon Cognito (User Pool) と JWT (IDトークン) を利用し、バックエンド側で検証・制御。  
  ローカル開発時は「モック認証」(userId固定) で手軽に動作確認が可能です。

- **サーバーレス構成**  
  AWS Lambda + API Gateway + DynamoDB + Cognito。  
  Serverless Framework を用いたデプロイフローを想定し、S3/CloudFront や Amplify Hosting 上でフロントエンドを提供できます。

- **ローカル開発が容易**  
  Docker 上の DynamoDB Local + serverless-offline + モック認証で完結するため、AWSリソースを消費せず開発・テスト可能です。

---

## クイックスタート: ローカル環境

### 前提

- Node.js (推奨: v18 以降)
- Docker (推奨: Docker Desktop 最新)  
  → `amazon/dynamodb-local` イメージを使用

### フロントエンドの起動 (オフラインモード)

```bash
# リポジトリをクローン後:
cd markdown-portal/frontend
npm install
npm run dev:offline
```

- `VITE_API_STAGE=local` が指定され、モック認証が有効になります。
- ブラウザで `http://localhost:5173` にアクセスするとアプリを確認できます。

### バックエンドの起動 (Serverless Offline + DynamoDB Local)

1. **DynamoDB Local** を起動
   ```bash
   docker run -p 8888:8000 amazon/dynamodb-local
   ```
2. **Serverless Offline 起動**
ローカル環境に DynamoDB テーブルを作成し、サンプルデータを投入し、APIを起動します。
   ```bash
   cd markdown-portal/backend
   npm install
   npm run dev
   ```
3. **テーブル作成 + サンプルデータ投入**
npm run devコマンドに含まれていますが、個別に実行する場合は以下のコマンドを実行してください。
   ```bash
   npm run create-local-tables
   ```
    - `dist/scripts/createLocalTables.js` により DynamoDB テーブルが作成されます

### 動作確認

```bash
# テーブル一覧を確認
aws dynamodb list-tables --endpoint-url http://localhost:8888

# ドキュメント一覧を取得 (GET): 未認証状態のため、空の配列が返ります
curl http://localhost:3000/local/api/docs
```

- ローカル認証では `userId=local-user-1234` として扱われます。

---

## AWS 設定

### Cognito の設定

このプロジェクトを AWS 上で運用する場合は、**Cognito ユーザープール** と **アプリクライアント** を作成し、以下を行ってください。

1. **ユーザープール作成**
    - `username` として「メールアドレス」を使う設定でも、別々のユーザー名・メールアドレス設定でも構いません。
    - 「メールアドレス検証が必要」な設定の場合、新メールアドレスへの確認コード送信フローが有効になります。

2. **アプリクライアント (マネージドログイン画面) 設定**
    - コールバックURL（SignIn URL, SignOut URL）をフロントエンドホスト先に合わせて設定
    - クライアントID・ドメインプレフィックス等を `.env` ファイルに記述し、フロントエンドの `amplifyConfigure.ts` などで読み込む

#### ユーザープール > サインアップ 例

![signup-setting-example](https://github.com/user-attachments/assets/772ca7c1-3001-4e3e-b736-817de64de96e)

#### マネージドログイン画面設定 例

![hosted-ui-example](https://github.com/user-attachments/assets/a34e2bfc-741f-4b88-817f-dc519f95658d)

※ 具体的な設定画面は AWS コンソールのバージョンによって異なる場合があります。

---

### DynamoDB テーブル設計

#### バックアップの設定
Issue #38 にて、DynamoDB テーブルのバックアップ設定について証跡等保存してます。
当アプリでは、PITRを有効にし、データを保護しています。
![](https://github.com/user-attachments/assets/15698408-b973-40dc-9fa0-1eb2a56a6078)

## GitのSecrets管理
Secretsの一覧画像は以下のとおりです。
![](https://github.com/user-attachments/assets/0fdb1c27-fd3e-483a-85eb-d977ab34c251)

## デプロイ: 開発ステージ (dev)

### 前提

- AWS アカウントに対して DynamoDB / Lambda / API Gateway 等の IAM 権限を所持
- `serverless` CLI (グローバルインストール推奨)
- `.env.dev` 等のステージ別設定を用意 (Cognito, API Gateway のエンドポイントなど)

### フロントエンド (dev) のビルド & デプロイ

```bash
cd markdown-portal/frontend
npm install
npm run build  # --mode develop等を使う場合も可

# 出力された dist/ フォルダを S3 にアップロードする例:
aws s3 sync dist s3://<YOUR-S3-BUCKET-FOR-DEV> --delete
```

- CloudFront などを使う場合は、Invalidation 等の作業が必要です。

### バックエンド (dev) デプロイ

```bash
cd markdown-portal/backend
npm install
npx serverless deploy --stage dev
```

- デプロイ成功後に出力される API Endpoint を、フロントエンド `.env.dev` 等で設定し直してください。
- フロントエンドからのリクエスト先が正しく `/dev/api` を指すようにします。

---

## デプロイ: 本番ステージ (prod)

### フロントエンド

```bash
cd markdown-portal/frontend
npm install
npm run build:prod
aws s3 sync dist s3://<YOUR-PROD-BUCKET> --delete
# または Amplify Hosting, CloudFront 等でホスティング
```

### バックエンド

```bash
cd markdown-portal/backend
npx serverless deploy --stage prod
```

- デプロイ後に出力される API Endpoint をフロントエンドに設定してください。

---

## テスト方法

### フロントエンドテスト

React Testing Library + Vitest / Jest 等を使用
```bash
cd markdown-portal/frontend
npm run test
```

### バックエンドテスト

Jest によるユニット/統合テストを実装済み
```bash
cd markdown-portal/backend
npm run test
```
- serverless-offline 環境で `supertest` や `curl` を使い、実際に API を呼ぶテストも可能です。

---

## 環境変数 (.env) について

フロントエンド側では `VITE_` プレフィックス付き変数が中心です:

- **VITE_API_STAGE**  
  `local` → ローカル開発モード (`http://localhost:3000/local/api`)  
  `dev` → 開発ステージ (API Gatewayの `/dev/api`)  
  `prod` → 本番ステージ (API Gatewayの `/prod/api`)

- **REACT_APP_USE_MOCK_AUTH**  
  `"true"` の場合、オフライン用のモック認証が有効になり、ローカル環境でログイン状態を再現できます。

- **VITE_COGNITO_DOMAIN / VITE_COGNITO_CLIENT_ID / VITE_COGNITO_USER_POOL_ID / VITE_COGNITO_REGION**  
  Cognito User Pool 関連の設定 (ドメイン, クライアントID, ユーザープールID, リージョン等)

- **VITE_SIGNIN_URL / VITE_SIGNOUT_URL**  
  Cognito 認証後のリダイレクト先URL (サインイン / サインアウト時)

その他バックエンド用にも、`serverless.yml` や `.env.dev`, `.env.prod` などを併用してください。

---

## 開発フロー上の注意点

- **Gitブランチとステージ**
    - feature ブランチ → ローカル DynamoDB で動作確認
    - develop ブランチ → devステージ (AWS) へ随時デプロイ
    - main ブランチ → prodステージ (AWS) へ本番デプロイ

- **デプロイ時のチェックリスト**
    - `serverless.yml` の `stage` / `DYNAMO_TABLE_NAME` や `.env.*` の設定
    - Cognito リソース (User Pool ID / Client ID) が正しいか
    - Amplify / S3 / CloudFront の設定見直し

- **セキュリティ**
    - JWT トークン検証をバックエンドで行い、所有者以外はドキュメント操作を不可に
    - `isPublic=false` のドキュメントは認証必須にする

---

## 個人情報の取扱いポリシー

当プロジェクトでは、以下の個人情報を収集・保持する場合があります。

- **ユーザーID**: 内部的なユーザー識別・権限管理用
- **メールアドレス**: ログイン通知やパスワードリセットなどで必要な連絡手段

### 個人情報の削除

- **6カ月以上ログインがない場合**  
  管理者は、データ保持ポリシーに基づき、6カ月以上ログインのないアカウントを **事前通知なし** で削除する場合があります。  
  ユーザーID・メールアドレス・作成ドキュメントを含む関連データが削除対象です。

### 問い合わせ窓口

個人情報の取扱いや削除ポリシーに関する疑問・要望がある場合は、リポジトリの Issue もしくは管理者宛にご連絡ください。

---

## まとめ

- **ローカル開発**: Docker 上の DynamoDB Local + serverless-offline + モック認証で高速に開発
- **本番運用**: Cognito + DynamoDB + Lambda + API Gateway + (S3/CloudFront / Amplify) などでサーバーレス運用
- **デプロイフロー**: Git ブランチ (local → dev → prod) に応じて CI/CD などを構築可能

ご質問や不明点があれば、Issue や Pull Request を通じてお気軽にお寄せください。  