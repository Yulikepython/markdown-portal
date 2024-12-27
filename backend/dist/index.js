"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const express_1 = __importDefault(require("express"));
const serverless_http_1 = __importDefault(require("serverless-http"));
// Express アプリを作成
const app = (0, express_1.default)();
app.use(express_1.default.json());
// サンプルデータ
const documents = [
    { id: "1", title: "First Document", content: "This is the first document.", userId: "user1" },
    { id: "2", title: "Second Document", content: "This is the second document.", userId: "user2" },
];
// APIルート
app.get("/api/docs", (req, res) => {
    res.json(documents);
});
app.get("/api/docs/:id", (req, res) => {
    const doc = documents.find((d) => d.id === req.params.id);
    if (doc) {
        const isOwner = req.user?.id === doc.userId; // 所有者判定
        res.json({ ...doc, isOwner });
    }
    else {
        res.status(404).json({ message: "Document not found" });
    }
});
app.post("/api/docs", (req, res) => {
    const { title, content } = req.body;
    const newDoc = {
        id: (documents.length + 1).toString(),
        title,
        content,
        userId: req.user?.id || "unknown", // 所有者を設定。認証未実装の場合は "unknown" を使用
    };
    documents.push(newDoc);
    res.status(201).json(newDoc);
});
app.put("/api/docs/:id", (req, res) => {
    const { title, content } = req.body;
    const doc = documents.find((d) => d.id === req.params.id);
    if (doc) {
        doc.title = title;
        doc.content = content;
        res.json(doc);
    }
    else {
        res.status(404).json({ message: "Document not found" });
    }
});
app.delete("/api/docs/:id", (req, res) => {
    const index = documents.findIndex((d) => d.id === req.params.id);
    if (index !== -1) {
        documents.splice(index, 1);
        res.status(204).end();
    }
    else {
        res.status(404).json({ message: "Document not found" });
    }
});
// Lambdaハンドラーを作成
exports.handler = (0, serverless_http_1.default)(app);
