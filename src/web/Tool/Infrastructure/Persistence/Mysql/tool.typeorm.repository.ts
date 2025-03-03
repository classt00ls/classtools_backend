import { Injectable } from "@nestjs/common";

import { DataSource, In, InsertResult, Like, MoreThan, Repository } from 'typeorm';
import { ToolRepository } from "src/Shared/Domain/Repository/tool.repository";
import { ToolSchema } from "src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.schema";
import { ToolModel } from "src/Shared/Domain/Model/Tool/tool.model";
import { ToolFilter } from "@Web/Tool/Domain/tool.filter";

import * as fs from 'fs/promises';

@Injectable()
export class ToolTypeormRepository extends ToolRepository {
  
  private repository : Repository<ToolModel>;

  constructor(datasource: DataSource) {
    super();
    this.repository = datasource.getRepository(ToolSchema);
  }
  
  async getAll(
    filter: ToolFilter
  ): Promise<ToolModel[]> {

// console.log(filter)

    return this.repository.find({
      skip: filter.getPage(),
      take: filter.getPageSize(),
      relations: ['tags'],
      where: {
        // ...(filter.getTitle() != '' && {name: Like(`%${filter.getTitle()}%`)}),
        ...(filter.getTags()?.length > 0 && {tags: {name: In(filter.getTags())}}),
        // ...(filter.getStars() && {stars: MoreThan(filter.getStars()) })
      }
    });

  }

  async getOne(
    id: string
  ): Promise<ToolModel> {

// console.log(filter)

    return this.repository.findOne({
      relations: ['tags'],
      where: {
        id: id
      }
    });

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
    return this.repository.save(model);
  }

  async getOneByIdOrFail(
    id: string
  ): Promise<ToolModel> {
    const response = await this.repository.findOneByOrFail({id});
    return response;
  }

  async count( 
    tags: Array<string>,
    // stars: number,
    // title: string
  ): Promise<number> {
    const response = await this.repository.count({
        where: {
          // ...(title != '' && {name: Like(`%${title}%`)}),
          ...(tags?.length > 0 && {tags: {name: In(tags)}}),
          // ...(stars && {stars: MoreThan(stars) })
        }  
    });
    return response;
  }

  async getOneByNameAndFail(name: string) {
    try {
      await this.repository.findOneByOrFail({name});
      
    } catch (error) {
      console.log("El tool " + name + " NO existe")
      return;
    }
    console.log("El tool " + name + " SI existe")
    throw new Error("La tool " + name + " ya existe");
  }

  async getOneByLinkAndFail(link: string) {
    try {
      await this.repository.findOneByOrFail({link});
      
    } catch (error) {
      console.log("El tool " + link + " NO existe")
      return;
    }
    console.log("El tool " + link + " SI existe")
    throw new Error("La tool " + link + " ya existe");
  }

  async getOneByLinkOrFail(link: string): Promise<ToolModel> {
    
    return await this.repository.findOneByOrFail({link});
  }

  async getOneByNameOrFail(name: string): Promise<ToolModel> {
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
      response.status
    );
  }

  async export() {
    const data = await this.repository.find({
      select: {
        name: true,
        description: true,
        excerpt: true,
        id: true
      },
    });
    // Escribe en un archivo JSON
    await fs.writeFile('./output.json', JSON.stringify(data, null, 2));
  }
}
