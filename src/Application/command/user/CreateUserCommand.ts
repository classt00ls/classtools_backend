
export class CreateUserCommand {

	constructor(
		public email: string,
		public password: string,
		public name: string,
		public companyName: string
	) { }
}