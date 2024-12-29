import express, {Request, Response} from 'express';
import serverlessHttp from 'serverless-http';
import { Handler } from 'aws-lambda';
import { authenticateUser } from './middlewares/auth';
import { DocumentController } from './controllers/document';

const app = express();
app.use(express.json());
app.use((req: Request, res: Response, next) => authenticateUser(req, res, next));

/** 一覧表示（ユーザー所有のみ） */
app.get("/api/docs", (req: Request, res: Response) => {
    DocumentController.getDocumentsOfLoggedInUser(req, res).then();
});

/** slug指定 & 所有のみ */
app.get("/api/docs/:slug", (req: Request, res: Response) => {
    DocumentController.getDocumentBySlugOfLoggedInUser(req, res).then();
});

/** 公開ドキュメント */
app.get("/api/documents/:slug", (req: Request, res: Response) => {
    DocumentController.getDocumentBySlugOfPublic(req, res).then();
});

/** 新規作成 */
app.post("/api/docs", (req: Request, res: Response) => {
    DocumentController.createDocument(req, res).then();
});

/** 更新 */
app.put("/api/docs/:slug", (req: Request, res: Response) => {
    DocumentController.updateDocument(req, res).then();
});

/** 削除 */
app.delete("/api/docs/:slug", (req: Request, res: Response) => {
    DocumentController.deleteDocument(req, res).then();
});

export const handler: Handler = serverlessHttp(app) as Handler;