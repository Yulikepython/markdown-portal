// test/middlewares/auth.test.ts
import { authenticateUser, checkIsAuthorizedOrThrow403 } from '../../src/middlewares/auth';
import { Request, Response, NextFunction } from 'express';

describe('auth middleware tests', () => {
    let mockReq: Partial<Request> & { user?: { id: string } };
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

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
        mockReq.headers = { 'x-user-id': 'test-user-id' };

        authenticateUser(mockReq as Request, mockRes as Response, mockNext);

        expect(mockReq.user).toEqual({ id: 'test-user-id' });
        expect(mockNext).toHaveBeenCalled();
    });

    test('authenticateUser sets req.user as anonymous if no header found', () => {
        // ヘッダーがない場合
        mockReq.headers = {};

        authenticateUser(mockReq as Request, mockRes as Response, mockNext);

        expect(mockReq.user).toEqual({ id: 'anonymous' });
        expect(mockNext).toHaveBeenCalled();
    });

    test('checkIsAuthorizedOrThrow403 returns 403 if user is anonymous', () => {
        mockReq.user = { id: 'anonymous' };

        checkIsAuthorizedOrThrow403(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    test('checkIsAuthorizedOrThrow403 does nothing if user exists', () => {
        mockReq.user = { id: 'someUser' };

        checkIsAuthorizedOrThrow403(mockReq as Request, mockRes as Response);

        // status, json 共に呼ばれていないこと
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
    });
});
