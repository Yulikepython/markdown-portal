// backend/src/middlewares/authDynamicJwt.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getPemForKid } from "./jwksCache";

/**
 * (A) 環境変数から取得
 */
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || "";
const REGION = process.env.AWS_REGION || "ap-northeast-1";
const CLIENT_ID = process.env.COGNITO_CLIENT_ID || "";

/**
 * (B) issuer / audience を動的に組み立てる
 */
const VERIFY_OPTIONS: jwt.VerifyOptions = {
    algorithms: ["RS256"],
    issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`,
    audience: CLIENT_ID,
};

/**
 * JWT 検証関数（動的に JWKS を取得/キャッシュして pem を生成）
 */
async function verifyToken(token: string): Promise<jwt.JwtPayload | null> {
    try {
        // kid を取り出す
        const decodedHeader = jwt.decode(token, { complete: true }) as {
            header?: { kid?: string };
            payload?: any;
        };
        if (!decodedHeader?.header?.kid) {
            console.error("[authDynamicJwt] No 'kid' in JWT header");
            return null;
        }

        // kid に対応する pem を取得
        const pem = await getPemForKid(decodedHeader.header.kid);
        if (!pem) {
            console.error("[authDynamicJwt] No matching JWK found for kid:", decodedHeader.header.kid);
            return null;
        }

        // verify
        const verified = jwt.verify(token, pem, VERIFY_OPTIONS) as jwt.JwtPayload;
        return verified;
    } catch (err) {
        console.error("[authDynamicJwt] JWT verification error:", err);
        return null;
    }
}

/**
 * Middleware
 */
export async function authenticateDynamicJwt(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace(/^Bearer\s+/, "");

    if (!token) {
        res.status(401).json({ message: "No Bearer token" });
        return;
    }

    const payload = await verifyToken(token);
    if (!payload?.sub) {
        res.status(403).json({ message: "Invalid or expired token" });
        return;
    }

    req.user = { id: payload.sub };
    next();
}
