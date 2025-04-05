import { Inject, Injectable } from "@nestjs/common";
import { ToolRepository } from "@backoffice/Tool/Domain/tool.repository";
import { DataSource } from "typeorm";
import { ToolTypeormRepository } from "src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.typeorm.repository";
import { EmbeddingRepository } from "@Shared/Embedding/Domain/EmbeddingRepository";

@Injectable()
export class ToolVectorSearcher {
    private repositories: { [key: string]: ToolRepository } = {};

    constructor(
        private readonly dataSource: DataSource,
        @Inject('EmbeddingRepository') private readonly embeddingRepository: EmbeddingRepository
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
            // Usamos el EmbeddingRepository para buscar contenido similar
            const embeddings = await this.embeddingRepository.search(
                prompt, 
                10, // Límite de resultados
                { type: 'tool' } // Filtro por metadatos para asegurar que solo devuelve herramientas
            );
            
            // Extraemos los IDs de los resultados
            const toolIds = embeddings.map(embedding => embedding.metadata.aggregateId || embedding.id);
            
            // Obtenemos la información completa de las herramientas desde el repositorio específico del idioma
            const repository = this.getRepositoryForLanguage(lang);
            const response = await Promise.all(
                toolIds.map(id => this.format({ id }, repository))
            );
            
            // Filtramos posibles valores nulos (herramientas que pudieran no existir)
            return response.filter(tool => tool !== null);
            
        } catch(error) {
            console.error('[ToolVectorSearcher] Error en búsqueda de embeddings:', error);
            throw error;
        }
    }

    private format = async (result, repository: ToolRepository) => {
        return await repository.getOne(result.id);
    }
}