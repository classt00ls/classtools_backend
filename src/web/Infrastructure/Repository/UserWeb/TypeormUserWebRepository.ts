import { UserWeb } from "src/web/Domain/Model/UserWeb/UserWeb";
import { UserWebRepository } from "src/web/Domain/Repository/UserWeb/UserWebRepository";
import { UserWebId } from "src/web/Domain/ValueObject/UserWebId";
import { DataSource, Repository } from "typeorm";
import { DatabaseWebUser } from "../../Persistence/typeorm/UserWeb.schema";
import { UserWebSchema } from "src/Web/Infrastructure/Persistence/typeorm/userWeb.schema";

export class TypeormUserWebRepository implements UserWebRepository {

	private repository : Repository<DatabaseWebUser>;
	
	constructor(
		datasource: DataSource
	) {
		this.repository = datasource.getRepository(UserWebSchema);
	}

	async save(user: UserWeb): Promise<void> {
		const userPrimitives = user.toPrimitives();

		await this.repository.insert({
			id: userPrimitives.id,
			favorites: JSON.stringify(userPrimitives.favorites),
			visitedTools: JSON.stringify(userPrimitives.visitedTools)
		});
	}

	async search(id: UserWebId): Promise<UserWeb | null> {
		const response = await this.repository.findOneByOrFail({id: id.value});

		return UserWeb.fromPrimitives({
			id: response.id,
			favorites: JSON.parse(response.favorites),
			visitedTools: JSON.parse(response.visitedTools)
		});
	}
}