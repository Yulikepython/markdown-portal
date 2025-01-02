// test/services/document.test.ts

import { DocumentServiceDynamo } from '../../src/services/document';
import {
    DynamoDBClient,
    PutItemCommand,
    QueryCommand,
    GetItemCommand,
    DeleteItemCommand,
    UpdateItemCommand,
    ReturnValue
} from '@aws-sdk/client-dynamodb';

jest.mock('@aws-sdk/client-dynamodb', () => {
    // 実際に使うクラスを一部再定義し、コンストラクタ内の処理を無視する
    return {
        DynamoDBClient: jest.fn().mockImplementation(() => {
            // このオブジェクトが「new DynamoDBClient(...)」の返り値になる
            return {
                send: jest.fn(), // これが後で "mockSend" として取り出せる
            };
        }),
        PutItemCommand: jest.fn(),
        QueryCommand: jest.fn(),
        GetItemCommand: jest.fn(),
        DeleteItemCommand: jest.fn(),
        UpdateItemCommand: jest.fn(),
    };
});

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

        const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
        mockSend = (new DynamoDBClient() as any).send;
    });

    test('createDocument should put item to DynamoDB', async () => {
        // PutItem の場合、成功時は特に "Attributes" や "Items" は不要
        mockSend.mockResolvedValueOnce({});

        const content = 'Test content';
        const userId = 'testUser';

        let doc = await DocumentServiceDynamo.createDocument(content, userId);

        // doc の値を検証
        expect(doc.content).toBe(content);
        expect(doc.userId).toBe(userId);
        expect(doc.isPublic).toBe(false);

        expect(mockSend).toHaveBeenCalledTimes(1);
        // PutItemCommandのインスタンスが渡されているはず
        expect(mockSend.mock.calls[0][0]).toBeInstanceOf(PutItemCommand);
    });

    describe('DocumentServiceDynamo', () => {

        beforeAll(() => {
            process.env.DYNAMO_TABLE_NAME = 'TestDocumentsTable';
            process.env.IS_OFFLINE = 'true';
            process.env.LOCAL_DYNAMO_ENDPOINT = 'http://localhost:8000';
        });

        beforeEach(() => {
            jest.clearAllMocks();
            mockSend = jest.fn().mockResolvedValue({});
            (DynamoDBClient as jest.Mock).mockImplementation(() => {
                return {send: mockSend};
            });
        });

        //
        // 1) createDocument (既存)
        //
        test('createDocument should put item to DynamoDB', async () => {
            const content = 'Test content';
            const userId = 'testUser';
            mockSend.mockResolvedValue({}); // PutItem 成功を模擬

            let doc = await DocumentServiceDynamo.createDocument(content, userId);

            expect(doc.content).toBe(content);
            expect(doc.userId).toBe(userId);
            expect(doc.isPublic).toBe(false);

            // send が呼ばれたか
            expect(mockSend).toHaveBeenCalledTimes(1);
            // PutItemCommand であること
            expect(mockSend.mock.calls[0][0]).toBeInstanceOf(PutItemCommand);
        });

        //
        // 2) getDocumentsByOwnUser
        //
        test('getDocumentsByOwnUser should query items', async () => {
            mockSend.mockResolvedValue({
                Items: [
                    {
                        userId: {S: 'testUser'},
                        slug: {S: 'slug-123'},
                        content: {S: 'doc content'},
                        isPublic: {BOOL: false},
                    },
                ],
            });

            const docs = await DocumentServiceDynamo.getDocumentsByOwnUser('testUser');
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(mockSend.mock.calls[0][0]).toBeInstanceOf(QueryCommand);

            expect(docs.length).toBe(1);
            expect(docs[0]).toEqual({
                userId: 'testUser',
                slug: 'slug-123',
                content: 'doc content',
                isPublic: false,
            });
        });

        //
        // 3) getDocumentBySlugAndUserId
        //
        test('getDocumentBySlugAndUserId should get the item', async () => {
            mockSend.mockResolvedValue({
                Item: {
                    userId: {S: 'testUser'},
                    slug: {S: 'slug-001'},
                    content: {S: 'some content'},
                    isPublic: {BOOL: true},
                },
            });

            const doc = await DocumentServiceDynamo.getDocumentBySlugAndUserId('slug-001', 'testUser');
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(mockSend.mock.calls[0][0]).toBeInstanceOf(GetItemCommand);
            expect(doc).toEqual({
                userId: 'testUser',
                slug: 'slug-001',
                content: 'some content',
                isPublic: true,
            });
        });

        test('getDocumentBySlugAndUserId should return null if no Item', async () => {
            mockSend.mockResolvedValue({Item: undefined});

            const doc = await DocumentServiceDynamo.getDocumentBySlugAndUserId('slug-002', 'testUser');
            expect(doc).toBeNull();
        });

        //
        // 4) getPublicDocumentBySlug
        //
        test('getPublicDocumentBySlug should query SlugIndex with isPublic=true', async () => {
            mockSend.mockResolvedValue({
                Items: [
                    {
                        userId: {S: 'publicUser'},
                        slug: {S: 'public-slug'},
                        content: {S: 'public doc content'},
                        isPublic: {BOOL: true},
                    },
                ],
            });

            const doc = await DocumentServiceDynamo.getPublicDocumentBySlug('public-slug');
            expect(mockSend).toHaveBeenCalledTimes(1);
            expect(mockSend.mock.calls[0][0]).toBeInstanceOf(QueryCommand);
            expect(doc).toEqual({
                userId: 'publicUser',
                slug: 'public-slug',
                content: 'public doc content',
                isPublic: true,
            });
        });

        test('getPublicDocumentBySlug should return null if no items found', async () => {
            mockSend.mockResolvedValue({Items: []}); // 空

            const doc = await DocumentServiceDynamo.getPublicDocumentBySlug('no-doc-here');
            expect(doc).toBeNull();
        });

        //
        // 5) updateDocument
        //
        describe('updateDocument', () => {
            it('should update content and isPublic', async () => {
                mockSend.mockResolvedValue({
                    Attributes: {
                        userId: {S: 'testUser'},
                        slug: {S: 'slug-xyz'},
                        content: {S: 'updated content'},
                        isPublic: {BOOL: true},
                    },
                });

                const result = await DocumentServiceDynamo.updateDocument(
                    'slug-xyz',
                    'updated content',
                    'testUser',
                    true,
                );
                expect(mockSend).toHaveBeenCalledTimes(1);
                expect(mockSend.mock.calls[0][0]).toBeInstanceOf(UpdateItemCommand);
                expect(result).toEqual({
                    userId: 'testUser',
                    slug: 'slug-xyz',
                    content: 'updated content',
                    isPublic: true,
                });
            });

            it('should update only isPublic if content is null', async () => {
                mockSend.mockResolvedValue({
                    Attributes: {
                        userId: {S: 'testUser'},
                        slug: {S: 'slug-xyz'},
                        content: {S: 'old content'},
                        isPublic: {BOOL: false},
                    },
                });

                const result = await DocumentServiceDynamo.updateDocument(
                    'slug-xyz',
                    null,
                    'testUser',
                    false,
                );

                // UpdateItemCommand の updateExpression が content省略になっているはず
                expect(mockSend).toHaveBeenCalledTimes(1);
                expect(result).toEqual({
                    userId: 'testUser',
                    slug: 'slug-xyz',
                    content: 'old content',
                    isPublic: false,
                });
            });

            it('should return null if no Attributes returned', async () => {
                mockSend.mockResolvedValue({Attributes: undefined});

                const result = await DocumentServiceDynamo.updateDocument('slug', 'content', 'user', true);
                expect(result).toBeNull();
            });

            it('should catch error and return null', async () => {
                mockSend.mockRejectedValue(new Error('Update error!'));

                const result = await DocumentServiceDynamo.updateDocument('slug', 'content', 'user', true);
                expect(result).toBeNull();
            });
        });

        //
        // 6) deleteDocument
        //
        describe('deleteDocument', () => {
            it('should return true if successfully deleted', async () => {
                mockSend.mockResolvedValue({});

                const success = await DocumentServiceDynamo.deleteDocument('slug-123', 'testUser');
                expect(mockSend).toHaveBeenCalledTimes(1);
                expect(mockSend.mock.calls[0][0]).toBeInstanceOf(DeleteItemCommand);
                expect(success).toBe(true);
            });

            it('should return false on error', async () => {
                mockSend.mockRejectedValue(new Error('Delete error'));
                const success = await DocumentServiceDynamo.deleteDocument('slug-123', 'testUser');
                expect(success).toBe(false);
            });
        });

        //
        // 7) isDocumentExist
        //
        describe('isDocumentExist', () => {
            it('should return true if the document exists', async () => {
                mockSend.mockResolvedValue({
                    Item: {
                        userId: {S: 'testUser'},
                        slug: {S: 'slug-abc'},
                        content: {S: 'hi'},
                        isPublic: {BOOL: false},
                    },
                });
                const exists = await DocumentServiceDynamo.isDocumentExist('slug-abc', 'testUser');
                expect(exists).toBe(true);
            });

            it('should return false if no item found', async () => {
                mockSend.mockResolvedValue({Item: undefined});
                const exists = await DocumentServiceDynamo.isDocumentExist('slug-xyz', 'testUser');
                expect(exists).toBe(false);
            });
        });
    });
});
