import { UserWeb } from "@Web/UserWeb/Domain/UserWeb";
import { UserWebId } from "src/web/Domain/ValueObject/UserWebId";
import { DataSource, InsertResult, Repository } from "typeorm";
import { DatabaseWebUser } from "./DatabaseWebUser.schema";
import { UserWebSchema } from "@Web/UserWeb/Infrastructure/Persistence/TypeOrm/DatabaseWebUser.schema";
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

		await this.repository.save({
			id: userPrimitives.id,
			email: userPrimitives.email,
			name: userPrimitives.name,
			favorites: JSON.stringify(userPrimitives.favorites),
			visited_tools: userPrimitives.visitedTools,
			suggestions: userPrimitives.suggestions
		});

	}

	async search(id: UserWebId): Promise<UserWeb | null> {
		try {
			const response = await this.repository.findOneByOrFail({id: id.value});
			
			return UserWeb.fromPrimitives({
				id: response.id,
				favorites: JSON.parse(response.favorites),
				visitedTools: response.visited_tools,
				email: response.email,
				name: response.name,
				suggestions: response.suggestions
			});
		} catch (error) {
			return null;
		}
		
		
		
	}

	public async deleteAll(): Promise<void> {
		await this.repository.clear();
	}
}