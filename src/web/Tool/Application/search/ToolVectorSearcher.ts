import { Injectable } from "@nestjs/common";
import { ToolRepository } from "@Backoffice//Tool/Domain/tool.repository";
import { ToolVectorRepository } from "@Web/Tool/Domain/tool.vector.repository";
import { DataSource } from "typeorm";
import { ToolTypeormRepository } from "src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.typeorm.repository";

@Injectable()
export class ToolVectorSearcher {
    private repositories: { [key: string]: ToolRepository } = {};

    constructor(
        private readonly dataSource: DataSource,
        private readonly toolVectorRepository: ToolVectorRepository
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
    
    async search(
        prompt: string,
        lang: string = 'es'
    ) {
        try {
            const result = await this.toolVectorRepository.search(prompt);
            
            const repository = this.getRepositoryForLanguage(lang);
            const response = await Promise.all(result.map(item => this.format(item, repository))); 
            return response;
            
        } catch(error) {
            console.error('[ToolVectorRepository] Error en búsqueda vectorial:', error);
            throw error;
        }
    }

    private format = async (result, repository: ToolRepository) => {
        return await repository.getOne(result.id);
    }
}