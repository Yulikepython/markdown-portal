import * as express from "express";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string; // 必要に応じて型定義を追加
            };
        }
    }
}
