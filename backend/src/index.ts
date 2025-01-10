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
app.use(authenticateUser); // ローカル:モック or JWT検証

// ルート定義例
app.get("/api/docs", DocumentController.getDocumentsOfLoggedInUser);
app.get("/api/docs/:slug", DocumentController.getDocumentBySlugOfLoggedInUser);
// @ts-ignore
app.post("/api/docs", DocumentController.createDocument);
// @ts-ignore
app.put("/api/docs/:slug", DocumentController.updateDocument);
app.delete("/api/docs/:slug", DocumentController.deleteDocument);

app.get("/api/documents/:slug", DocumentController.getDocumentBySlugOfPublic);

export const handler: Handler = serverlessHttp(app) as Handler;