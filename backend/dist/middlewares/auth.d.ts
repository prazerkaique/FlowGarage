import type { Request, Response, NextFunction } from 'express';
interface TokenPayload {
    id: number;
    garageId: number;
    role: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const authorize: (roles: string[]) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export {};
//# sourceMappingURL=auth.d.ts.map