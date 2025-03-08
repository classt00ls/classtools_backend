import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetFilteredToolsByLangQuery } from "./GetFilteredToolsByLangQuery";
import { ToolRepository } from "@Backoffice/Tool/Domain/tool.repository";
import { Injectable, Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ToolTypeormRepository } from "@Web/Tool/Infrastructure/Persistence/Mysql/tool.typeorm.repository";
import { ToolModel } from "@Backoffice/Tool/Domain/tool.model";
import { ToolLangFilter } from "@Web/Tool/Domain/tool.lang.filter";

@Injectable()
@QueryHandler(GetFilteredToolsByLangQuery)
export class GetFilteredToolsByLangQueryHandler implements IQueryHandler<GetFilteredToolsByLangQuery> {
    private readonly logger = new Logger(GetFilteredToolsByLangQueryHandler.name);
    private repositories: { [key: string]: ToolRepository } = {};

    constructor(
        private dataSource: DataSource
    ) {
        // Inicializar repositorios para los idiomas principales
        this.repositories = {
            es: new ToolTypeormRepository(dataSource, '_es'),
            en: new ToolTypeormRepository(dataSource, '_en')
        };
    }

    private getRepositoryForLanguage(lang: string): ToolRepository {
        if (!this.repositories[lang]) {
            this.repositories[lang] = new ToolTypeormRepository(this.dataSource, `_${lang}`);
        }
        return this.repositories[lang];
    }

    async execute(query: GetFilteredToolsByLangQuery): Promise<ToolModel[]> {
        try {
            const lang = query.filter.lang || 'es';
            this.logger.log(`Buscando herramientas en idioma: ${lang}`);

            const repository = this.getRepositoryForLanguage(lang);

            const filter = ToolLangFilter.fromFilterDto(
                query.filter,
                query.page,
                query.pageSize
            );

            const tools = await repository.getAll(filter);
            this.logger.log(`Encontradas ${tools.length} herramientas`);

            return tools;

        } catch (error) {
            this.logger.error(`Error al buscar herramientas: ${error.message}`);
            throw error;
        }
    }
} 