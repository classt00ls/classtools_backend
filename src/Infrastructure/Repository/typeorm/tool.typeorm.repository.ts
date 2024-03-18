import { Injectable } from "@nestjs/common";

import { DataSource, InsertResult, Repository } from 'typeorm';
import { UserSchema } from "src/Infrastructure/Persistence/typeorm/user.schema";
import { ToolRepository } from "src/Domain/Repository/tool.repository";
import { ToolModel } from "src/Domain/Model/tool.model";
import { ToolSchema } from "src/Infrastructure/Persistence/typeorm/tool.schema";

@Injectable()
export class ToolTypeormRepository extends ToolRepository {
  
  private repository : Repository<ToolModel>;

  constructor(datasource: DataSource) {
    super();
    this.repository = datasource.getRepository(ToolSchema);
  }
  
  async getAll(): Promise<ToolModel[]> {
    return this.repository.find();
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

  async getOneByNameOrFail(name: string) {
    const response = await this.repository.findOneByOrFail({name});
    return response;
  }
}
