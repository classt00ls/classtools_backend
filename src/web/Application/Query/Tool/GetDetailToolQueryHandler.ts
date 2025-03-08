import { QueryHandler } from "@nestjs/cqrs";
import { Injectable, Logger } from "@nestjs/common";
import { ToolRepository } from "@Backoffice//Tool/Domain/tool.repository";
import { GetDetailToolQuery } from "./GetDetailToolQuery";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ToolVisitedEvent } from "src/Shared/Application/Event/Tool/ToolVisitedEvent";
import { DataSource } from "typeorm";
import { ToolTypeormRepository } from "@Web/Tool/Infrastructure/Persistence/Mysql/tool.typeorm.repository";

@QueryHandler(GetDetailToolQuery)
@Injectable()
export class GetDetailToolQueryHandler {
    private readonly logger = new Logger(GetDetailToolQueryHandler.name);
    private repositories: { [key: string]: ToolRepository } = {};

    constructor(
        private dataSource: DataSource,
        private eventEmitter: EventEmitter2
    ) {
        // Inicializar repositorios para los idiomas principales
        this.repositories = {
            es: new ToolTypeormRepository(dataSource, '_es'),
            en: new ToolTypeormRepository(dataSource, '_en')
        };
    }

    private getRepositoryForLanguage(lang: string): ToolRepository {
        const cleanLang = lang.replace(/['"]/g, '').trim();
        
        if (!this.repositories[cleanLang]) {
            this.repositories[cleanLang] = new ToolTypeormRepository(this.dataSource, `_${cleanLang}`);
        }
        return this.repositories[cleanLang];
    }

    async execute(query: GetDetailToolQuery) {
        try {
            const lang = (query.lang || 'es').replace(/['"]/g, '').trim();
            this.logger.log(`Buscando herramienta ${query.id} en idioma: ${lang}`);

            const repository = this.getRepositoryForLanguage(lang);
            const tool = await repository.getOneByIdOrFail(query.id);
            tool.url = tool.url.split('?')[0];

            if(query.userId) {
                this.eventEmitter.emit(
                    'web.tool.get_detail',
                    new ToolVisitedEvent(
                        tool.name,
                        query.userId
                    ),
                );
            }
            
            return tool;
        } catch (error) {
            this.logger.error(`Error al buscar herramienta: ${error.message}`);
            throw error;
        }
    }
}