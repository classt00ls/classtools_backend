import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from 'express';
import { UserWebExtractor } from "@Web/UserWeb/Domain/UserWebExtractor";

@Injectable()
export class PublicGuard implements CanActivate {

	constructor(
		private userExtractor: UserWebExtractor
	) {}

	async canActivate(
		context: ExecutionContext
	): Promise<boolean> 
	{
		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);
		if (!token) {
			request['userId'] = null;
			return true;
		}
		try {
			
			const user = await this.userExtractor.execute(token);
			request['userId'] = user.id.value;
			request['useremail'] = user.email;
			
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