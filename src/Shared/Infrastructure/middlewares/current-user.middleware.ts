import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { UserModel } from "src/Shared/Domain/Model/User/user.model";



declare global {
    namespace Express {
        interface Request {
            currentUser?: UserModel
        }
    }
}
@Injectable() 
export class CurrentUserMiddleware implements NestMiddleware {
    constructor( ) { }

    async use(request: any, res: Response, next: NextFunction) {
        const { user, impersonated } = request.session || {};

        if(impersonated && !request.currentUser) {
			request.currentUser = impersonated;
		} else if (!user) { 
            request.currentUser = null;
        }
		return next();
    }
}