// test/controllers/document.test.ts
import { DocumentController } from '../../src/controllers/document';
import { DocumentServiceDynamo } from '../../src/services/document';
import { Request, Response, NextFunction } from 'express';
import { authenticateUser } from "../../src/middlewares/auth";

jest.mock('../../src/services/document');

describe('DocumentController', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let jsonMock: jest.Mock;
    let mockNext: NextFunction;

    beforeAll(() => {
        process.env.DYNAMO_TABLE_NAME = 'TestDocumentsTable';
        process.env.IS_OFFLINE = 'true';
        process.env.LOCAL_DYNAMO_ENDPOINT = 'http://localhost:8000';
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jsonMock = jest.fn();

        mockNext = jest.fn();

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            end: jest.fn(),  // ← これを追加
        };
        mockReq = {
            headers: { 'x-user-id': 'test-user-id' }
        };

        authenticateUser(mockReq as Request, mockRes as Response, mockNext);
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    it('should return documents in JSON', async () => {
        (DocumentServiceDynamo.getDocumentsByOwnUser as jest.Mock).mockResolvedValue([
            { userId: 'test-user-id', slug: 'abc', content: 'hello', isPublic: false }
        ]);
        authenticateUser(mockReq as Request, mockRes as Response, mockNext);

        await DocumentController.getDocumentsOfLoggedInUser(
            mockReq as Request,
            mockRes as Response
        );

        expect(DocumentServiceDynamo.getDocumentsByOwnUser).toHaveBeenCalledWith('test-user-id');
        expect(jsonMock).toHaveBeenCalledWith([
            { userId: 'test-user-id', slug: 'abc', content: 'hello', isPublic: false }
        ]);
    });

    describe('DocumentController', () => {
        let mockReq: Partial<Request>;
        let mockRes: Partial<Response>;
        let jsonMock: jest.Mock;
        let statusMock: jest.Mock;

        beforeAll(() => {
            process.env.DYNAMO_TABLE_NAME = 'TestDocumentsTable';
            process.env.IS_OFFLINE = 'true';
            process.env.LOCAL_DYNAMO_ENDPOINT = 'http://localhost:8000';
        });

        beforeEach(() => {
            jest.clearAllMocks();
            jsonMock = jest.fn();
            statusMock = jest.fn().mockReturnThis();

            mockRes = {
                status: statusMock,
                json: jsonMock,
            };
            // リクエストに user を持たせる
            mockReq = {
                headers: { 'x-user-id': 'test-user-id' },
                params: {},
                body: {},
            };

            // ミドルウェアで user を設定
            authenticateUser(mockReq as Request, mockRes as Response, jest.fn());
        });

        //
        // 1) getDocumentsOfLoggedInUser は既にあるので省略
        //

        //
        // 2) getDocumentBySlugOfLoggedInUser
        //
        describe('getDocumentBySlugOfLoggedInUser', () => {
            it('should return a document with given slug for the logged in user', async () => {
                mockReq!.params = { slug: 'docSlug' };
                (DocumentServiceDynamo.getDocumentBySlugAndUserId as jest.Mock).mockResolvedValue({
                    userId: 'test-user-id',
                    slug: 'docSlug',
                    content: 'example content',
                    isPublic: false,
                });

                await DocumentController.getDocumentBySlugOfLoggedInUser(
                    mockReq as Request,
                    mockRes as Response
                );

                expect(DocumentServiceDynamo.getDocumentBySlugAndUserId).toHaveBeenCalledWith('docSlug', 'test-user-id');
                expect(jsonMock).toHaveBeenCalledWith({
                    userId: 'test-user-id',
                    slug: 'docSlug',
                    content: 'example content',
                    isPublic: false,
                });
            });

            it('should return 500 if an error occurs', async () => {
                mockReq!.params = { slug: 'docSlug' };
                (DocumentServiceDynamo.getDocumentBySlugAndUserId as jest.Mock).mockRejectedValue(new Error('Test Error'));

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
                });

                await DocumentController.getDocumentBySlugOfPublic(
                    mockReq as Request,
                    mockRes as Response
                );

                expect(DocumentServiceDynamo.getPublicDocumentBySlug).toHaveBeenCalledWith('public-slug');
                expect(jsonMock).toHaveBeenCalledWith({
                    userId: 'public-user',
                    slug: 'public-slug',
                    content: 'public content',
                    isPublic: true,
                });
            });

            it('should return 500 on error', async () => {
                mockReq!.params = { slug: 'public-slug' };
                (DocumentServiceDynamo.getPublicDocumentBySlug as jest.Mock).mockRejectedValue(new Error('Boom!'));

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
                    userId: 'test-user-id',
                    slug: 'abc-123',
                    content: 'new doc content',
                    isPublic: false,
                });

                await DocumentController.createDocument(mockReq as Request, mockRes as Response);

                expect(DocumentServiceDynamo.createDocument).toHaveBeenCalledWith('new doc content', 'test-user-id');
                expect(statusMock).toHaveBeenCalledWith(201);
                expect(jsonMock).toHaveBeenCalledWith({
                    userId: 'test-user-id',
                    slug: 'abc-123',
                    content: 'new doc content',
                    isPublic: false,
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
                (DocumentServiceDynamo.createDocument as jest.Mock).mockRejectedValue(new Error('DB Error'));

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
                    userId: 'test-user-id',
                    slug: 'doc-slug',
                    content: 'updated content',
                    isPublic: true,
                });

                await DocumentController.updateDocument(mockReq as Request, mockRes as Response);

                expect(DocumentServiceDynamo.updateDocument).toHaveBeenCalledWith(
                    'doc-slug',
                    'updated content',
                    'test-user-id',
                    true
                );
                expect(jsonMock).toHaveBeenCalledWith({
                    userId: 'test-user-id',
                    slug: 'doc-slug',
                    content: 'updated content',
                    isPublic: true,
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

                expect(DocumentServiceDynamo.deleteDocument).toHaveBeenCalledWith('doc-slug', 'test-user-id');
                expect(statusMock).toHaveBeenCalledWith(204);
                expect(jsonMock).not.toHaveBeenCalled(); // 204 の場合 body なし
            });

            it('should return 404 if document not found', async () => {
                mockReq!.params = { slug: 'doc-slug' };

                (DocumentServiceDynamo.deleteDocument as jest.Mock).mockResolvedValue(false);

                await DocumentController.deleteDocument(mockReq as Request, mockRes as Response);

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
