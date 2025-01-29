import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import { GetUsuarioFromTokenQuery } from "./GetUsuarioFromTokenQuery";

import { GetUsuarioFromTokenQueryResponse } from "./GetUsuarioFromTokenQueryResponse";

import { UserWebExtractor } from "@Web/Domain/Service/UserWeb/UserWebExtractor";

@Injectable()
@QueryHandler(GetUsuarioFromTokenQuery)
export class GetUsuarioFromTokenQueryHandler implements IQueryHandler<GetUsuarioFromTokenQuery>{
    constructor(
        private userExtractor: UserWebExtractor
    ) {}

    async execute(query: GetUsuarioFromTokenQuery): Promise<GetUsuarioFromTokenQueryResponse>  {
        
        await this.userExtractor.execute(query.token);

        return new GetUsuarioFromTokenQueryResponse(
            '',
            ''
        );
  	}
}