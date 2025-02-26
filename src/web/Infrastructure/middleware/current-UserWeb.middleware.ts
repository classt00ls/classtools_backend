import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { UserModel } from "src/Shared/Domain/Model/User/user.model";
import { UserWeb } from "@Web/UserWeb/Domain/UserWeb";



declare global {
    namespace Express {
        interface Request {
            currentUser?: UserModel
        }
    }
}
@Injectable()
export class CurrentUserWebMiddleware implements NestMiddleware {
    constructor( ) { }

    async use(request: Request, res: Response, next: NextFunction) {
        // @ts-ignore
        const { user, impersonated } = request.session || {};

        if (!user) {
            request.currentUser = null;
        } 

        request.currentUser = null;
		return next();
    }
}