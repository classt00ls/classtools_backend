import { CallHandler, ExecutionContext, NestInterceptor, UseInterceptors } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { map, Observable } from "rxjs";


interface ClassConstructor {
	new (...args: any): {}
}
export function Serialize(dto: ClassConstructor) {
	return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {

	constructor(
		private dto: any
	) {}

	intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
		// console.log("I'm running before the handler.", this.dto);
		return handler.handle().pipe(
			map((data: any) => {
				// console.log("I'm running after the handler.", data);
				const classToReturn = plainToInstance(this.dto, data, {
					excludeExtraneousValues: true
				});
				// console.log('Returning class ... ', classToReturn);
				return classToReturn;
			})
		)
	}
}