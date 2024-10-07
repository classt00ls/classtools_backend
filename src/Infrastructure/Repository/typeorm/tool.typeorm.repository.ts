import { Injectable } from "@nestjs/common";

import { DataSource, In, InsertResult, MoreThan, Repository } from 'typeorm';
import { ToolRepository } from "src/Domain/Repository/tool.repository";
import { ToolSchema } from "src/Shared/Infrastructure/Persistence/typeorm/tool.schema";
import { GenericFilter } from "src/Shared/Application/Filter/Tool/GenericFilter";
import { ToolModel } from "src/Shared/Domain/Model/Tool/tool.model";

@Injectable()
export class ToolTypeormRepository extends ToolRepository {
  
  private repository : Repository<ToolModel>;

  constructor(datasource: DataSource) {
    super();
    this.repository = datasource.getRepository(ToolSchema);
  }
  
  async getAll(
    filter: GenericFilter
  ): Promise<ToolModel[]> {

    return this.repository.find({
      skip: filter.getPage(),
      take: filter.getPageSize(),
      relations: ['tags'],
      where: {
         ...(filter.getTags()?.length > 0 && {tags: {name: In(filter.getTags())}}),
         stars: MoreThan(filter.getStars())
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
    stars: number
  ): Promise<number> {
    const response = await this.repository.count({
        where: {
          ...(tags?.length > 0 && {tags: {name: In(tags)}}),
          stars: MoreThan(stars)
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

  async getOneByNameOrFail(name: string) {
    const response = await this.repository.findOneByOrFail({name});
    return response;
  }
}
