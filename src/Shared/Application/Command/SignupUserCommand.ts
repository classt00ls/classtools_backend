
export class SignupUserCommand {

	constructor(
		public email: string,
		public password: string,
		public name: string,
		public companyName: string = null
	) { }
}