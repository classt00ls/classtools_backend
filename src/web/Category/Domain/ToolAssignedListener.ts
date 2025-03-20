import { Injectable, Logger } from "@nestjs/common";
import { CategoryCreator } from "../Application/Create/CategoryCreator";
import { CategoryRepository } from "../Domain/category.repository";
import { EventListener } from "@Shared/Infrastructure/decorators/event-listener.decorator";
import { Event } from "@Events/Event/Domain/Event";
import { ToolRepository } from "@Backoffice/Tool/Domain/tool.repository";
import { ToolTypeormRepository } from "src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.typeorm.repository";
import { DataSource } from "typeorm";

/**
 * Escucha de eventos cuando una herramienta es asignada a una etiqueta.
 * Este listener se activa con el evento 'backoffice.tag.tool.assigned' y
 * determina si una etiqueta debe convertirse en categoría basándose en 
 * la cantidad de herramientas asociadas.
 */
@EventListener('backoffice.tag.tool.assigned')
@Injectable()
export class ToolAssignedListener {
    // Creamos un logger específico para esta clase
    private readonly logger = new Logger(ToolAssignedListener.name);

    constructor(
        private categoryCreator: CategoryCreator, // Servicio para crear categorías
        private categoryRepository: CategoryRepository, // Repositorio para acceder a las categorías
        private dataSource: DataSource // Fuente de datos para conexión con la base de datos
    ) {}

    /**
     * Maneja el evento de asignación de herramienta a etiqueta
     * @param event Evento con los datos de la asignación
     */
    async handle(event: Event) {
        // Registramos la asignación de la herramienta a la etiqueta
        this.logger.log(`Tool ${event.event_data.toolId} assigned to tag ${event.event_data.tagId}`);

        // Creamos un repositorio para acceder a las herramientas en inglés
        const repository = new ToolTypeormRepository(this.dataSource, `_en`);

        // Obtenemos todas las herramientas asociadas a la etiqueta actual
        const tools = await repository.findByTagId(event.event_data.tagId);
        this.logger.log(`El tag ${event.event_data.tagName} tiene ${tools.length} herramientas asociadas`);

        // Si la etiqueta tiene más de 10 herramientas, la convertimos en categoría
        if (tools.length > 10) {
            try {
                // Verificamos si la categoría ya existe por su ID
                await this.categoryRepository.findByIdAndFail(event.event_data.tagId);
                
                // Registramos el proceso de conversión de etiqueta a categoría
                this.logger.log(`Tag ${event.event_data.tagName} has been added ${event.event_data.times_added} times. Converting to category...`);
                
                // Creamos una nueva categoría con el ID y nombre de la etiqueta
                // e inicializamos el contador de herramientas con el número actual
                await this.categoryCreator.create(
                    event.event_data.tagId,
                    event.event_data.tagName,
                    tools.length
                );
                
                // Registramos el éxito de la operación
                this.logger.log(`Successfully created category from tag ${event.event_data.tagName} with ${tools.length} tools`);
            } catch (error) {
                // Si la categoría ya existe, simplemente lo registramos y salimos
                if (error.message.includes('already exists')) {
                    this.logger.log(`Category already exists for tag ${event.event_data.tagName}`);
                    
                    try {
                        // Si la categoría ya existe, actualizamos su contador de herramientas
                        const category = await this.categoryRepository.find(event.event_data.tagId);
                        category.setToolsNum(tools.length);
                        await this.categoryRepository.save(category);
                        this.logger.log(`Updated tools count for category ${event.event_data.tagName} to ${tools.length}`);
                    } catch (updateError) {
                        this.logger.error(`Error updating tools count for category ${event.event_data.tagName}: ${updateError.message}`);
                    }
                    
                    return;
                }
                // Registramos cualquier otro error que pueda ocurrir
                this.logger.error(`Error handling tag ${event.event_data.tagName}: ${error.message}`);
            }
        }
    }
} 