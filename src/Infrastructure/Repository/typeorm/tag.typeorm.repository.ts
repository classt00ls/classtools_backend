import { Injectable } from "@nestjs/common";
import { DataSource, InsertResult, Repository } from 'typeorm';
import { TagRepository } from "src/Domain/Repository/tag.repository";
import { TagSchema } from "src/Shared/Infrastructure/Persistence/typeorm/tag.schema";
import { TagModel } from "src/Shared/Domain/Model/Tag/Tag.model";

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

  async getAllCategories(): Promise<TagModel[]> {
    return this.repository.find({
      where: {
        isCategory: true
      }
    });
  }

  async update(tagModel: Partial<TagModel>) {
    return await this.repository.update(
      {id: tagModel.id},
      {...tagModel}
    )
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

  async getOneByNameAndFail(name: string) {
    try {
      await this.repository.findOneByOrFail({name});
      
    } catch (error) {
      console.log("El tag " + name + " NO existe")
       return;
    }
    console.log("El tag " + name + " SI existe")
    throw new Error("El tag " + name + " ya existe");
  }

  async getOneByNameOrFail(name: string) {
    const response = await this.repository.findOneByOrFail({name});
    return response;
  }
}
