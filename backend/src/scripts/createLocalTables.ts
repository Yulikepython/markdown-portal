// src/scripts/createLocalTables.ts

import { DynamoDBClient, CreateTableCommand, DescribeTableCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import * as fs from 'fs';
import * as path from 'path';
import { documents } from '../models/document';  // <= 追加: サンプルデータ
import { Document } from '../types/document';     // <= 追加

const isOffline: boolean = process.env.IS_OFFLINE === 'true';
const tableDefinitionPath = path.resolve(__dirname, '../../dynamodb-table-definition.json');
const tableDefinition = JSON.parse(fs.readFileSync(tableDefinitionPath, 'utf-8'));

const dynamoClient = new DynamoDBClient({
    region: "ap-northeast-1",
    endpoint: isOffline ? process.env.LOCAL_DYNAMO_ENDPOINT : undefined, // ここも調整
});

async function createTable() {
    try {
        const describeCommand = new DescribeTableCommand({ TableName: tableDefinition.TableName });
        await dynamoClient.send(describeCommand);
        console.log(`Table "${tableDefinition.TableName}" already exists.`);
    } catch (error: any) {
        if (error.name === "ResourceNotFoundException") {
            try {
                const createCommand = new CreateTableCommand(tableDefinition);
                const result = await dynamoClient.send(createCommand);
                console.log("Table created successfully:", result.TableDescription?.TableName);
            } catch (createError: any) {
                console.error("Error creating table:", createError);
            }
        } else {
            console.error("Error describing table:", error);
        }
    }
}

// 「重複しないように ConditionExpression を使う」例
async function putIfNotExists(doc: Document) {
    try {
        const params = {
            TableName: tableDefinition.TableName,
            Item: {
                userId: { S: doc.userId },
                slug:   { S: doc.slug },
                content: { S: doc.content },
                isPublic: { BOOL: doc.isPublic },
            },
            // すでに userId+slug が存在する場合は上書きしない
            ConditionExpression: "attribute_not_exists(userId) AND attribute_not_exists(slug)",
        };
        await dynamoClient.send(new PutItemCommand(params));
        console.log(`Inserted doc slug=${doc.slug} userId=${doc.userId}`);
    } catch (error: any) {
        if (error.name === "ConditionalCheckFailedException") {
            console.log(`Doc already exists (slug=${doc.slug}, userId=${doc.userId}). Skipping.`);
        } else {
            console.error("Error putting doc:", error);
        }
    }
}

async function insertDefaultDocuments() {
    for (const doc of documents) {
        await putIfNotExists(doc);
    }
}

async function main() {
    await createTable();
    // テーブルが作成済み or 既に存在するなら、デフォルトデータ投入
    await insertDefaultDocuments();
}

main();
