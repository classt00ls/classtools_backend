import { Injectable, Logger } from "@nestjs/common";

import { DataSource, In, InsertResult, Like, MoreThan, Repository } from 'typeorm';
import { ToolRepository } from "@backoffice/Tool/Domain/tool.repository";
import { createToolSchema } from "@backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.schema";
import { ToolModel } from "@backoffice/Tool/Domain/tool.model";
import { ToolFilter } from "@Web/Tool/Domain/tool.filter";
import { ToolLangFilter } from "@Web/Tool/Domain/tool.lang.filter";

import * as fs from 'fs/promises';

@Injectable()
export class ToolTypeormRepository extends ToolRepository {
  private readonly logger = new Logger(ToolTypeormRepository.name);
  private repository : Repository<ToolModel>;

  constructor(
    datasource: DataSource,
    suffix: string = 'en'
  ) {
    super(suffix);
    this.repository = datasource.getRepository(createToolSchema(this.suffix));
  }
  
  async getAll(
    filter: ToolFilter | ToolLangFilter
  ): Promise<ToolModel[]> {
    const where: any = {};
    
    if (filter.getTags()?.length > 0) {
      where.tags = { name: In(filter.getTags()) };
    }
    
    if (filter.getTitle()) {
      where.name = Like(`%${filter.getTitle()}%`);
    }

    if (filter.getStars()) {
      where.stars = MoreThan(filter.getStars());
    }

    return this.repository.find({
      skip: filter.getPage(),
      take: filter.getPageSize(),
      relations: ['tags'],
      where: where,
      order: {
        stars: 'DESC'
      }
    });
  }

  async getOne(
    id: string
  ): Promise<ToolModel> {
    
    
    const query = this.repository.createQueryBuilder('tool')
      .where('tool.id = :id', { id })
      .getSql();
    
    const result = await this.repository.findOne({
      relations: ['tags'],
      where: {
        id: id
      }
    });
    return result;
  }

  async create(
    model: ToolModel
  ): Promise<ToolModel> {
    return await this.repository.create(model);
  }

  async insert(
    model: ToolModel
  ): Promise<InsertResult> {
    return await this.repository.insert(model);
  }

  async save(model: ToolModel): Promise<ToolModel> {
    try {
      const result = await this.repository.save(model);
      this.logger.debug(`Tool guardada correctamente: ${model.name} (${model.id})`);
      return result;
    } catch (error) {
      this.logger.error(`Error al guardar tool ${model.name} (${model.id}): ${error.message}`);
      throw error;
    }
  }

  async getOneByIdOrFail(
    id: string
  ): Promise<ToolModel> {
    const response = await this.repository.findOneByOrFail({id});
    return response;
  }

  async count( 
    tags: Array<string>
  ): Promise<number> {
    const response = await this.repository.count({
        where: {
          ...(tags?.length > 0 && {tags: {name: In(tags)}})
        }  
    });
    return response;
  }

  async getOneByNameAndFail(name: string) {
    try {
      await this.repository.findOneByOrFail({name});
    } catch (error) {

      return;
    }
    throw new Error(`La tool ${name} ya existe`);
  }

  async getOneByLinkAndFail(link: string) {
    try {
      const tool = await this.repository.findOneByOrFail({link: link});
      this.logger.debug(`Tool con link ${link} ya existe`);
      return;
    } catch (error) {
      // Si no existe la herramienta, continuamos con la importación
      throw new Error(`La tool con link ${link} no existe`);
    }
  }

  async getOneByLinkOrFail(link: string): Promise<ToolModel> {
    return await this.repository.findOneByOrFail({link});
  }

  async getOneByNameOrFail(name: string): Promise<ToolModel> {
    try {
      const response = await this.repository.findOneByOrFail({name});

      return ToolModel.fromPrimitives(
        response.id,
        response.name,
        response.pricing,
        response.stars,
        response.description,
        response.features,
        response.excerpt,
        response.tags,
        response.link,
        response.url,
        response.html,
        response.video_html,
        response.video_url,
        response.prosAndCons,
        response.ratings,
        response.howToUse
      );
    } catch (error) {
      this.logger.error(`Error al obtener tool por nombre ${name}: ${error.message}`);
      throw error;
    }
  }

  async getOneBySlugOrFail(slug: string): Promise<ToolModel> {
    try {
      this.logger.debug(`Buscando tool con nombre: ${slug}`);
      
      const response = await this.repository.findOneByOrFail({
        name: slug
      });

      return ToolModel.fromPrimitives(
        response.id,
        response.name,
        response.pricing,
        response.stars,
        response.description,
        response.features,
        response.excerpt,
        response.tags,
        response.link,
        response.url,
        response.html,
        response.video_html,
        response.video_url,
        response.prosAndCons,
        response.ratings,
        response.howToUse
      );
    } catch (error) {
      this.logger.error(`Error al obtener tool por nombre ${slug}: ${error.message}`);
      throw error;
    }
  }

  async export(): Promise<void> {
    try {
      const tools = await this.repository.find();
      const jsonContent = JSON.stringify(tools, null, 2);
      await fs.writeFile('tools.json', jsonContent);
      this.logger.log('Exportación de tools completada exitosamente');
    } catch (error) {
      this.logger.error(`Error al exportar tools: ${error.message}`);
      throw error;
    }
  }

  async findByTagId(tagId: string): Promise<ToolModel[]> {
    return this.repository
      .createQueryBuilder('tool')
      .innerJoin('tool.tags', 'tag')
      .where('tag.id = :tagId', { tagId })
      .getMany();
  }

  async getByIds(ids: string[]): Promise<ToolModel[]> {
    return this.repository.find({
      where: {
        id: In(ids)
      },
      relations: ['tags']
    });
  }
}
