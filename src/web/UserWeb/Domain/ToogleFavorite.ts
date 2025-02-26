import { Injectable } from "@nestjs/common";
import { UserWebId } from "@Web/UserWeb/Domain/UserWebId";
import { UserWebRepository } from "@Web/UserWeb/Domain/UserWebRepository";

@Injectable()
export class ToogleFavorite {

    constructor(
        private repository: UserWebRepository
    ) {}

    public async execute(
        userId: UserWebId,
        toolId: string
    ): Promise<void> 
    {
        const user = await this.repository.search(userId);

        user.toggleFavorite(toolId);

        await this.repository.save(user);

    }

}