import { Injectable } from "@nestjs/common";
import { UserWeb } from "@Web/UserWeb/Domain/UserWeb";
import { InsertResult } from "typeorm";
import { DatabaseWebUser } from "@Web/UserWeb/Infrastructure/Persistence/TypeOrm/DatabaseWebUser.schema";
import { UserWebId } from "@Web/UserWeb/Domain/UserWebId";

@Injectable()
export abstract class UserWebRepository {
	abstract create(model: Partial<DatabaseWebUser>): Promise<DatabaseWebUser>;

  	abstract insert(model: DatabaseWebUser): Promise<InsertResult>;

	abstract save(user: UserWeb): Promise<void>;

	abstract search(id: UserWebId): Promise<UserWeb | null>;

	abstract deleteAll(): Promise<void>;
}