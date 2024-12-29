import { Request, Response, NextFunction } from 'express';

export function authenticateUser(req: Request, res: Response, next: NextFunction) {
    const userId = req.headers['x-user-id'];
    req.user = userId ? { id: userId as string } : { id: "anonymous" };
    next();
}

export function checkIsAuthorizedOrThrow403(req: Request, res: Response) {
    if (req.user == null || req.user?.id === "anonymous") {
        res.status(403).json({ message: "Unauthorized" });
    }
}