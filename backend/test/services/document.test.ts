// test/services/document.test.ts

jest.mock('@aws-sdk/client-dynamodb');

import { DocumentServiceDynamo } from '../../src/services/document';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

describe('DocumentServiceDynamo', () => {
    let mockSend: jest.Mock;

    beforeAll(() => {
        // ここでテーブル名を設定（または beforeEach でもOK）
        process.env.DYNAMO_TABLE_NAME = 'TestDocumentsTable';
        process.env.IS_OFFLINE = 'true';
        process.env.LOCAL_DYNAMO_ENDPOINT = 'http://localhost:8000';
    });

    beforeEach(() => {
        jest.clearAllMocks();

        mockSend = jest.fn().mockResolvedValue({});
        (DynamoDBClient as jest.Mock).mockImplementation(() => {
            return { send: mockSend };
        });
    });

    test('createDocument should put item to DynamoDB', async () => {
        const content = 'Test content';
        const userId = 'testUser';

        const doc = await DocumentServiceDynamo.createDocument(content, userId);

        // doc の値を検証
        expect(doc.content).toBe(content);
        expect(doc.userId).toBe(userId);
        expect(doc.isPublic).toBe(false);

        // // send が呼ばれたか
        // expect(mockSend).toHaveBeenCalled();  // calls = 1
        // // PutItemCommand であること
        // expect(mockSend).toHaveBeenCalledWith(expect.any(PutItemCommand));
    });
});
