import { Injectable, Logger } from "@nestjs/common";
import { CategoryCreator } from "../Application/Create/CategoryCreator";
import { CategoryRepository } from "../Domain/category.repository";
import { EventListener } from "@Shared/Infrastructure/decorators/event-listener.decorator";
import { Event } from "@Events/Event/Domain/Event";
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

        // Si la etiqueta tiene más de 10 herramientas, evaluamos si debe convertirse en categoría
        if (tools.length > 10) {
            try {
                // Verificamos si la categoría ya existe por su ID
                await this.categoryRepository.findByIdAndFail(event.event_data.tagId);
                
                // Obtenemos el número total de categorías
                const categoryCount = await this.categoryRepository.countAll();
                
                // Si hay menos de 10 categorías, procedemos con la lógica original
                if (categoryCount < 10) {

                    this.logger.log(`Hay menos de 10 categorías (${categoryCount}). Procediendo con la lógica original.`);

                    await this.createNewCategory(event,tools.length);

                } else {
                    // Si ya hay 10 o más categorías, buscamos la que tiene menos herramientas
                    this.logger.log(`Ya existen ${categoryCount} categorías. Buscando la categoría con menos herramientas...`);
                    
                    await this.findCategoryWithFewestTools(event,tools.length);
                }
            } catch (error) {
                // Si la categoría ya existe, simplemente lo registramos y actualizamos el contador
                if (error.message.includes('already exists')) {
                    
                    this.logger.log(`Category already exists for tag ${event.event_data.tagName}`);
                    
                    await this.updateCategoryToolsNum(event,tools.length);                    
                    
                    return;
                }
                // Registramos cualquier otro error que pueda ocurrir
                this.logger.error(`Error handling tag ${event.event_data.tagName}: ${error.message}`);
            }
        }
    }
    

    private async createNewCategory(event: Event, toolsLength: number) {
        // Registramos el proceso de conversión de etiqueta a categoría
        this.logger.log(`Tag ${event.event_data.tagName} has been added ${event.event_data.times_added} times. Converting to category...`);
        
        // Creamos una nueva categoría con el ID y nombre de la etiqueta
        // e inicializamos el contador de herramientas con el número actual
        await this.categoryCreator.create(
            event.event_data.tagId,
            event.event_data.tagName,
            toolsLength
        );
        
        // Registramos el éxito de la operación
        this.logger.log(`Successfully created category from tag ${event.event_data.tagName} with ${toolsLength} tools`);
    }

    private async findCategoryWithFewestTools(event: Event, toolsLenght: number) {
        // Ahora sí necesitamos obtener todas las categorías para encontrar la que tiene menos herramientas
        const allCategories = await this.categoryRepository.findAll();
            
        // Encontramos la categoría con menos herramientas
        let categoryWithFewestTools = allCategories[0];
        for (const category of allCategories) {
            if (category.tools_num < categoryWithFewestTools.tools_num) {
                categoryWithFewestTools = category;
            }
        }
        
        // this.logger.log(`La categoría con menos herramientas es ${categoryWithFewestTools.name} con ${categoryWithFewestTools.tools_num} herramientas`);
        
        // Comparamos con nuestra etiqueta actual
        if (toolsLenght > categoryWithFewestTools.tools_num) {
            // this.logger.log(`La etiqueta ${event.event_data.tagName} tiene más herramientas (${toolsLenght}) que la categoría ${categoryWithFewestTools.name} (${categoryWithFewestTools.tools_num}). Reemplazando...`);
            
            // Eliminamos la categoría con menos herramientas
            await this.categoryRepository.delete(categoryWithFewestTools.id);
            this.logger.log(`Se ha eliminado la categoría ${categoryWithFewestTools.name}`);
            
            // Creamos la nueva categoría
            await this.categoryCreator.create(
                event.event_data.tagId,
                event.event_data.tagName,
                toolsLenght
            );
            
            this.logger.log(`Se ha creado la nueva categoría ${event.event_data.tagName} con ${toolsLenght} herramientas`);
        } 
    }

    private async updateCategoryToolsNum(event: Event, toolsLenght: number) {
        try {
            // Si la categoría ya existe, actualizamos su contador de herramientas
            const category = await this.categoryRepository.find(event.event_data.tagId);
            category.setToolsNum(toolsLenght);
            await this.categoryRepository.save(category);
            this.logger.log(`Updated tools count for category ${event.event_data.tagName} to ${toolsLenght}`);
        } catch (updateError) {
            this.logger.error(`Error updating tools count for category ${event.event_data.tagName}: ${updateError.message}`);
        }
    }
} 

    