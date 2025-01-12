// backend/src/middlewares/authLocal.ts
import { Request, Response, NextFunction } from "express";

export const sampleUseId = "local-user-1234";

/**
 * ローカル開発用: 署名検証をスキップし、固定ユーザーでログイン済みとみなす例
 */
export function authenticateLocalUser(
    req: Request,
    res: Response,
    next: NextFunction
) {
    // 任意のユーザーIDを仮設定
    req.user = { id: sampleUseId };
    next();
}
