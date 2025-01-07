// test/middlewares/auth.test.ts
import { authenticateUser } from '../../src/middlewares/authIndex';
import { sampleUseId } from "../../src/middlewares/authLocal";
import { Request, Response, NextFunction } from 'express';

describe('auth middleware tests', () => {
    let mockReq: Partial<Request> & { user?: { id: string } };
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeAll(() => {
        process.env.DYNAMO_TABLE_NAME = 'TestDocumentsTable';
        process.env.IS_OFFLINE = 'true';
        process.env.DYNAMO_ENDPOINT = 'http://localhost:8000';
    });

    beforeEach(() => {
        // テスト開始ごとに作り直す
        mockReq = {};
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockNext = jest.fn();
    });

    test('authenticateUser sets req.user correctly', () => {
        mockReq.headers = { 'id': sampleUseId };

        authenticateUser(mockReq as Request, mockRes as Response, mockNext);

        expect(mockReq.user).toEqual({ id: sampleUseId });
        expect(mockNext).toHaveBeenCalled();
    });

    test('authenticateUser sets req.user as anonymous if no header found', () => {
        // ヘッダーがない場合
        mockReq.headers = {};

        authenticateUser(mockReq as Request, mockRes as Response, mockNext);

        expect(mockReq.user).toEqual({ id: sampleUseId });
        expect(mockNext).toHaveBeenCalled();
    });
});
