// test/scripts/createLocalTables.test.ts

// @ts-ignore
import request from 'supertest';
import { app } from '../src';

jest.mock('../src/services/document');

describe('createLocalTables script tests', () => {
    beforeAll(() => {
        process.env.DYNAMO_TABLE_NAME = 'TestDocumentsTable';
        process.env.IS_OFFLINE = 'true';
        process.env.LOCAL_DYNAMO_ENDPOINT = 'http://localhost:8888';
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('GET /api/docs should return 200', async () => {
        // ※ テーブルが存在しない場合は 500 になるかも
        // 事前に createLocalTables.main() を実行するか、
        // DynamoDB をモックにするか、適宜調整
        const result = await request(app)
            .get('/api/docs')
            .set('x-user-id', 'testUserId');

        expect(result.status).toBe(200); // もし実際は 500 ならDynamoDB未構築の可能性
        // expect(result.body).toEqual([]);
    });
});
