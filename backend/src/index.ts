// backend/src/index.ts
import express from "express";
import serverlessHttp from "serverless-http";
import { Handler } from "aws-lambda";
import { authenticateUser } from "./middlewares/authIndex";  // ←ここだけimport

import { DocumentController } from "./controllers/document";


const app = express();
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