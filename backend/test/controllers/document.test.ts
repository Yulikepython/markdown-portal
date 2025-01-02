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
            json: jsonMock,
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

    // it('should handle errors', async () => {
    //     authenticateUser(mockReq as Request, mockRes as Response, mockNext);
    //     try {
    //         (DocumentServiceDynamo.getDocumentsByOwnUser as jest.Mock).mockRejectedValue(new Error('Test Error'));
    //         expect(false);
    //     } catch (e){
    //         console.log('error occured as expected');
    //         expect(true);
    //     }
    //
    //
    //     await DocumentController.getDocumentsOfLoggedInUser(
    //         mockReq as Request,
    //         mockRes as Response
    //     );
    //
    //     expect(mockRes.status).toHaveBeenCalledWith(500);
    //     expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal server error' });
    // });
});
