import { QueryHandler } from "@nestjs/cqrs";
import { Injectable, Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ToolRepository } from "@Backoffice/Tool/Domain/tool.repository";
import { ToolTypeormRepository } from "src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.typeorm.repository";
import { ToolModel } from "@Backoffice/Tool/Domain/tool.model";
import { GetToolBySlugQuery } from "./GetToolBySlugQuery";
import { ToolVisitedEvent } from "src/Shared/Application/Event/Tool/ToolVisitedEvent";

@QueryHandler(GetToolBySlugQuery)
@Injectable()
export class GetToolBySlugQueryHandler {
    private readonly logger = new Logger(GetToolBySlugQueryHandler.name);
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

    async execute(query: GetToolBySlugQuery): Promise<ToolModel> {
        try {
            const lang = (query.lang || 'es').replace(/['"]/g, '').trim();
            this.logger.log(`Buscando herramienta con slug ${query.slug} en idioma: ${lang}`);

            const repository = this.getRepositoryForLanguage(lang);
            const tool = await repository.getOneBySlugOrFail(query.slug);
            tool.url = tool.url.split('?')[0];

            if(query.userId) {
                console.log('Emitir evento web.tool.get_detail');
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