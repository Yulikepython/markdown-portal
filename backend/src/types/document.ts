/**
 * DynamoDBに保存するドキュメントの型定義例。
 * 将来的にdocMetadataにJSON形式の追加情報を入れていく想定。
 */
export interface Document {
    id: number;
    content: string;
    isPublic: boolean;
    slug: string;
    userId: string;
    schemaVersion: number;

    /**
     * 将来拡張用: JSON形式で任意のデータを保存できる
     * 例: { docVersion: 3, tags: ["tech", "aws"], ... } など
     */
    docMetadata?: Record<string, unknown>;
}
