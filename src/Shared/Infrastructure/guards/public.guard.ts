import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from "../jwt/constants";

@Injectable()
export class PublicGuard implements CanActivate {

	constructor(
		private jwtService: JwtService
	) {}

	async canActivate(
		context: ExecutionContext
	): Promise<boolean> 
	{
		const request = context.switchToHttp().getRequest();
		try {
			

			const token = this.extractTokenFromHeader(request);

			if (!token) {
				request['userId'] = null;
				return true;
			}

			
			const payload = await this.jwtService.verifyAsync(
				token,
				{
				secret: jwtConstants.secret
				}
			);

			// We're assigning the payload to the request object here
			// so that we can access it in our route handlers
			request['userId'] = payload.sub;
			request['useremail'] = payload.sub;
			  
			return true;
		} catch (error) {
			request['userId'] = null;
			return true;
		}
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	  }
}