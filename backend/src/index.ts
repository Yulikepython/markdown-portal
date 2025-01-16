// backend/src/index.ts
import express from "express";
import serverlessHttp from "serverless-http";
import { Handler } from "aws-lambda";
import { authenticateUser } from "./middlewares/authIndex";  // ←ここだけimport
import { DocumentController } from "./controllers/document";

/**
 * CORS用カスタムミドルウェア
 *  - すべてのレスポンスに Access-Control-Allow-Origin を付加する
 */
function attachCorsHeaders(req: express.Request, res: express.Response, next: express.NextFunction) {
    // レスポンスヘッダーを付与
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amzn-Trace-Id');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    next();
}

export const app = express();

// ❶ グローバルにCORSヘッダー付与
app.use(attachCorsHeaders);

app.use(express.json());

// =====================
// 認証不要ルート
// =====================
app.get("/api/documents/:slug", DocumentController.getDocumentBySlugOfPublic);


// =====================
// 認証が必要なルート
// =====================
app.get("/api/docs", authenticateUser, DocumentController.getDocumentsOfLoggedInUser);
app.get("/api/docs/:slug", authenticateUser, DocumentController.getDocumentBySlugOfLoggedInUser);
// @ts-ignore
app.post("/api/docs", authenticateUser, DocumentController.createDocument);
// @ts-ignore
app.put("/api/docs/:slug", authenticateUser, DocumentController.updateDocument);
app.delete("/api/docs/:slug", authenticateUser, DocumentController.deleteDocument);

export const handler: Handler = serverlessHttp(app) as Handler;