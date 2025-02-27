import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from "../jwt/constants";

@Injectable()
export class AuthGuard implements CanActivate {

	constructor(
		private jwtService: JwtService
	) {}

	async canActivate(
		context: ExecutionContext
	): Promise<boolean> 
	{

		try {
			const request = context.switchToHttp().getRequest();

			const token = this.extractTokenFromHeader(request);

			if (!token) throw new UnauthorizedException();

			try {
				console.log('Authguard vamos a por el payload: ');
				const payload = await this.jwtService.verifyAsync(
				  token,
				  {
					secret: jwtConstants.secret
				  }
				);
				console.log('Authguard tenemos el payload: ', payload);
				// We're assigning the payload to the request object here
				// so that we can access it in our route handlers
				request['userId'] = payload.sub;
				request['useremail'] = payload.email;
			  } catch {
				console.log('Authguard token no valido');
				throw new UnauthorizedException();
			  }
			return true;
		} catch (error) {
			return false;
		}
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	  }
}