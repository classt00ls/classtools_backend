import { Injectable } from "@nestjs/common";
import { UserWeb } from "../../Model/UserWeb/UserWeb";
import { InsertResult } from "typeorm";
import { DatabaseWebUser } from "src/web/Infrastructure/Persistence/typeorm/DatabaseWebUser.schema";
import { UserWebId } from "../../ValueObject/UserWebId";

@Injectable()
export abstract class UserWebRepository {
	abstract create(model: Partial<DatabaseWebUser>): Promise<DatabaseWebUser>;

  	abstract insert(model: DatabaseWebUser): Promise<InsertResult>;

	abstract save(user: UserWeb): Promise<void>;

	abstract search(id: UserWebId): Promise<UserWeb | null>;

	abstract deleteAll(): Promise<void>;
}