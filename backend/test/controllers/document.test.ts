// test/controllers/document.test.ts
import { DocumentController } from '../../src/controllers/document';
import { DocumentServiceDynamo } from '../../src/services/document';
import { Request, Response, NextFunction } from 'express';
import { authenticateUser } from '../../src/middlewares/authIndex';
import { sampleUseId } from "../../src/middlewares/authLocal";

jest.mock('../../src/services/document');

describe('DocumentController', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let jsonMock: jest.Mock;
    let mockNext: NextFunction;

    beforeAll(() => {
        process.env.DYNAMO_TABLE_NAME = 'TestDocumentsTable';
        process.env.IS_OFFLINE = 'true';
        process.env.DYNAMO_ENDPOINT = 'http://localhost:8888';
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jsonMock = jest.fn();
        mockNext = jest.fn();

        // レスポンスモック: 上位 describe でも end を追加しておく
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jsonMock,
            end: jest.fn(),
        };
        // リクエストヘッダーに x-user-id を付与
        mockReq = {
            headers: { 'x-user-id': sampleUseId }
        };

        // 認証ミドルウェアを先に通す
        authenticateUser(mockReq as Request, mockRes as Response, mockNext);
        // ここで mockNext() が呼ばれるはず
    });

    it('should return documents in JSON', async () => {
        // モック: 返却値
        (DocumentServiceDynamo.getDocumentsByOwnUser as jest.Mock).mockResolvedValue([
            { userId: sampleUseId, slug: 'abc', content: 'hello', isPublic: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
        ]);

        // 実行
        await DocumentController.getDocumentsOfLoggedInUser(
            mockReq as Request,
            mockRes as Response
        );

        // 検証
        expect(DocumentServiceDynamo.getDocumentsByOwnUser).toHaveBeenCalledWith(sampleUseId);
        expect(jsonMock).toHaveBeenCalledWith([
            { userId: sampleUseId, slug: 'abc', content: 'hello', isPublic: false, createdAt: '2024-01-01', updatedAt: '2024-01-01'  }
        ]);
    });

    describe('DocumentController', () => {
        let mockReq: Partial<Request>;
        let mockRes: Partial<Response>;
        let jsonMock: jest.Mock;
        let statusMock: jest.Mock;

        beforeAll(() => {
            process.env.DYNAMO_TABLE_NAME = 'TestDocumentsTable';
            process.env.LOCAL_DYNAMO_ENDPOINT = 'http://localhost:8000';
        });

        beforeEach(() => {
            jest.clearAllMocks();
            jsonMock = jest.fn();
            statusMock = jest.fn().mockReturnThis();

            // 下位 describe でもレスポンスに end を付与
            mockRes = {
                status: statusMock,
                json: jsonMock,
                end: jest.fn()
            };
            mockReq = {
                headers: { 'x-user-id': sampleUseId },
                params: {},
                body: {},
            };

            // ミドルウェアを通す
            authenticateUser(mockReq as Request, mockRes as Response, jest.fn());
        });

        // 1) getDocumentsOfLoggedInUser は既にあるので省略

        //
        // 2) getDocumentBySlugOfLoggedInUser
        //
        describe('getDocumentBySlugOfLoggedInUser', () => {
            it('should return a document with given slug for the logged in user', async () => {
                mockReq!.params = { slug: 'docSlug' };

                (DocumentServiceDynamo.getDocumentBySlugAndUserId as jest.Mock).mockResolvedValue({
                    userId: sampleUseId,
                    slug: 'docSlug',
                    content: 'example content',
                    isPublic: false,
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01'
            });

                await DocumentController.getDocumentBySlugOfLoggedInUser(
                    mockReq as Request,
                    mockRes as Response
                );

                expect(DocumentServiceDynamo.getDocumentBySlugAndUserId)
                    .toHaveBeenCalledWith('docSlug', sampleUseId);
                expect(jsonMock).toHaveBeenCalledWith({
                    userId: sampleUseId,
                    slug: 'docSlug',
                    content: 'example content',
                    isPublic: false,
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01'
                });
            });

            it('should return 500 if an error occurs', async () => {
                mockReq!.params = { slug: 'docSlug' };
                (DocumentServiceDynamo.getDocumentBySlugAndUserId as jest.Mock)
                    .mockRejectedValue(new Error('Test Error'));

                await DocumentController.getDocumentBySlugOfLoggedInUser(
                    mockReq as Request,
                    mockRes as Response
                );

                expect(statusMock).toHaveBeenCalledWith(500);
                expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal server error' });
            });
        });

        //
        // 3) getDocumentBySlugOfPublic
        //
        describe('getDocumentBySlugOfPublic', () => {
            it('should return a public document', async () => {
                mockReq!.params = { slug: 'public-slug' };
                (DocumentServiceDynamo.getPublicDocumentBySlug as jest.Mock).mockResolvedValue({
                    userId: 'public-user',
                    slug: 'public-slug',
                    content: 'public content',
                    isPublic: true,
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01'
                });

                await DocumentController.getDocumentBySlugOfPublic(
                    mockReq as Request,
                    mockRes as Response
                );

                expect(DocumentServiceDynamo.getPublicDocumentBySlug)
                    .toHaveBeenCalledWith('public-slug');
                expect(jsonMock).toHaveBeenCalledWith({
                    userId: 'public-user',
                    slug: 'public-slug',
                    content: 'public content',
                    isPublic: true,
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01'
                });
            });

            it('should return 500 on error', async () => {
                mockReq!.params = { slug: 'public-slug' };
                (DocumentServiceDynamo.getPublicDocumentBySlug as jest.Mock)
                    .mockRejectedValue(new Error('Boom!'));

                await DocumentController.getDocumentBySlugOfPublic(
                    mockReq as Request,
                    mockRes as Response
                );

                expect(statusMock).toHaveBeenCalledWith(500);
                expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal server error' });
            });
        });

        //
        // 4) createDocument
        //
        describe('createDocument', () => {
            it('should create a new document', async () => {
                mockReq!.body = { content: 'new doc content' };

                (DocumentServiceDynamo.createDocument as jest.Mock).mockResolvedValue({
                    userId: sampleUseId,
                    slug: 'abc-123',
                    content: 'new doc content',
                    isPublic: false,
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01'
                });

                await DocumentController.createDocument(mockReq as Request, mockRes as Response);

                // コード側では 3 引数呼び出し( content, userId, isPublic ) になるため
                expect(DocumentServiceDynamo.createDocument)
                    .toHaveBeenCalledWith('new doc content', sampleUseId, undefined);
                expect(statusMock).toHaveBeenCalledWith(201);
                expect(jsonMock).toHaveBeenCalledWith({
                    userId: sampleUseId,
                    slug: 'abc-123',
                    content: 'new doc content',
                    isPublic: false,
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01'
                });
            });

            it('should return 400 if content is missing', async () => {
                mockReq!.body = {};

                await DocumentController.createDocument(mockReq as Request, mockRes as Response);

                expect(statusMock).toHaveBeenCalledWith(400);
                expect(jsonMock).toHaveBeenCalledWith({ message: 'Content are required' });
            });

            it('should return 500 if service throws error', async () => {
                mockReq!.body = { content: 'new doc content' };
                (DocumentServiceDynamo.createDocument as jest.Mock)
                    .mockRejectedValue(new Error('DB Error'));

                await DocumentController.createDocument(mockReq as Request, mockRes as Response);

                expect(statusMock).toHaveBeenCalledWith(500);
                expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal server error' });
            });
        });

        //
        // 5) updateDocument
        //
        describe('updateDocument', () => {
            it('should update a document successfully', async () => {
                mockReq!.params = { slug: 'doc-slug' };
                mockReq!.body = { content: 'updated content', isPublic: true };

                (DocumentServiceDynamo.updateDocument as jest.Mock).mockResolvedValue({
                    userId: sampleUseId,
                    slug: 'doc-slug',
                    content: 'updated content',
                    isPublic: true,
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01'
                });

                await DocumentController.updateDocument(mockReq as Request, mockRes as Response);

                expect(DocumentServiceDynamo.updateDocument).toHaveBeenCalledWith(
                    'doc-slug',
                    'updated content',
                    sampleUseId,
                    true
                );
                expect(jsonMock).toHaveBeenCalledWith({
                    userId: sampleUseId,
                    slug: 'doc-slug',
                    content: 'updated content',
                    isPublic: true,
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01'
                });
            });

            it('should return 400 if content is missing', async () => {
                mockReq!.params = { slug: 'doc-slug' };
                mockReq!.body = { isPublic: false };

                await DocumentController.updateDocument(mockReq as Request, mockRes as Response);

                expect(statusMock).toHaveBeenCalledWith(400);
                expect(jsonMock).toHaveBeenCalledWith({ message: 'Content are required' });
            });

            it('should return 404 if update service returns null', async () => {
                mockReq!.params = { slug: 'doc-slug' };
                mockReq!.body = { content: 'updated content', isPublic: false };

                (DocumentServiceDynamo.updateDocument as jest.Mock).mockResolvedValue(null);

                await DocumentController.updateDocument(mockReq as Request, mockRes as Response);

                expect(statusMock).toHaveBeenCalledWith(404);
                expect(jsonMock).toHaveBeenCalledWith({ message: 'Document not found' });
            });

            it('should return 500 on error', async () => {
                mockReq!.params = { slug: 'doc-slug' };
                mockReq!.body = { content: 'updated content', isPublic: false };

                (DocumentServiceDynamo.updateDocument as jest.Mock).mockRejectedValue(new Error('Update error'));

                await DocumentController.updateDocument(mockReq as Request, mockRes as Response);

                expect(statusMock).toHaveBeenCalledWith(500);
                expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal server error' });
            });
        });

        //
        // 6) deleteDocument
        //
        describe('deleteDocument', () => {
            it('should delete a document successfully', async () => {
                mockReq!.params = { slug: 'doc-slug' };

                (DocumentServiceDynamo.deleteDocument as jest.Mock).mockResolvedValue(true);

                await DocumentController.deleteDocument(mockReq as Request, mockRes as Response);

                expect(DocumentServiceDynamo.deleteDocument).toHaveBeenCalledWith('doc-slug', sampleUseId);
                expect(statusMock).toHaveBeenCalledWith(204);
                // 204 の場合 bodyなし → json を呼ばない
                expect(jsonMock).not.toHaveBeenCalled();
            });

            it('should return 404 if document not found', async () => {
                mockReq!.params = { slug: 'doc-slug' };

                (DocumentServiceDynamo.deleteDocument as jest.Mock).mockResolvedValue(false);

                await DocumentController.deleteDocument(mockReq as Request, mockRes as Response);

                expect(DocumentServiceDynamo.deleteDocument).toHaveBeenCalledWith('doc-slug', sampleUseId);
                expect(statusMock).toHaveBeenCalledWith(404);
                expect(jsonMock).toHaveBeenCalledWith({ message: 'Document not found' });
            });

            it('should return 500 on error', async () => {
                mockReq!.params = { slug: 'doc-slug' };
                (DocumentServiceDynamo.deleteDocument as jest.Mock).mockRejectedValue(new Error('Delete error'));

                await DocumentController.deleteDocument(mockReq as Request, mockRes as Response);

                expect(statusMock).toHaveBeenCalledWith(500);
                expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal server error' });
            });
        });
    });
});
