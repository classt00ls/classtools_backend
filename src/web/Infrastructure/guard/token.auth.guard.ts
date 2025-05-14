import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from 'express';
import { UserWebExtractor } from "@Web/UserWeb/Domain/UserWebExtractor";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class TokenAuthGuard implements CanActivate {

	constructor(
		private userExtractor: UserWebExtractor,
		private configService: ConfigService
	) {}

	async canActivate(
		context: ExecutionContext
	): Promise<boolean> 
	{

		// Permitir todo en desarrollo
		if (this.configService.get('NODE_ENV') === 'development') {
			const request = context.switchToHttp().getRequest();
			// Asignar un usuario de desarrollo por defecto
			request['userId'] = 'WzmEzSrynxYBiMsJEu6oq5moNlG2';
			request['useremail'] = 'classtools.io@gmail.com';
			return true;
		}

			const request = context.switchToHttp().getRequest();

			const token = this.extractTokenFromHeader(request);

			if (!token) throw new UnauthorizedException();

			try {
				const user = await this.userExtractor.execute(token);
				
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