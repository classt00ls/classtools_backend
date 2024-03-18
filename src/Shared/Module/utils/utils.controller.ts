import { Controller, Get, Query } from "@nestjs/common";


@Controller('utils')
export class UtilsController {

	constructor(
		// private readonly commandBus:CommandBus,
		// private readonly queryBus: QueryBus
	){}

	@Get('/references')
	async getReferences(
		@Query('size') size: number
	) {
		const array = [];
		for(let i=0 ; i<=size ; i++) {
			array[i] = i;
		}

		const shuffledArray = array.sort((a, b) => 0.5 - Math.random());
		return shuffledArray;
	}
}
