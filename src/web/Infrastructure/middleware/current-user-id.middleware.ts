import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";



declare global {
    namespace Express {
        interface Request {
            currentUserId?: string
        }
    }
}
@Injectable()
export class CurrentUserIdMiddleware implements NestMiddleware {
    constructor() { }
    
    async use(request: Request, res: Response, next: NextFunction) {
        
        const { user } = request.session || {};

        if(user) {
            request.currentUserId = user.id;
        } else {
            request.currentUserId = null;
        }
		return next();
    }
}