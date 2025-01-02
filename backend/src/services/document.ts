// src/services/document.ts

import {
    DynamoDBClient,
    GetItemCommand,
    PutItemCommand,
    QueryCommand,
    DeleteItemCommand,
    UpdateItemCommand,
    ReturnValue
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

// インターフェースの定義
export interface Document {
    userId: string;
    slug: string;
    content: string;
    isPublic: boolean;
}

// 環境変数の取得と型定義
const isOffline: boolean = process.env.IS_OFFLINE === 'true';
const tableName: string = process.env.DYNAMO_TABLE_NAME || "";

// DynamoDB クライアントの設定
const dynamoClient = new DynamoDBClient({
    region: "ap-northeast-1",
    endpoint: isOffline ? process.env.LOCAL_DYNAMO_ENDPOINT : undefined,
});

export class DocumentServiceDynamo {
    /**
     * 新規ドキュメントの作成
     * @param content ドキュメントの内容
     * @param userId ユーザーID
     * @returns 作成されたドキュメント
     */
    static async createDocument(content: string, userId: string): Promise<Document> {
        const slug = uuidv4();
        const newDoc: Document = {
            userId,
            slug,
            content,
            isPublic: false,
        };

        const params = {
            TableName: tableName,
            Item: {
                userId: { S: newDoc.userId },
                slug: { S: newDoc.slug },
                content: { S: newDoc.content },
                isPublic: { BOOL: newDoc.isPublic },
            },
        };

        await dynamoClient.send(new PutItemCommand(params));
        return newDoc;
    }

    /**
     * ユーザーのドキュメント一覧取得
     * @param userId ユーザーID
     * @returns ユーザーが所有するドキュメントの配列
     */
    static async getDocumentsByOwnUser(userId: string): Promise<Document[]> {
        const params = {
            TableName: tableName,
            KeyConditionExpression: "userId = :uid",
            ExpressionAttributeValues: {
                ":uid": { S: userId },
            },
        };

        const command = new QueryCommand(params);
        const result = await dynamoClient.send(command);
        return result.Items?.map(item => ({
            userId: item.userId.S!,
            slug: item.slug.S!,
            content: item.content.S!,
            isPublic: item.isPublic.BOOL!,
        })) || [];
    }

    /**
     * slug と userId でドキュメント取得
     * @param slug ドキュメントのスラッグ
     * @param userId ユーザーID
     * @returns ドキュメントまたは null
     */
    static async getDocumentBySlugAndUserId(slug: string, userId: string): Promise<Document | null> {
        const params = {
            TableName: tableName,
            Key: {
                userId: { S: userId },
                slug: { S: slug },
            },
        };

        const command = new GetItemCommand(params);
        const result = await dynamoClient.send(command);
        if (!result.Item) return null;

        return {
            userId: result.Item.userId.S!,
            slug: result.Item.slug.S!,
            content: result.Item.content.S!,
            isPublic: result.Item.isPublic.BOOL!,
        };
    }

    /**
     * 公開ドキュメントを slug で取得
     * @param slug ドキュメントのスラッグ
     * @returns ドキュメントまたは null
     */
    static async getPublicDocumentBySlug(slug: string): Promise<Document | null> {
        const params = {
            TableName: tableName,
            IndexName: "SlugIndex",
            KeyConditionExpression: "slug = :s",
            FilterExpression: "isPublic = :p",
            ExpressionAttributeValues: {
                ":s": { S: slug },
                ":p": { BOOL: true },
            },
        };

        const command = new QueryCommand(params);
        const result = await dynamoClient.send(command);
        if (result.Items && result.Items.length > 0) {
            const item = result.Items[0];
            return {
                userId: item.userId.S!,
                slug: item.slug.S!,
                content: item.content.S!,
                isPublic: item.isPublic.BOOL!,
            };
        }
        return null;
    }

    /**
     * ドキュメントの更新
     * @param slug ドキュメントのスラッグ
     * @param content 更新する内容（nullの場合は更新しない）
     * @param userId ユーザーID
     * @param isPublic 公開フラグ
     * @returns 更新されたドキュメントまたは null
     */
    static async updateDocument(slug: string, content: string | null, userId: string, isPublic: boolean): Promise<Document | null> {
        let updateExpression = "";
        const expressionAttributeValues: { [key: string]: any } = {
            ":p": { BOOL: isPublic },
        };

        if (content !== null) {
            updateExpression = "set isPublic = :p, content = :c";
            expressionAttributeValues[":c"] = { S: content };
        } else {
            updateExpression = "set isPublic = :p";
        }

        const params = {
            TableName: tableName,
            Key: {
                userId: { S: userId },
                slug: { S: slug },
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: ReturnValue.ALL_NEW,
        };

        try {
            const command = new UpdateItemCommand(params);
            const result = await dynamoClient.send(command);
            if (result.Attributes) {
                return {
                    userId: result.Attributes.userId.S!,
                    slug: result.Attributes.slug.S!,
                    content: result.Attributes.content.S!,
                    isPublic: result.Attributes.isPublic.BOOL!,
                };
            }
            return null;
        } catch (error) {
            console.error("Error updating document:", error);
            return null;
        }
    }

    /**
     * ドキュメントの削除
     * @param slug ドキュメントのスラッグ
     * @param userId ユーザーID
     * @returns 削除に成功した場合は true、失敗した場合は false
     */
    static async deleteDocument(slug: string, userId: string): Promise<boolean> {
        const params = {
            TableName: tableName,
            Key: {
                userId: { S: userId },
                slug: { S: slug },
            },
        };

        try {
            const command = new DeleteItemCommand(params);
            await dynamoClient.send(command);
            return true;
        } catch (error) {
            console.error("Error deleting document:", error);
            return false;
        }
    }

    /**
     * ドキュメントが存在するか確認
     * @param slug ドキュメントのスラッグ
     * @param userId ユーザーID
     * @returns 存在する場合は true、存在しない場合は false
     */
    static async isDocumentExist(slug: string, userId: string): Promise<boolean> {
        const doc = await this.getDocumentBySlugAndUserId(slug, userId);
        return doc !== null;
    }
}
