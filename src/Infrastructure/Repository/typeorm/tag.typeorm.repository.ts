import { Injectable } from "@nestjs/common";
import { DataSource, InsertResult, Repository } from 'typeorm';
import { TagRepository } from "@Backoffice/Tag/Domain/tag.repository";
import { TagSchema } from "src/Shared/Infrastructure/Persistence/typeorm/tag.schema";
import { TagModel } from "@Backoffice/Tag/Domain/Tag.model";

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
        isCategory: 1
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
    return TagModel.fromPrimitives(
      response.id,
      response.name,
      response.description,
      response.excerpt,
      response.deleted,
      response.isCategory
    );
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
    return TagModel.fromPrimitives(
      response.id,
      response.name,
      response.description,
      response.excerpt,
      response.deleted,
      response.isCategory
    );
  }
}
