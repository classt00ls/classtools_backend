import { QueryHandler } from "@nestjs/cqrs";
import { Injectable, Logger } from "@nestjs/common";
import { GetFavoriteToolsQuery } from "./GetFavoriteToolsQuery";
import { ToolRepository } from "@backoffice/Tool/Domain/tool.repository";
import { UserWebRepository } from "@Web/UserWeb/Domain/UserWebRepository";
import { UserWebId } from "@Web/UserWeb/Domain/UserWebId";
import { ToolTypeormRepository } from "@backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.typeorm.repository";
import { DataSource } from "typeorm";
import { ToolModel } from "@backoffice/Tool/Domain/tool.model";

@QueryHandler(GetFavoriteToolsQuery)
@Injectable()
export class GetFavoriteToolsQueryHandler {
    private readonly logger = new Logger(GetFavoriteToolsQueryHandler.name);
    private repositories: { [key: string]: ToolRepository } = {};

    constructor(
        private readonly dataSource: DataSource,
        private readonly userRepository: UserWebRepository
    ) {}

    private getRepositoryForLanguage(lang: string): ToolRepository {
        const cleanLang = lang.replace(/['"]/g, '').trim();
        
        if (!this.repositories[cleanLang]) {
            this.repositories[cleanLang] = new ToolTypeormRepository(this.dataSource, `_${cleanLang}`);
        }
        return this.repositories[cleanLang];
    }

    async execute(query: GetFavoriteToolsQuery) {
        try {
            // 1. Obtener el usuario y sus favoritos
            const user = await this.userRepository.search(new UserWebId(query.userId));
            const favoriteIds = JSON.parse(user.favorites);

            if (!favoriteIds.length) {
                return {
                    data: [],
                    count: 0
                };
            }

            // 2. Obtener las herramientas favoritas
            const repository = this.getRepositoryForLanguage(query.lang);
            const tools = await repository.getByIds(favoriteIds);

            // 3. Convertir a primitivos y marcar como favoritas
            const toolsWithBookmark = tools.map(tool => {
                const toolData = tool instanceof ToolModel ? tool.toPrimitives() : tool;
                return {
                    ...toolData,
                    isBookmarked: true
                };
            });

            // 4. Devolver cada herramienta envuelta en un objeto para que coincida con el DTO
            return toolsWithBookmark.map(tool => ({
                ...tool,
                totalBookmarked: false // Valor por defecto
            }));
        } catch (error) {
            this.logger.error(`Error al obtener herramientas favoritas: ${error.message}`);
            throw error;
        }
    }
} 