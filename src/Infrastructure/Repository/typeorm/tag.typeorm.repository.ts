import { Injectable } from "@nestjs/common";
import { DataSource, InsertResult, Repository } from 'typeorm';
import { TagRepository } from "src/Domain/Repository/tag.repository";
import { TagModel } from "src/Domain/Model/tag.model";
import { TagSchema } from "src/Infrastructure/Persistence/typeorm/tag.schema";

@Injectable()
export class TagTypeormRepository extends TagRepository {
  
  private repository : Repository<TagModel>;

  constructor(datasource: DataSource) {
    super();
    this.repository = datasource.getRepository(TagSchema);
  }
  
  async getAll(): Promise<TagModel[]> {
    return this.repository.find();
  }

  async create(
    model: TagModel
  ): Promise<TagModel> {
    return await this.repository.create(model);
  }

  async insert(
    model: TagModel
  ): Promise<InsertResult> {
    return await this.repository.insert(model);
  }

  async save(model: TagModel): Promise<TagModel> {
    return this.repository.save(model);
  }

  async getOneByIdOrFail(
    id: string
  ): Promise<TagModel> {
    const response = await this.repository.findOneByOrFail({id});
    return response;
  }
}
