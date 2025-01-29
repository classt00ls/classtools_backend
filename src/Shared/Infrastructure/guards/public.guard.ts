import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from 'express';
import { UserWebExtractor } from "@Web/Domain/Service/UserWeb/UserWebExtractor";

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
		console.log('public guard, tenemos token')
		if (!token) {
			console.log('public guard, NO tenemos token')
			request['userId'] = null;
			return true;
		}
		try {
			
			const user = await this.userExtractor.execute(token);
			console.log('Public guard, tenemos user: ', user)
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