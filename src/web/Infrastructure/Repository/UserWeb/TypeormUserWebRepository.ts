import { UserWeb } from "src/web/Domain/Model/UserWeb/UserWeb";
import { UserWebId } from "src/web/Domain/ValueObject/UserWebId";
import { DataSource, InsertResult, Repository } from "typeorm";
import { DatabaseWebUser } from "../../Persistence/typeorm/DatabaseWebUser.schema";
import { UserWebSchema } from "src/web/Infrastructure/Persistence/typeorm/DatabaseWebUser.schema";
import { Injectable } from "@nestjs/common";
import { UserWebRepository } from "src/web/Domain/Repository/UserWeb/UserWebRepository";


@Injectable()
export class TypeormUserWebRepository extends UserWebRepository {

	private repository : Repository<DatabaseWebUser>;
	
	constructor(
		datasource: DataSource
	) {
		super();
		this.repository = datasource.getRepository(UserWebSchema);
	}

	async create(
		model: DatabaseWebUser
	  ): Promise<DatabaseWebUser> {
		return await this.repository.create(model);
	  }

	async insert(
		model: DatabaseWebUser
	  ): Promise<InsertResult> {
		return await this.repository.insert(model);
	  }
	

	async save(user: UserWeb): Promise<void> {
		const userPrimitives = user.toPrimitives();

		await this.repository.insert({
			id: userPrimitives.id,
			favorites: JSON.stringify(userPrimitives.favorites),
			visited_tools: JSON.stringify(userPrimitives.visitedTools)
		});
	}

	async search(id: UserWebId): Promise<UserWeb | null> {
		try {
			const response = await this.repository.findOneByOrFail({id: id.value});
			return UserWeb.fromPrimitives({
				id: response.id,
				favorites: JSON.parse(response.favorites),
				visitedTools: JSON.parse(response.visited_tools)
			});
		} catch (error) {
			return null;
		}
		
		
		
	}
}