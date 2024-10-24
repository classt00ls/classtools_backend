import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";

export class AuthGuard implements CanActivate {

	canActivate(
		context: ExecutionContext
	): boolean 
	{
		try {
			const request = context.switchToHttp().getRequest();
			if(!request.currentUser && !request.currentUserId) {
				return false;
			}
			return true;
		} catch (error) {
			return false;
		}
	}
}