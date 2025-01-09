// src/services/document.ts

import {
    DynamoDBClient,
    GetItemCommand,
    PutItemCommand,
    QueryCommand,
    DeleteItemCommand,
    UpdateItemCommand,
    UpdateItemCommandOutput,
    ReturnValue
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

import { Document } from "../types/document";

export const CURRENT_SCHEMA_VERSION = 1.0;


// 環境変数の取得と型定義
const isOffline: boolean = process.env.IS_OFFLINE === 'true';
const tableName: string = process.env.DYNAMO_TABLE_NAME || "";

// DynamoDB クライアントの設定
const dynamoClient = new DynamoDBClient({
    region: process.env.MY_AWS_REGION,
    endpoint: isOffline ? process.env.DYNAMO_ENDPOINT : undefined, //@todo 要確認
});

export class DocumentServiceDynamo {
    // カウンター管理用テーブル名
    static readonly COUNTER_TABLE_NAME = "DocCounter";

    static async getNextAutoIncrementId(): Promise<number> {
        const tableName = DocumentServiceDynamo.COUNTER_TABLE_NAME; // "DocCounter"
        const pkValue = "docCounter";

        // 1) まず一度だけ putItem してみる (attribute_not_exists(pk) により既にあったらスキップ)
        //    → 何もなければ初期値 0 のレコードを作る
        try {
            await dynamoClient.send(
                new PutItemCommand({
                    TableName: tableName,
                    Item: {
                        pk: { S: pkValue },
                        counterValue: { N: "0" },
                    },
                    ConditionExpression: "attribute_not_exists(pk)",
                })
            );
            console.log("[getNextAutoIncrementId] Initialized docCounter=0");
        } catch (err: any) {
            if (err.name === "ConditionalCheckFailedException") {
                // すでに存在するならOK (スルー)
            } else {
                console.error(
                    "[getNextAutoIncrementId] PutItem (init docCounter) failed:",
                    err
                );
                // このエラーは致命的でないなら黙ってスルーでも可
            }
        }

        // 2) ADD で +1
        try {
            const updateParams = {
                TableName: tableName,
                Key: { pk: { S: pkValue } },
                UpdateExpression: "ADD counterValue :inc",
                ExpressionAttributeValues: {
                    ":inc": { N: "1" },
                },
                ReturnValues: ReturnValue.UPDATED_NEW,
            };

            const command = new UpdateItemCommand(updateParams);
            const result: UpdateItemCommandOutput = await dynamoClient.send(command);

            const updatedAttr = result.Attributes;
            const newValue = updatedAttr?.counterValue?.N;

            if (!newValue) {
                throw new Error("Failed to increment docCounter in DocCounter table.");
            }
            return parseInt(newValue, 10);
        } catch (err) {
            console.error("[getNextAutoIncrementId] Error incrementing docCounter:", err);
            throw err;
        }
    }

    /**
     * 新規ドキュメントの作成
     * @param content ドキュメントの内容
     * @param userId ユーザーID
     * @param isPublic 公開フラグ
     * @returns 作成されたドキュメント
     */
    static async createDocument(content: string, userId: string, isPublic: boolean): Promise<Document> {
        console.log('createDocument', content, userId, isPublic);
        const slug = uuidv4();
        const nextId = await DocumentServiceDynamo.getNextAutoIncrementId();
        const newDoc: Document = {
            id: nextId,
            userId,
            slug,
            content,
            isPublic: isPublic,
            schemaVersion: CURRENT_SCHEMA_VERSION,
            docMetadata: {},
        };

        const params = {
            TableName: tableName,
            Item: {
                id: { N: newDoc.id.toString() },
                userId: { S: newDoc.userId },
                slug: { S: newDoc.slug },
                content: { S: newDoc.content },
                isPublic: { BOOL: newDoc.isPublic },
                schemaVersion: { N: newDoc.schemaVersion.toString() },
                docMetadata: { S: JSON.stringify(newDoc.docMetadata)},
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
            id: Number(item.id.N),
            userId: item.userId.S!,
            slug: item.slug.S!,
            content: item.content.S!,
            isPublic: item.isPublic.BOOL!,
            schemaVersion: Number(item.schemaVersion.N),
            docMetadata: JSON.parse(item.docMetadata.S!),
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
            id: Number(result.Item.id.N),
            userId: result.Item.userId.S!,
            slug: result.Item.slug.S!,
            content: result.Item.content.S!,
            isPublic: result.Item.isPublic.BOOL!,
            schemaVersion: Number(result.Item.schemaVersion.N),
            docMetadata: JSON.parse(result.Item.docMetadata.S!),
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
                id: Number(item.id.N),
                userId: item.userId.S!,
                slug: item.slug.S!,
                content: item.content.S!,
                isPublic: item.isPublic.BOOL!,
                schemaVersion: Number(item.schemaVersion.N),
                docMetadata: JSON.parse(item.docMetadata.S!),
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
                    id: Number(result.Attributes.id.N),
                    userId: result.Attributes.userId.S!,
                    slug: result.Attributes.slug.S!,
                    content: result.Attributes.content.S!,
                    isPublic: result.Attributes.isPublic.BOOL!,
                    schemaVersion: Number(result.Attributes.schemaVersion.N),
                    docMetadata: JSON.parse(result.Attributes.docMetadata.S!),
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
}
