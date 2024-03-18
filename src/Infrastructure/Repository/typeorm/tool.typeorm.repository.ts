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
}
