import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { handleRetry, InjectRepository } from "@nestjs/typeorm";

export class CurrentUserInterceptor implements NestInterceptor{

	constructor(
		//@InjectRepository(UserRepository) private userRepository
	) {}

	async intercept(
		context: ExecutionContext, 
		next: CallHandler<any>
	){
		const request = context.switchToHttp().getRequest();
		const  { user } = request.session || {};

		if(user) {
			const userId = user.id;
			const userEntity = null ;// await this.userRepository.findOneOrFail(userId);
			// Lo asignamos al request para usarlo posteriormente en el decorador
			request.CurrentUser = userEntity;
		} else {
			throw new BadRequestException('User not logged');
		}
		return next.handle();
	}
}