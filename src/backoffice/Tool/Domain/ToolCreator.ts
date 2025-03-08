import { EventEmitter2 } from "@nestjs/event-emitter";
import { ToolCreatedEvent } from "@Backoffice/Tool/Domain/ToolCreatedEvent";
import { ScrapToolResponse } from "./ScrapResponse";
import { ToolRepository } from "./tool.repository";
import { v6 as uuidv6 } from 'uuid';
import { TagModel } from "@Backoffice/Tag/Domain/Tag.model";
import { Injectable, Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ToolTypeormRepository } from "@Web/Tool/Infrastructure/Persistence/Mysql/tool.typeorm.repository";
import { ToolAssignedEvent } from "@Backoffice/Tag/Domain/ToolAssignedEvent";

export type ToolParams = ScrapToolResponse & {
    description: {
        [key: string]: { analysis: string }
    };
    excerpt: {
        [key: string]: { analysis: string }
    };
    features: {
        [key: string]: { analysis: string }
    };
    prosAndCons: {
        [key: string]: { 
            analysis: string,
            structuredData: {
                pros: string[],
                cons: string[]
            }
        }
    };
    ratings: {
        [key: string]: {
            analysis: string,
            structuredData: {
                ratings: Array<{
                    category: string,
                    score: number,
                    description: string
                }>
            }
        }
    };
    howToUse: {
        [key: string]: {
            analysis: string,
            structuredData: {
                steps: Array<{
                    title: string,
                    description: string
                }>
            }
        }
    };
    videoUrl: string;
};

@Injectable()
export class ToolCreator {
    private readonly logger = new Logger(ToolCreator.name);
    private repositories: { [key: string]: ToolRepository } = {};

    constructor(
        private eventEmitter: EventEmitter2,
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
    
    async create(
        toolParams: ToolParams,
        tags: TagModel[]
    ){
        try {
            // Obtener los idiomas disponibles
            const availableLanguages = Object.keys(toolParams.description);
            this.logger.log(`Creando tool en ${availableLanguages.length} idiomas: ${availableLanguages.join(', ')}`);

            // Generar un ID único para todas las versiones de la herramienta
            const toolId = uuidv6();

            // Crear todas las versiones en paralelo
            const creationPromises = availableLanguages.map(async lang => {
                const repository = this.getRepositoryForLanguage(lang);
                
                const tool = await repository.create({
                    id: toolId, // Mismo ID para todas las versiones
                    name: toolParams.title,
                    excerpt: toolParams.excerpt[lang]?.analysis,
                    link: toolParams.link,
                    url: toolParams.url,
                    pricing: toolParams.pricing,
                    description: toolParams.description[lang]?.analysis,
                    features: toolParams.features[lang]?.analysis,
                    stars: toolParams.stars,
                    html: toolParams.body_content,
                    video_html: toolParams.video_content,
                    video_url: toolParams.videoUrl || '',
                    prosAndCons: toolParams.prosAndCons[lang]?.analysis || '',
                    ratings: toolParams.ratings[lang]?.analysis || '',
                    howToUse: toolParams.howToUse[lang]?.analysis || ''
                });

                tool.tags = tags;
                await repository.save(tool);

                // Emitir evento para cada tag asignado
                for (const tag of tags) {
                    this.eventEmitter.emit(
                        ToolAssignedEvent.eventName(),
                        new ToolAssignedEvent(tag.id, tool.id, tag.name, tag.times_added)
                    );
                }

                // Solo emitimos el evento para la versión en inglés
                if (lang === 'en') {
                    this.eventEmitter.emit(
                        'backoffice.tool.created',
                        new ToolCreatedEvent(
                            tool.id,
                            tool.name,
                            tool.tags.map(t => t.name).join("\n"),
                            tool.description,
                            tool.pricing,
                            tool.url,
                            tool.html,
                            tool.video_html,
                            tool.video_url,
                            tool.prosAndCons,
                            tool.ratings
                        )
                    );
                    this.logger.log(`Evento tool.created emitido para versión en inglés: ${tool.name} (${tool.id})`);
                }

                this.logger.log(`Tool creada exitosamente en ${lang}: ${tool.name} (${tool.id})`);
                return tool;
            });

            const createdTools = await Promise.all(creationPromises);
            return createdTools;

        } catch (error) {
            this.logger.error(`Error al crear la tool: ${error.message}`);
            throw error;
        }
    }
}