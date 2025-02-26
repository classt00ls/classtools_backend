import { UserWebId } from "@Web/UserWeb/Domain/UserWebId";
import { UserWeb } from "@Web/UserWeb/Domain/UserWeb";
import { UserWebRepository } from "@Web/UserWeb/Domain/UserWebRepository";


export class ToogleFavorite {

    constructor(
        private repository: UserWebRepository
    ) {}

    public async execute(
        userId: string,
        toolId: string
    ): Promise<void> 
    {
        const user = await this.repository.search(new UserWebId(userId));

    }

}