import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from 'express';
import { UserWebExtractor } from "@Web/Domain/Service/UserWeb/UserWebExtractor";

@Injectable()
export class TokenAuthGuard implements CanActivate {

	constructor(
		private userExtractor: UserWebExtractor
	) {}

	async canActivate(
		context: ExecutionContext
	): Promise<boolean> 
	{
			const request = context.switchToHttp().getRequest();

			const token = this.extractTokenFromHeader(request);

			if (!token) throw new UnauthorizedException();

			try {
				const user = await this.userExtractor.execute(token);
				
				console.log('tenemos user: ', user)
				
				// We're assigning the payload to the request object here so that we can access it in our route handlers
				request['userId'] = user.id.value;
				request['useremail'] = user.email;
				
				return true;

			} catch(exception) {
				throw new UnauthorizedException();
			
			}
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	  }
}