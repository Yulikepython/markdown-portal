// backend/src/middlewares/jwksCache.ts

import axios from "axios";
import jwkToPem from "jwk-to-pem";

/**
 * Cognito の User Pool ID 等を環境変数から取得
 */
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || "";
const REGION = process.env.AWS_REGION || "ap-northeast-1";

const JWKS_URL = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`;


/**
 * { kid: string, pem: string } の配列をキャッシュする
 */
let pemsCache: Record<string, string> | null = null;

/**
 * JWKS を取得してキャッシュする
 */
async function fetchJwksAndCache(): Promise<Record<string, string>> {
    if (pemsCache) {
        // 既にキャッシュがあればそれを返す
        return pemsCache;
    }
    try {
        const response = await axios.get(JWKS_URL);
        const { keys } = response.data; // keys: JWK配列
        const pems: Record<string, string> = {};

        for (const jwk of keys) {
            // kidごとに pem を生成
            const pem = jwkToPem(jwk);
            pems[jwk.kid] = pem;
        }
        pemsCache = pems;
        return pems;
    } catch (err) {
        console.error("[jwksCache] Error fetching JWKS:", err);
        return {};
    }
}

/**
 * kid に対応する PEM を取得（なければ null）
 */
export async function getPemForKid(kid: string): Promise<string | null> {
    const pems = await fetchJwksAndCache();
    return pems[kid] || null;
}

/**
 * 必要に応じて「キャッシュをクリア」する関数
 *  - 例: 新しい鍵にローテーションした場合など
 */
export function clearJwksCache() {
    pemsCache = null;
}
