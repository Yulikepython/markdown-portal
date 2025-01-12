// src/scripts/createLocalTables.ts

import { DynamoDBClient, CreateTableCommand, DescribeTableCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import * as fs from 'fs';
import * as path from 'path';
import { documents } from '../models/document';  // <= 追加: サンプルデータ
import { Document } from '../types/document';     // <= 追加
import { DocumentServiceDynamo } from '../services/document'; // <= 追加

const isOffline: boolean = process.env.IS_OFFLINE === 'true';


export function getTableDefinition(): any {
  const tableDefinitionPath = path.resolve(__dirname, '../../dynamodb-table-definition.json');
  const raw = fs.readFileSync(tableDefinitionPath, 'utf-8');
  const json = JSON.parse(raw);
  json.TableName = process.env.DYNAMO_TABLE_NAME || json.TableName;
  return json;
}

const dynamoClient = new DynamoDBClient({
    region: process.env.MY_AWS_REGION,
    endpoint: isOffline ? process.env.DYNAMO_ENDPOINT : undefined,
});

// 共通化: テーブル作成関数 (describe → create)
async function createTableIfNotExists(def: any) {
    const tableName = def.TableName;
    try {
        await dynamoClient.send(
            new DescribeTableCommand({ TableName: tableName })
        );
        console.log(`Table "${tableName}" already exists.`);
    } catch (error: any) {
        if (error.name === "ResourceNotFoundException") {
            try {
                const createCommand = new CreateTableCommand(def);
                const result = await dynamoClient.send(createCommand);
                console.log("Table created successfully:", result.TableDescription?.TableName);
            } catch (createError: any) {
                console.error(`Error creating table "${tableName}":`, createError);
            }
        } else {
            console.error(`Error describing table "${tableName}":`, error);
        }
    }
}

// 「重複しないように ConditionExpression を使う」例
async function putIfNotExists(doc: Document, tableDefinition: any) {
    try {
        const params = {
            TableName: tableDefinition.TableName,
            Item: {
                userId: { S: doc.userId },
                slug:   { S: doc.slug },
                content: { S: doc.content },
                isPublic: { BOOL: doc.isPublic },
                schemaVersion: { N: doc.schemaVersion.toString() },
                docMetadata: { S: JSON.stringify(doc.docMetadata ?? {})},
                createdAt: { S: doc.createdAt },
                updatedAt: { S: doc.updatedAt },
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

async function insertDefaultDocuments(tableDefinition: any) {
    for (const doc of documents) {
        await putIfNotExists(doc, tableDefinition);
    }
}

export async function main() {
    const tableDefinition = getTableDefinition();
    // 1) DocumentsTable の作成
    await createTableIfNotExists(tableDefinition);
    // 3) DocumentsTable にサンプルデータ挿入
    await insertDefaultDocuments(tableDefinition);
}

// ★テストでなく実行用なら、条件分岐で呼ぶ
if (require.main === module) {
    main().catch(err => {
        console.error(err);
        process.exit(1);
    });
}
