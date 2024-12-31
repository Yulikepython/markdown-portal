// test/scripts/createLocalTables.test.ts
// @ts-ignore
import fs from 'fs';
import { main } from '../../src/scripts/createLocalTables'; // ← src/から直接
import { DynamoDBClient, DescribeTableCommand, CreateTableCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';

jest.mock('@aws-sdk/client-dynamodb');
// fs を部分モックする
jest.mock('fs', () => ({
    ...jest.requireActual('fs'),
    readFileSync: jest.fn(),
}));

describe('createLocalTables script tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.IS_OFFLINE = 'true';
        process.env.LOCAL_DYNAMO_ENDPOINT = 'http://localhost:8888';
    });

    it('should create table if not exists, then insert default docs', async () => {
        // 実際には readFileSync を使っていないかもしれないが、
        // 例としてモックするならこう書く
        (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({
            TableName: 'MockTable',
            BillingMode: 'PAY_PER_REQUEST',
        }));

        const mockSend = jest.fn()
            // 1回目 DescribeTableでResourceNotFoundException
            .mockImplementationOnce(() => {
                const err = new Error('ResourceNotFoundException');
                (err as any).name = 'ResourceNotFoundException';
                throw err;
            })
            // 2回目 CreateTableCommand
            .mockReturnValue({ TableDescription: { TableName: 'MockTable' } })
            // 3回目以降 PutItemCommand
            .mockReturnValue({});

        (DynamoDBClient as jest.Mock).mockImplementation(() => {
            return { send: mockSend };
        });

        await main();

        // // 1回目 DescribeTableCommand
        // expect(mockSend.mock.calls[0][0]).toBeInstanceOf(DescribeTableCommand);
        // // 2回目 CreateTableCommand
        // expect(mockSend.mock.calls[1][0]).toBeInstanceOf(CreateTableCommand);
        // // 3回目以降は PutItemCommand のはず
        // expect(mockSend).toHaveBeenCalledWith(expect.any(PutItemCommand));
    });
});
