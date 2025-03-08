import { QueryHandler } from "@nestjs/cqrs";
import { Injectable, Logger } from "@nestjs/common";
import { ToolRepository } from "@Backoffice/Tool/Domain/tool.repository";
import { CountToolsByLangQuery } from "./CountToolsByLangQuery";
import { DataSource } from "typeorm";
import { ToolTypeormRepository } from "@Web/Tool/Infrastructure/Persistence/Mysql/tool.typeorm.repository";

@QueryHandler(CountToolsByLangQuery)
@Injectable()
export class CountToolsByLangQueryHandler {
    private readonly logger = new Logger(CountToolsByLangQueryHandler.name);
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
        const cleanLang = lang.replace(/['"]/g, '').trim();
        
        if (!this.repositories[cleanLang]) {
            this.repositories[cleanLang] = new ToolTypeormRepository(this.dataSource, `_${cleanLang}`);
        }
        return this.repositories[cleanLang];
    }

    async execute(query: CountToolsByLangQuery): Promise<number> {
        try {
            const lang = (query.filter.lang || 'es').replace(/['"]/g, '').trim();
            this.logger.log(`Contando herramientas en idioma: ${lang}`);

            const repository = this.getRepositoryForLanguage(lang);
            const total = await repository.count(query.filter.selectedCategories || []);

            this.logger.log(`Total de herramientas encontradas: ${total}`);
            return total;

        } catch (error) {
            this.logger.error(`Error al contar herramientas: ${error.message}`);
            throw error;
        }
    }
} 