// src/scripts/createLocalTables.ts

import { DynamoDBClient, CreateTableCommand, DescribeTableCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import * as fs from 'fs';
import * as path from 'path';
import { documents } from '../models/document';  // <= 追加: サンプルデータ
import { Document } from '../types/document';     // <= 追加
import { DocumentServiceDynamo } from '../services/document'; // <= 追加

const isOffline: boolean = process.env.IS_OFFLINE === 'true';
const tableDefinitionPath = path.resolve(__dirname, '../../dynamodb-table-definition.json');

// --- DocCounter 定義をハードコードで用意 ---
const docCounterDefinition = {
    TableName: DocumentServiceDynamo.COUNTER_TABLE_NAME, // => "DocCounter"
    BillingMode: "PAY_PER_REQUEST",
    AttributeDefinitions: [{ AttributeName: "pk", AttributeType: "S" }],
    KeySchema: [{ AttributeName: "pk", KeyType: "HASH" }],
};


const tableDefinition = JSON.parse(fs.readFileSync(tableDefinitionPath, 'utf-8'));

tableDefinition.TableName = process.env.DYNAMO_TABLE_NAME || tableDefinition.TableName;

const dynamoClient = new DynamoDBClient({
    region: process.env.AWS_REGION,
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
async function putIfNotExists(doc: Document) {
    try {
        const params = {
            TableName: tableDefinition.TableName,
            Item: {
                id: { N: doc.id.toString() },
                userId: { S: doc.userId },
                slug:   { S: doc.slug },
                content: { S: doc.content },
                isPublic: { BOOL: doc.isPublic },
                schemaVersion: { N: doc.schemaVersion.toString() },
                docMetadata: { S: JSON.stringify(doc.docMetadata ?? {})},
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

// DocCounter を初期化する例 (pk=docCounter, counterValue=0)
async function initDocCounter() {
    try {
        const params = {
            TableName: docCounterDefinition.TableName,
            Item: {
                pk: { S: "docCounter" },
                counterValue: { N: "0" },
            },
            ConditionExpression: "attribute_not_exists(pk)",
        };
        await dynamoClient.send(new PutItemCommand(params));
        console.log(`Inserted initial docCounter=0`);
    } catch (error: any) {
        if (error.name === "ConditionalCheckFailedException") {
            console.log("docCounter already initialized. Skipping.");
        } else {
            console.error("Error putting docCounter item:", error);
        }
    }
}

async function insertDefaultDocuments() {
    for (const doc of documents) {
        await putIfNotExists(doc);
    }
}

async function main() {
    // 1) DocumentsTable の作成
    await createTableIfNotExists(tableDefinition);

    // 2) DocCounter の作成
    await createTableIfNotExists(docCounterDefinition);

    // 3) DocumentsTable にサンプルデータ挿入
    await insertDefaultDocuments();

    // 4) DocCounter を初期化 (必要なら)
    await initDocCounter();
}

// ★テストでなく実行用なら、条件分岐で呼ぶ
if (require.main === module) {
    main().catch(err => {
        console.error(err);
        process.exit(1);
    });
}
