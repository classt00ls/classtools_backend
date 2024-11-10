import { UserWeb } from "../../Model/UserWeb/UserWeb";
import { UserWebId } from "../../ValueObject/UserWebId";


export interface UserWebRepository {
	save(user: UserWeb): Promise<void>;

	search(id: UserWebId): Promise<UserWeb | null>;
}