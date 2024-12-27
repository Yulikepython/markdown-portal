import { APIGatewayProxyHandler, Handler } from "aws-lambda";
import express, { Request, Response } from "express";
import serverlessHttp from "serverless-http";

// Express アプリを作成
const app = express();
app.use((req, res, next) => {
    const userId = req.headers['x-user-id'];
    req.user = userId ? { id: userId as string } : undefined;
    next();
});


interface Document {
    id: string;
    title: string;
    content: string;
    userId: string; // 所有者情報を追加
}


// サンプルデータ
const documents: Document[] = [
    { id: "1", title: "First Document", content: "This is the first document.", userId: "user1" },
    { id: "2", title: "Second Document", content: "This is the second document.", userId: "user2" },
];

// APIルート
app.get("/api/docs", (req: Request, res: Response) => {
    res.json(documents);
});

app.get("/api/docs/:id", (req: Request, res: Response) => {
    const doc = documents.find((d) => d.id === req.params.id);
    if (doc) {
        const isOwner = req.user?.id === doc.userId; // 所有者判定
        res.json({ ...doc, isOwner });
    } else {
        res.status(404).json({ message: "Document not found" });
    }
});

app.post("/api/docs", (req: Request, res: Response) => {
    const { title, content } = req.body;
    const newDoc: Document = {
        id: (documents.length + 1).toString(),
        title,
        content,
        userId: req.user?.id || "unknown", // 所有者を設定。認証未実装の場合は "unknown" を使用
    };
    documents.push(newDoc);
    res.status(201).json(newDoc);
});

app.put("/api/docs/:id", (req: Request, res: Response) => {
    const { title, content } = req.body;
    const doc = documents.find((d) => d.id === req.params.id);
    if (doc) {
        doc.title = title;
        doc.content = content;
        res.json(doc);
    } else {
        res.status(404).json({ message: "Document not found" });
    }
});

app.delete("/api/docs/:id", (req: Request, res: Response) => {
    const index = documents.findIndex((d) => d.id === req.params.id);
    if (index !== -1) {
        documents.splice(index, 1);
        res.status(204).end();
    } else {
        res.status(404).json({ message: "Document not found" });
    }
});

// Lambdaハンドラーを作成
export const handler: Handler = serverlessHttp(app) as Handler;