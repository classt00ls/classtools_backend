import { EventEmitter2 } from "@nestjs/event-emitter";
import { ToolCreatedEvent } from "@backoffice/Tool/Domain/ToolCreatedEvent";
import { ScrapToolResponse } from "./ScrapResponse";
import { ToolRepository } from "./tool.repository";
import { v6 as uuidv6 } from 'uuid';
import { TagModel } from "@backoffice/Tag/Domain/Tag.model";
import { Injectable, Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ToolTypeormRepository } from "src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.typeorm.repository";
import { ToolAssignedEvent } from "@backoffice/Tag/Domain/ToolAssignedEvent";
import { CommandBus } from "@nestjs/cqrs";
import { CreateEventCommand } from "@Events/Event/Application/Create/CreateEventCommand";

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
        private dataSource: DataSource,
        private commandBus: CommandBus
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

            let englishTool = null;

            // Crear todas las versiones en paralelo
            const creationPromises = availableLanguages.map(async lang => {
                const repository = this.getRepositoryForLanguage(lang);
                
                const tool = await repository.create({
                    id: toolId,
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

                // Guardamos los eventos de tags asignados
                for (const tag of tags) {
                    await this.commandBus.execute(
                        new CreateEventCommand(
                            ToolAssignedEvent.eventName(),
                            new ToolAssignedEvent(tag.id, tool.id, tag.name, tag.times_added),
                            tag.id
                        )
                    );
                }

                // Guardamos la referencia a la versión en inglés
                if (lang === 'en') {
                    englishTool = tool;
                }

                this.logger.log(`Tool creada exitosamente en ${lang}: ${tool.name} (${tool.id})`);
                return tool;
            });

            const createdTools = await Promise.all(creationPromises);

            // Solo después de que todas las versiones se hayan creado exitosamente, guardamos el evento principal
            if (englishTool) {
                const event = new ToolCreatedEvent(
                    englishTool.id,
                    englishTool.name,
                    englishTool.tags.map(t => t.name).join("\n"),
                    englishTool.description,
                    englishTool.pricing,
                    englishTool.url,
                    englishTool.html,
                    englishTool.video_html,
                    englishTool.video_url,
                    englishTool.prosAndCons,
                    englishTool.ratings
                );

                await this.commandBus.execute(
                    new CreateEventCommand(
                        'backoffice.tool.created',
                        event,
                        englishTool.id
                    )
                );
                
                this.logger.log(`Evento tool.created guardado para: ${englishTool.name} (${englishTool.id})`);
            }

            return createdTools;

        } catch (error) {
            this.logger.error(`Error al crear la tool: ${error.message}`);
            throw error;
        }
    }
}