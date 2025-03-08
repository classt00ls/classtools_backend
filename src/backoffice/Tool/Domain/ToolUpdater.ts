import { Injectable, Logger } from "@nestjs/common";
import { ToolRepository } from "./tool.repository";
import { DataSource } from "typeorm";
import { ToolTypeormRepository } from "@Web/Tool/Infrastructure/Persistence/Mysql/tool.typeorm.repository";
import { ToolParams } from "./ToolCreator";
import { ToolModel } from "./tool.model";

@Injectable()
export class ToolUpdater {
    private readonly logger = new Logger(ToolUpdater.name);
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
    
    async update(
        toolId: string,
        toolParams: ToolParams,
    ){
        try {
            // Obtener los idiomas disponibles
            const availableLanguages = Object.keys(toolParams.description);
            this.logger.log(`Actualizando tool ${toolId} en ${availableLanguages.length} idiomas: ${availableLanguages.join(', ')}`);

            // Actualizar todas las versiones en paralelo
            const updatePromises = availableLanguages.map(async lang => {
                const repository = this.getRepositoryForLanguage(lang);
                
                // Obtener la herramienta existente
                const existingTool = await repository.getOneByIdOrFail(toolId);
                
                // Actualizar solo los campos que vienen del extractor
                const updatedTool: Partial<ToolModel> = {
                    excerpt: toolParams.excerpt[lang]?.analysis,
                    description: toolParams.description[lang]?.analysis,
                    features: toolParams.features[lang]?.analysis,
                    video_url: toolParams.videoUrl || '',
                    prosAndCons: toolParams.prosAndCons[lang]?.analysis || '',
                    ratings: toolParams.ratings[lang]?.analysis || ''
                };

                // Mantener los campos existentes que no se actualizan
                Object.assign(existingTool, updatedTool);
                
                await repository.save(existingTool);

                this.logger.log(`Tool actualizada exitosamente en ${lang}: ${existingTool.name} (${existingTool.id})`);
                return existingTool;
            });

            const updatedTools = await Promise.all(updatePromises);
            return updatedTools;

        } catch (error) {
            this.logger.error(`Error al actualizar la tool ${toolId}: ${error.message}`);
            throw error;
        }
    }
} 